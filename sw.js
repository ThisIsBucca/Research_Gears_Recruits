
// Service Worker for Sokoni Africa
// Caches all static assets and API GET requests for offline and fast loading
const CACHE_NAME = 'sokoni-static-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/styles/index.css',
  '/assets/styles/main.css',
  '/assets/styles/additional.css',
  '/assets/styles/solid-rounded.css',
  '/assets/styles/regular-rounded.css',
  '/assets/fonts/Montserrat.ttf',
  '/assets/fonts/uicons-regular-rounded.woff2',
  '/assets/fonts/uicons-solid-rounded.woff2',
  '/assets/favicon/android-chrome-512x512.png',
  '/assets/favicon/android-chrome-192x192.png',
  '/assets/favicon/apple-touch-icon.png',
  '/assets/images/loader.gif',
  '/assets/js/index.js',
  '/assets/js/api_handler.js',
  '/assets/js/components.js',
  '/assets/js/navigation.js',
  '/assets/js/languages.js',
  '/assets/js/mockData.js',
  '/assets/js/mapbox.js',
  '/assets/js/pbkdf2.encrypt.min.js',
  '/assets/js/push_handler.js',
  '/assets/js/confetti.js',
  '/assets/js/confetti_test.js',
  '/assets/audio/click.mp3',
  '/assets/audio/ding.mp3',
  '/assets/audio/failed.mp3',
  '/assets/audio/shutter.mp3',
  '/assets/audio/success.mp3',
  // Add more assets as needed
];

// Install event: nothing to pre-cache

// Install: Pre-cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});


// Push notification handler (unchanged)
self.addEventListener("push", event=>{
  const data=event.data.json();
  self.registration.showNotification(data.title,{body:data.body});
  self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
      clients.forEach(client => client.postMessage({ type: "push", payload: data }));
  });
});


// Fetch: Cache-first for static assets, network-first for API, fallback for failed loads
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Only handle same-origin requests for static assets
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Try to update cache in background
          fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone());
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }
        // Not cached: fetch from network and cache
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        }).catch(() => {
          // Fallback for missing resources
          if (event.request.destination === 'image') {
            return caches.match('/assets/images/default.png');
          }
          if (event.request.destination === 'font') {
            return new Response('', { status: 200 });
          }
          return new Response('Resource unavailable', { status: 404 });
        });
      })
    );
    return;
  }

  // For API requests: network-first, fallback to cache if offline
  if (url.pathname.startsWith('/api') || url.hostname.includes('api.sokoni.africa')) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }
});