// ── audio/player.js ───────────────────────────────────────────────────────────
// Web Audio engine. Triangle + sine layering with arpeggiated attack.

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Play a chord.
 * @param {number} rootMidi - MIDI note number for root
 * @param {number[]} intervals - semitone offsets from root
 * @param {object} opts
 * @param {boolean} opts.arpeggiate - stagger notes (default true)
 * @param {number} opts.duration - seconds (default 2.5)
 * @param {number} opts.gain - master gain 0–1 (default 0.4)
 */
export function playChord(rootMidi, intervals, opts = {}) {
  const {
    arpeggiate = true,
    duration = 2.5,
    gain = 0.4,
  } = opts;

  const ac = getCtx();
  const now = ac.currentTime;

  const master = ac.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(gain, now + 0.03);
  master.gain.setValueAtTime(gain, now + duration * 0.5);
  master.gain.exponentialRampToValueAtTime(0.001, now + duration);
  master.connect(ac.destination);

  intervals.forEach((semitones, i) => {
    const t = now + (arpeggiate ? i * 0.07 : 0);
    const freq = midiToFreq(rootMidi + semitones);

    // Triangle oscillator (body)
    const osc1 = ac.createOscillator();
    const g1 = ac.createGain();
    osc1.type = 'triangle';
    osc1.frequency.value = freq;
    g1.gain.setValueAtTime(0.25, t);
    osc1.connect(g1); g1.connect(master);
    osc1.start(t); osc1.stop(now + duration + 0.1);

    // Sine oscillator (warmth, slightly detuned)
    const osc2 = ac.createOscillator();
    const g2 = ac.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 1.0015;
    g2.gain.setValueAtTime(0.12, t);
    osc2.connect(g2); g2.connect(master);
    osc2.start(t); osc2.stop(now + duration + 0.1);

    // Octave sine for presence
    const osc3 = ac.createOscillator();
    const g3 = ac.createGain();
    osc3.type = 'sine';
    osc3.frequency.value = freq * 2;
    g3.gain.setValueAtTime(0.05, t);
    osc3.connect(g3); g3.connect(master);
    osc3.start(t); osc3.stop(now + duration + 0.1);
  });
}

/**
 * Play a sequence of chords with a gap between each.
 * @param {Array<{rootMidi, intervals}>} chords
 * @param {number} bpm
 * @param {number} beatsPerChord
 */
export function playSequence(chords, bpm = 80, beatsPerChord = 2) {
  const ac = getCtx();
  const now = ac.currentTime;
  const beatDur = 60 / bpm;
  const chordDur = beatDur * beatsPerChord;

  chords.forEach(({ rootMidi, intervals }, i) => {
    setTimeout(() => {
      playChord(rootMidi, intervals, { duration: chordDur * 0.9 });
    }, i * chordDur * 1000);
  });
}
