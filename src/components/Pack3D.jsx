import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Waveform from './Waveform.jsx';
import { Seal } from './Wordmark.jsx';
import { prefersReducedMotion } from '../hooks/useScroll.js';
import '../styles/sections/pack.css';

const art = import.meta.glob('../assets/brand/packs/*.svg', { eager: true, query: '?url', import: 'default' });
export const packArt = (id) => art[`../assets/brand/packs/pack-${id}.svg`];

/**
 * The carton, built from six CSS planes with the real vector artwork on the
 * front — so it is always sharp, always on-brand, and costs no image.
 * It leans toward the pointer, can be dragged round, and turns a full
 * revolution when the cut changes (the artwork swaps while its back is to you).
 */
export default function Pack3D({ product, hit = 0, stageRef }) {
  const [shown, setShown] = useState(product);
  const box = useRef(null);
  const s = useRef({ x: -7, y: -26, tx: -7, ty: -26, spin: 0, drag: 0, vel: 0, dragging: false, hover: false, lastX: 0 });
  const first = useRef(true);

  // turn + swap on change
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    if (prefersReducedMotion()) {
      setShown(product);
      return undefined;
    }
    const st = s.current;
    const tween = gsap.to(st, { spin: Math.round(st.spin / 360) * 360 + 360, duration: 1.05, ease: 'power3.inOut' });
    const swap = setTimeout(() => setShown(product), 525);
    return () => {
      tween.kill();
      clearTimeout(swap);
      setShown(product);
    };
  }, [product]);

  // pointer + render loop
  useEffect(() => {
    const el = box.current;
    const stage = stageRef?.current || el.parentElement;
    const st = s.current;
    if (prefersReducedMotion()) {
      el.style.transform = 'rotateX(-6deg) rotateY(-24deg)';
      return undefined;
    }
    let raf = 0;
    const t0 = performance.now();

    const move = (e) => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      st.hover = true;
      st.ty = -32 + nx * 64;
      st.tx = 9 - ny * 20;
      if (st.dragging) {
        const dx = e.clientX - st.lastX;
        st.lastX = e.clientX;
        st.vel = dx * 0.55;
        st.drag += st.vel;
      }
    };
    const leave = () => {
      st.hover = false;
    };
    const down = (e) => {
      st.dragging = true;
      st.lastX = e.clientX;
      el.setPointerCapture?.(e.pointerId);
      el.classList.add('is-grabbing');
    };
    const up = () => {
      st.dragging = false;
      el.classList.remove('is-grabbing');
    };

    const frame = (now) => {
      const t = (now - t0) / 1000;
      if (!st.hover) {
        st.ty = -24 + Math.sin(t * 0.55) * 9;
        st.tx = -6 + Math.sin(t * 0.4 + 1) * 3;
      }
      if (!st.dragging) {
        st.drag += st.vel;
        st.vel *= 0.93;
      }
      st.x += (st.tx - st.x) * 0.07;
      st.y += (st.ty - st.y) * 0.07;
      el.style.transform = `translateY(${Math.sin(t * 0.9) * 6}px) rotateX(${st.x.toFixed(2)}deg) rotateY(${(st.y + st.spin + st.drag).toFixed(2)}deg)`;
      raf = requestAnimationFrame(frame);
    };

    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerleave', leave);
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, [stageRef]);

  const style = { '--pk-bg': shown.bg, '--pk-ink': shown.ink };

  return (
    <div className="pack-scene" style={style}>
      <div className={`pack-shake ${hit ? 'is-hit' : ''}`} key={hit}>
        <div className="pack" ref={box}>
          <div className="pack__face pack__front">
            <img src={packArt(shown.id)} alt={`Rica Beef ${shown.cut} pack: ${shown.kana} — ${shown.soundLine.toLowerCase()}`} draggable="false" />
          </div>
          <div className="pack__face pack__back" aria-hidden="true">
            <Seal className="pack__seal" />
            <p className="pack__back-cut">{shown.cut}</p>
            <Waveform values={shown.wave} />
            <p className="label">
              {shown.line} · {shown.weight}
            </p>
          </div>
          <div className="pack__face pack__side pack__left" aria-hidden="true">
            <span>
              Rica — {shown.cut} — {shown.sound}
            </span>
          </div>
          <div className="pack__face pack__side pack__right" aria-hidden="true">
            <span lang="ja">{shown.kana}</span>
          </div>
          <div className="pack__face pack__cap pack__top" aria-hidden="true" />
          <div className="pack__face pack__cap pack__bottom" aria-hidden="true" />
        </div>
      </div>
      <div className="pack-shadow" aria-hidden="true" />
    </div>
  );
}
