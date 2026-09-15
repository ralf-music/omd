(() => {
  const DATA = window.OMD_DATA;
  const STORE_KEY = 'omd-state-v1';
  const SCHEMA_VERSION = 6;
  const DAILY_CENTS = 50;
  const PERFECT_WEEK_CENTS = 200;
  const API_BASE = 'https://one-more-day-api.ralf-music.workers.dev/api/v1';
  const state = loadState();
  const $ = id => document.getElementById(id);

  // Start migration: 14.09.2026 and 15.09.2026 count as fully completed launch days.
  // Regular WORK -> HOME geo rules start on 16.09.2026.
  seedLaunchDays();
  migrateRewards022();
  migrateRewardSnapshots034();

  const refs = {
    todayLabel:$('todayLabel'), pauseBanner:$('pauseBanner'), dayBadge:$('dayBadge'),
    workStep:$('workStep'), homeStep:$('homeStep'), workStatus:$('workStatus'), homeStatus:$('homeStatus'),
    locationBtn:$('locationBtn'), locationHint:$('locationHint'), rewardCard:$('rewardCard'), rewardLock:$('rewardLock'),
    rewardTitle:$('rewardTitle'), rewardSubtitle:$('rewardSubtitle'), openRewardBtn:$('openRewardBtn'), rewardContent:$('rewardContent'),
    dailyPicture:$('dailyPicture'), pictureSource:$('pictureSource'), pictureInfo:$('pictureInfo'), songTitle:$('songTitle'), songArtist:$('songArtist'), spotifyBtn:$('spotifyBtn'), spotifyCoverWrap:$('spotifyCoverWrap'), spotifyCover:$('spotifyCover'), spotifyCoverFallback:$('spotifyCoverFallback'),
    weekDays:$('weekDays'), weekBadge:$('weekBadge'), weeklyRewardBox:$('weeklyRewardBox'), weeklyRewardStatus:$('weeklyRewardStatus'), weeklyRewardBtn:$('weeklyRewardBtn'),
    dailyCount:$('dailyCount'), weeklyCount:$('weeklyCount'), completedCount:$('completedCount'), pauseBtn:$('pauseBtn'), nextMissionText:$('nextMissionText'),
    historyList:$('historyList'), pauseDialog:$('pauseDialog'), pauseForm:$('pauseForm'), pauseReason:$('pauseReason'), pauseFrom:$('pauseFrom'), pauseTo:$('pauseTo'),
    weeklyDialog:$('weeklyDialog'), weeklyDialogTitle:$('weeklyDialogTitle'), weeklyDialogText:$('weeklyDialogText'), weeklyYoutubeLink:$('weeklyYoutubeLink'),
    walletBalance:$('walletBalance'), todayEarned:$('todayEarned'), weekEarned:$('weekEarned'),
    versionBtn:$('versionBtn'), versionDialog:$('versionDialog'),
    historyDialog:$('historyDialog'), historyDialogDate:$('historyDialogDate'), historyDialogTitle:$('historyDialogTitle'), historyPicture:$('historyPicture'), historyPictureInfo:$('historyPictureInfo'), historyPictureSource:$('historyPictureSource'), historySpotifyCover:$('historySpotifyCover'), historySpotifyFallback:$('historySpotifyFallback'), historySongTitle:$('historySongTitle'), historySongArtist:$('historySongArtist'), historySpotifyBtn:$('historySpotifyBtn'),
    pictureFullscreenDialog:$('pictureFullscreenDialog'), pictureFullscreenImage:$('pictureFullscreenImage'), pictureFullscreenInfo:$('pictureFullscreenInfo'), pictureFullscreenSource:$('pictureFullscreenSource'), closePictureFullscreen:$('closePictureFullscreen')
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

  function seedLaunchDays(){
    const launchDays=[
      {key:'2026-09-14',workAt:'2026-09-14T10:00:00+02:00',homeAt:'2026-09-14T15:00:00+02:00'},
      {key:'2026-09-15',workAt:'2026-09-15T10:00:00+02:00',homeAt:'2026-09-15T15:00:00+02:00'}
    ];
    state.days ||= {};
    state.migrations ||= {};
    if(state.migrations.launchDays021) return;
    for(const item of launchDays){
      const ds=state.days[item.key] ||= {work:false,home:false,rewardOpened:false};
      ds.work=true; ds.home=true; ds.rewardOpened=true;
      ds.workAt ||= item.workAt; ds.homeAt ||= item.homeAt;
      ds.workSource='launch-migration'; ds.homeSource='launch-migration';
      ds.rewardOpenedAt ||= item.homeAt;
    }
    // These two launch days are explicitly treated as completed, never paused.
    state.pauses=(state.pauses||[]).filter(p=>!launchDays.some(d=>d.key>=p.from&&d.key<=p.to));
    state.migrations.launchDays021=true;
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }

  function migrateRewards022(){
    state.migrations ||= {};
    if(state.migrations.rewards022) return;
    // The launch rewards are intentionally re-selected from the new direct-track pool.
    for(const key of ['2026-09-14','2026-09-15']){
      const ds=state.days[key];
      if(!ds) continue;
      delete ds.songIndex;
      delete ds.songId;
    }
    // Assign chronologically so cooldown and artist-run rules also apply to the two launch days.
    for(const key of ['2026-09-14','2026-09-15']){
      const ds=state.days[key];
      if(ds&&ds.rewardOpened) assignReward(key,ds);
    }
    state.migrations.rewards022=true;
    saveState();
  }
  function makeRewardSnapshot(key,ds){
    assignReward(key,ds);
    const pic=DATA.pictures[ds.pictureIndex];
    const song=DATA.songs.find(s=>s.id===ds.songId) || DATA.songs[ds.songIndex];
    if(!pic || !song) return null;
    return {
      version:1,
      lockedAt:ds.rewardOpenedAt || new Date().toISOString(),
      picture:{title:pic.title||'',info:pic.info||'',file:pic.file||'',source:pic.source||'',url:imageUrl(pic.file)},
      song:{id:song.id||'',title:song.title||'',artist:song.artist||'',url:song.url||'',coverUrl:song.coverUrl||''},
      extras:[]
    };
  }
  function lockReward(key,ds){
    if(ds.rewardSnapshot) return ds.rewardSnapshot;
    ds.rewardSnapshot=makeRewardSnapshot(key,ds);
    return ds.rewardSnapshot;
  }
  function migrateRewardSnapshots034(){
    state.migrations ||= {};
    if(state.migrations.rewardSnapshots034) return;
    for(const [key,ds] of Object.entries(state.days||{})){
      if(ds&&ds.rewardOpened&&!ds.rewardSnapshot) lockReward(key,ds);
    }
    state.migrations.rewardSnapshots034=true;
    saveState();
  }
  function rewardFor(key,ds){
    if(ds.rewardOpened) return lockReward(key,ds);
    return makeRewardSnapshot(key,ds);
  }
  function saveState(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

  async function apiJson(path, options={}){
    const response=await fetch(`${API_BASE}${path}`,options);
    let result=null;
    try{ result=await response.json(); }catch{}
    if(!response.ok || !result || result.ok!==true) throw new Error(`API ${path}`);
    return result;
  }
  function snapshotFromCloudReward(reward){
    return reward?.extras?.snapshot || null;
  }
  async function syncRewardToCloud(key,ds){
    if(!ds?.rewardOpened) return null;
    const localSnapshot=lockReward(key,ds);
    if(!localSnapshot) return null;
    const result=await apiJson('/reward',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        date:key,
        picture_id:localSnapshot.picture?.file || localSnapshot.picture?.title || null,
        song_id:localSnapshot.song?.id || null,
        extras:{snapshot:localSnapshot}
      })
    });
    const locked=snapshotFromCloudReward(result.reward);
    if(locked){ ds.rewardSnapshot=locked; ds.rewardOpened=true; ds.rewardOpenedAt ||= locked.lockedAt || new Date().toISOString(); saveState(); }
    return locked;
  }
  async function syncDayWithCloud(key,ds){
    try{
      const existing=await apiJson(`/day?date=${encodeURIComponent(key)}`);
      if(existing.day){
        ds.work=!!existing.day.work_confirmed || !!ds.work;
        ds.home=!!existing.day.home_confirmed || !!ds.home;
        ds.workAt ||= existing.day.work_confirmed_at;
        ds.homeAt ||= existing.day.home_confirmed_at;
      }
      if(ds.work || ds.home){
        await apiJson('/day',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            date:key,work_confirmed:!!ds.work,work_confirmed_at:ds.workAt||null,
            home_confirmed:!!ds.home,home_confirmed_at:ds.homeAt||null,
            status:ds.work&&ds.home?'COMPLETE':'OPEN'
          })
        });
      }
    }catch(err){ console.warn('D1 day sync:',key,err); }
  }
  async function syncLedgerToCloud(){
    for(const t of state.ledger||[]){
      // 14/15 September were seeded manually in D1 with canonical IDs.
      if(t.type==='DAILY_REWARD' && (t.date==='2026-09-14'||t.date==='2026-09-15')) continue;
      const id=t.type==='DAILY_REWARD'&&t.date ? `daily-${t.date}` : t.type==='PERFECT_WEEK'&&t.week ? `week-${t.week}` : `local-${t.id}`;
      try{
        await apiJson('/transaction',{
          method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({id,type:t.type,amount_cents:Number(t.cents||0),day_date:t.date||null,note:t.type==='PERFECT_WEEK'?'Perfect Week':'Tagesbelohnung'})
        });
      }catch(err){ console.warn('D1 transaction sync:',id,err); }
    }
  }
  async function refreshCloudWallet(){
    try{
      const result=await apiJson('/wallet');
      state.cloudWallet={balanceCents:Number(result.balance_cents||0),transactions:result.transactions||[],syncedAt:new Date().toISOString()};
      saveState(); renderWallet(new Date());
    }catch(err){ console.warn('D1 wallet:',err); }
  }
  async function migrateAndSyncCloud(){
    // First merge known day state, then lock/upload existing local rewards.
    for(const [key,ds] of Object.entries(state.days||{})) await syncDayWithCloud(key,ds);
    for(const [key,ds] of Object.entries(state.days||{})){
      if(!ds?.rewardOpened) continue;
      try{
        const existing=await apiJson(`/reward?date=${encodeURIComponent(key)}`);
        const serverSnapshot=snapshotFromCloudReward(existing.reward);
        if(serverSnapshot){ ds.rewardSnapshot=serverSnapshot; saveState(); }
        else await syncRewardToCloud(key,ds);
      }catch(err){ console.warn('D1 reward migration:',key,err); }
    }
    reconcileLedger();
    await syncLedgerToCloud();
    await refreshCloudWallet();
    state.migrations ||= {}; state.migrations.cloud040=true; saveState(); render();
  }
  function dateKey(d=new Date()){ return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); }
  function localDate(key){ const [y,m,d]=key.split('-').map(Number); return new Date(y,m-1,d); }
  function fmtDate(d){ return new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'2-digit',month:'long'}).format(d); }
  function fmtTime(iso){ return new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit'}).format(new Date(iso)); }
  function dayState(key){ return state.days[key] ||= {work:false,home:false,rewardOpened:false}; }
  function isWorkday(d){ const wd=d.getDay(); return wd>=1&&wd<=5; }
  function euro(cents){ return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(cents/100); }
  function isPaused(key){ return state.pauses.find(p => key>=p.from && key<=p.to) || null; }
  function hash(str){ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619);} return Math.abs(h>>>0); }
  function imageUrl(file){ return 'https://commons.wikimedia.org/wiki/Special:Redirect/file/' + encodeURIComponent(file) + '?width=1200'; }

  function setGeoMessage(type,text){
    refs.locationHint.classList.remove('geo-neutral','geo-success','geo-error');
    refs.locationHint.classList.add(type==='success'?'geo-success':type==='error'?'geo-error':'geo-neutral');
    refs.locationHint.textContent=text;
  }


  function render(){
    const now=new Date(), key=dateKey(now), ds=dayState(key), pause=isPaused(key), workday=isWorkday(now);
    refs.todayLabel.textContent=fmtDate(now);
    refs.pauseBanner.classList.toggle('hidden',!pause);
    if(pause){
      refs.pauseBanner.innerHTML=`<p class="eyebrow">MISSION PAUSIERT</p><h2>${pause.reason}</h2><p class="muted">Heute ist kein Check-in nötig. Deine nächste Mission wartet danach.</p>`;
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
    refs.rewardSubtitle.textContent=unlocked?'One More Day geschafft.':'Erst ARBEIT + ZUHAUSE abschließen.';
    refs.openRewardBtn.disabled=!unlocked; refs.openRewardBtn.textContent=ds.rewardOpened?'REWARD ANZEIGEN':'TÜRCHEN ÖFFNEN';
    if(ds.rewardOpened) showDailyReward(key,ds); else refs.rewardContent.classList.add('hidden');

    reconcileLedger(); renderWeek(now); renderWallet(now); renderStats(); renderHistory(); renderNextMission();
  }

  function checkLocation(){
    const now=new Date(), key=dateKey(now), ds=dayState(key);
    if(!isWorkday(now)){ setGeoMessage('error','Heute ist keine Arbeitsmission aktiv.'); render(); return; }
    if(isPaused(key)){ setGeoMessage('error','Dieser Tag ist pausiert.'); render(); return; }
    if(!navigator.geolocation){ setGeoMessage('error','Dieses Gerät unterstützt keine Standortabfrage.'); return; }
    const before13=now.getHours()<13;
    if(!before13 && !ds.work){ setGeoMessage('error','ZUHAUSE ist erst möglich, wenn ARBEIT heute erfolgreich bestätigt wurde.'); render(); return; }
    const target=before13?'work':'home', label=before13?'ARBEIT':'ZUHAUSE';
    refs.locationBtn.disabled=true; refs.locationBtn.textContent='STANDORT WIRD GEPRÜFT…'; setGeoMessage('neutral','Standort wird geprüft …');
    navigator.geolocation.getCurrentPosition(async pos=>{
      const {latitude,longitude,accuracy}=pos.coords;
      try{
        const response=await fetch(`${API_BASE}/geo/${target}`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({latitude,longitude,accuracy})
        });
        let result=null;
        try{ result=await response.json(); }catch{}
        if(!response.ok || !result || result.ok!==true) throw new Error('API');
        if(result.accepted===true){
          const nowIso=new Date().toISOString();
          if(before13){ ds.work=true; ds.workAt=nowIso; ds.workSource='geo-api'; }
          else { ds.home=true; ds.homeAt=nowIso; ds.homeSource='geo-api'; }
          saveState();
          await syncDayWithCloud(key,ds);
          reconcileLedger();
          await syncLedgerToCloud();
          await refreshCloudWallet();
          setGeoMessage('success',`✓ Standort erfolgreich bestätigt – ${label} · ca. ${Number(result.distance)||0} m vom Zielpunkt.`);
          render();
          return;
        }
        if(result.reason==='accuracy') setGeoMessage('error',`✕ Standort nicht bestätigt – GPS zu ungenau (±${Math.round(Number(result.accuracy)||accuracy)} m). Bitte erneut versuchen.`);
        else setGeoMessage('error',`✕ Standort nicht bestätigt – du befindest dich außerhalb des erlaubten Bereichs${Number.isFinite(Number(result.distance)) ? ` · ca. ${(Number(result.distance)/1000).toFixed(1)} km entfernt.` : '.'}`);
        render();
      }catch(err){
        console.warn('Geo API:',err);
        setGeoMessage('error','✕ Standort nicht bestätigt – Serverprüfung momentan nicht erreichbar. Bitte erneut versuchen.');
        render();
      }
    },err=>{
      const msg={1:'Standortberechtigung wurde verweigert.',2:'Standort ist momentan nicht verfügbar.',3:'Standortabfrage hat zu lange gedauert.'}[err.code]||'Standort konnte nicht geprüft werden.';
      setGeoMessage('error',`✕ Standort nicht bestätigt – ${msg}`); render();
    },{enableHighAccuracy:true,maximumAge:0,timeout:15000});
  }


  function assignReward(key,ds){
    if(ds.pictureIndex==null) ds.pictureIndex=hash(key+'pic')%DATA.pictures.length;
    if(ds.songId && DATA.songs.some(s=>s.id===ds.songId)) return;

    const usedSongIds=new Set();
    const priorArtists=[];
    const d=localDate(key);
    for(let back=1;back<=10;back++){
      const p=new Date(d); p.setDate(d.getDate()-back);
      const pk=dateKey(p), pd=state.days[pk];
      if(!pd) continue;
      const ps=pd.songId ? DATA.songs.find(s=>s.id===pd.songId) : DATA.songs[pd.songIndex];
      if(ps){ usedSongIds.add(ps.id); if(back<=3) priorArtists.push({back,artist:ps.artist}); }
    }
    const last3=[1,2,3].map(back=>priorArtists.find(x=>x.back===back)?.artist).filter(Boolean);
    const blockedArtist=last3.length===3 && last3.every(a=>a===last3[0]) ? last3[0] : null;
    let candidates=DATA.songs.filter(s=>!usedSongIds.has(s.id) && s.artist!==blockedArtist);
    if(!candidates.length) candidates=DATA.songs.filter(s=>s.artist!==blockedArtist);
    if(!candidates.length) candidates=DATA.songs;
    const song=candidates[hash(key+'song-v022')%candidates.length];
    ds.songId=song.id;
    ds.songIndex=DATA.songs.findIndex(s=>s.id===song.id); // compatibility with older local state/history
  }
  function showDailyReward(key,ds){
    const reward=rewardFor(key,ds); if(!reward) return;
    saveState();
    const pic=reward.picture, song=reward.song;
    refs.dailyPicture.src=pic.url; refs.dailyPicture.alt=pic.title; refs.pictureSource.href=pic.source; refs.pictureInfo.textContent=pic.info||''; refs.pictureInfo.classList.toggle('hidden',!pic.info);
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

  async function openDailyReward(){ const key=dateKey(), ds=dayState(key); if(!(ds.work&&ds.home)) return; ds.rewardOpened=true; ds.rewardOpenedAt ||= new Date().toISOString(); lockReward(key,ds); saveState(); try{ await syncRewardToCloud(key,ds); }catch(err){ console.warn('D1 reward lock:',err); } showDailyReward(key,ds); renderStats(); renderHistory(); }

  function getWeekStart(d){ const x=new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x; }
  function renderWeek(now){
    const start=getWeekStart(now), labels=['MO','DI','MI','DO','FR']; let completed=0;
    refs.weekDays.innerHTML='';
    for(let i=0;i<5;i++){
      const d=new Date(start); d.setDate(start.getDate()+i); const key=dateKey(d), pause=isPaused(key), ds=state.days[key];
      const done=!!(ds&&ds.work&&ds.home); if(done) completed++;
      const el=document.createElement('div'); el.className='week-day'+(done?' done':'')+(pause?' paused':'')+(done&&ds.rewardOpened?' clickable':''); el.innerHTML=`${labels[i]}<strong>${pause?'–':done?'✓':'○'}</strong>`; if(done&&ds.rewardOpened){ el.title='Tagesbelohnung erneut ansehen'; el.tabIndex=0; el.setAttribute('role','button'); el.addEventListener('click',()=>openHistoricalReward(key)); el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openHistoricalReward(key);}}); } refs.weekDays.appendChild(el);
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
    const localTotal=state.ledger.reduce((sum,t)=>sum+Number(t.cents||0),0);
    const total=Number.isFinite(state.cloudWallet?.balanceCents) ? state.cloudWallet.balanceCents : localTotal;
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
    refs.historyList.innerHTML='';
    if(!items.length){ refs.historyList.innerHTML='<p class="muted">Noch nichts freigeschaltet.</p>'; return; }
    for(const [key,d] of items){
      const reward=rewardFor(key,d); const s=reward.song;
      const item=document.createElement('button'); item.type='button'; item.className='history-item history-button';
      item.innerHTML=`<div><strong>${s.title}</strong><br><small>${s.artist}</small></div><small>${new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit'}).format(localDate(key))}</small>`;
      item.addEventListener('click',()=>openHistoricalReward(key)); refs.historyList.appendChild(item);
    }
  }
  function openHistoricalReward(key){
    const ds=state.days[key]; if(!ds || !ds.rewardOpened) return;
    const reward=rewardFor(key,ds); if(!reward) return; saveState();
    const pic=reward.picture, song=reward.song;
    refs.historyDialogDate.textContent=new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(localDate(key)).toUpperCase();
    refs.historyDialogTitle.textContent=pic.title;
    refs.historyPicture.src=pic.url; refs.historyPicture.alt=pic.title; refs.historyPictureSource.href=pic.source;
    refs.historyPictureInfo.textContent=pic.info||''; refs.historyPictureInfo.classList.toggle('hidden',!pic.info);
    refs.historySongTitle.textContent=song.title; refs.historySongArtist.textContent=song.artist; refs.historySpotifyBtn.href=song.url;
    loadHistoricalSpotifyCover(song); refs.historyDialog.showModal();
  }

  async function loadHistoricalSpotifyCover(song){
    refs.historySpotifyCover.classList.add('hidden'); refs.historySpotifyCover.removeAttribute('src'); refs.historySpotifyFallback.classList.remove('hidden'); refs.historySpotifyFallback.textContent='SPOTIFY COVER WIRD GELADEN…';
    const sourceUrl=song.coverUrl || (/open\.spotify\.com\/(?:intl-[^/]+\/)?(?:track|album)\//.test(song.url) ? song.url : '');
    if(!sourceUrl){ refs.historySpotifyFallback.textContent='COVER FÜR DIESEN SONG NOCH NICHT HINTERLEGT'; return; }
    try{ const response=await fetch('https://open.spotify.com/oembed?url='+encodeURIComponent(sourceUrl),{mode:'cors'}); if(!response.ok) throw new Error('Spotify oEmbed '+response.status); const meta=await response.json(); if(!meta.thumbnail_url) throw new Error('Kein Cover vorhanden'); refs.historySpotifyCover.onload=()=>{refs.historySpotifyCover.classList.remove('hidden');refs.historySpotifyFallback.classList.add('hidden');}; refs.historySpotifyCover.onerror=()=>{refs.historySpotifyCover.classList.add('hidden');refs.historySpotifyFallback.classList.remove('hidden');refs.historySpotifyFallback.textContent='SPOTIFY COVER KONNTE NICHT GELADEN WERDEN';}; refs.historySpotifyCover.src=meta.thumbnail_url; }
    catch(err){ console.warn('Spotify history cover:',err); refs.historySpotifyFallback.textContent='SPOTIFY COVER KONNTE NICHT GELADEN WERDEN'; }
  }
  function renderNextMission(){
    let d=new Date(); for(let i=0;i<370;i++){ const key=dateKey(d), weekday=d.getDay(); if(weekday>=1&&weekday<=5&&!isPaused(key)){ refs.nextMissionText.textContent=`Nächste aktive Mission: ${fmtDate(d)}`; return;} d.setDate(d.getDate()+1); }
  }

  function savePause(ev){
    ev.preventDefault(); const from=refs.pauseFrom.value, to=refs.pauseTo.value; if(!from||!to||to<from) return;
    state.pauses.push({from,to,reason:refs.pauseReason.value}); state.pauses.sort((a,b)=>a.from.localeCompare(b.from)); saveState(); refs.pauseDialog.close(); render();
  }

  function openPictureFullscreen(img,info,source){
    if(!img?.src) return;
    refs.pictureFullscreenImage.src=img.src; refs.pictureFullscreenImage.alt=img.alt||'Bild des Tages';
    refs.pictureFullscreenInfo.textContent=info||''; refs.pictureFullscreenInfo.classList.toggle('hidden',!info);
    refs.pictureFullscreenSource.href=source||'#'; refs.pictureFullscreenSource.classList.toggle('hidden',!source);
    refs.pictureFullscreenDialog.showModal();
  }
  refs.dailyPicture.addEventListener('click',()=>openPictureFullscreen(refs.dailyPicture,refs.pictureInfo.textContent,refs.pictureSource.href));
  refs.historyPicture.addEventListener('click',()=>openPictureFullscreen(refs.historyPicture,refs.historyPictureInfo.textContent,refs.historyPictureSource.href));
  refs.closePictureFullscreen.addEventListener('click',()=>refs.pictureFullscreenDialog.close());
  refs.pictureFullscreenDialog.addEventListener('click',e=>{if(e.target===refs.pictureFullscreenDialog) refs.pictureFullscreenDialog.close();});

  const joeyMotivationBtn=$('joeyMotivationBtn'), joeyMotivationDialog=$('joeyMotivationDialog'), closeJoeyMotivation=$('closeJoeyMotivation');
  joeyMotivationBtn.addEventListener('click',()=>joeyMotivationDialog.showModal());
  closeJoeyMotivation.addEventListener('click',()=>joeyMotivationDialog.close());
  joeyMotivationDialog.addEventListener('click',e=>{ if(e.target===joeyMotivationDialog) joeyMotivationDialog.close(); });

  refs.locationBtn.addEventListener('click',checkLocation); refs.openRewardBtn.addEventListener('click',openDailyReward);
  refs.pauseBtn.addEventListener('click',()=>{ const k=dateKey(); refs.pauseFrom.value=k; refs.pauseTo.value=k; refs.pauseDialog.showModal(); });
  refs.pauseForm.addEventListener('submit',savePause); $('cancelPauseBtn').addEventListener('click',()=>refs.pauseDialog.close()); refs.versionBtn.addEventListener('click',()=>refs.versionDialog.showModal());
  if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  render(); migrateAndSyncCloud(); setInterval(render,60000);
})();
