// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_URL
  const BACKEND_HAS_API_PREFIX = false

  return {
    plugins: [
      react(),
      tailwindcss(),
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
            '^/(auth|users|courses|quizzes|exercises|messages|books|lectures|results|uploads|modules)': {
              target,
              changeOrigin: true,
              secure: true,
              ...(BACKEND_HAS_API_PREFIX
                ? {
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
