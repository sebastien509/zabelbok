// utils/compressVideo.js
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({
  log: true,
  corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
});

export async function compressVideo(file, title = 'video', crf = 28) {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
    console.log("✅ FFmpeg loaded");
  }

  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  try {
    ffmpeg.FS('writeFile', inputName, await fetchFile(file));

    await ffmpeg.run(
      '-i', inputName,
      '-vcodec', 'libx264',
      '-crf', crf.toString(),
      '-preset', 'fast',
      outputName
    );

    const data = ffmpeg.FS('readFile', outputName);

    return new File([data.buffer], `${slugify(title)}-compressed.mp4`, {
      type: 'video/mp4',
    });

  } catch (err) {
    console.error('[compressVideo] Compression failed:', err);
    throw err;
  } finally {
    try {
      ffmpeg.FS('unlink', inputName);
      ffmpeg.FS('unlink', outputName);
    } catch (cleanupError) {
      console.warn('[compressVideo] Cleanup warning:', cleanupError);
    }
  }
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
