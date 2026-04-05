// ── ui/arrows.js ──────────────────────────────────────────────────────────────
// Mode-aware SVG arrow overlay.

let _state = null;
export function setStateRef(s) { _state = s; }

let _svg = null;
let _resizeObserver = null;

export function initArrows() {
  const board = document.querySelector('.board');
  if (!board) return;
  board.style.position = 'relative';

  _svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  _svg.id = 'arrows-overlay';
  _svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:10;overflow:visible;';
  _svg.innerHTML = `<defs>
    <marker id="arr-teal"  markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="rgba(61,204,168,0.7)"/></marker>
    <marker id="arr-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="rgba(232,168,74,0.7)"/></marker>
    <marker id="arr-purple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="rgba(176,125,232,0.7)"/></marker>
  </defs>`;
  board.appendChild(_svg);

  _resizeObserver = new ResizeObserver(() => drawArrows());
  _resizeObserver.observe(board);
}

function tileRect(chordId) {
  const el = document.querySelector(`[data-chord-id="${chordId}"]`);
  if (!el) return null;
  const board = document.querySelector('.board');
  const br = board.getBoundingClientRect();
  const tr = el.getBoundingClientRect();
  return {
    top: tr.top - br.top, bottom: tr.bottom - br.top,
    cx:  tr.left - br.left + tr.width / 2,
  };
}

function rowMidY(rowId) {
  const row = document.getElementById(`row-${rowId}`);
  if (!row) return null;
  const board = document.querySelector('.board');
  const br = board.getBoundingClientRect();
  const rr = row.getBoundingClientRect();
  return { top: rr.top - br.top, bottom: rr.bottom - br.top, cx: rr.left - br.left + rr.width / 2 };
}

export function drawArrows() {
  if (!_svg) return;
  _svg.querySelectorAll('path, line').forEach(p => p.remove());

  const mode = _state?.activeMode;
  if (!mode?.arrows) return;

  let html = '';

  for (const arrowDef of mode.arrows) {
    const color = arrowDef.style === 'teal'   ? 'rgba(61,204,168,0.55)'  :
                  arrowDef.style === 'amber'  ? 'rgba(232,168,74,0.55)' :
                  arrowDef.style === 'purple' ? 'rgba(176,125,232,0.55)' :
                  'rgba(255,255,255,0.2)';
    const marker = `arr-${arrowDef.style}`;

    if (arrowDef.type === 'row-to-row-targeted') {
      // One arrow per chord in fromRow pointing to its target in toRow
      const fromRow = mode.rows.find(r => r.id === arrowDef.fromRow);
      if (!fromRow) continue;
      fromRow.chords.forEach(cd => {
        const fromR = tileRect(cd.id);
        const toId  = cd.resolveId || cd.targetId;
        const toR   = toId ? tileRect(toId) : null;
        if (!fromR || !toR) return;
        const x1 = fromR.cx, y1 = fromR.bottom + 2;
        const x2 = toR.cx,   y2 = toR.top   - 2;
        const cx = (x1 + x2) / 2 + (x2 - x1) * 0.1;
        html += `<path d="M${x1},${y1} Q${cx},${(y1+y2)/2} ${x2},${y2}" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#${marker})"/>`;
      });
    }

    if (arrowDef.type === 'gateway-down') {
      // Short downward stub from each gateway chord
      arrowDef.gatewayIds.forEach(gid => {
        const r = tileRect(gid);
        if (!r) return;
        html += `<line x1="${r.cx}" y1="${r.bottom+2}" x2="${r.cx}" y2="${r.bottom+20}" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 2" marker-end="url(#${marker})"/>`;
      });
    }
  }

  _svg.insertAdjacentHTML('beforeend', html);
}
