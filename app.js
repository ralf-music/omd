(() => {
  const DATA = window.OMD_DATA;
  const STORE_KEY = 'omd-state-v1';
  const SCHEMA_VERSION = 2;
  const DAILY_CENTS = 50;
  const PERFECT_WEEK_CENTS = 200;
  const state = loadState();
  const $ = id => document.getElementById(id);

  // One-time launch/test exception: Monday, 14.09.2026 counts WORK as completed.
  // From 15.09.2026 onward the normal location rules apply without exceptions.
  seedLaunchTestDay();

  const refs = {
    todayLabel:$('todayLabel'), pauseBanner:$('pauseBanner'), dayBadge:$('dayBadge'),
    workStep:$('workStep'), homeStep:$('homeStep'), workStatus:$('workStatus'), homeStatus:$('homeStatus'),
    locationBtn:$('locationBtn'), locationHint:$('locationHint'), rewardCard:$('rewardCard'), rewardLock:$('rewardLock'),
    rewardTitle:$('rewardTitle'), rewardSubtitle:$('rewardSubtitle'), openRewardBtn:$('openRewardBtn'), rewardContent:$('rewardContent'),
    dailyPicture:$('dailyPicture'), pictureSource:$('pictureSource'), songTitle:$('songTitle'), songArtist:$('songArtist'), spotifyBtn:$('spotifyBtn'), spotifyCoverWrap:$('spotifyCoverWrap'), spotifyCover:$('spotifyCover'), spotifyCoverFallback:$('spotifyCoverFallback'),
    weekDays:$('weekDays'), weekBadge:$('weekBadge'), weeklyRewardBox:$('weeklyRewardBox'), weeklyRewardStatus:$('weeklyRewardStatus'), weeklyRewardBtn:$('weeklyRewardBtn'),
    dailyCount:$('dailyCount'), weeklyCount:$('weeklyCount'), completedCount:$('completedCount'), pauseBtn:$('pauseBtn'), nextMissionText:$('nextMissionText'),
    historyList:$('historyList'), pauseDialog:$('pauseDialog'), pauseForm:$('pauseForm'), pauseReason:$('pauseReason'), pauseFrom:$('pauseFrom'), pauseTo:$('pauseTo'),
    weeklyDialog:$('weeklyDialog'), weeklyDialogTitle:$('weeklyDialogTitle'), weeklyDialogText:$('weeklyDialogText'), weeklyYoutubeLink:$('weeklyYoutubeLink'),
    walletBalance:$('walletBalance'), todayEarned:$('todayEarned'), weekEarned:$('weekEarned'),
    versionBtn:$('versionBtn'), versionDialog:$('versionDialog')
  };

  function loadState(){
    const base={schemaVersion:SCHEMA_VERSION,days:{},pauses:[],weeklyOpened:{},ledger:[]};
    try {
      const loaded=Object.assign(base,JSON.parse(localStorage.getItem(STORE_KEY)||'{}'));
      loaded.days ||= {}; loaded.pauses ||= []; loaded.weeklyOpened ||= {}; loaded.ledger ||= [];
      loaded.schemaVersion=SCHEMA_VERSION;
      return loaded;
    } catch { return base; }
  }

  function seedLaunchTestDay(){
    const key='2026-09-14';
    const existing=state.days && state.days[key];
    if(existing && existing.work) return;
    state.days ||= {};
    const ds=state.days[key] ||= {work:false,home:false,rewardOpened:false};
    ds.work=true;
    ds.workAt='2026-09-14T10:00:00+02:00';
    ds.workSource='launch-test';
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }
  function saveState(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  function dateKey(d=new Date()){ return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); }
  function localDate(key){ const [y,m,d]=key.split('-').map(Number); return new Date(y,m-1,d); }
  function fmtDate(d){ return new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'2-digit',month:'long'}).format(d); }
  function fmtTime(iso){ return new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit'}).format(new Date(iso)); }
  function dayState(key){ return state.days[key] ||= {work:false,home:false,rewardOpened:false}; }
  function isWorkday(d){ const wd=d.getDay(); return wd>=1&&wd<=5; }
  function decodeZone(code){ const z=DATA.geo.zones[code], sc=DATA.geo.scale; return {name:code==='w'?'WORK':'HOME',lat:z[0]/sc[0],lon:z[1]/sc[1],radius:z[2]}; }
  function euro(cents){ return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(cents/100); }
  function isPaused(key){ return state.pauses.find(p => key>=p.from && key<=p.to) || null; }
  function hash(str){ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619);} return Math.abs(h>>>0); }
  function imageUrl(file){ return 'https://commons.wikimedia.org/wiki/Special:Redirect/file/' + encodeURIComponent(file) + '?width=1200'; }

  function distanceMeters(lat1,lon1,lat2,lon2){
    const R=6371000, r=Math.PI/180, dLat=(lat2-lat1)*r, dLon=(lon2-lon1)*r;
    const a=Math.sin(dLat/2)**2 + Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin(dLon/2)**2;
    return 2*R*Math.asin(Math.sqrt(a));
  }

  function render(){
    const now=new Date(), key=dateKey(now), ds=dayState(key), pause=isPaused(key), workday=isWorkday(now);
    refs.todayLabel.textContent=fmtDate(now);
    refs.pauseBanner.classList.toggle('hidden',!pause);
    if(pause){
      refs.pauseBanner.innerHTML=`<p class="eyebrow">MISSION PAUSED</p><h2>${pause.reason}</h2><p class="muted">Heute ist kein Check-in nötig. Deine nächste Mission wartet danach.</p>`;
    }

    refs.workStep.classList.toggle('done',!!ds.work); refs.homeStep.classList.toggle('done',!!ds.home);
    refs.workStatus.textContent=ds.work ? `Bestätigt · ${fmtTime(ds.workAt)}` : (!workday ? 'Heute keine Arbeitsmission' : 'Vor 13:00 Uhr am Arbeitsort bestätigen');
    refs.homeStatus.textContent=ds.home ? `Bestätigt · ${fmtTime(ds.homeAt)}` : (!workday ? 'Heute keine Arbeitsmission' : (now.getHours()<13 ? 'Ab 13:00 Uhr verfügbar' : 'Jetzt zuhause bestätigen'));
    refs.dayBadge.textContent=`${Number(!!ds.work)+Number(!!ds.home)}/2`;

    if(!workday){ refs.locationBtn.disabled=true; refs.locationBtn.textContent='HEUTE KEINE MISSION'; }
    else if(pause){ refs.locationBtn.disabled=true; refs.locationBtn.textContent='HEUTE PAUSIERT'; }
    else if(ds.work && ds.home){ refs.locationBtn.disabled=true; refs.locationBtn.textContent='MISSION ERLEDIGT'; }
    else { refs.locationBtn.disabled=false; refs.locationBtn.textContent='STANDORT PRÜFEN'; }

    const unlocked=!!(ds.work&&ds.home);
    refs.rewardCard.classList.toggle('unlocked',unlocked); refs.rewardCard.classList.toggle('locked',!unlocked);
    refs.rewardLock.textContent=unlocked?'★':'🔒'; refs.rewardTitle.textContent=unlocked?'Reward bereit':'Noch gesperrt';
    refs.rewardSubtitle.textContent=unlocked?'One More Day completed.':'Erst WORK + HOME abschließen.';
    refs.openRewardBtn.disabled=!unlocked; refs.openRewardBtn.textContent=ds.rewardOpened?'REWARD ANZEIGEN':'TÜRCHEN ÖFFNEN';
    if(ds.rewardOpened) showDailyReward(key,ds); else refs.rewardContent.classList.add('hidden');

    reconcileLedger(); renderWeek(now); renderWallet(now); renderStats(); renderHistory(); renderNextMission();
  }

  function checkLocation(){
    const now=new Date(), key=dateKey(now), ds=dayState(key);
    if(!isWorkday(now)){ refs.locationHint.textContent='Heute ist keine Arbeitsmission aktiv.'; render(); return; }
    if(isPaused(key)){ refs.locationHint.textContent='Dieser Tag ist pausiert.'; render(); return; }
    if(!navigator.geolocation){ refs.locationHint.textContent='Dieses Gerät unterstützt keine Standortabfrage.'; return; }
    const before13=now.getHours()<13;
    if(!before13 && !ds.work){ refs.locationHint.textContent='HOME ist erst möglich, wenn WORK heute erfolgreich bestätigt wurde.'; render(); return; }
    refs.locationBtn.disabled=true; refs.locationBtn.textContent='STANDORT WIRD GEPRÜFT…'; refs.locationHint.textContent='GPS/Standort wird einmalig abgefragt.';
    navigator.geolocation.getCurrentPosition(pos=>{
      const {latitude,longitude,accuracy}=pos.coords;
      const target=decodeZone(before13?'w':'h');
      const dist=Math.round(distanceMeters(latitude,longitude,target.lat,target.lon));
      if(accuracy>2000){ refs.locationHint.textContent=`Standort zu ungenau (±${Math.round(accuracy)} m). Bitte erneut versuchen.`; render(); return; }
      if(dist<=target.radius){
        if(before13){ ds.work=true; ds.workAt=new Date().toISOString(); ds.workSource='geo-local'; refs.locationHint.textContent=`WORK bestätigt · ca. ${dist} m vom Zielpunkt.`; }
        else { ds.home=true; ds.homeAt=new Date().toISOString(); ds.homeSource='geo-local'; refs.locationHint.textContent=`HOME bestätigt · ca. ${dist} m vom Zielpunkt.`; }
        saveState(); render();
      } else {
        refs.locationHint.textContent=`Nicht in der ${target.name}-Zone · ca. ${(dist/1000).toFixed(1)} km entfernt.`; render();
      }
    },err=>{
      const msg={1:'Standortberechtigung wurde verweigert.',2:'Standort ist momentan nicht verfügbar.',3:'Standortabfrage hat zu lange gedauert.'}[err.code]||'Standort konnte nicht geprüft werden.';
      refs.locationHint.textContent=msg; render();
    },{enableHighAccuracy:true,maximumAge:0,timeout:15000});
  }

  function assignReward(key,ds){
    if(ds.pictureIndex==null) ds.pictureIndex=hash(key+'pic')%DATA.pictures.length;
    if(ds.songIndex==null) ds.songIndex=hash(key+'song')%DATA.songs.length;
  }
  function showDailyReward(key,ds){
    assignReward(key,ds); saveState();
    const pic=DATA.pictures[ds.pictureIndex], song=DATA.songs[ds.songIndex];
    refs.dailyPicture.src=imageUrl(pic.file); refs.dailyPicture.alt=pic.title; refs.pictureSource.href=pic.source;
    refs.songTitle.textContent=song.title; refs.songArtist.textContent=song.artist; refs.spotifyBtn.href=song.url;
    loadSpotifyCover(song);
    refs.rewardContent.classList.remove('hidden'); refs.rewardTitle.textContent=pic.title;
  }

  async function loadSpotifyCover(song){
    refs.spotifyCover.classList.add('hidden');
    refs.spotifyCover.removeAttribute('src');
    refs.spotifyCoverFallback.classList.remove('hidden');
    refs.spotifyCoverFallback.textContent='SPOTIFY COVER WIRD GELADEN…';
    const sourceUrl=song.coverUrl || (/open\.spotify\.com\/(?:intl-[^/]+\/)?(?:track|album)\//.test(song.url) ? song.url : '');
    if(!sourceUrl){
      refs.spotifyCoverFallback.textContent='COVER FÜR DIESEN SONG NOCH NICHT HINTERLEGT';
      return;
    }
    try{
      const endpoint='https://open.spotify.com/oembed?url='+encodeURIComponent(sourceUrl);
      const response=await fetch(endpoint,{mode:'cors'});
      if(!response.ok) throw new Error('Spotify oEmbed '+response.status);
      const meta=await response.json();
      if(!meta.thumbnail_url) throw new Error('Kein Cover vorhanden');
      refs.spotifyCover.onload=()=>{
        refs.spotifyCover.classList.remove('hidden');
        refs.spotifyCoverFallback.classList.add('hidden');
      };
      refs.spotifyCover.onerror=()=>{
        refs.spotifyCover.classList.add('hidden');
        refs.spotifyCoverFallback.classList.remove('hidden');
        refs.spotifyCoverFallback.textContent='SPOTIFY COVER KONNTE NICHT GELADEN WERDEN';
      };
      refs.spotifyCover.src=meta.thumbnail_url;
    }catch(err){
      console.warn('Spotify cover:',err);
      refs.spotifyCoverFallback.textContent='SPOTIFY COVER KONNTE NICHT GELADEN WERDEN';
    }
  }

  function openDailyReward(){ const key=dateKey(), ds=dayState(key); if(!(ds.work&&ds.home)) return; ds.rewardOpened=true; assignReward(key,ds); saveState(); showDailyReward(key,ds); renderStats(); renderHistory(); }

  function getWeekStart(d){ const x=new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x; }
  function renderWeek(now){
    const start=getWeekStart(now), labels=['MO','DI','MI','DO','FR']; let completed=0;
    refs.weekDays.innerHTML='';
    for(let i=0;i<5;i++){
      const d=new Date(start); d.setDate(start.getDate()+i); const key=dateKey(d), pause=isPaused(key), ds=state.days[key];
      const done=!!(ds&&ds.work&&ds.home); if(done) completed++;
      const el=document.createElement('div'); el.className='week-day'+(done?' done':'')+(pause?' paused':''); el.innerHTML=`${labels[i]}<strong>${pause?'–':done?'✓':'○'}</strong>`; refs.weekDays.appendChild(el);
    }
    refs.weekBadge.textContent=`${completed}/5`;
    const weekKey=dateKey(start), canUnlock=completed===5;
    refs.weeklyRewardBox.classList.toggle('ready',canUnlock); refs.weeklyRewardBtn.disabled=!canUnlock;
    refs.weeklyRewardStatus.textContent=canUnlock?(state.weeklyOpened[weekKey]?'Freigeschaltet':'Bereit zum Öffnen'):'Montag bis Freitag vollständig abschließen';
    refs.weeklyRewardBtn.onclick=()=>openWeekly(weekKey);
  }
  function openWeekly(weekKey){
    const idx=hash(weekKey+'weekly')%DATA.weeklyRewards.length, wr=DATA.weeklyRewards[idx]; state.weeklyOpened[weekKey]={index:idx,openedAt:new Date().toISOString()}; saveState();
    refs.weeklyDialogTitle.textContent=wr.title; refs.weeklyDialogText.textContent=wr.text; refs.weeklyYoutubeLink.href='https://www.youtube.com/results?search_query='+encodeURIComponent(wr.query); refs.weeklyDialog.showModal(); render();
  }

  function transaction(id,type,cents,meta={}){
    if(state.ledger.some(t=>t.id===id)) return false;
    state.ledger.push({id,type,cents,createdAt:new Date().toISOString(),...meta});
    return true;
  }
  function reconcileLedger(){
    let changed=false;
    for(const [key,d] of Object.entries(state.days)){
      const date=localDate(key);
      if(isWorkday(date) && d.work && d.home && !isPaused(key)) changed=transaction(`daily:${key}`,'DAILY_REWARD',DAILY_CENTS,{date:key})||changed;
    }
    const starts=new Set(Object.keys(state.days).map(k=>dateKey(getWeekStart(localDate(k)))));
    for(const wk of starts){
      const start=localDate(wk); let perfect=true;
      for(let i=0;i<5;i++){ const d=new Date(start); d.setDate(start.getDate()+i); const k=dateKey(d), ds=state.days[k]; if(!(ds&&ds.work&&ds.home) || isPaused(k)){ perfect=false; break; } }
      if(perfect) changed=transaction(`week:${wk}`,'PERFECT_WEEK',PERFECT_WEEK_CENTS,{week:wk})||changed;
    }
    if(changed) saveState();
  }
  function renderWallet(now){
    const total=state.ledger.reduce((sum,t)=>sum+Number(t.cents||0),0);
    const today=dateKey(now), week=dateKey(getWeekStart(now));
    const todayTotal=state.ledger.filter(t=>t.date===today).reduce((s,t)=>s+t.cents,0);
    const weekEnd=new Date(getWeekStart(now)); weekEnd.setDate(weekEnd.getDate()+4); const weekEndKey=dateKey(weekEnd);
    const weekTotal=state.ledger.filter(t=>(t.date&&t.date>=week&&t.date<=weekEndKey)||t.week===week).reduce((s,t)=>s+t.cents,0);
    refs.walletBalance.textContent=euro(total); refs.todayEarned.textContent=euro(todayTotal); refs.weekEarned.textContent=euro(weekTotal);
  }

  function renderStats(){
    const entries=Object.entries(state.days), completed=entries.filter(([,d])=>d.work&&d.home).length, opened=entries.filter(([,d])=>d.rewardOpened).length;
    refs.completedCount.textContent=completed; refs.dailyCount.textContent=opened; refs.weeklyCount.textContent=Object.keys(state.weeklyOpened).length;
  }
  function renderHistory(){
    const items=Object.entries(state.days).filter(([,d])=>d.rewardOpened).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,5);
    if(!items.length){ refs.historyList.innerHTML='<p class="muted">Noch nichts freigeschaltet.</p>'; return; }
    refs.historyList.innerHTML=items.map(([key,d])=>{assignReward(key,d); const s=DATA.songs[d.songIndex]; return `<div class="history-item"><div><strong>${s.title}</strong><br><small>${s.artist}</small></div><small>${new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit'}).format(localDate(key))}</small></div>`}).join('');
  }
  function renderNextMission(){
    let d=new Date(); for(let i=0;i<370;i++){ const key=dateKey(d), weekday=d.getDay(); if(weekday>=1&&weekday<=5&&!isPaused(key)){ refs.nextMissionText.textContent=`Nächste aktive Mission: ${fmtDate(d)}`; return;} d.setDate(d.getDate()+1); }
  }

  function savePause(ev){
    ev.preventDefault(); const from=refs.pauseFrom.value, to=refs.pauseTo.value; if(!from||!to||to<from) return;
    state.pauses.push({from,to,reason:refs.pauseReason.value}); state.pauses.sort((a,b)=>a.from.localeCompare(b.from)); saveState(); refs.pauseDialog.close(); render();
  }

  refs.locationBtn.addEventListener('click',checkLocation); refs.openRewardBtn.addEventListener('click',openDailyReward);
  refs.pauseBtn.addEventListener('click',()=>{ const k=dateKey(); refs.pauseFrom.value=k; refs.pauseTo.value=k; refs.pauseDialog.showModal(); });
  refs.pauseForm.addEventListener('submit',savePause); $('cancelPauseBtn').addEventListener('click',()=>refs.pauseDialog.close()); refs.versionBtn.addEventListener('click',()=>refs.versionDialog.showModal());
  if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  render(); setInterval(render,60000);
})();
