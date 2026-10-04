(() => {
  'use strict';

  const boardEl = document.getElementById('board');
  const pairsEl = document.getElementById('pairs');
  const movesEl = document.getElementById('moves');
  const timeEl = document.getElementById('time');
  const bestEl = document.getElementById('best');
  const newGameBtn = document.getElementById('newGameBtn');
  const againBtn = document.getElementById('againBtn');
  const finishPanel = document.getElementById('finishPanel');
  const finishTitle = document.getElementById('finishTitle');
  const finishText = document.getElementById('finishText');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const gameCard = document.getElementById('gameCard');

  const PAIRS_PER_GAME = 10;
  const MISMATCH_DELAY = 820;
  const BEST_TIME_KEY = 'snikkers_memory_best_time_v1';
  const BEST_MOVES_KEY = 'snikkers_memory_best_moves_v1';

  const IMAGE_POOL = Array.from({length: 16}, (_, i) => `assets/memory/${String(i + 1).padStart(2,'0')}.svg`);

  let cards = [];
  let firstCard = null;
  let secondCard = null;
  let locked = false;
  let matchedPairs = 0;
  let moves = 0;
  let startedAt = null;
  let elapsedMs = 0;
  let timerId = null;
  let finished = false;
  let pseudoFullscreen = false;

  function shuffle(array){
    const a = [...array];
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function formatTime(ms){
    const total = Math.floor(ms/1000);
    const min = Math.floor(total/60);
    const sec = total%60;
    return `${min}:${String(sec).padStart(2,'0')}`;
  }

  function getBestTime(){
    const v = Number(localStorage.getItem(BEST_TIME_KEY) || 0);
    return v > 0 ? v : null;
  }

  function getBestMoves(){
    const v = Number(localStorage.getItem(BEST_MOVES_KEY) || 0);
    return v > 0 ? v : null;
  }

  function updateHud(){
    pairsEl.textContent = `${matchedPairs} / ${PAIRS_PER_GAME}`;
    movesEl.textContent = String(moves);
    const nowElapsed = startedAt && !finished ? performance.now()-startedAt : elapsedMs;
    timeEl.textContent = formatTime(nowElapsed);
    const bt = getBestTime();
    const bm = getBestMoves();
    bestEl.textContent = bt ? `${formatTime(bt)} · ${bm ?? '–'} Z.` : '–';
  }

  function startTimerIfNeeded(){
    if(startedAt || finished) return;
    startedAt = performance.now();
    timerId = window.setInterval(updateHud, 250);
  }

  function stopTimer(){
    if(startedAt && !finished) elapsedMs = performance.now()-startedAt;
    if(timerId){ clearInterval(timerId); timerId = null; }
  }

  function createDeck(){
    const chosen = shuffle(IMAGE_POOL).slice(0, PAIRS_PER_GAME);
    const doubled = chosen.flatMap((src, pairId) => [
      {pairId, src, uid:`${pairId}-a`},
      {pairId, src, uid:`${pairId}-b`}
    ]);
    return shuffle(doubled);
  }

  function renderBoard(){
    boardEl.innerHTML = '';
    cards.forEach(card => {
      const btn = document.createElement('button');
      btn.className = 'memory-card';
      btn.type = 'button';
      btn.dataset.uid = card.uid;
      btn.dataset.pairId = String(card.pairId);
      btn.setAttribute('aria-label','Memory-Karte');
      btn.innerHTML = `
        <span class="card-inner">
          <span class="card-face card-back" aria-hidden="true"></span>
          <span class="card-face card-front"><img src="${card.src}" alt="Platzhaltermotiv" draggable="false"></span>
        </span>`;
      btn.addEventListener('click', () => flipCard(btn));
      boardEl.appendChild(btn);
    });
  }

  function flipCard(cardEl){
    if(locked || finished || cardEl.classList.contains('is-flipped') || cardEl.classList.contains('is-matched')) return;
    startTimerIfNeeded();
    cardEl.classList.add('is-flipped');

    if(!firstCard){
      firstCard = cardEl;
      return;
    }

    secondCard = cardEl;
    moves++;
    updateHud();

    const match = firstCard.dataset.pairId === secondCard.dataset.pairId;
    if(match){
      firstCard.classList.add('is-matched');
      secondCard.classList.add('is-matched');
      firstCard.disabled = true;
      secondCard.disabled = true;
      firstCard = null;
      secondCard = null;
      matchedPairs++;
      updateHud();
      if(matchedPairs >= PAIRS_PER_GAME) finishGame();
      return;
    }

    locked = true;
    const a = firstCard;
    const b = secondCard;
    window.setTimeout(() => {
      a.classList.remove('is-flipped');
      b.classList.remove('is-flipped');
      firstCard = null;
      secondCard = null;
      locked = false;
    }, MISMATCH_DELAY);
  }

  function finishGame(){
    stopTimer();
    finished = true;
    elapsedMs = startedAt ? performance.now()-startedAt : elapsedMs;

    const oldBestTime = getBestTime();
    const oldBestMoves = getBestMoves();
    if(!oldBestTime || elapsedMs < oldBestTime) localStorage.setItem(BEST_TIME_KEY, String(Math.round(elapsedMs)));
    if(!oldBestMoves || moves < oldBestMoves) localStorage.setItem(BEST_MOVES_KEY, String(moves));

    updateHud();
    finishTitle.textContent = 'GESCHAFFT!';
    finishText.textContent = `${formatTime(elapsedMs)} · ${moves} Züge`;
    finishPanel.classList.remove('hidden');
  }

  function newGame(){
    if(timerId){ clearInterval(timerId); timerId = null; }
    cards = createDeck();
    firstCard = null;
    secondCard = null;
    locked = false;
    matchedPairs = 0;
    moves = 0;
    startedAt = null;
    elapsedMs = 0;
    finished = false;
    finishPanel.classList.add('hidden');
    renderBoard();
    updateHud();
  }

  async function requestNativeFullscreen(){
    try{
      const fn = gameCard.requestFullscreen || gameCard.webkitRequestFullscreen;
      if(fn) await fn.call(gameCard);
    }catch{}
  }

  async function leaveNativeFullscreen(){
    try{
      if(document.fullscreenElement || document.webkitFullscreenElement){
        const fn = document.exitFullscreen || document.webkitExitFullscreen;
        if(fn) await fn.call(document);
      }
    }catch{}
  }

  function updateFullscreenButton(){
    const active = pseudoFullscreen || document.fullscreenElement===gameCard || document.webkitFullscreenElement===gameCard;
    fullscreenBtn.textContent = active ? '⤢' : '⛶';
    fullscreenBtn.setAttribute('aria-label', active ? 'Vollbild verlassen' : 'Vollbild einschalten');
    fullscreenBtn.title = active ? 'Vollbild verlassen' : 'Vollbild';
  }

  fullscreenBtn.addEventListener('click', async () => {
    const active = pseudoFullscreen || document.fullscreenElement===gameCard || document.webkitFullscreenElement===gameCard;
    if(active){
      pseudoFullscreen = false;
      gameCard.classList.remove('is-fullscreen');
      await leaveNativeFullscreen();
    }else{
      pseudoFullscreen = true;
      gameCard.classList.add('is-fullscreen');
      await requestNativeFullscreen();
    }
    updateFullscreenButton();
  });

  document.addEventListener('fullscreenchange', () => {
    if(!document.fullscreenElement && pseudoFullscreen) gameCard.classList.add('is-fullscreen');
    updateFullscreenButton();
  });
  document.addEventListener('webkitfullscreenchange', updateFullscreenButton);

  document.addEventListener('visibilitychange', () => {
    if(document.hidden && startedAt && !finished){
      elapsedMs = performance.now()-startedAt;
    }
  });

  newGameBtn.addEventListener('click', newGame);
  againBtn.addEventListener('click', newGame);

  newGame();
})();
