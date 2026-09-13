const CACHE='htm-v4-2026-09';
const CORE=['/','/index.html','/bible.html','/daily-word.html','/sermons.html','/events.html','/prayer.html','/give.html','/branches.html','/offline.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET') return;
 const u=new URL(e.request.url); if(u.origin!==location.origin)return;
 const path=u.pathname;
 const dynamic=/\.(html?|js|css)$/i.test(path)||path==='/'||path.endsWith('/');
 if(dynamic){
   e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/offline.html'))));
 } else {
   e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>caches.match('/offline.html'))));
 }
});
