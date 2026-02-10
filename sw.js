// ==============================
// Service Worker for PWA
// ==============================

const CACHE_NAME = 'almassia-kitchens-v3.1'; // Bumping to apply button fixes
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/dist/bundle.css',
  '/dist/bundle.js',
  '/images/logo-light.webp',
  '/images/logo-dark.webp',
  '/images/kitchen1.webp',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Install event
self.addEventListener('install', function (event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', function (event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', function (event) {
  if (event.request.url.startsWith('http')) {
    const isAsset = event.request.url.includes('/dist/') || event.request.url.includes('/css/') || event.request.url.includes('/js/');

    // Stale-While-Revalidate for bundle assets
    if (isAsset) {
      event.respondWith(
        caches.open(CACHE_NAME).then(function (cache) {
          return cache.match(event.request).then(function (response) {
            const fetchPromise = fetch(event.request).then(function (networkResponse) {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
            return response || fetchPromise;
          });
        })
      );
    } else {
      // Default Cache-First strategy for other resources
      event.respondWith(
        caches.match(event.request)
          .then(function (response) {
            if (response) return response;

            return fetch(event.request).then(function (networkResponse) {
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, responseToCache);
              });
              return networkResponse;
            });
          })
      );
    }
  }
});

// Background sync for form submissions
self.addEventListener('sync', function (event) {
  if (event.tag === 'background-form-sync') {
    console.log('Background sync for forms');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background form submission logic here
  console.log('Performing background sync...');
}