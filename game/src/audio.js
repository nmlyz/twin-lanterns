// All sound is synthesized with WebAudio: no audio files, no network.
const NOTE = { C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0 };

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (!context) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
      } catch {
        context = null;
      }
    }
    if (context && context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function tone(freq, start, length, type, volume) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + start;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + length + 0.05);
  }

  function sequence(notes, type, volume, step) {
    notes.forEach((freq, index) => tone(freq, index * step, step * 1.6, type, volume));
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    click() {
      tone(NOTE.E5, 0, 0.07, 'triangle', 0.12);
    },
    find(combo) {
      const base = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.A5, NOTE.C5 + 261.63];
      const top = base[Math.min(combo, base.length - 1)];
      tone(NOTE.C5, 0, 0.14, 'sine', 0.22);
      tone(NOTE.E5, 0.07, 0.14, 'sine', 0.22);
      tone(top, 0.14, 0.3, 'sine', 0.26);
    },
    miss() {
      tone(140, 0, 0.16, 'sawtooth', 0.1);
      tone(110, 0.08, 0.2, 'sawtooth', 0.08);
    },
    hint() {
      tone(NOTE.G4, 0, 0.12, 'triangle', 0.16);
      tone(NOTE.B4, 0.09, 0.2, 'triangle', 0.16);
    },
    clear() {
      sequence([NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5, NOTE.E5, NOTE.G5], 'sine', 0.2, 0.09);
    },
    win() {
      sequence([NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5, NOTE.G5, NOTE.C5, NOTE.E5, NOTE.G5, NOTE.A5], 'triangle', 0.2, 0.11);
    },
    over() {
      sequence([NOTE.A4, NOTE.G4, NOTE.E4, NOTE.C4], 'sine', 0.16, 0.16);
    },
    tick() {
      tone(NOTE.A5, 0, 0.05, 'square', 0.06);
    },
  };
}
