// // vite.config.js
// import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'
// import tailwindcss from '@tailwindcss/vite'
// import { VitePWA } from 'vite-plugin-pwa'

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd(), '')
//   const target = env.VITE_API_URL
//   const BACKEND_HAS_API_PREFIX = false

//   return {
//     plugins: [
//       react(),
//       tailwindcss(),
//       splitVendorChunkPlugin(),
//       mode === 'production' &&
//         VitePWA({
//           registerType: 'autoUpdate',
//           injectRegister: 'auto',
//           devOptions: { enabled: false },
//           manifest: {
//             name: 'E-strateji',
//             short_name: 'E-strateji',
//             start_url: '/',
//             display: 'standalone',
//             background_color: '#FAF8F4',
//             theme_color: '#66A569',
//             icons: [
//               { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
//               { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
//             ],
//           },
//           workbox: {
//             navigateFallback: '/index.html',
//             // only precache core web assets (exclude big media)
//             globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
//             // raise cap above default 2 MiB for entry chunks
//             maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
//             // optional: if you still hit large entry files, ignore them from precache
//             // globIgnores: ['**/assets/index-*.js'],
//             runtimeCaching: [
//               {
//                 urlPattern: /\/.*\.(?:png|jpg|jpeg|gif|webp|svg)$/i,
//                 handler: 'CacheFirst',
//                 options: {
//                   cacheName: 'images',
//                   expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 3600 },
//                 },
//               },
//               {
//                 urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
//                 handler: 'StaleWhileRevalidate',
//                 options: { cacheName: 'google-fonts' },
//               },
//               {
//                 urlPattern: /\/.*\.(?:mp4|webm)$/i,
//                 handler: 'CacheFirst',
//                 options: {
//                   cacheName: 'media',
//                   expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 3600 },
//                 },
//               },
//             ],
//           },
//         }),
//     ].filter(Boolean),

//     resolve: { alias: { '@': path.resolve(__dirname, 'src') } },

//     build: {
//       sourcemap: false,
//       chunkSizeWarningLimit: 1200, // in KB
//       rollupOptions: {
//         output: {
//           manualChunks: {
//             react: ['react', 'react-dom'],
//             router: ['react-router-dom'],
//             icons: ['lucide-react'],
//             // add more libs if needed to keep index-*.js small
//           },
//         },
//       },
//     },

//     server: {
//       port: 5173,
//       proxy: target
//         ? {
//             '^/(auth|users|courses|quizzes|exercises|messages|books|lectures|results|uploads|modules)': {
//               target,
//               changeOrigin: true,
//               secure: true,
//               ...(BACKEND_HAS_API_PREFIX
//                 ? {
//                     rewrite: (p) =>
//                       p.replace(
//                         /^\/(auth|users|courses|quizzes|exercises|messages|books|lectures|results|uploads|modules)/,
//                         '/api/$1'
//                       ),
//                   }
//                 : {}),
//             },
//           }
//         : undefined,
//     },

//     preview: { port: 5173 },
//   }
// })

// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss(),],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      proxy: {
        "/api": {
          target: env.VITE_FLASK_URL || "http://localhost:5050",
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
  };
});
