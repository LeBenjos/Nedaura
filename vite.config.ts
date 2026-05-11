import vue from '@vitejs/plugin-vue';
import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import glsl from 'vite-plugin-glsl';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { syncThreeWorldPresets } from './scripts/sync-three-world-config.mjs';

function threeWorldConfigPlugin(): Plugin {
    return {
        name: 'three-world-config-sync',
        configureServer(server) {
            server.watcher.add('three-world-presets.json');
            server.watcher.on('change', (path) => {
                if (path.endsWith('three-world-presets.json')) {
                    syncThreeWorldPresets();
                }
            });
        },
    };
}

export default defineConfig({
    base: './',
    server: {
        host: true,
        https: {},
    },
    build: {
        outDir: './dist',
        emptyOutDir: true,
        sourcemap: true,
    },
    plugins: [vue(), glsl(), basicSsl(), threeWorldConfigPlugin()],
    resolve: {
        alias: {
            // L'ordre est important : du plus spécifique au plus général
            '@/utils': fileURLToPath(new URL('./src/experiences/views/vues/utils', import.meta.url)),
            '@/comp': fileURLToPath(new URL('./src/experiences/views/vues/components', import.meta.url)),
            '@/hooks': fileURLToPath(new URL('./src/experiences/views/vues/hooks', import.meta.url)),
            '@/views': fileURLToPath(new URL('./src/experiences/views/vues/views', import.meta.url)),
            '@/managers': fileURLToPath(new URL('./src/experiences/managers', import.meta.url)),
            '@/constants': fileURLToPath(new URL('./src/experiences/constants', import.meta.url)),
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '~': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
