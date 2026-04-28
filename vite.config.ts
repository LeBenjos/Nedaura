import vue from '@vitejs/plugin-vue';
import { defineConfig, type Plugin } from 'vite';
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
});
