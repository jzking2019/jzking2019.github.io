self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('v2').then(function(cache) {
            return cache.addAll([
                '/',
                '/?source=pwa', // 👈 確保 start_url 被快取
                '/index.html',
                '/manifest.json'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
