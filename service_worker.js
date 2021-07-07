var cacheVersion = "v1";
var cacheAssets = [
  '/index.html',
  '/css/main.css',
  '/js/algolia-search.js',
  '/js/bookmark.js',
  '/js/local-search.js',
  '/js/motion.js',
  '/js/next-boot.js',
  '/js/utils.js',
  '/images/algolia_logo.svg',
  '/images/apple-touch-icon-next.png',
  '/images/avatar.gif',
  '/images/cc-by-nc-nd.svg',
  '/images/cc-by-nc-sa.svg',
  '/images/cc-by-nc.svg',
  '/images/cc-by-nd.svg',
  '/images/cc-by-sa.svg',
  '/images/cc-by.svg',
  '/images/cc-zero.svg',
  '/images/favicon-16x16-next.png',
  '/images/favicon-32x32-next.png',
  '/images/logo.svg',
  '/js/schemes/muse.js',
  '/js/schemes/pisces.js'
];
self.addEventListener('install', function (event) {
  event
    .waitUntil(
      (async function () {
        let cache = await caches.open(cacheVersion);
        await cache.addAll(cacheAssets);
        return self.skipWaiting();
      })()
    );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keyList) {
        return Promise.all([
          keyList.map(function (key) {
            if (key !== cacheVersion) {
              return caches.delete(key);
            }
          }),
          self.clients.claim()
        ])
      })
  );
});

self.addEventListener('fetch', function(event) {
  var imageHosts = /(images\.unsplash\.com)/i
  var allowedHosts = /(localhost|googleapis\.com|gstatic\.com|foo-bar\.top|cdn\.jsdelivr\.net|tidiochat\.com|tidio\.co|maxcdn\.com|avatars\.githubusercontent\.com|clarity\.ms|yandex\.ru|cdn\.bootcdn\.net)/i;
  var deniedHosts = /(service_worker.js|collect)/i;
  var htmlDocument = /(\/|\.html)$/i;
  if ((allowedHosts.test(event.request.url) || imageHosts.test(event.request.url)) && !deniedHosts.test(event.request.url) && (event.request.method == "POST")) {
    if (htmlDocument.test(event.request.url)) {
      event.respondWith(
        (async function() {
          try {
            let response = await fetch(event.request.clone());
            try {
              let cache = await caches.open(cacheVersion);
              await cache.put(event.request.clone(), response.clone());
            } catch (err) {
              console.warn(err);
            }
            return response;
          } catch (e) {
            return caches.match(event.request);
          }
        })()
      );
    } else {
      event.respondWith(
        (async function() {
          let cachedResponse = await caches.match(event.request);
          let response;
          if (cachedResponse) {
            response = cachedResponse;
          } else {
            response = (async function() {
              let fetchedResponse = await fetch(event.request.clone());
              let cache = await caches.open(cacheVersion);
              try {
                await cache.put(event.request.clone(), fetchedResponse.clone());
              } catch (err) {
                console.warn(err);
              }
              return fetchedResponse;
            })()
          }
          return response;
        })()
      );
    }
  }
});