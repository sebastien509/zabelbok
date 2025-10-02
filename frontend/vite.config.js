// vite.config.js
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_URL
  const BACKEND_HAS_API_PREFIX = false

  // Optional: set VITE_USE_FFMPEG_MT=true to use @ffmpeg/core-mt
  const useMT = String(env.VITE_USE_FFMPEG_MT || '').toLowerCase() === 'true'
  const ffmpegSrc = useMT
    ? 'node_modules/@ffmpeg/core-mt/dist/*'
    : 'node_modules/@ffmpeg/core/dist/*'

  // Guard: only add the copy plugin if the path exists (avoids build error)
  const shouldCopyFFmpeg = fs.existsSync(
    path.resolve(process.cwd(), ffmpegSrc.replace('/*', ''))
  )

  const plugins = [
    react(),
    tailwindcss(),
    splitVendorChunkPlugin(), // helps Vite split common vendor code automatically
    // Copy ffmpeg core files to /ffmpeg in dist (only if present)
    shouldCopyFFmpeg &&
      viteStaticCopy({
        targets: [
          {
            src: ffmpegSrc,
            dest: 'ffmpeg', // available at /ffmpeg/ffmpeg-core.js
          },
        ],
      }),
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
  ].filter(Boolean)

  return {
    plugins,
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
    build: {
      // reduce “large chunk” warnings (you can keep default if you prefer)
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          // Further split heavy libs into their own async chunks
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('framer-motion')) return 'motion'
              if (id.includes('@stripe')) return 'stripe'
              if (id.includes('@ffmpeg')) return 'ffmpeg'
              if (id.includes('react-router')) return 'router'
              // default vendor bucket
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
