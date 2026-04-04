// ── app.js ────────────────────────────────────────────────────────────────────

import { renderBoard, applyViewMode, closeDetailPanel, setStateRef as boardStateRef } from './ui/board.js';
import { initControls } from './ui/controls.js';
import { initArrows, setStateRef as arrowStateRef } from './ui/arrows.js';
import { initProgression, setStateRef as progStateRef, renderTray } from './ui/progression.js';

export const state = {
  tonicIdx:     0,
  instrument:   'piano',
  chordFormat:  'english',
  viewMode:     'name',
  soundEnabled: true,
  activeMood:   null,
  lastSelected: null,
  progression:  [],
};

export function init() {
  boardStateRef(state);
  arrowStateRef(state);
  progStateRef(state);

  initControls(state, onStateChange);
  initArrows();
  initProgression();

  document.getElementById('dp-close')?.addEventListener('click', closeDetailPanel);
  document.getElementById('detail-panel-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('detail-panel-overlay')) closeDetailPanel();
  });

  document.getElementById('reset-path')?.addEventListener('click', () => {
    state.lastSelected = null;
    renderBoard();
  });

  renderBoard();

  // Init Lucide icons (runs after all dynamic content is rendered)
  if (window.lucide) window.lucide.createIcons();
}

function onStateChange(what) {
  if (what === 'viewmode') {
    applyViewMode();
  } else {
    if (what === 'key') state.lastSelected = null;
    renderBoard();
    renderTray();
  }
}

document.addEventListener('DOMContentLoaded', init);
