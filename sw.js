const CACHE_VERSION = 'v2';
const CACHE_NAME = 'airhorny-' + CACHE_VERSION;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/dist/styles/app.css?id=62f98c29f83b3fcb8297d2031dcadaa5',
  '/dist/scripts/app.js?id=a89793ef7a6f0262ec1a4a1075f19239',
  '/dist/images/logo.svg?id=fdf37dba4f61d747daf759975dedce3a',
  '/dist/images/favicon.svg',
  '/dist/images/icon-192.png',
  '/dist/images/icon-512.png',
  '/dist/sounds/air-horn-4.mp3?id=40430727aebdbd88e25f551ae23aed34',
  '/dist/sounds/air-horn-5.mp3?id=59668c9a2a4ca665349cb1104066e5fc',
  '/dist/sounds/air-horn-6.mp3?id=2af33471bac4e1b506076ba8b3ee089e',
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
