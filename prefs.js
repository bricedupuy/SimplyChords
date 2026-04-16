// ── prefs.js ──────────────────────────────────────────────────────────────────
// Persists user preferences to localStorage and restores them on load.
// Only serialisable, user-facing settings are stored — not session state.

import { getModeById } from './data/modes.js';

const KEY = 'chord-board-prefs';

// Fields from state that are worth persisting, with their defaults.
const PERSISTABLE = {
  tonicIdx:     0,
  instrument:   'piano',
  chordFormat:  'english',
  viewMode:     'name',
  soundEnabled: true,
  chordColours: 'default',
  activeModeId: 'progressions', // stored as id, resolved to object on load
};

// Theme lives on <html> data-theme, not in state — handled separately.
const THEME_KEY = 'chord-board-theme';

// ── Save ──────────────────────────────────────────────────────────────────────
export function savePrefs(state) {
  try {
    const prefs = {};
    for (const key of Object.keys(PERSISTABLE)) {
      if (key === 'activeModeId') {
        prefs.activeModeId = state.activeMode?.id ?? 'progressions';
      } else if (key in state) {
        prefs[key] = state[key];
      }
    }
    localStorage.setItem(KEY, JSON.stringify(prefs));
    // Theme is separate — it's on <html> not in state
    localStorage.setItem(THEME_KEY, document.documentElement.dataset.theme ?? 'dark');
  } catch {
    // localStorage unavailable (private mode, storage full) — fail silently
  }
}

// ── Load into state ───────────────────────────────────────────────────────────
// Call this BEFORE init() so state has correct values before first render.
export function loadPrefs(state) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const prefs = JSON.parse(raw);
      for (const [key, def] of Object.entries(PERSISTABLE)) {
        if (key === 'activeModeId') {
          if (prefs.activeModeId) {
            const mode = getModeById(prefs.activeModeId);
            if (mode) state.activeMode = mode;
          }
        } else if (key in prefs && prefs[key] !== undefined) {
          state[key] = prefs[key];
        }
      }
    }
  } catch {
    // Corrupted storage — ignore, use defaults
  }
}

// ── Apply theme to <html> (call before first paint) ───────────────────────────
// Returns the resolved theme string so the caller can update meta tags.
export function loadTheme() {
  try {
    const theme = localStorage.getItem(THEME_KEY) ?? 'dark';
    document.documentElement.dataset.theme = theme;
    return theme;
  } catch {
    return 'dark';
  }
}

// ── Apply chord colours to <html> ─────────────────────────────────────────────
export function applyChordColours(chordColours) {
  document.documentElement.dataset.chordColours = chordColours === 'quality' ? 'quality' : '';
}

// ── Sync active-pill UI to match restored state ───────────────────────────────
// Called after initControls() so the DOM buttons exist.
export function syncUI(state) {
  // Pill groups: find all [data-X] buttons and mark the right one active
  const pillGroups = [
    { selector: '[data-instrument]',  value: state.instrument  },
    { selector: '[data-format]',      value: state.chordFormat },
    { selector: '[data-viewmode]',    value: state.viewMode    },
    { selector: '[data-colours]',     value: state.chordColours },
    { selector: '.mode-btn',          value: null }, // handled by mode switcher
  ];

  pillGroups.forEach(({ selector, value }) => {
    if (value === null) return;
    document.querySelectorAll(selector).forEach(btn => {
      const btnVal = btn.dataset.instrument ?? btn.dataset.format ??
                     btn.dataset.viewmode   ?? btn.dataset.colours;
      btn.classList.toggle('active', btnVal === value);
    });
  });

  // Key buttons
  document.querySelectorAll('.key-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.keyIdx) === state.tonicIdx);
  });

  // Sound button
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.classList.toggle('active', state.soundEnabled);
    soundBtn.title = state.soundEnabled ? 'Sound on' : 'Sound off';
  }

  // Theme button — icon visibility is CSS-driven via data-theme, just update meta
  const metaTheme = document.getElementById('meta-theme-color');
  if (metaTheme) {
    metaTheme.content = document.documentElement.dataset.theme === 'light' ? '#f4f5f8' : '#0f1117';
  }

  // Chord colours on <html>
  applyChordColours(state.chordColours);
}
