const CACHE='omd-v0.9.14';
const ASSETS=['./','./index.html','./styles.css','./app.js','./data.js','./content.js','./manifest.webmanifest','./games/game-viewport.js','./games/snikkers-run/snikkers-run.css','./games/snikkers-run/snikkers-run.js','./games/snikkers-run/index.html','./games/snikkers-run/assets/cover.png','./games/snikkers-run/assets/run1.png','./games/snikkers-run/assets/run2.png','./games/snikkers-run/assets/run3.png','./games/snikkers-run/assets/run4.png','./games/snikkers-run/assets/jump1.png','./games/snikkers-run/assets/jump2.png','./games/snikkers-run/assets/land.png','./games/snikkers-run/assets/gameover.png','./assets/joey-motivation.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/games/snikkers-run/run1.png','./assets/games/snikkers-run/run2.png','./assets/games/snikkers-run/run3.png','./assets/games/snikkers-run/run4.png','./assets/games/snikkers-run/jump1.png','./assets/games/snikkers-run/jump2.png','./assets/games/snikkers-run/land.png','./assets/games/snikkers-run/gameover.png','./assets/games/snikkers-run/cover.png','./assets/games/snikkers-catch/cover.png','./games/snikkers-catch/index.html','./games/snikkers-catch/styles.css','./games/snikkers-catch/game.js','./games/snikkers-catch/assets/snikkers.png','./games/snikkers-catch/assets/audio/theme.mp3','./games/snikkers-run/assets/audio/theme.mp3','./assets/games/snikkers-chase/cover.png','./games/snikkers-chase/index.html','./games/snikkers-chase/styles.css','./games/snikkers-chase/game.js','./games/snikkers-chase/assets/snikkers.png','./games/snikkers-chase/assets/idle.png','./games/snikkers-chase/assets/run1.png','./games/snikkers-chase/assets/run2.png','./games/snikkers-chase/assets/run3.png','./games/snikkers-chase/assets/run4.png','./games/snikkers-chase/assets/flies_sheet.png','./games/snikkers-chase/assets/audio/snikkers_chase_theme.mp3','./assets/games/snikkers-memory/cover.png','./games/snikkers-memory/index.html','./games/snikkers-memory/styles.css','./games/snikkers-memory/game.js','./games/snikkers-memory/README.txt','./games/snikkers-memory/assets/memory/snikkers01.jpg','./games/snikkers-memory/assets/memory/snikkers02.jpg','./games/snikkers-memory/assets/memory/snikkers03.jpg','./games/snikkers-memory/assets/memory/snikkers04.jpg','./games/snikkers-memory/assets/memory/snikkers05.jpg','./games/snikkers-memory/assets/memory/snikkers06.jpg','./games/snikkers-memory/assets/memory/snikkers07.jpg','./games/snikkers-memory/assets/memory/snikkers08.jpg','./games/snikkers-memory/assets/memory/snikkers09.jpg','./games/snikkers-memory/assets/memory/snikkers10.jpg','./games/snikkers-memory/assets/memory/snikkers11.jpg','./games/snikkers-memory/assets/memory/snikkers12.jpg','./games/snikkers-memory/assets/memory/snikkers13.jpg','./games/snikkers-memory/assets/memory/snikkers14.jpg','./games/snikkers-memory/assets/memory/snikkers15.jpg','./games/snikkers-memory/assets/memory/snikkers16.jpg','./games/snikkers-memory/assets/memory/snikkers17.jpg','./games/snikkers-memory/assets/memory/snikkers18.jpg','./games/snikkers-memory/assets/memory/snikkers19.jpg','./games/snikkers-memory/assets/memory/snikkers20.jpg','./games/snikkers-memory/assets/memory/snikkers21.jpg','./games/snikkers-memory/assets/memory/snikkers22.jpg','./games/snikkers-memory/assets/memory/snikkers23.jpg','./games/snikkers-memory/assets/memory/snikkers24.jpg','./games/snikkers-memory/assets/memory/snikkers25.jpg','./games/snikkers-memory/assets/memory/snikkers26.jpg','./games/snikkers-memory/assets/memory/snikkers27.jpg','./games/snikkers-memory/assets/memory/snikkers28.jpg','./games/snikkers-memory/assets/memory/snikkers29.jpg','./games/snikkers-memory/assets/memory/snikkers30.jpg','./games/snikkers-memory/assets/memory/snikkers31.jpg'];

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
