// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { VitePWA } from 'vite-plugin-pwa'

// Read env at build time: VITE_API_BASE_URL (see step 3)
const API_BASE = process.env.VITE_API_URL

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
console.log("base:",API_BASE)
  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          // ffmpeg.wasm files, used by your uploader/compressor
          { src: 'node_modules/@ffmpeg/core/dist/*', dest: '' },
        ],
      }),
      tailwindcss(),
      // PWA in prod only (recommended for dev sanity)
      isProd &&
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',          // <-- auto-inject SW registration
          devOptions: { enabled: false },  // keep SW off in dev to avoid cache weirdness
          manifest: {
            name: 'E-strateji',
            short_name: 'E-strateji',
            start_url: '/',
            display: 'standalone',
            background_color: '#FAF8F4',
            theme_color: '#66A569',
            icons: [
              { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
            ],
          },
          workbox: {
            navigateFallback: '/index.html',
            globPatterns: ['**/*.{js,css,html,png,svg,ico,mp4,webm}'],
          },
        }),
    ].filter(Boolean),
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    server: {
      port: 5173,
      // If your frontend calls relative paths like /api/..., forward them to Render (or local API).
      proxy: API_BASE
        ? {
            // example: /api -> https://your-api.onrender.com
           '^/(auth|users|courses|quizzes|exercises|messages|books|lectures|results|uploads|modules)': {
            target: API_BASE,
            changeOrigin: true,
            secure: false,
              // if your backend expects /api prefix keep it; otherwise rewrite:
              // rewrite: (p) => p.replace(/^\/api/, ''),
            },
          }
        : undefined,
    },
    // For builds on Vercel / local preview
    preview: { port: 5173 },
  }
})
