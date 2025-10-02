// vite.config.js (only the relevant diffs)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const ENABLE_FFMPEG = String(env.VITE_ENABLE_FFMPEG) === 'true';

  const useMT = String(env.VITE_USE_FFMPEG_MT || '').toLowerCase() === 'true';
  const ffmpegSrc = useMT
    ? 'node_modules/@ffmpeg/core-mt/dist/*'
    : 'node_modules/@ffmpeg/core/dist/*';

  const shouldCopyFFmpeg = ENABLE_FFMPEG && fs.existsSync(
    path.resolve(process.cwd(), ffmpegSrc.replace('/*', ''))
  );

  const plugins = [
    react(),
    tailwindcss(),
    splitVendorChunkPlugin(),
    shouldCopyFFmpeg && viteStaticCopy({ targets: [{ src: ffmpegSrc, dest: 'ffmpeg' }] }),
    // ... PWA plugin as before
  ].filter(Boolean);

  return {
    plugins,
    // keep alias/server/preview as-is
    optimizeDeps: {
      // ok to keep excludes; harmless if disabled
      exclude: ['@ffmpeg/ffmpeg','@ffmpeg/core','@ffmpeg/core-mt'],
    },
    build: {
      commonjsOptions: { transformMixedEsModules: true, requireReturnsDefault: 'auto' },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('framer-motion')) return 'motion';
              if (id.includes('@stripe')) return 'stripe';
              if (ENABLE_FFMPEG && id.includes('@ffmpeg')) return 'ffmpeg';
              if (id.includes('react-router')) return 'router';
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
