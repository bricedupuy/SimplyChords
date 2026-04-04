// ── ui/progression.js ─────────────────────────────────────────────────────────
// Progression builder: tray, sequence playback, export.

import { playChord } from '../audio/player.js';
import { CHROMATIC, preferredNote, formatChordName } from '../data/theory.js';

let _state = null;
export function setStateRef(s) { _state = s; }

// ── Init ──────────────────────────────────────────────────────────────────────
export function initProgression() {
  document.getElementById('prog-clear')?.addEventListener('click', clearProgression);
  document.getElementById('prog-play')?.addEventListener('click', playProgression);
  document.getElementById('prog-undo')?.addEventListener('click', undoProgression);
  renderTray();
}

// ── Add a chord step ──────────────────────────────────────────────────────────
export function addToProgression(noteIdx, chordDef) {
  const rootKey = CHROMATIC[_state.tonicIdx];
  const name = formatChordName(noteIdx, chordDef.quality, rootKey, _state.chordFormat, chordDef.nash);
  _state.progression.push({
    noteIdx,
    intervals: chordDef.int,
    name,
    deg: chordDef.deg,
    id: chordDef.id,
  });
  renderTray();
}

// ── Remove last step ──────────────────────────────────────────────────────────
export function undoProgression() {
  _state.progression.pop();
  renderTray();
}

// ── Clear ──────────────────────────────────────────────────────────────────────
export function clearProgression() {
  _state.progression = [];
  renderTray();
}

// ── Play sequence ─────────────────────────────────────────────────────────────
export function playProgression() {
  const prog = _state.progression;
  if (!prog.length || !_state.soundEnabled) return;

  const bpm = 72;
  const beatDur = 60 / bpm;
  const chordDur = beatDur * 2; // 2 beats per chord

  // Highlight steps as they play
  prog.forEach((step, i) => {
    setTimeout(() => {
      playChord(rootMidi(step.noteIdx), step.intervals, { duration: chordDur * 0.9 });
      highlightStep(i);
    }, i * chordDur * 1000);
  });
}

function rootMidi(noteIdx) {
  return 12 + 4 * 12 + noteIdx;
}

function highlightStep(idx) {
  document.querySelectorAll('.prog-step').forEach((el, i) => {
    el.classList.toggle('prog-step-playing', i === idx);
  });
  setTimeout(() => {
    document.querySelectorAll('.prog-step').forEach(el => el.classList.remove('prog-step-playing'));
  }, 900);
}

// ── Refresh names when key/format changes ─────────────────────────────────────
export function refreshProgressionNames() {
  const rootKey = CHROMATIC[_state.tonicIdx];
  _state.progression.forEach(step => {
    // Find the chordDef to re-derive name
    step.name = formatChordName(step.noteIdx, null, rootKey, _state.chordFormat, step.deg);
  });
  renderTray();
}

// ── Render tray ───────────────────────────────────────────────────────────────
export function renderTray() {
  const tray = document.getElementById('prog-steps');
  const exportEl = document.getElementById('prog-export');
  const playBtn = document.getElementById('prog-play');
  const prog = _state.progression;

  if (!tray) return;

  if (!prog.length) {
    tray.innerHTML = '<span class="prog-empty">Click chords above to build a progression</span>';
    if (exportEl) exportEl.textContent = '';
    if (playBtn) playBtn.disabled = true;
    return;
  }

  if (playBtn) playBtn.disabled = false;

  tray.innerHTML = prog.map((step, i) => `
    <div class="prog-step" data-idx="${i}">
      <span class="prog-step-deg">${step.deg}</span>
      <span class="prog-step-name">${step.name}</span>
      <button class="prog-step-remove" data-idx="${i}" title="Remove">×</button>
    </div>
    ${i < prog.length - 1 ? '<span class="prog-sep">–</span>' : ''}
  `).join('');

  // Remove individual step
  tray.querySelectorAll('.prog-step-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      _state.progression.splice(idx, 1);
      renderTray();
    });
  });

  // Click step to replay
  tray.querySelectorAll('.prog-step').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx);
      const step = prog[idx];
      if (_state.soundEnabled) playChord(rootMidi(step.noteIdx), step.intervals);
      highlightStep(idx);
    });
  });

  // Export string
  if (exportEl) {
    exportEl.textContent = prog.map(s => s.name).join(' – ');
  }
}
