import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import basicSsl from '@vitejs/plugin-basic-ssl';

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
    plugins: [vue(), glsl(), basicSsl()],
});
