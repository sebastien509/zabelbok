// utils/compressVideo.js
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export async function compressVideo(file, title = 'video', crf = 28) {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  const inputName = 'input.mp4';
  const outputName = 'output.mp4';

  try {
    // Step 1: Write input file to FFmpeg FS
    ffmpeg.FS('writeFile', inputName, await fetchFile(file));

    // Step 2: Run compression
    await ffmpeg.run(
      '-i', inputName,
      '-vcodec', 'libx264',
      '-crf', crf.toString(),
      outputName
    );

    // Step 3: Read output file
    const data = ffmpeg.FS('readFile', outputName);

    // Step 4: Return as new File object
    return new File([data.buffer], `${slugify(title)}-compressed.mp4`, {
      type: 'video/mp4',
    });

  } catch (err) {
    console.error('[compressVideo] Compression failed:', err);
    throw err;
  } finally {
    // Step 5: Clean up FS
    try {
      ffmpeg.FS('unlink', inputName);
      ffmpeg.FS('unlink', outputName);
    } catch (cleanupError) {
      console.warn('[compressVideo] Cleanup warning:', cleanupError);
    }
  }
}

// Optional: basic slugify utility (if not imported)
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
