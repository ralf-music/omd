const CACHE='omd-v0.9.2';
const ASSETS=['./','./index.html','./styles.css','./app.js','./data.js','./content.js','./manifest.webmanifest','./games/snikkers-runner/snikkers-runner.css','./games/snikkers-runner/snikkers-runner.js','./assets/joey-motivation.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/games/snikkers-runner/run1.png','./assets/games/snikkers-runner/run2.png','./assets/games/snikkers-runner/run3.png','./assets/games/snikkers-runner/run4.png','./assets/games/snikkers-runner/jump1.png','./assets/games/snikkers-runner/jump2.png','./assets/games/snikkers-runner/land.png','./assets/games/snikkers-runner/gameover.png','./assets/games/snikkers-runner/cover.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
    if(new URL(event.request.url).origin===location.origin){
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    }
    return response;
  }).catch(()=>caches.match('./index.html'))));
});

self.addEventListener('push',event=>{
  let payload={};
  try{ payload=event.data ? event.data.json() : {}; }
  catch{ payload={body:event.data ? event.data.text() : ''}; }
  const title=payload.title || 'One More Day';
  const options={
    body:payload.body || 'Neue Benachrichtigung',
    icon:'./assets/icons/icon-192.png',
    badge:'./assets/icons/icon-192.png',
    tag:payload.tag || undefined,
    renotify:false,
    data:{url:'./',...(payload.data||{})}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const targetUrl=new URL(event.notification.data?.url || './',self.location.origin).href;
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of windows){
      if('focus' in client){
        try{ await client.navigate(targetUrl); }catch{}
        return client.focus();
      }
    }
    if(self.clients.openWindow) return self.clients.openWindow(targetUrl);
  })());
});
