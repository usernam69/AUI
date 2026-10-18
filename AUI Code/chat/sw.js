const CACHE_NAME = "aui-t20261018-b5";
const ASSET_VERSION = "20261018-b5";
const versioned = path => `${path}?v=${ASSET_VERSION}`;

// The worker lives in <base>chat/, so resolve everything from there. That keeps it
// working under a sub-path such as the /AUI/ GitHub Pages site as well as at the root.
const BASE = new URL("../", self.registration.scope).pathname;
const at = path => `${BASE}${path}`;

const PRECACHE_PAGES = [at("chat"), at("about")];
const PRECACHE_ASSETS = [
  at(versioned("style.css")),
  at(versioned("chat/app.js")),
  at("favicon-t-20260728.svg"),
  at("og.png"),
  at(versioned("modules/storage.js")),
  at(versioned("modules/keyboard.js")),
  at(versioned("modules/markdown.js")),
  at(versioned("modules/uploads.js")),
  at(versioned("modules/slm.js")),
  at("modules/slm-worker.js"),
  at(versioned("modules/rag.js"))
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS)
        // Pages may redirect (e.g. to a trailing slash); a miss here must not block install.
        .then(() => Promise.all(PRECACHE_PAGES.map(page => cache.add(page).catch(() => {})))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== location.origin) return;

  const isNavigation = request.mode === "navigate";
  const extension = url.pathname.split(".").pop();
  const isHtml = isNavigation || extension === "html" || !extension || extension === url.pathname.split("/").pop();

  if (isHtml || isNavigation) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match(at("chat"))))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response.ok) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      });
    })
  );
});
