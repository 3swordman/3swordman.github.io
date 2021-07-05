var cacheVersion = "v1";
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open('v1')
      .then(function (cache) {
        return cache.addAll([
          '/index.html',
          '/css/main.css',
          '/js/algolia-search.js',
          '/js/bookmark.js',
          '/js/local-search.js',
          '/js/motion.js',
          '/js/next-boot.js',
          '/js/util.js',
          '/js/schemes/muse.js',
          '/js/schemes/pisces.js'
        ]);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
  );
});