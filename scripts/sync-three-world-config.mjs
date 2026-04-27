import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const JSON_PATH = resolve(ROOT, 'three-world-config.json');
const TS_PATH = resolve(ROOT, 'src/experiences/constants/experiences/ThreeWorldConfig.ts');

/**
 * Type overrides for fields that need Three.js types instead of inferred primitives.
 * Key format: "section.field" → TS type string.
 * Add an entry here when a JSON value is a plain number/string
 * but the TS type should be a Three.js branded type.
 */
const TYPE_OVERRIDES = {
    'renderer.toneMapping': 'ToneMapping',
    'renderer.outputColorSpace': 'ColorSpace',
};

/** Three.js type imports needed based on active overrides. */
const THREE_IMPORTS = {
    ToneMapping: 'ToneMapping',
    ColorSpace: 'ColorSpace',
};

function inferType(value, path) {
    const override = TYPE_OVERRIDES[path];
    if (override) return override;

    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') return 'string';
    if (Array.isArray(value)) {
        const types = value.map((v) => typeof v);
        const unique = [...new Set(types)];
        if (unique.length === 1) return `[${value.map(() => unique[0]).join(', ')}]`;
        return `[${types.join(', ')}]`;
    }
    return 'unknown';
}

function buildInterface(config) {
    let iface = 'export interface ThreeWorldConfig {\n';
    for (const [section, fields] of Object.entries(config)) {
        iface += `    ${section}: {\n`;
        for (const [key, value] of Object.entries(fields)) {
            const type = inferType(value, `${section}.${key}`);
            iface += `        ${key}: ${type};\n`;
        }
        iface += '    };\n';
    }
    iface += '}';
    return iface;
}

function collectImports(config) {
    const needed = new Set();
    for (const [section, fields] of Object.entries(config)) {
        for (const key of Object.keys(fields)) {
            const override = TYPE_OVERRIDES[`${section}.${key}`];
            if (override && THREE_IMPORTS[override]) {
                needed.add(THREE_IMPORTS[override]);
            }
        }
    }
    if (needed.size === 0) return '';
    return `import type { ${[...needed].sort().join(', ')} } from 'three';\n\n`;
}

/**
 * Deep merge: incoming values override existing ones,
 * but sections/fields absent from incoming are kept from existing.
 */
function deepMerge(existing, incoming) {
    const result = { ...existing };
    for (const [key, value] of Object.entries(incoming)) {
        if (value && typeof value === 'object' && !Array.isArray(value) && existing[key] && typeof existing[key] === 'object' && !Array.isArray(existing[key])) {
            result[key] = deepMerge(existing[key], value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

/**
 * Extract the current config object from the existing TS file.
 * Returns null if the file doesn't exist or can't be parsed.
 */
function readExistingConfig() {
    try {
        const ts = readFileSync(TS_PATH, 'utf-8');
        const match = ts.match(/THREE_WORLD_CONFIG:\s*ThreeWorldConfig\s*=\s*(\{[\s\S]*\})\s*as\s*const;/);
        if (!match) return null;
        return JSON.parse(match[1]);
    } catch {
        return null;
    }
}

export function syncThreeWorldConfig() {
    const raw = readFileSync(JSON_PATH, 'utf-8');
    const incoming = JSON.parse(raw);

    const existing = readExistingConfig();
    const config = existing ? deepMerge(existing, incoming) : incoming;

    const values = JSON.stringify(config, null, 4);
    const imports = collectImports(config);
    const iface = buildInterface(config);

    const ts = `${imports}${iface}\n\nexport const THREE_WORLD_CONFIG: ThreeWorldConfig = ${values} as const;\n`;

    writeFileSync(TS_PATH, ts, 'utf-8');
    console.log('[sync-three-world-config] ThreeWorldConfig.ts updated');
}

// Allow direct execution: node scripts/sync-three-world-config.mjs
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    syncThreeWorldConfig();
}
