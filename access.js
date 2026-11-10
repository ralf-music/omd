(() => {
  const API_BASE='https://one-more-day-api.ralf-music.workers.dev/api/v1';
  const TOKEN_KEY='omd-device-token-v1';
  const AUTH_CACHE_KEY='omd-device-auth-cache-v1';
  const ACTIVATION_PARAM='omd_device_token';

  const $=id=>document.getElementById(id);
  const privateShell=$('privateAppShell');
  const publicShell=$('publicAccessShell');
  const publicStatus=$('publicAccessStatus');

  function setAccessView(mode,message=''){
    document.documentElement.dataset.access=mode;
    if(privateShell) privateShell.classList.toggle('hidden',mode!=='private');
    if(publicShell) publicShell.classList.toggle('hidden',mode==='private');
    if(publicStatus&&message) publicStatus.textContent=message;
  }

  function validToken(value){
    const token=String(value||'').trim();
    return token.length>=32 && token.length<=512 && /^[A-Za-z0-9._~:-]+$/.test(token);
  }

  function consumeActivationFragment(){
    const raw=location.hash.startsWith('#')?location.hash.slice(1):'';
    if(!raw) return false;
    const params=new URLSearchParams(raw);
    const token=params.get(ACTIVATION_PARAM);
    if(!validToken(token)) return false;
    localStorage.setItem(TOKEN_KEY,token.trim());
    params.delete(ACTIVATION_PARAM);
    const rest=params.toString();
    history.replaceState(null,'',`${location.pathname}${location.search}${rest?`#${rest}`:''}`);
    return true;
  }

  async function fingerprint(value){
    const bytes=new TextEncoder().encode(String(value||''));
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  }

  async function cacheAuthorization(token,device){
    try{
      localStorage.setItem(AUTH_CACHE_KEY,JSON.stringify({
        token_fingerprint:await fingerprint(token),
        device,
        verified_at:new Date().toISOString()
      }));
    }catch{}
  }

  async function cachedAuthorization(token){
    try{
      const cached=JSON.parse(localStorage.getItem(AUTH_CACHE_KEY)||'null');
      if(!cached?.device || !cached?.token_fingerprint) return null;
      if(cached.token_fingerprint!==await fingerprint(token)) return null;
      return cached;
    }catch{
      return null;
    }
  }

  async function verifyDevice(){
    const token=(localStorage.getItem(TOKEN_KEY)||'').trim();
    if(!validToken(token)){
      return {
        authorized:false,
        token:'',
        device:null,
        reason:'Dieses Gerät ist nicht registriert.'
      };
    }

    try{
      const response=await fetch(`${API_BASE}/device/me`,{
        method:'GET',
        cache:'no-store',
        headers:{'X-Device-Token':token}
      });
      let payload=null;
      try{ payload=await response.json(); }catch{}
      if(response.ok && payload?.ok===true && payload?.registered===true && payload?.device){
        await cacheAuthorization(token,payload.device);
        return {authorized:true,token,device:payload.device,offline:false};
      }
      return {
        authorized:false,
        token,
        device:null,
        reason:'Dieses Gerät ist nicht registriert.'
      };
    }catch{
      const cached=await cachedAuthorization(token);
      if(cached?.device){
        return {
          authorized:true,
          token,
          device:cached.device,
          offline:true,
          verifiedAt:cached.verified_at
        };
      }
      return {
        authorized:false,
        token,
        device:null,
        reason:'Geräteprüfung derzeit nicht möglich. Die öffentlichen Minispiele bleiben verfügbar.'
      };
    }
  }

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      if(document.querySelector(`script[data-omd-src="${src}"]`)) return resolve();
      const script=document.createElement('script');
      script.src=src;
      script.defer=false;
      script.dataset.omdSrc=src;
      script.onload=()=>resolve();
      script.onerror=()=>reject(new Error(`Script konnte nicht geladen werden: ${src}`));
      document.body.appendChild(script);
    });
  }

  async function loadGameRuntime(){
    await loadScript('games/game-viewport.js');
    await loadScript('games/snikkers-run/snikkers-run.js');
  }

  async function loadPrivateApp(){
    await loadScript('data.js');
    await loadScript('content.js');
    await loadGameRuntime();
    await loadScript('app.js');
  }

  function setupPublicGames(){
    let snikkersGame=null;
    const refs={
      openMiniGamesBtn:$('publicOpenMiniGamesBtn'),
      miniGamesDialog:$('miniGamesDialog'),
      closeMiniGamesBtn:$('closeMiniGamesBtn'),
      snikkersRunCoverBtn:$('snikkersRunCoverBtn'),
      snikkersRunDialog:$('snikkersRunDialog'),
      snikkersRunMount:$('snikkersRunMount'),
      snikkersFullscreenBtn:$('snikkersFullscreenBtn'),
      closeSnikkersRunBtn:$('closeSnikkersRunBtn'),
      snikkersCatchCoverBtn:$('snikkersCatchCoverBtn'),
      snikkersCatchDialog:$('snikkersCatchDialog'),
      snikkersCatchFrame:$('snikkersCatchFrame'),
      closeSnikkersCatchBtn:$('closeSnikkersCatchBtn'),
      snikkersChaseCoverBtn:$('snikkersChaseCoverBtn'),
      snikkersChaseDialog:$('snikkersChaseDialog'),
      snikkersChaseFrame:$('snikkersChaseFrame'),
      closeSnikkersChaseBtn:$('closeSnikkersChaseBtn'),
      snikkersMemoryCoverBtn:$('snikkersMemoryCoverBtn'),
      snikkersMemoryDialog:$('snikkersMemoryDialog'),
      snikkersMemoryFrame:$('snikkersMemoryFrame'),
      closeSnikkersMemoryBtn:$('closeSnikkersMemoryBtn'),
      snikkersPuzzleCoverBtn:$('snikkersPuzzleCoverBtn'),
      snikkersPuzzleDialog:$('snikkersPuzzleDialog'),
      snikkersPuzzleFrame:$('snikkersPuzzleFrame'),
      closeSnikkersPuzzleBtn:$('closeSnikkersPuzzleBtn'),
      snikkersSlotCoverBtn:$('snikkersSlotCoverBtn'),
      snikkersSlotDialog:$('snikkersSlotDialog'),
      snikkersSlotFrame:$('snikkersSlotFrame'),
      closeSnikkersSlotBtn:$('closeSnikkersSlotBtn')
    };

    const closeMiniGames=()=>{ if(refs.miniGamesDialog?.open) refs.miniGamesDialog.close(); };
    const openMiniGames=()=>refs.miniGamesDialog?.showModal();

    function destroyRun(){
      if(snikkersGame){
        try{ snikkersGame.destroy(); }catch{}
        snikkersGame=null;
      }
    }
    function fullscreenActive(){
      return !!(refs.snikkersRunDialog?.classList.contains('snikkers-force-fullscreen')||document.fullscreenElement);
    }
    function pseudoFullscreen(active){
      refs.snikkersRunDialog?.classList.toggle('snikkers-force-fullscreen',!!active);
      document.documentElement.classList.toggle('snikkers-fullscreen-lock',!!active);
      document.body.classList.toggle('snikkers-fullscreen-lock',!!active);
      window.OMDGameViewport?.refit();
    }
    function updateFullscreenButton(){
      if(!refs.snikkersFullscreenBtn) return;
      refs.snikkersFullscreenBtn.hidden=false;
      const active=fullscreenActive();
      refs.snikkersFullscreenBtn.textContent=active?'⤢':'⛶';
      refs.snikkersFullscreenBtn.setAttribute('aria-label',active?'Vollbild verlassen':'Snikkers Run im Vollbild anzeigen');
      refs.snikkersFullscreenBtn.title=active?'Vollbild verlassen':'Vollbild';
    }
    function unlockOrientation(){
      try{ screen.orientation?.unlock?.(); }catch{}
    }
    async function toggleFullscreen(){
      if(!refs.snikkersRunDialog) return;
      if(fullscreenActive()){
        pseudoFullscreen(false);
        unlockOrientation();
        if(document.fullscreenElement&&document.exitFullscreen){
          try{ await document.exitFullscreen(); }catch{}
        }
        updateFullscreenButton();
        return;
      }
      pseudoFullscreen(true);
      updateFullscreenButton();
      try{
        if(!document.fullscreenElement&&refs.snikkersRunDialog.requestFullscreen){
          await refs.snikkersRunDialog.requestFullscreen({navigationUI:'hide'});
        }else if(!document.fullscreenElement&&refs.snikkersRunDialog.webkitRequestFullscreen){
          refs.snikkersRunDialog.webkitRequestFullscreen();
        }
      }catch{}
      try{ await screen.orientation?.lock?.('landscape'); }catch{}
      updateFullscreenButton();
    }

    function openRun(){
      if(!refs.snikkersRunDialog||!refs.snikkersRunMount||!window.SnikkersRun) return;
      closeMiniGames();
      destroyRun();
      refs.snikkersRunDialog.showModal();
      updateFullscreenButton();
      snikkersGame=window.SnikkersRun.mount(refs.snikkersRunMount,{
        assetBase:'./assets/games/snikkers-run',
        audioSrc:'./games/snikkers-run/assets/audio/theme.mp3',
        bestScoreKey:'omd_snikkers_run_best_v1',
        accent:'#ff2f92',
        accentHover:'#ff65b5',
        title:'Snikkers Run',
        subtitle:'Tippen oder Leertaste: springen',
        startText:'Tippen oder Leertaste zum Starten',
        musicDefaultOn:false,
        musicVolume:0.25
      });
    }
    function closeRun(){
      destroyRun();
      pseudoFullscreen(false);
      unlockOrientation();
      const finish=()=>{ if(refs.snikkersRunDialog?.open) refs.snikkersRunDialog.close(); updateFullscreenButton(); };
      if(document.fullscreenElement&&document.exitFullscreen){
        document.exitFullscreen().catch(()=>{}).finally(finish);
      }else finish();
    }

    const frameGame=(dialog,frame,src)=>{
      if(!dialog||!frame) return;
      closeMiniGames();
      frame.src=src;
      dialog.showModal();
      window.OMDGameViewport?.refit();
    };
    const closeFrameGame=(dialog,frame)=>{
      if(frame) frame.src='about:blank';
      if(dialog?.open) dialog.close();
    };

    refs.openMiniGamesBtn?.addEventListener('click',openMiniGames);
    refs.closeMiniGamesBtn?.addEventListener('click',closeMiniGames);
    refs.snikkersRunCoverBtn?.addEventListener('click',openRun);
    refs.snikkersCatchCoverBtn?.addEventListener('click',()=>frameGame(refs.snikkersCatchDialog,refs.snikkersCatchFrame,'./games/snikkers-catch/index.html'));
    refs.snikkersChaseCoverBtn?.addEventListener('click',()=>frameGame(refs.snikkersChaseDialog,refs.snikkersChaseFrame,'./games/snikkers-chase/index.html'));
    refs.snikkersMemoryCoverBtn?.addEventListener('click',()=>frameGame(refs.snikkersMemoryDialog,refs.snikkersMemoryFrame,'./games/snikkers-memory/index.html'));
    refs.snikkersPuzzleCoverBtn?.addEventListener('click',()=>frameGame(refs.snikkersPuzzleDialog,refs.snikkersPuzzleFrame,'./games/snikkers-puzzle-slide/index.html'));
    refs.snikkersSlotCoverBtn?.addEventListener('click',()=>frameGame(refs.snikkersSlotDialog,refs.snikkersSlotFrame,'./games/snikkers-slot/index.html'));
    refs.snikkersFullscreenBtn?.addEventListener('click',toggleFullscreen);
    refs.closeSnikkersRunBtn?.addEventListener('click',closeRun);
    refs.closeSnikkersCatchBtn?.addEventListener('click',()=>closeFrameGame(refs.snikkersCatchDialog,refs.snikkersCatchFrame));
    refs.closeSnikkersChaseBtn?.addEventListener('click',()=>closeFrameGame(refs.snikkersChaseDialog,refs.snikkersChaseFrame));
    refs.closeSnikkersMemoryBtn?.addEventListener('click',()=>closeFrameGame(refs.snikkersMemoryDialog,refs.snikkersMemoryFrame));
    refs.closeSnikkersPuzzleBtn?.addEventListener('click',()=>closeFrameGame(refs.snikkersPuzzleDialog,refs.snikkersPuzzleFrame));
    refs.closeSnikkersSlotBtn?.addEventListener('click',()=>closeFrameGame(refs.snikkersSlotDialog,refs.snikkersSlotFrame));

    refs.miniGamesDialog?.addEventListener('click',e=>{ if(e.target===refs.miniGamesDialog) closeMiniGames(); });
    refs.snikkersRunDialog?.addEventListener('cancel',()=>{ destroyRun(); pseudoFullscreen(false); unlockOrientation(); });
    refs.snikkersRunDialog?.addEventListener('close',()=>{ destroyRun(); pseudoFullscreen(false); unlockOrientation(); updateFullscreenButton(); });
    refs.snikkersRunDialog?.addEventListener('click',e=>{ if(e.target===refs.snikkersRunDialog) closeRun(); });

    [
      [refs.snikkersCatchDialog,refs.snikkersCatchFrame],
      [refs.snikkersChaseDialog,refs.snikkersChaseFrame],
      [refs.snikkersMemoryDialog,refs.snikkersMemoryFrame],
      [refs.snikkersPuzzleDialog,refs.snikkersPuzzleFrame],
      [refs.snikkersSlotDialog,refs.snikkersSlotFrame]
    ].forEach(([dialog,frame])=>{
      dialog?.addEventListener('cancel',()=>{ if(frame) frame.src='about:blank'; });
      dialog?.addEventListener('close',()=>{ if(frame) frame.src='about:blank'; });
      dialog?.addEventListener('click',e=>{ if(e.target===dialog) closeFrameGame(dialog,frame); });
    });
    document.addEventListener('fullscreenchange',updateFullscreenButton);
  }

  function handleUnauthorized(){
    window.OMD_ACCESS={authorized:false,token:localStorage.getItem(TOKEN_KEY)||'',device:null};
    setAccessView('public','Die Gerätefreigabe ist nicht mehr gültig. Der private Bereich wurde gesperrt.');
    window.setTimeout(()=>location.reload(),50);
  }

  window.OMDAccess={
    tokenKey:TOKEN_KEY,
    handleUnauthorized
  };

  (async()=>{
    consumeActivationFragment();

    if('serviceWorker' in navigator){
      try{ await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}); }catch{}
    }

    const access=await verifyDevice();
    window.OMD_ACCESS=access;

    if(access.authorized){
      setAccessView('private');
      try{
        await loadPrivateApp();
      }catch(err){
        console.error(err);
        setAccessView('public','Der private Bereich konnte nicht geladen werden. Die Minispiele bleiben verfügbar.');
        try{ await loadGameRuntime(); setupPublicGames(); }catch{}
      }
      return;
    }

    setAccessView('public',access.reason);
    try{
      await loadGameRuntime();
      setupPublicGames();
    }catch(err){
      console.error('Public games runtime:',err);
      if(publicStatus) publicStatus.textContent='Die Minispiele konnten nicht vollständig geladen werden.';
    }
  })();
})();
