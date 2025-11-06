const CACHE_VERSION = "stargate-mail-v1";
// 缓存所有邮件系统页面（对应你提供的home/inbox等文件）
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
  "./1762422730443.png",
  "./1762422726708.png"
];

// 安装时缓存核心文件
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(CACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

// 激活时清除旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 离线优先加载
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => caches.match("./index.html"))
  );
});
