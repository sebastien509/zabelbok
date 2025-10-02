// FFmpeg disabled shim
export async function getFFmpeg() {
    throw new Error('FFmpeg is disabled for this build.');
  }
  export default getFFmpeg;
  