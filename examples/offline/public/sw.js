const CACHE_NAME = 'notes-app-cache-v1';

const filesToCache = [
    '/',
    '/index.js',
    '/index.html',
    '/sw.js',
    'https://unpkg.com/@picocss/pico@latest/css/pico.min.css',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', async () => {

    console.log('Service Worker activated');
    const cacheKeys = await caches.keys();

    cacheKeys.forEach(cacheKey => {
        if (cacheKey !== CACHE_NAME) {
            caches.delete(cacheKey);
        }
    });
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
            let fetchPromise = fetch(event.request).then(networkResponse => {
                if (event.request.url.indexOf('technologies') === -1) {
                    cache.put(event.request, networkResponse.clone());     
                }
                return networkResponse;
            }).catch(error => {
                console.warn('Could not fetch at the moment.');
                console.error(error);
            });

            return response || fetchPromise;
        });
    }))

});
