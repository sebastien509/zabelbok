// src/utils/cacheUtils.js

/**
 * Lists all cached files from the service worker's cache storage.
 * Useful for OfflineLibraryViewer and other offline components.
 */

export async function listCachedFiles() {
    if (!('caches' in window)) return [];
  
    const cacheNames = await caches.keys();
    const files = [];
  
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
  
      for (const request of requests) {
        // Only include file-like resources (e.g., books, lectures)
        if (request.url.includes('/offline/')) {
          files.push({
            name: request.url.split('/').pop(),
            url: request.url
          });
        }
      }
    }
  
    return files;
  }
  