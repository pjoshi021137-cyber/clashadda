const CACHE="bgr-pro-max-v2"; const ASSETS=["./","./index.html","./admin.html","./payment.html","./logo.png","./manifest.json"];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.map(x=>{ if(x!==CACHE) return caches.delete(x)})))); self.clients.claim(); });
self.addEventListener('fetch', e=>{ e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request).catch(()=>caches.match("./index.html")))); });
