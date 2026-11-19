// Kid-friendly synthesized Web Audio API sound effects
// 100% standalone — works in every browser with zero external MP3s or network requests

let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleSound(enabled) {
  if (typeof enabled === 'boolean') {
    soundEnabled = enabled;
  } else {
    soundEnabled = !soundEnabled;
  }
  return soundEnabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

// Gentle pleasant pop (e.g. for feeding a gulab jamun or button popping)
export function playPop(pitch = 440) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(pitch, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(pitch * 2.2, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

// Cheerful bell chime for correct answer
export function playSuccessChime() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

    gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.08);
    osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
  });
}

// Gentle "oops" boing for wrong try (encouraging, not jarring)
export function playGentleBoing() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(260, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.2);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

// Hop / Jump sound for Lava Hop
export function playHop() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

// Dice tumble / rattle sound
export function playDiceRoll() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  for (let i = 0; i < 4; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150 + Math.random() * 200, ctx.currentTime + i * 0.05);

    gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + i * 0.05);
    osc.stop(ctx.currentTime + i * 0.05 + 0.04);
  }
}

// Grand celebratory victory fanfare
export function playVictoryFanfare() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const melody = [
    { f: 523.25, d: 0.15 }, // C5
    { f: 659.25, d: 0.15 }, // E5
    { f: 783.99, d: 0.15 }, // G5
    { f: 1046.5, d: 0.35 }  // C6
  ];

  let t = ctx.currentTime;
  melody.forEach(n => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.f, t);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + n.d);
    t += n.d;
  });
}

// Bead click sound
export function playBeadClick() {
  if (!soundEnabled) return;
  playPop(620);
}

// Banana eat munch sound
export function playMunch() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

// Funny cartoon stomach growl
export function playStomachGrowl() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const masterGain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(85, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(65, ctx.currentTime + 0.6);

  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(14, ctx.currentTime);
  lfoGain.gain.setValueAtTime(35, ctx.currentTime);

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.15);
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);

  osc.connect(masterGain);
  masterGain.connect(ctx.destination);

  lfo.start();
  osc.start();
  lfo.stop(ctx.currentTime + 0.65);
  osc.stop(ctx.currentTime + 0.65);
}

// Cheerful bakery shop entry bell
export function playBakeryBell() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [1567.98, 2093.00];
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

    gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.06);
    osc.stop(ctx.currentTime + idx * 0.06 + 0.35);
  });
}

// Cake pick / select sweet chime
export function playCakePick() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(750, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.09);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

// Funny cartoon burp / satisfied sound
export function playMonsterBurp() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(110, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.25);
  osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + 0.35);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

// Funny overstuffed groan
export function playMonsterGroan() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(140, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.4);

  gain.gain.setValueAtTime(0.22, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.45);
}

// Snapping string sound for bracelet snap
export function playBraceletSnap() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.18);

  gain.gain.setValueAtTime(0.35, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

// Clattering scattering beads sound
export function playScatter() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  for (let i = 0; i < 7; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const freq = 500 + Math.random() * 600;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + i * 0.05 + 0.06);

    gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + i * 0.05);
    osc.stop(ctx.currentTime + i * 0.05 + 0.07);
  }
}

// Sizzling hot lava sound
export function playLavaSizzle() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.35);
}

