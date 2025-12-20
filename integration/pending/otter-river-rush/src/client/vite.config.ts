import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/otter-river-rush/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // The following assets must exist in the public directory:
      // - favicon.ico
      // - apple-touch-icon.png
      // - mask-icon.svg
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: "Otter River Rush - Rusty's Adventure",
        short_name: 'OtterRush',
        description:
          'Join Rusty the Otter on a wild river adventure! Dodge obstacles, collect coins, and ride the rapids in this exciting endless runner game.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'fullscreen',
        orientation: 'portrait',
        categories: ['games', 'action'],
        lang: 'en-US',
        start_url: '/otter-river-rush/',
        scope: '/otter-river-rush/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Increase the maximum file size limit to 3.5 MB to accommodate splash screens
        maximumFileSizeToCacheInBytes: 3.5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,mp3,ogg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  build: {
    target: 'es2020',
    outDir: '../../dist', // Output to root dist/ for Electron/Capacitor/CI
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          howler: ['howler'],
        },
      },
    },
  },
});
