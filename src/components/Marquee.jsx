import { useEffect, useRef } from 'react';
import { products } from '../data/products.js';
import { prefersReducedMotion } from '../hooks/useScroll.js';
import '../styles/sections/marquee.css';

/** The five sound words on a loop. Decorative: hidden from assistive tech. */
export default function Marquee({ tone = 'shu', reverse = false }) {
  const track = useRef(null);

  // The faster the page moves, the faster the words run and the harder they lean.
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return undefined;
    const anim = el.getAnimations?.()[0];
    let raf = 0;
    let seen = false;
    let v = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    const loop = (now) => {
      const dt = Math.max(8, now - lastT);
      const inst = ((window.scrollY - lastY) / dt) * 1000;
      lastY = window.scrollY;
      lastT = now;
      v += (inst - v) * 0.1;
      if (seen) {
        if (anim) anim.playbackRate = 1 + Math.min(7, Math.abs(v) / 420);
        el.style.setProperty('--lean', `${Math.max(-12, Math.min(12, v / 220)).toFixed(2)}deg`);
      }
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    io.observe(el);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const run = (
    <span className="marquee__run">
      {products.map((p) => (
        <span className="marquee__item" key={p.id}>
          <span className="loud" lang="ja">
            {p.kana}
          </span>
          <span className="quiet">{p.sound}</span>
          <span className="marquee__sep" />
        </span>
      ))}
    </span>
  );
  return (
    <div className={`marquee marquee--${tone} ${reverse ? 'marquee--rev' : ''}`} aria-hidden="true">
      <div className="marquee__track" ref={track}>
        {run}
        {run}
        {run}
      </div>
    </div>
  );
}
