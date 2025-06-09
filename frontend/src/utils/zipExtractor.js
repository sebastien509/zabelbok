import { unzipSync } from 'fflate';

export async function extractZipFromBlob(blob) {
  const buffer = await blob.arrayBuffer();
  const files = unzipSync(new Uint8Array(buffer));
  return Object.entries(files).map(([name, content]) => ({
    name,
    text: new TextDecoder().decode(content)
  }));
}