// src/lib/ffmpeg.ts
let p: Promise<any> | null = null;
export async function getFFmpeg() {
  if (!p) {
    p = (async () => {
      const mod = await import('@ffmpeg/ffmpeg'); // dynamic
      const ffmpeg = mod.createFFmpeg({ log: true, corePath: '/ffmpeg/ffmpeg-core.js' });
      // @ts-ignore
      ffmpeg.__fetchFile = mod.fetchFile;
      await ffmpeg.load();
      return ffmpeg;
    })();
  }
  return p;
}

