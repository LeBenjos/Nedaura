import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TS_PATH = resolve(ROOT, 'src/experiences/constants/experiences/ThreeWorldConfig.ts');
const PRESETS_JSON_PATH = resolve(ROOT, 'three-world-presets.json');
const PRESETS_TS_PATH = resolve(ROOT, 'src/experiences/constants/experiences/ThreeWorldPresets.ts');

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

function writeThreeWorldConfigTs(config) {
    const values = JSON.stringify(config, null, 4);
    const imports = collectImports(config);
    const iface = buildInterface(config);
    const ts = `${imports}${iface}\n\nexport const THREE_WORLD_CONFIG: ThreeWorldConfig = ${values} as const;\n`;
    writeFileSync(TS_PATH, ts, 'utf-8');
    console.log('[sync-three-world-config] ThreeWorldConfig.ts updated');
}

export function syncThreeWorldPresets() {
    if (!existsSync(PRESETS_JSON_PATH)) return;

    const raw = readFileSync(PRESETS_JSON_PATH, 'utf-8');
    const data = JSON.parse(raw);
    const presets = data.presets ?? {};
    const defaultId = data.default;

    const presetIds = Object.keys(presets);
    if (presetIds.length === 0) {
        console.warn('[sync-three-world-config] No presets defined — skipping');
        return;
    }
    if (!defaultId || !(defaultId in presets)) {
        console.warn(`[sync-three-world-config] "default" must reference an existing preset (got "${defaultId}")`);
        return;
    }

    const values = JSON.stringify(presets, null, 4);
    const idUnion = presetIds.map((id) => `'${id}'`).join(' | ');

    const presetsTs =
        `import type { ThreeWorldConfig } from './ThreeWorldConfig';\n\n` +
        `export type ThreeWorldPresetId = ${idUnion};\n\n` +
        `export const THREE_WORLD_DEFAULT_PRESET_ID: ThreeWorldPresetId = '${defaultId}';\n\n` +
        `export const THREE_WORLD_PRESETS: Record<ThreeWorldPresetId, ThreeWorldConfig> = ${values} as const;\n`;

    writeFileSync(PRESETS_TS_PATH, presetsTs, 'utf-8');
    console.log('[sync-three-world-config] ThreeWorldPresets.ts updated');

    writeThreeWorldConfigTs(presets[defaultId]);
}

// Allow direct execution: node scripts/sync-three-world-config.mjs
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    syncThreeWorldPresets();
}
