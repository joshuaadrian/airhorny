const CACHE_VERSION = 'v3';
const CACHE_NAME = 'airhorny-' + CACHE_VERSION;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/dist/styles/app.css?id=49e05a82cb5f35d27c12e01ac8a2b796',
  '/dist/scripts/app.js?id=1ae9b90656088ec2b68f9731f5cad9d2',
  '/dist/images/logo.svg?id=fdf37dba4f61d747daf759975dedce3a',
  '/dist/images/favicon.svg',
  '/dist/images/icon-192.png',
  '/dist/images/icon-512.png',
  '/dist/sounds/air-horn-4.mp3?id=c999f6db24cb67df27413e422512d50e',
  '/dist/sounds/air-horn-5.mp3?id=e3adc5a9e2c74b231b46728e6502b87a',
  '/dist/sounds/air-horn-6.mp3?id=dd319f91a68164a45d94a7ad609ead5a',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) {
            return name.startsWith('airhorny-') && name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') {
    return;
  }

  var url = new URL(event.request.url);

  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put('/index.html', copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match('/index.html');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return fetch(event.request)
        .then(function (response) {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return cached || response;
          }

          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });

          return response;
        })
        .catch(function () {
          return cached;
        });
    })
  );
});
