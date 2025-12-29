import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
    base: process.env.VITE_BASE_URL || '/rivermarsh/',
    plugins: [react(), glsl()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        host: true, // Expose on 0.0.0.0 for LAN access
    },
});
