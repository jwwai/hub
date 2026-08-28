(() => {
  'use strict';

  const APPS = {
    radio:  { name: 'Live Radio', src: 'radio/index.html',  accent: '#d7ff4b', sync: true },
    scores: { name: 'Live Score', src: 'scores/index.html', accent: '#ff4136', sync: false },
    tv:     { name: 'Live TV',    src: 'tv/index.html',     accent: '#34d399', sync: true },
  };

  const homeScreen  = document.getElementById('homeScreen');
  const appView      = document.getElementById('appView');
  const appFrame      = document.getElementById('appFrame');
  const appBarName  = document.getElementById('appBarName');
  const appBarDot    = document.getElementById('appBarDot');
  const backBtn      = document.getElementById('backBtn');
  const reloadBtn    = document.getElementById('reloadBtn');
  const syncBtn      = document.getElementById('syncBtn');

  let currentApp = null;

  function openApp(key, { pushHistory = true, forceReload = false } = {}) {
    const app = APPS[key];
    if (!app) { showHome({ pushHistory }); return; }

    if (currentApp !== key || forceReload) {
      appFrame.src = app.src;
    }
    currentApp = key;

    appBarName.textContent = app.name;
    appBarDot.style.setProperty('--accent', app.accent);
    appView.style.setProperty('--accent', app.accent);
    syncBtn.hidden = !app.sync;

    homeScreen.hidden = true;
    appView.hidden = false;
    document.title = app.name + ' — Live Hub';

    if (pushHistory) {
      history.pushState({ app: key }, '', '#' + key);
    }
  }

  function showHome({ pushHistory = true } = {}) {
    currentApp = null;
    appFrame.src = 'about:blank';
    appView.hidden = true;
    homeScreen.hidden = false;
    document.title = 'Live Hub — Radio, Scores & TV';

    if (pushHistory) {
      history.pushState({ app: null }, '', '#');
    }
  }

  // Card clicks
  document.querySelectorAll('.app-card').forEach((card) => {
    card.addEventListener('click', () => openApp(card.dataset.app));
  });

  backBtn.addEventListener('click', () => showHome());
  reloadBtn.addEventListener('click', () => {
    if (currentApp) openApp(currentApp, { pushHistory: false, forceReload: true });
  });
  syncBtn.addEventListener('click', () => {
    if (currentApp && appFrame.contentWindow) {
      appFrame.contentWindow.postMessage({ type: 'liveHub:openSync' }, '*');
    }
  });

  // Keyboard: Escape returns home from an open app
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !appView.hidden) showHome();
  });

  // Browser back/forward
  window.addEventListener('popstate', (e) => {
    const key = (e.state && e.state.app) || (location.hash ? location.hash.slice(1) : null);
    if (key && APPS[key]) openApp(key, { pushHistory: false });
    else showHome({ pushHistory: false });
  });

  // Deep link on load (e.g. shared URL with #radio)
  const initialKey = location.hash ? location.hash.slice(1) : null;
  if (initialKey && APPS[initialKey]) {
    openApp(initialKey, { pushHistory: false });
    history.replaceState({ app: initialKey }, '', '#' + initialKey);
  } else {
    history.replaceState({ app: null }, '', '#');
  }
})();
