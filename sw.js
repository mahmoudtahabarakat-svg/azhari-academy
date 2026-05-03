// Service Worker - أكاديمية المعلم الأزهري
const CACHE_NAME = "azhari-academy-v1";
const URLS_TO_CACHE = [
  "/azhari-academy/index-standalone.html",
  "/azhari-academy/mushaf-standalone.html",
  "/azhari-academy/stories-standalone.html",
  "/azhari-academy/kids-standalone.html",
  "/azhari-academy/quiz-standalone.html",
  "/azhari-academy/lessons-standalone.html",
  "/azhari-academy/manifest.json",
];

// Install - cache all files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching app files...");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - serve from cache when offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Offline fallback
        return caches.match("/azhari-academy/index-standalone.html");
      });
    })
  );
});

// Push notifications (daily reminders)
self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "أكاديمية المعلم الأزهري";
  const body = data.body || "تذكير يومي - لا تنسَ ورد القرآن اليوم 📖";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "https://raw.githubusercontent.com/mahmoudtahabarakat-svg/azhari-academy/main/logo.png",
      badge: "https://raw.githubusercontent.com/mahmoudtahabarakat-svg/azhari-academy/main/logo.png",
      dir: "rtl",
      lang: "ar",
      vibrate: [200, 100, 200],
      tag: "daily-reminder",
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/azhari-academy/index-standalone.html"));
});
