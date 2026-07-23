const CACHE_PREFIX = "eclipse-cinema-portal-";
const CACHE_NAME = `${CACHE_PREFIX}67d8d0a23ab1cc8d37f8726900bf7c73`;
const APP_SHELL_URL = "/portal/index.html";
const PRECACHE_URLS = [
  "/portal/",
  APP_SHELL_URL,
  "/portal/favicon.ico",
  "/portal/icon.png",
  "/portal/manifest.webmanifest",
  "/portal/_expo/static/js/web/entry-67d8d0a23ab1cc8d37f8726900bf7c73.js",
  "/portal/assets/assets/apple-sign-in-logo-white.42ff957f8c4ef88cc510340502cd40a1.png",
  "/portal/assets/assets/google-sign-in-logo.2bbfebc5c3db0d7a97b8cf8fe25cc8c8.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (
    url.origin !== self.location.origin ||
    !url.pathname.startsWith("/portal/")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) =>
          response.ok
            ? response
            : caches.match(APP_SHELL_URL).then((cached) => cached ?? response),
        )
        .catch(() => caches.match(APP_SHELL_URL)),
    );
    return;
  }

  if (
    url.pathname.startsWith("/portal/_expo/") ||
    url.pathname.startsWith("/portal/assets/") ||
    url.pathname === "/portal/favicon.ico" ||
    url.pathname === "/portal/icon.png" ||
    url.pathname === "/portal/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              void caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
