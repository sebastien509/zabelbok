const OFFLINE_CACHE = 'offline-content-v3';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then(cache => {
      return cache.addAll([
        '/offline',
        '/static/offline-fallback.html',
        '/static/js/offline.bundle.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Handle API requests differently
  if (event.request.url.includes('/api/offline/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: "Offline mode active" }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Handle zip downloads
  if (event.request.url.includes('/offline/download/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          // Cache the zip file
          const cacheCopy = response.clone();
          caches.open(OFFLINE_CACHE).then(cache => cache.put(event.request, cacheCopy));
          return response;
        });
      })
    );
    return;
  }

  // Default caching strategy
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(
      (async () => {
        // Get pending submissions from IndexedDB
        const db = await openDB('OfflineSubmissions', 1);
        const submissions = await db.getAll('submissions');
        
        if (submissions.length > 0) {
          try {
            const response = await fetch('/api/offline/sync', {
              method: 'POST',
              body: JSON.stringify({ submissions }),
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (response.ok) {
              // Clear successfully synced submissions
              await db.clear('submissions');
            }
          } catch (error) {
            console.error('Sync failed:', error);
          }
        }
      })()
    );
  }
});