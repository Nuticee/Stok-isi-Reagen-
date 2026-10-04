const CACHE = "stok-reagen-lite-v5";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // Jangan pernah cache HTML utama atau request Supabase.
  if (
    req.method !== "GET" ||
    url.hostname.includes("supabase.co") ||
    req.mode === "navigate" ||
    url.pathname.endsWith("/index.html")
  ) {
    return;
  }

  // Untuk aset statis, gunakan cache lalu jaringan.
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return response;
      });
    })
  );
});
