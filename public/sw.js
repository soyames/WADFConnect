const CACHE_NAME = 'wadf-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_CACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// Install service worker and cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch with network-first strategy for API calls, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached data if network fails
          return caches.match(request).then((cached) => {
            return cached || new Response(
              JSON.stringify({ error: 'Offline - data not cached' }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendance());
  }
  if (event.tag === 'sync-ratings') {
    event.waitUntil(syncRatings());
  }
});

async function syncAttendance() {
  // Sync attendance records when back online
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  const attendanceRequests = requests.filter(req => 
    req.url.includes('/api/attendance') && req.method === 'POST'
  );

  for (const request of attendanceRequests) {
    try {
      await fetch(request);
      await cache.delete(request);
    } catch (error) {
      console.error('Failed to sync attendance:', error);
    }
  }
}

async function syncRatings() {
  // Sync rating submissions when back online
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  const ratingRequests = requests.filter(req => 
    req.url.includes('/api/ratings') && req.method === 'POST'
  );

  for (const request of ratingRequests) {
    try {
      await fetch(request);
      await cache.delete(request);
    } catch (error) {
      console.error('Failed to sync ratings:', error);
    }
  }
}
