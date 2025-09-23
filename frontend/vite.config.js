// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // ✅ Read Vite envs from .env, .env.local, etc.
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_URL // <-- this now works

  // Flip this to true if your backend paths are actually /api/auth, /api/users, etc.
  const BACKEND_HAS_API_PREFIX = false
  // If true, we’ll rewrite /auth -> /api/auth (and similarly for other roots)

  return {
    plugins: [
      react(),
      viteStaticCopy({ targets: [{ src: 'node_modules/@ffmpeg/core/dist/*', dest: '' }] }),
      tailwindcss(),
      // keep PWA in prod if you want
      mode === 'production' &&
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          devOptions: { enabled: false },
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
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    server: {
      port: 5173,
      proxy: target
        ? {
            // forward these top-level API roots to Render in DEV
            '^/(auth|users|courses|quizzes|exercises|messages|books|lectures|results|uploads|modules)': {
              target,
              changeOrigin: true,
              secure: true,
              ...(BACKEND_HAS_API_PREFIX
                ? {
                    // If your backend is /api/<route>, rewrite /<route> -> /api/<route>
                    rewrite: (p) =>
                      p.replace(
                        /^\/(auth|users|courses|quizzes|exercises|messages|books|lectures|results|uploads|modules)/,
                        '/api/$1'
                      ),
                  }
                : {}),
            },
          }
        : undefined,
    },
    preview: { port: 5173 },
  }
})
