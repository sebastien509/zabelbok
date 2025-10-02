import { getFFmpeg } from '@/lib/ffmpeg';

const ENABLED = String(import.meta.env.VITE_ENABLE_FFMPEG) === 'true';

export async function compressVideo(file, title = 'video', crf = 28, onProgress, signal) {
  // If disabled, return the original file unchanged
  if (!ENABLED) return file;

  // If enabled (later), this path uses the real loader
  const ffmpeg = await getFFmpeg();
  const fetchFile = ffmpeg.__fetchFile;

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  if (typeof onProgress === 'function') {
    ffmpeg.setProgress(({ ratio }) => onProgress(Math.max(0, Math.min(1, ratio || 0))));
  }

  const inName = 'input.mp4', outName = 'output.mp4';
  try {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();
    ffmpeg.FS('writeFile', inName, await fetchFile(file));
    await ffmpeg.run('-i', inName, '-vcodec', 'libx264', '-crf', String(crf), '-preset', 'fast',
                     '-acodec', 'aac', '-b:a', '128k', '-movflags', '+faststart', outName);
    const out = ffmpeg.FS('readFile', outName);
    const blob = new Blob([out.buffer], { type: 'video/mp4' });
    const name = `${slugify(title)}-compressed.mp4`;
    try { return new File([blob], name, { type: 'video/mp4' }); } catch { blob.name = name; return blob; }
  } finally {
    try { ffmpeg.FS('unlink', inName); } catch {}
    try { ffmpeg.FS('unlink', outName); } catch {}
    ffmpeg.setProgress(() => {});
  }
}

function slugify(t) {
  return String(t).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'');
}
