// ==============================
// Service Worker for PWA
// ==============================

const CACHE_NAME = 'almassia-kitchens-v4.1'; // Bump: navigation network-first, images SWR, resilient precache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/logo-light.webp',
  '/images/logo-dark.webp',
  '/images/kitchen1.webp',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/apple-touch-icon.png',
  '/css/vars.css',
  '/css/animations.css',
  '/css/components.css',
  '/css/facebook-feed.css',
  '/css/main.css',
  '/css/responsive.css',
  '/css/scrollytelling.css',
  '/js/main.js',
  '/js/calculator.js',
  '/js/form-handler.js',
  '/js/scrollytelling.js'
];

// Install event
self.addEventListener('install', function (event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('Opened cache');
        // Cache each URL individually so one 404 doesn't fail the whole install
        return Promise.all(
          urlsToCache.map(function (url) {
            return cache.add(url).catch(function (err) {
              console.warn('Precache failed for', url, err);
            });
          })
        );
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
  if (!event.request.url.startsWith('http')) return;
  if (event.request.method !== 'GET') return;

  // Network-first for navigations so HTML is never stale forever
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match('/index.html');
        });
      })
    );
    return;
  }

  const isAsset = event.request.url.includes('/dist/') || event.request.url.includes('/css/') || event.request.url.includes('/js/') || event.request.url.includes('/images/');

  // Stale-While-Revalidate for static assets
  if (isAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(event.request).then(function (response) {
          const fetchPromise = fetch(event.request).then(function (networkResponse) {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(function () {
            return response;
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
