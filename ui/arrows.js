// ── ui/arrows.js ──────────────────────────────────────────────────────────────
// Draws SVG arrows between chord tiles showing allowed progression paths.
// Uses an absolutely-positioned SVG overlay over .board.

import { SECONDARY, DIATONIC } from '../data/theory.js';

let _state = null;
export function setStateRef(s) { _state = s; }

let _svg = null;
let _resizeObserver = null;

// ── Init: create the SVG overlay ──────────────────────────────────────────────
export function initArrows() {
  const board = document.querySelector('.board');
  if (!board) return;

  // Make board a positioning context
  board.style.position = 'relative';

  _svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  _svg.id = 'arrows-overlay';
  _svg.style.cssText = `
    position:absolute; inset:0; width:100%; height:100%;
    pointer-events:none; z-index:10; overflow:visible;
  `;
  // Arrow marker defs
  _svg.innerHTML = `<defs>
    <marker id="arr-teal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="rgba(61,204,168,0.7)"/>
    </marker>
    <marker id="arr-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="rgba(232,168,74,0.7)"/>
    </marker>
    <marker id="arr-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="rgba(74,143,232,0.6)"/>
    </marker>
  </defs>`;
  board.appendChild(_svg);

  // Redraw on resize
  _resizeObserver = new ResizeObserver(() => drawArrows());
  _resizeObserver.observe(board);
}

// ── Get tile element center/edge positions ────────────────────────────────────
function tileRect(chordId) {
  const el = document.querySelector(`[data-chord-id="${chordId}"]`);
  if (!el) return null;
  const board = document.querySelector('.board');
  const boardRect = board.getBoundingClientRect();
  const tileRect = el.getBoundingClientRect();
  return {
    top:    tileRect.top    - boardRect.top,
    bottom: tileRect.bottom - boardRect.top,
    left:   tileRect.left   - boardRect.left,
    right:  tileRect.right  - boardRect.left,
    cx:     tileRect.left   - boardRect.left + tileRect.width  / 2,
    cy:     tileRect.top    - boardRect.top  + tileRect.height / 2,
    width:  tileRect.width,
    height: tileRect.height,
  };
}

// ── Draw a curved arrow between two rects ─────────────────────────────────────
function arrow(x1, y1, x2, y2, color, markerId, curvature = 0) {
  const mx = (x1 + x2) / 2 + curvature;
  const my = (y1 + y2) / 2;
  return `<path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}"
    fill="none" stroke="${color}" stroke-width="1.5" opacity="0.65"
    stroke-dasharray="4 3"
    marker-end="url(#${markerId})"/>`;
}

// ── Main draw ─────────────────────────────────────────────────────────────────
export function drawArrows() {
  if (!_svg) return;

  // Remove old paths (keep defs)
  const paths = _svg.querySelectorAll('path:not(marker path), line');
  paths.forEach(p => p.remove());

  let html = '';

  // ── Secondary → Main arrows (each V7 → its target) ───────────────────────
  SECONDARY.forEach((sec, i) => {
    const secRect  = tileRect(sec.id);
    const mainRect = tileRect(sec.targetId);
    if (!secRect || !mainRect) return;

    // From bottom-center of secondary tile to top-center of main tile
    const x1 = secRect.cx;
    const y1 = secRect.bottom;
    const x2 = mainRect.cx;
    const y2 = mainRect.top;

    // Slight curve if they're not vertically aligned
    const curvature = (x2 - x1) * 0.15;

    html += arrow(x1, y1 + 2, x2, y2 - 2, 'rgba(61,204,168,0.6)', 'arr-teal', curvature);
  });

  // ── Main I/IV/V → Modal arrows ───────────────────────────────────────────
  const GATEWAY_IDS = ['I', 'IV', 'V'];
  GATEWAY_IDS.forEach(id => {
    const mainRect = tileRect(id);
    if (!mainRect) return;

    // Draw a small downward arrow from each gateway chord
    const x = mainRect.cx;
    const y1 = mainRect.bottom + 2;
    const y2 = y1 + 18;
    html += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"
      stroke="rgba(232,168,74,0.5)" stroke-width="1.5" stroke-dasharray="3 2"
      marker-end="url(#arr-amber)"/>`;
  });

  _svg.insertAdjacentHTML('beforeend', html);
}

export function destroyArrows() {
  if (_resizeObserver) _resizeObserver.disconnect();
  if (_svg) _svg.remove();
  _svg = null;
}
