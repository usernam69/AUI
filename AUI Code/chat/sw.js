const CACHE_NAME = "aui-t20261018-b34";
const ASSET_VERSION = "20261018-b34";
const versioned = path => `${path}?v=${ASSET_VERSION}`;

// The worker lives in <base>chat/, so resolve everything from there. That keeps it
// working under a sub-path such as the /AUI/ GitHub Pages site as well as at the root.
const BASE = new URL("../", self.registration.scope).pathname;
const at = path => `${BASE}${path}`;

const PRECACHE_PAGES = [at("chat"), at("about"), at("help.html"), at("changelog.html"), at("accessibility.html"), at("privacy.html")];
const RUNTIME_CACHE = "aui-runtime";
const RUNTIME_HOSTS = ["esm.sh", "cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];
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
  at(versioned("modules/rag.js")),
  at(versioned("modules/files.js")),
  at(versioned("modules/vault.js")),
  at(versioned("modules/luhn.js")),
  at(versioned("modules/plans.js")),
  at(versioned("modules/skills.js")),
  at(versioned("modules/openrouter.js")),
  at(versioned("modules/models.js")),
  at(versioned("modules/study-ui.js")),
  at("modules/study.js"),
  at("modules/citation.js"),
  at("modules/share.js"),
  at("modules/vendor/marked-16.1.2.mjs"),
  at("modules/vendor/dompurify-3.2.6.mjs"),
  at("modules/vendor/highlight-11.11.1-common.mjs"),
  at("modules/vendor/katex-0.16.22.mjs"),
  at("modules/vendor/katex/katex.min.css"),
  at("modules/vendor/highlight-github-dark-11.11.1.min.css")
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
        // Only remove AUI's own older asset caches. Other caches (like the downloaded
        // WebLLM model, hundreds of MB) must survive app updates.
        keys.filter(key => key.startsWith("aui-t") && key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Libraries and styles from these CDNs are kept so formatting works offline (402).
  if (url.origin !== location.origin) {
    if (!RUNTIME_HOSTS.includes(url.hostname)) return;
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache => cache.match(request).then(cached => {
        const network = fetch(request).then(response => {
          if (response.ok || response.type === "opaque") cache.put(request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || network;
      }))
    );
    return;
  }

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
