// ── sw-manager.js ─────────────────────────────────────────────────────────────
// Registers the service worker, handles version-update toasts,
// and exposes the audio sample download API to the rest of the app.

// ── Salamander Grand Piano sample URLs ───────────────────────────────────────
// Hosted on gleitz/midi-js-soundfonts (the source Tone.js uses by default).
// These are the ~88 note samples at mp3 quality — ~8MB total.
// Each note is named like "A4.mp3", "C#3.mp3" etc.
const SAMPLE_BASE = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite/acoustic_grand_piano-mp3/';

// Sparse set: one sample per 3 semitones covers all notes with minimal downloads
// Tone.Sampler interpolates between samples automatically.
const SAMPLE_NOTES = [
  'A0','C1','D#1','F#1','A1','C2','D#2','F#2',
  'A2','C3','D#3','F#3','A3','C4','D#4','F#4',
  'A4','C5','D#5','F#5','A5','C6','D#6','F#6',
  'A6','C7','D#7','F#7','A7','C8',
];

export const SAMPLE_URLS = SAMPLE_NOTES.map(n => `${SAMPLE_BASE}${n}.mp3`);

// ── Registration ──────────────────────────────────────────────────────────────
let _swRegistration = null;

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return;

  try {
    _swRegistration = await navigator.serviceWorker.register('./sw.js');

    // Listen for SW messages
    navigator.serviceWorker.addEventListener('message', handleSWMessage);

    // Check for version after SW is active
    navigator.serviceWorker.ready.then(reg => {
      reg.active?.postMessage({ type: 'CHECK_VERSION' });
    });

    // New SW waiting → show update toast when it's ready
    _swRegistration.addEventListener('updatefound', () => {
      const newWorker = _swRegistration.installing;
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateToast();
        }
      });
    });

  } catch (err) {
    console.warn('[SW] Registration failed:', err);
  }
}

// ── Message dispatcher ────────────────────────────────────────────────────────
const _listeners = new Map();

function handleSWMessage(event) {
  const { type, payload } = event.data ?? {};
  const handlers = _listeners.get(type) ?? [];
  handlers.forEach(fn => fn(payload));
}

export function onSWMessage(type, fn) {
  if (!_listeners.has(type)) _listeners.set(type, []);
  _listeners.get(type).push(fn);
  return () => {
    // Returns an unsubscribe function
    const arr = _listeners.get(type);
    const idx = arr.indexOf(fn);
    if (idx !== -1) arr.splice(idx, 1);
  };
}

function sendToSW(message) {
  navigator.serviceWorker.ready.then(reg => {
    reg.active?.postMessage(message);
  });
}

// ── Version update toast ──────────────────────────────────────────────────────
function showUpdateToast() {
  // Remove any existing toast
  document.getElementById('sw-update-toast')?.remove();

  const toast = document.createElement('div');
  toast.id = 'sw-update-toast';
  toast.className = 'sw-toast';
  toast.innerHTML = `
    <span class="sw-toast-msg">
      <i data-lucide="refresh-cw"></i>
      Update available
    </span>
    <button class="sw-toast-btn" id="sw-reload-btn">Reload</button>
    <button class="sw-toast-dismiss" id="sw-dismiss-btn">
      <i data-lucide="x"></i>
    </button>
  `;
  document.body.appendChild(toast);

  // Re-render Lucide icons for the toast
  if (window.lucide) window.lucide.createIcons();

  document.getElementById('sw-reload-btn')?.addEventListener('click', () => {
    sendToSW({ type: 'SKIP_WAITING' });
    // Give SW a moment to activate, then reload
    setTimeout(() => window.location.reload(), 300);
  });

  document.getElementById('sw-dismiss-btn')?.addEventListener('click', () => {
    toast.classList.add('sw-toast-hide');
    setTimeout(() => toast.remove(), 300);
  });

  // Auto-dismiss after 12s
  setTimeout(() => {
    if (toast.isConnected) {
      toast.classList.add('sw-toast-hide');
      setTimeout(() => toast.remove(), 300);
    }
  }, 12000);
}

// ── Version check result handler ──────────────────────────────────────────────
onSWMessage('VERSION_RESULT', ({ hasUpdate, current, latest }) => {
  if (hasUpdate) {
    console.log(`[SW] Update available: ${current} → ${latest}`);
    showUpdateToast();
  }
});

// ── Sample download API ───────────────────────────────────────────────────────

/**
 * Check how many samples are already cached.
 * Returns a Promise<{ total, cached, complete }>.
 */
export function checkSampleStatus() {
  return new Promise(resolve => {
    const unsub = onSWMessage('SAMPLES_STATUS', payload => {
      unsub();
      resolve(payload);
    });
    sendToSW({ type: 'SAMPLES_CACHED', payload: { urls: SAMPLE_URLS } });
  });
}

/**
 * Download all piano samples via the service worker.
 * onProgress(done, total) is called for each completed file.
 * Returns a Promise that resolves when complete.
 */
export function downloadSamples(onProgress) {
  return new Promise(resolve => {
    const unsub = onSWMessage('SAMPLE_DOWNLOAD_COMPLETE', payload => {
      unsub();
      resolve(payload);
    });

    if (onProgress) {
      const unsub2 = onSWMessage('SAMPLE_PROGRESS', ({ done, total }) => {
        onProgress(done, total);
        if (done >= total) unsub2();
      });
    }

    sendToSW({ type: 'DOWNLOAD_SAMPLES', payload: { urls: SAMPLE_URLS } });
  });
}

/**
 * Delete all cached samples.
 */
export function clearSamples() {
  return new Promise(resolve => {
    const unsub = onSWMessage('SAMPLES_CLEARED', () => { unsub(); resolve(); });
    sendToSW({ type: 'CLEAR_SAMPLES' });
  });
}
