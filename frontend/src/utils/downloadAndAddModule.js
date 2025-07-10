import { ModuleDB } from './ModuleDB';
import { getModuleById } from '@/services/modules';

export async function downloadAndAddModule(id) {
  try {
    const module = await getModuleById(id);
    const response = await fetch(module.video_url);
    const blob = await response.blob();

    if (!blob || !(blob instanceof Blob) || blob.size === 0) {
      throw new Error('Blob invalid or empty');
    }

    await ModuleDB.add({ ...module, blob });
    console.log(`[downloadAndAddModule] Module ${id} downloaded and saved.`);
    return true;
  } catch (e) {
    console.error(`[downloadAndAddModule] Failed to download module ${id}:`, e);
    return false;
  }
}
