// utils/compressVideo.js
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export async function compressVideo(file, crf = 28) {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  try {
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));

    // Compress to output.mp4 with CRF setting
    await ffmpeg.run(
      '-i', 'input.mp4',
      '-vcodec', 'libx264',
      '-crf', crf.toString(),
      'output.mp4'
    );

    const data = ffmpeg.FS('readFile', 'output.mp4');

    return new File([data.buffer], 'compressed.mp4', { type: 'video/mp4' });
  } catch (err) {
    console.error('[compressVideo] Compression failed:', err);
    throw err;
  } finally {
    ffmpeg.FS('unlink', 'input.mp4');
    ffmpeg.FS('unlink', 'output.mp4');
  }
}
