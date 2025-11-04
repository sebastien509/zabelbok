// vite.config.js
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'
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
      splitVendorChunkPlugin(), // improves chunking so index-*.js is smaller
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
            // Precache only code & core assets; exclude heavy media from precache
            globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
            // Allow slightly larger entry bundles to be precached (default is 2 MiB)
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
            // Use runtime caching for images, fonts, and videos instead of precache
            runtimeCaching: [
              {
                urlPattern: /\/.*\.(?:png|jpg|jpeg|gif|webp|svg)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images',
                  expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 3600 },
                },
              },
              {
                urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: { cacheName: 'google-fonts' },
              },
              {
                urlPattern: /\/.*\.(?:mp4|webm)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'media',
                  expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 3600 },
                },
              },
            ],
          },
        }),
    ].filter(Boolean),

    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },

    // Shrink index-*.js further with manual chunks
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 1200, // quiet warnings (KB)
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            icons: ['lucide-react'],
            // add other big libs here if needed
          },
        },
      },
    },

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
