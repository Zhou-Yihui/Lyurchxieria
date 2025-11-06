const CACHE_VERSION = "stargate-mail-v2";
const CACHE_FILES = [
  "./index.html",
  "./home.html",
  "./inbox.html",
  "./compose.html",
  "./contacts.html",
  "./draft.html",
  "./sent.html",
  "./settings.html",
  "./spam.html",
  "./trash.html",
  "./1762422726708.png",
  "./1762422730443.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(CACHE_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)).catch(() => caches.match("./index.html")));
});
