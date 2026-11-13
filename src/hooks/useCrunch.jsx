import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

/**
 * The brand's sound, synthesised in the browser — no audio files.
 * Each cut carries a tiny recipe (products.js → synth): how many grains the
 * break has, how far apart, how bright, how long. Ribeye is one glassy
 * transient; brisket is a run of low layered cracks; jerky is a slow squeeze.
 *
 * Sound is OFF by default. `play` is for explicit "hear it" buttons and always
 * sounds; `cue` is for incidental moments and only sounds when the visitor has
 * switched sound on.
 */
const SoundContext = createContext({ on: false, toggle: () => {}, play: () => {}, cue: () => {} });

export function SoundProvider({ children }) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef(null);
  const noiseRef = useRef(null);
  const onRef = useRef(false);

  const ensure = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      const ctx = new AC();
      const len = ctx.sampleRate * 1.2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      ctxRef.current = ctx;
      noiseRef.current = buf;
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (synth) => {
      const ctx = ensure();
      if (!ctx || !synth) return;
      const now = ctx.currentTime + 0.01;
      const master = ctx.createGain();
      master.gain.value = 0.55 * (synth.gain ?? 0.8);
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 6;
      master.connect(comp).connect(ctx.destination);

      const slow = synth.decay > 0.2; // the jerky "squeeze"
      for (let i = 0; i < synth.grains; i++) {
        const t = now + (synth.grains > 1 ? (i / (synth.grains - 1)) * synth.spread * (0.75 + Math.random() * 0.5) : 0);
        const level = (i === 0 ? 1 : 0.45 + Math.random() * 0.5) * (1 - (i / synth.grains) * 0.35);

        const src = ctx.createBufferSource();
        src.buffer = noiseRef.current;
        src.playbackRate.value = 0.8 + Math.random() * 0.5;

        const bp = ctx.createBiquadFilter();
        bp.type = slow ? 'lowpass' : 'bandpass';
        bp.frequency.value = synth.freq * (0.8 + Math.random() * 0.45);
        bp.Q.value = synth.q;

        const g = ctx.createGain();
        if (slow) {
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(level * 0.9, t + synth.decay * 0.45);
          g.gain.exponentialRampToValueAtTime(0.0001, t + synth.decay);
          bp.frequency.setValueAtTime(synth.freq * 0.5, t);
          bp.frequency.exponentialRampToValueAtTime(synth.freq * 1.6, t + synth.decay * 0.5);
        } else {
          g.gain.setValueAtTime(level, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + synth.decay * (0.7 + Math.random() * 0.6));
        }
        src.connect(bp).connect(g).connect(master);
        src.start(t, Math.random() * 0.8);
        src.stop(t + synth.decay * 2 + 0.05);

        if (!slow) {
          // the "tick" on top of each grain — the glassy edge
          const click = ctx.createBufferSource();
          click.buffer = noiseRef.current;
          const hp = ctx.createBiquadFilter();
          hp.type = 'highpass';
          hp.frequency.value = Math.min(9000, synth.freq * 1.7);
          const cg = ctx.createGain();
          cg.gain.setValueAtTime(level * 0.7, t);
          cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
          click.connect(hp).connect(cg).connect(master);
          click.start(t, Math.random() * 0.8);
          click.stop(t + 0.03);
        }
      }
    },
    [ensure],
  );

  const cue = useCallback(
    (synth) => {
      if (onRef.current) play(synth);
    },
    [play],
  );

  const toggle = useCallback(() => {
    setOn((v) => {
      const next = !v;
      onRef.current = next;
      if (next) {
        ensure();
        // confirm with the house sound
        play({ grains: 2, spread: 0.035, freq: 5200, q: 0.9, decay: 0.07, gain: 0.7 });
      }
      return next;
    });
  }, [ensure, play]);

  const value = useMemo(() => ({ on, toggle, play, cue }), [on, toggle, play, cue]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export const useCrunch = () => useContext(SoundContext);
