const CACHE_NAME = 'daily-tasks-v1';
const RUNTIME_CACHE = 'daily-tasks-runtime-v1';

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/generated/app-icon.dim_128x128.png',
  '/assets/generated/app-icon.dim_256x256.png',
  '/assets/generated/app-icon.dim_512x512.png',
  '/assets/generated/calendar-icon.dim_64x64.png',
  '/assets/generated/checkmark-success.dim_64x64.png',
  '/assets/generated/notification-bell.dim_64x64.png',
  '/assets/generated/progress-chart.dim_64x64.png',
  '/assets/generated/settings-notifications-transparent.dim_64x64.png',
  '/assets/generated/streak-flame.dim_64x64.png',
  '/assets/generated/weekly-chart.dim_400x300.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and non-GET requests
  if (event.request.url.startsWith(self.location.origin) && event.request.method === 'GET') {
    // For navigation requests, use network-first strategy
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // Fallback to cache if network fails
            return caches.match(event.request).then((response) => {
              return response || caches.match('/index.html');
            });
          })
      );
      return;
    }

    // For static assets, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(event.request).then((response) => {
            // Don't cache non-successful responses or opaque responses
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response;
            }

            // Cache successful responses
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          });
        })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
