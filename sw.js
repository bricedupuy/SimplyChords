// ── sw.js — Chord Board Service Worker ───────────────────────────────────────
// Responsibilities:
//   1. Cache-first serving of the app shell (all static assets)
//   2. Version checking: on each load, fetch version.json; if newer than cached
//      version, notify the page so it can prompt the user to refresh
//   3. Audio sample caching: download Tone.js piano samples on explicit request
//      from the page, reporting progress back via postMessage

const APP_CACHE    = 'chord-board-app-v2.0.0';
const SAMPLE_CACHE = 'chord-board-samples-v1'; // separate — survives app updates

// ── App shell files ───────────────────────────────────────────────────────────
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './favicon.svg',
  './favicon.ico',
  './icon-192.png',
  './icon-512.png',
  './sw-manager.js',
  './prefs.js',
  './ui/samples.js',
  './version.json',
  './data/theory.js',
  './data/modes.js',
  './data/instruments.js',
  './data/voicings.js',
  './ui/board.js',
  './ui/controls.js',
  './ui/detail.js',
  './ui/diagrams.js',
  './ui/arrows.js',
  './ui/progression.js',
  './audio/player.js',
];

// External resources cached on first use
const EXTERNAL_CACHE_PATTERNS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com/lucide',
];

// ── Install: pre-cache app shell ─────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()) // activate immediately
  );
});

// ── Activate: clean up old app caches ────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('chord-board-app-') && k !== APP_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim()) // take control of existing pages
  );
});

// ── Fetch: cache-first for app shell, network-first for version.json ─────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always fetch version.json from network (version check)
  if (url.pathname.endsWith('version.json')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // External fonts / Lucide: cache-first, network fallback
  if (EXTERNAL_CACHE_PATTERNS.some(p => url.href.includes(p))) {
    event.respondWith(cacheFirst(event.request, APP_CACHE));
    return;
  }

  // App shell and local assets: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request, APP_CACHE));
    return;
  }
});

// ── Cache strategies ──────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(APP_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

// ── Message handler ───────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  const { type, payload } = event.data ?? {};

  switch (type) {
    case 'CHECK_VERSION':
      handleVersionCheck(event.source);
      break;

    case 'DOWNLOAD_SAMPLES':
      handleSampleDownload(payload?.urls ?? [], event.source);
      break;

    case 'SAMPLES_CACHED':
      // Page asking if samples are already available
      checkSamplesCached(payload?.urls ?? [], event.source);
      break;

    case 'CLEAR_SAMPLES':
      caches.delete(SAMPLE_CACHE).then(() => {
        event.source?.postMessage({ type: 'SAMPLES_CLEARED' });
      });
      break;

    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
  }
});

// ── Version check ─────────────────────────────────────────────────────────────
async function handleVersionCheck(client) {
  try {
    // Get cached version
    const cachedResp = await caches.match('./version.json');
    const cachedData = cachedResp ? await cachedResp.json() : null;

    // Fetch live version
    const liveResp = await fetch('./version.json?_=' + Date.now());
    if (!liveResp.ok) return;
    const liveData = await liveResp.json();

    // Update cache
    const cache = await caches.open(APP_CACHE);
    cache.put('./version.json', liveResp.clone());

    const hasUpdate = cachedData && cachedData.version !== liveData.version;

    client?.postMessage({
      type: 'VERSION_RESULT',
      payload: {
        current:   cachedData?.version ?? null,
        latest:    liveData.version,
        hasUpdate,
      },
    });
  } catch (err) {
    // Network unavailable — silently ignore
  }
}

// ── Sample download ───────────────────────────────────────────────────────────
async function handleSampleDownload(urls, client) {
  const cache = await caches.open(SAMPLE_CACHE);
  let done = 0;
  const total = urls.length;

  client?.postMessage({ type: 'SAMPLE_PROGRESS', payload: { done: 0, total } });

  for (const url of urls) {
    try {
      // Skip if already cached
      const existing = await cache.match(url);
      if (existing) {
        done++;
        client?.postMessage({ type: 'SAMPLE_PROGRESS', payload: { done, total, url } });
        continue;
      }

      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch {
      // Individual sample failed — continue with others
    }
    done++;
    client?.postMessage({ type: 'SAMPLE_PROGRESS', payload: { done, total, url } });
  }

  client?.postMessage({ type: 'SAMPLE_DOWNLOAD_COMPLETE', payload: { total } });
}

// ── Check which samples are already cached ────────────────────────────────────
async function checkSamplesCached(urls, client) {
  const cache = await caches.open(SAMPLE_CACHE);
  const results = await Promise.all(
    urls.map(async url => ({ url, cached: !!(await cache.match(url)) }))
  );
  const cachedCount = results.filter(r => r.cached).length;
  client?.postMessage({
    type: 'SAMPLES_STATUS',
    payload: { total: urls.length, cached: cachedCount, complete: cachedCount === urls.length },
  });
}
