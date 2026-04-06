// ── app.js ────────────────────────────────────────────────────────────────────

import { renderBoard, applyViewMode, closeDetailPanel, setStateRef as boardStateRef } from './ui/board.js';
import { initControls } from './ui/controls.js';
import { initArrows, setStateRef as arrowStateRef } from './ui/arrows.js';
import { initProgression, setStateRef as progStateRef, renderTray } from './ui/progression.js';
import { initDetailPanel, setStateRef as detailStateRef } from './ui/detail.js';
import { MODES, getModeById, MODE_PROGRESSIONS } from './data/modes.js';
import { registerSW } from './sw-manager.js';
import { initSamplesUI } from './ui/samples.js';

export const state = {
  tonicIdx:     0,
  instrument:   'piano',
  chordFormat:  'english',
  viewMode:     'name',
  soundEnabled: true,
  activeMood:   null,
  activeMode:   MODE_PROGRESSIONS,
  chordColours: 'default',
  lastSelected: null,
  progression:  [],
};

export function init() {
  boardStateRef(state);
  arrowStateRef(state);
  progStateRef(state);
  detailStateRef(state);

  initControls(state, onStateChange);
  initModeSwitcher();
  initArrows();
  initProgression();
  initDetailPanel();

  document.getElementById('reset-path')?.addEventListener('click', () => {
    state.lastSelected = null;
    renderBoard();
  });

  renderBoard();
  if (window.lucide) window.lucide.createIcons();

  // Service worker + sample download UI
  registerSW();
  initSamplesUI('samples-ui');
}

// ── Mode switcher ─────────────────────────────────────────────────────────────
function initModeSwitcher() {
  const container = document.getElementById('mode-switcher');
  if (!container) return;

  MODES.forEach(mode => {
    const btn = document.createElement('button');
    btn.className = 'mode-btn' + (mode.id === state.activeMode.id ? ' active' : '');
    btn.dataset.modeId = mode.id;
    btn.innerHTML = `<i data-lucide="${mode.icon}"></i><span>${mode.label}</span>`;
    btn.addEventListener('click', () => {
      state.activeMode   = mode;
      state.lastSelected = null;
      state.progression  = [];
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onStateChange('mode');
      if (window.lucide) window.lucide.createIcons();
    });
    container.appendChild(btn);
  });
}

function onStateChange(what) {
  if (what === 'viewmode') {
    applyViewMode();
  } else {
    if (what === 'key' || what === 'mode') state.lastSelected = null;
    renderBoard();
    renderTray();
    if (window.lucide) window.lucide.createIcons();
  }
}

document.addEventListener('DOMContentLoaded', init);
