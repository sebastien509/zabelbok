// utils/compressVideo.js
import { getFFmpeg } from '@/lib/ffmpeg';

export async function compressVideo(file, title = 'video', crf = 28, onProgress, signal) {
  const ffmpeg = await getFFmpeg();
  const fetchFile = ffmpeg.__fetchFile;

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const abortHandler = () => { try { ffmpeg.exit(); } catch {} };
  signal?.addEventListener('abort', abortHandler, { once: true });

  if (typeof onProgress === 'function') {
    ffmpeg.setProgress(({ ratio }) => onProgress(Math.max(0, Math.min(1, ratio || 0))));
  }

  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  try {
    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    ffmpeg.FS('writeFile', inputName, await fetchFile(file));

    await ffmpeg.run(
      '-i', inputName,
      '-vcodec', 'libx264',
      '-crf', String(crf),
      '-preset', 'fast',
      '-acodec', 'aac', '-b:a', '128k',
      '-movflags', '+faststart',
      outputName
    );

    const out = ffmpeg.FS('readFile', outputName);
    const blob = new Blob([out.buffer], { type: 'video/mp4' });
    const name = `${slugify(title)}-compressed.mp4`;
    try { return new File([blob], name, { type: 'video/mp4' }); } catch { (blob).name = name; return blob; }

  } finally {
    try { ffmpeg.FS('unlink', inputName); } catch {}
    try { ffmpeg.FS('unlink', outputName); } catch {}
    if (signal) signal.removeEventListener('abort', abortHandler);
    ffmpeg.setProgress(() => {});
  }
}

function slugify(t) {
  return String(t).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'');
}
