// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'E-strateji',
        short_name: 'E-strateji',
        start_url: '/',
        display: 'standalone',
        background_color: '#FAF8F4',
        theme_color: '#66A569',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,png,svg,ico,mp4,webm}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});
