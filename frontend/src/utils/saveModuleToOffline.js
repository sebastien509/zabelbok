import { ModuleDB } from '@/utils/ModuleDB';

export async function saveModuleToOffline(id, videoUrl, moduleData) {
  try {
    // Save metadata first
    await ModuleDB.addModuleMeta(moduleData);
    
    // Only save video blob if under size limit (e.g., 50MB)
    const MAX_BLOB_SIZE = 50 * 1024 * 1024;
    const response = await fetch(videoUrl, { method: 'HEAD' });
    const size = parseInt(response.headers.get('content-length'));
    
    if (size < MAX_BLOB_SIZE) {
      const videoResponse = await fetch(videoUrl);
      const blob = await videoResponse.blob();
      await ModuleDB.addVideoBlob(id, blob);
    } else {
      console.warn('Video too large for offline storage');
    }
  } catch (error) {
    console.error('Failed to save module offline:', error);
    throw error; // Re-throw if you want calling code to handle the error
  }
}