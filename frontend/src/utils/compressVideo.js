// utils/compressVideo.js
// Vite-safe lazy loader to avoid prebundle issues
let _ffmpegPromise = null;

async function getFFmpeg() {
  if (!_ffmpegPromise) {
    _ffmpegPromise = (async () => {
      const { createFFmpeg, fetchFile } = await import('@ffmpeg/ffmpeg'); // dynamic import
      const ffmpeg = createFFmpeg({
        log: true,
        // Use local copied core (vite-plugin-static-copy -> dist/ffmpeg/*)
        corePath: '/ffmpeg/ffmpeg-core.js',
      });
      // attach helpers for reuse
      ffmpeg.__fetchFile = fetchFile;
      await ffmpeg.load();
      return ffmpeg;
    })();
  }
  return _ffmpegPromise;
}

/**
 * Compress a video to H.264 MP4 using CRF.
 * @param {File|Blob|ArrayBuffer|Uint8Array|string} file - input video source
 * @param {string} title - base name for output
 * @param {number} crf - 18(best) .. 28(smaller)
 * @param {(p:number)=>void} onProgress - optional progress callback 0..1
 * @param {AbortSignal} signal - optional abort signal
 * @returns {Promise<File>}
 */
export async function compressVideo(file, title = 'video', crf = 28, onProgress, signal) {
  const ffmpeg = await getFFmpeg();
  const fetchFile = ffmpeg.__fetchFile;

  // Allow cancel
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const abortHandler = () => { try { ffmpeg.exit(); } catch {} };

  // Optional progress reporting
  let unlisten;
  if (typeof onProgress === 'function') {
    const handler = ({ ratio }) => onProgress(Math.max(0, Math.min(1, ratio || 0)));
    ffmpeg.setProgress(handler);
    unlisten = () => ffmpeg.setProgress(() => {});
  }

  signal?.addEventListener('abort', abortHandler, { once: true });

  const inputName = 'input.mp4';   // ffmpeg FS needs a filename
  const outputName = 'output.mp4';

  try {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    // Write input
    const data = await fetchFile(file);
    ffmpeg.FS('writeFile', inputName, data);

    // Run ffmpeg
    await ffmpeg.run(
      '-i', inputName,
      // Video
      '-vcodec', 'libx264',
      '-crf', String(crf),
      '-preset', 'fast',
      // Audio (copy if possible; re-encode to AAC otherwise)
      '-acodec', 'aac',
      '-b:a', '128k',
      // Fast start for web playback
      '-movflags', '+faststart',
      outputName
    );

    // Read output
    const out = ffmpeg.FS('readFile', outputName);
    // Create a File (safer across browsers)
    const blob = new Blob([out.buffer], { type: 'video/mp4' });
    const fname = `${slugify(title)}-compressed.mp4`;
    // some browsers don’t support File constructor; fall back when needed
    try {
      return new File([blob], fname, { type: 'video/mp4' });
    } catch {
      blob.name = fname; // fallback-ish
      return blob;
    }

  } catch (err) {
    console.error('[compressVideo] Compression failed:', err);
    throw err;
  } finally {
    // Cleanup FS
    try { ffmpeg.FS('unlink', inputName); } catch {}
    try { ffmpeg.FS('unlink', outputName); } catch {}
    // Remove listeners
    if (unlisten) unlisten();
    if (signal) signal.removeEventListener('abort', abortHandler);
  }
}

function slugify(text) {
  return String(text).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
