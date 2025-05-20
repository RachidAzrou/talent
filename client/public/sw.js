// Service Worker for PWA functionality

const CACHE_NAME = 'talentforge-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// Install the service worker and cache the core app assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and network strategy with network first
self.addEventListener('fetch', event => {
  // Skip non-GET requests and browser extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip API requests and file upload requests
  if (event.request.url.includes('/api/') || event.request.url.includes('/uploads/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            // Only cache successful responses
            if (response.status === 200) {
              cache.put(event.request, responseToCache);
            }
          });

        return response;
      })
      .catch(() => {
        // If network request fails, serve from cache
        return caches.match(event.request);
      })
  );
});

// Clean up outdated caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
