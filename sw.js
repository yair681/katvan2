/* Katvan service worker: keeps every local file of the app available offline.
   Registered only over http(s) (see registerServiceWorker in js/app.js); file:// never uses it.
   Strategy: answer from the cache at once, refresh the cached copy in the background,
   so a new version arrives on the next start. Bump VERSION when the file list changes. */
var VERSION = 'katvan2-v1'; /* own prefix: 2.0 shares the github.io origin with the original, whose cleanup deletes 'katvan-*' */
var ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'css/app.css',
  'css/fonts.css',
  'js/icons.js',
  'js/docx-export.js',
  'js/extras.js',
  'js/app.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-192.png',
  'icons/icon-maskable-512.png',
  'vendor/jszip.min.js',
  'vendor/mammoth.browser.min.js',
  'vendor/jspdf.umd.min.js',
  'vendor/mathlive/mathlive.min.js',
  'vendor/mathlive/mathlive-fonts.css',
  'vendor/mathlive/mathlive-static.css',
  'vendor/mathlive/fonts/KaTeX_AMS-Regular.woff2',
  'vendor/mathlive/fonts/KaTeX_Caligraphic-Bold.woff2',
  'vendor/mathlive/fonts/KaTeX_Caligraphic-Regular.woff2',
  'vendor/mathlive/fonts/KaTeX_Fraktur-Bold.woff2',
  'vendor/mathlive/fonts/KaTeX_Fraktur-Regular.woff2',
  'vendor/mathlive/fonts/KaTeX_Main-Bold.woff2',
  'vendor/mathlive/fonts/KaTeX_Main-BoldItalic.woff2',
  'vendor/mathlive/fonts/KaTeX_Main-Italic.woff2',
  'vendor/mathlive/fonts/KaTeX_Main-Regular.woff2',
  'vendor/mathlive/fonts/KaTeX_Math-BoldItalic.woff2',
  'vendor/mathlive/fonts/KaTeX_Math-Italic.woff2',
  'vendor/mathlive/fonts/KaTeX_SansSerif-Bold.woff2',
  'vendor/mathlive/fonts/KaTeX_SansSerif-Italic.woff2',
  'vendor/mathlive/fonts/KaTeX_SansSerif-Regular.woff2',
  'vendor/mathlive/fonts/KaTeX_Script-Regular.woff2',
  'vendor/mathlive/fonts/KaTeX_Size1-Regular.woff2',
  'vendor/mathlive/fonts/KaTeX_Size2-Regular.woff2',
  'vendor/mathlive/fonts/KaTeX_Size3-Regular.woff2',
  'vendor/mathlive/fonts/KaTeX_Size4-Regular.woff2',
  'vendor/mathlive/fonts/KaTeX_Typewriter-Regular.woff2',
  'fonts/Assistant-hebrew-0.woff2',
  'fonts/Assistant-latin-ext-1.woff2',
  'fonts/Assistant-latin-2.woff2',
  'fonts/David-Libre-hebrew-3.woff2',
  'fonts/David-Libre-latin-ext-4.woff2',
  'fonts/David-Libre-latin-5.woff2',
  'fonts/David-Libre-hebrew-6.woff2',
  'fonts/David-Libre-latin-ext-7.woff2',
  'fonts/David-Libre-latin-8.woff2',
  'fonts/David-Libre-hebrew-9.woff2',
  'fonts/David-Libre-latin-ext-10.woff2',
  'fonts/David-Libre-latin-11.woff2',
  'fonts/Frank-Ruhl-Libre-hebrew-12.woff2',
  'fonts/Frank-Ruhl-Libre-latin-ext-13.woff2',
  'fonts/Frank-Ruhl-Libre-latin-14.woff2',
  'fonts/Heebo-hebrew-15.woff2',
  'fonts/Heebo-latin-ext-16.woff2',
  'fonts/Heebo-latin-17.woff2',
  'fonts/Noto-Sans-Hebrew-hebrew-18.woff2',
  'fonts/Noto-Sans-Hebrew-latin-ext-19.woff2',
  'fonts/Noto-Sans-Hebrew-latin-20.woff2',
  'fonts/Rubik-hebrew-21.woff2',
  'fonts/Rubik-latin-ext-22.woff2',
  'fonts/Rubik-latin-23.woff2',
  'fonts/Secular-One-hebrew-24.woff2',
  'fonts/Secular-One-latin-ext-25.woff2',
  'fonts/Secular-One-latin-26.woff2'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(VERSION)
      .then(function (cache) { return cache.addAll(ASSETS.map(function (u) { return new Request(u, { cache: 'reload' }); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) { return Promise.all(keys.filter(function (k) { return k.indexOf('katvan2-') === 0 && k !== VERSION; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  var isPage = req.mode === 'navigate';
  event.respondWith(
    caches.open(VERSION).then(function (cache) {
      var key = isPage ? 'index.html' : req;
      return cache.match(key, { ignoreSearch: true }).then(function (hit) {
        var fresh = fetch(req).then(function (res) {
          if (res && res.ok && res.type === 'basic') cache.put(key, res.clone());
          return res;
        }).catch(function () { return null; });
        if (hit) {
          event.waitUntil(fresh);
          return hit;
        }
        return fresh.then(function (res) { return res || new Response('', { status: 504, statusText: 'offline' }); });
      });
    })
  );
});
