// ── ui/samples.js ─────────────────────────────────────────────────────────────
// Sample download UI — renders into the settings drawer.

import { checkSampleStatus, downloadSamples, clearSamples, SAMPLE_URLS } from '../sw-manager.js';

let _container = null;

export async function initSamplesUI(containerId) {
  _container = document.getElementById(containerId);
  if (!_container) return;
  if (!('serviceWorker' in navigator)) {
    _container.style.display = 'none';
    return;
  }
  await refreshStatus();
}

async function refreshStatus() {
  if (!_container) return;
  const status = await checkSampleStatus();
  renderUI(status);
}

function renderUI({ total, cached, complete }) {
  if (!_container) return;
  const pct = Math.round((cached / total) * 100);

  if (complete) {
    _container.innerHTML = `
      <div class="sample-status sample-status-ok">
        <i data-lucide="check-circle-2"></i>
        <span>Piano samples cached</span>
        <button class="sample-action-btn sample-clear-btn" id="sample-clear">
          <i data-lucide="trash-2"></i>
        </button>
      </div>`;
    _container.querySelector('#sample-clear')?.addEventListener('click', async () => {
      renderDownloading(0, total, true);
      await clearSamples();
      await refreshStatus();
    });
  } else if (cached > 0) {
    _container.innerHTML = `
      <div class="sample-status">
        <span>${pct}% cached (${cached}/${total})</span>
        <button class="sample-action-btn" id="sample-resume">
          <i data-lucide="download"></i> Resume
        </button>
      </div>`;
    _container.querySelector('#sample-resume')?.addEventListener('click', startDownload);
  } else {
    _container.innerHTML = `
      <div class="sample-status">
        <i data-lucide="piano"></i>
        <span>Piano samples</span>
        <span class="sample-size">~8 MB</span>
        <button class="sample-action-btn" id="sample-download">
          <i data-lucide="download"></i> Download
        </button>
      </div>`;
    _container.querySelector('#sample-download')?.addEventListener('click', startDownload);
  }

  if (window.lucide) window.lucide.createIcons();
}

async function startDownload() {
  renderDownloading(0, SAMPLE_URLS.length);
  await downloadSamples((done, total) => {
    renderDownloading(done, total);
  });
  await refreshStatus();
}

function renderDownloading(done, total, clearing = false) {
  if (!_container) return;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  _container.innerHTML = `
    <div class="sample-status sample-downloading">
      <i data-lucide="${clearing ? 'trash-2' : 'download'}"></i>
      <span>${clearing ? 'Clearing…' : `Downloading… ${pct}%`}</span>
      <div class="sample-progress-bar">
        <div class="sample-progress-fill" style="width:${pct}%"></div>
      </div>
    </div>`;
  if (window.lucide) window.lucide.createIcons();
}
