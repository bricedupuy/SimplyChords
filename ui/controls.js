// ── ui/controls.js ─────────────────────────────────────────────────────────────
// Key selector, instrument picker, format picker, view mode, sound toggle, moods.

import { CHROMATIC, ENHARMONIC, MOODS } from '../data/theory.js';

let _state = null;
let _onStateChange = null;

export function initControls(state, onStateChange) {
  _state = state;
  _onStateChange = onStateChange;
  buildKeyBar();
  buildMoodBar();
  bindToggleButtons();
}

// ── Key bar ───────────────────────────────────────────────────────────────────
const DISPLAY_KEYS = ['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
const KEY_TO_IDX = {};
CHROMATIC.forEach((k, i) => KEY_TO_IDX[k] = i);
// Map flat display names to chromatic index
const FLAT_TO_IDX = { 'D♭':1, 'E♭':3, 'G♭':6, 'A♭':8, 'B♭':10 };

function keyIdx(displayKey) {
  if (FLAT_TO_IDX[displayKey] !== undefined) return FLAT_TO_IDX[displayKey];
  return KEY_TO_IDX[displayKey] ?? 0;
}

function buildKeyBar() {
  const bar = document.getElementById('key-buttons');
  if (!bar) return;
  bar.innerHTML = '';
  DISPLAY_KEYS.forEach(k => {
    const btn = document.createElement('button');
    btn.className = 'key-btn';
    btn.textContent = k;
    btn.dataset.keyIdx = keyIdx(k);
    if (keyIdx(k) === _state.tonicIdx) btn.classList.add('active');
    btn.addEventListener('click', () => {
      _state.tonicIdx = keyIdx(k);
      document.querySelectorAll('.key-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _onStateChange('key');
    });
    bar.appendChild(btn);
  });
}

// ── Mood bar ──────────────────────────────────────────────────────────────────
function buildMoodBar() {
  const bar = document.getElementById('mood-buttons');
  if (!bar) return;
  bar.innerHTML = '';
  MOODS.forEach(mood => {
    const btn = document.createElement('button');
    btn.className = 'mood-btn';
    btn.dataset.moodId = mood.id;
    btn.title = mood.desc;
    btn.innerHTML = `<span class="mood-label">${mood.label}</span><span class="mood-desc">${mood.desc}</span>`;
    btn.style.setProperty('--mood-color', mood.color);
    btn.addEventListener('click', () => {
      const wasActive = _state.activeMood?.id === mood.id;
      _state.activeMood = wasActive ? null : mood;
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
      if (!wasActive) btn.classList.add('active');
      _onStateChange('mood');
    });
    bar.appendChild(btn);
  });
}

// ── Reusable pill group binder ────────────────────────────────────────────────
function bindPillGroup(selector, stateKey, changeEvent) {
  document.querySelectorAll(selector).forEach(btn => {
    if (btn.dataset[stateKey] === _state[stateKey]) btn.classList.add('active');
    btn.addEventListener('click', () => {
      _state[stateKey] = btn.dataset[stateKey];
      document.querySelectorAll(selector).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _onStateChange(changeEvent);
    });
  });
}

// ── Toggle buttons ────────────────────────────────────────────────────────────
function bindToggleButtons() {
  bindPillGroup('[data-instrument]', 'instrument', 'instrument');
  bindPillGroup('[data-format]',     'chordFormat', 'format');

  // Chord colour mode
  document.querySelectorAll('[data-colours]').forEach(btn => {
    if (btn.dataset.colours === (_state.chordColours ?? 'default')) btn.classList.add('active');
    btn.addEventListener('click', () => {
      _state.chordColours = btn.dataset.colours;
      document.documentElement.dataset.chordColours = btn.dataset.colours === 'quality' ? 'quality' : '';
      document.querySelectorAll('[data-colours]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _onStateChange('colours');
    });
  });

  // View mode has extra side-effect
  document.querySelectorAll('[data-viewmode]').forEach(btn => {
    if (btn.dataset.viewmode === _state.viewMode) btn.classList.add('active');
    btn.addEventListener('click', () => {
      _state.viewMode = btn.dataset.viewmode;
      document.querySelectorAll('[data-viewmode]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      syncFormatGroupVisibility();
      _onStateChange('viewmode');
    });
  });

  syncFormatGroupVisibility();

  // Sound toggle
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    updateSoundBtn(soundBtn);
    soundBtn.addEventListener('click', () => {
      _state.soundEnabled = !_state.soundEnabled;
      updateSoundBtn(soundBtn);
      _onStateChange('sound');
    });
  }

  // Settings drawer toggle
  const settingsBtn = document.getElementById('settings-toggle');
  const drawer = document.getElementById('settings-drawer');
  if (settingsBtn && drawer) {
    settingsBtn.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      settingsBtn.classList.toggle('open', open);
      settingsBtn.setAttribute('aria-expanded', open);
    });
  }

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const isLight = html.dataset.theme === 'light';
      html.dataset.theme = isLight ? 'dark' : 'light';
      // Update PWA theme-color meta
      const metaTheme = document.getElementById('meta-theme-color');
      if (metaTheme) metaTheme.content = isLight ? '#0f1117' : '#f4f5f8';
      _onStateChange('theme');
    });
  }
}

function syncFormatGroupVisibility() {
  const el = document.getElementById('format-group');
  if (el) el.style.display = _state.viewMode === 'diagram' ? 'none' : '';
}

function updateSoundBtn(btn) {
  btn.classList.toggle('active', _state.soundEnabled);
  btn.title = _state.soundEnabled ? 'Sound on' : 'Sound off';
}
