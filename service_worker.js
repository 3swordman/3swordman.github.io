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
  '/js/schemes/pisces.js',
  '/lib/font-awesome/css/all.min.css',
  '/lib/pace/pace-theme-minimal.min.css',
  '/lib/pace/pace.min.js',
  '/lib/velocity/velocity.min.js',
  '/lib/velocity/velocity.ui.min.js',
  '/lib/anime.min.js'
];
self.addEventListener('install', function (event) {
  event
    .waitUntil(
      caches.open(cacheVersion)
        .then(function (cache) {
          return cache.addAll(cacheAssets);
        })
        .then(function() {
          return self.skipWaiting();
        })
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
  var allowedHosts = /(localhost|googleapis\.com|gstatic\.com|foo-bar\.top|cdn\.jsdelivr\.net|tidiochat\.com|tidio\.co|maxcdn\.com|avatars\.githubusercontent\.com)/i;
  var deniedHosts = /(service_worker.js)/i;
  var htmlDocument = /(\/|\.html)$/i;
  if ((allowedHosts.test(event.request.url) || imageHosts.test(event.request.url)) && !deniedHosts.test(event.request.url)) {
    if (htmlDocument.test(event.request.url)) {
      event.respondWith(
        fetch(event.request)
          .then(function (response) {
            caches
              .open(cacheVersion)
              .then(function (cache) {
                cache.put(event.request, response.clone());
              })
              .catch(function (err) {
                console.warn(err);
              })
            return response;
          })
          .catch(function () {
            return caches.match(event.request);
          })
      );
    } else {
      event.respondWith(
        caches.match(event.request)
          .then(function (cachedResponse) {
            return (
              cachedResponse || 
              fetch(event.request)
                .then(function (fetchedResponse) {
                  caches
                    .open(cacheVersion)
                    .then(function (cache) {
                      try {
                        cache.put(event.request, fetchedResponse.clone());
                      } catch (err) {
                        console.warn(err);
                        cache.put(event.request, fetchedResponse);
                      }
                    })
                  return fetchedResponse;
                })
            );
          })
      );
    }
  }
});