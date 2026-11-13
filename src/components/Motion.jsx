import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../hooks/useScroll.js';

/** A hairline across the top of the window that fills as the page is read. */
export function ScrollProgress() {
  const bar = useRef(null);
  useEffect(() => {
    let raf = 0;
    const paint = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, []);
  return (
    <div className="scroll-progress" aria-hidden="true">
      <i ref={bar} />
    </div>
  );
}

/**
 * Buttons lean a few pixels toward the pointer. One delegated listener for the whole page;
 * the lean is two CSS variables on the button, so the styling stays in base.css.
 */
export function useMagneticButtons() {
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    let active = null;
    const clear = (el) => {
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    };
    const move = (e) => {
      const el = e.target.closest?.('.btn');
      if (active && active !== el) {
        clear(active);
        active = null;
      }
      if (!el) return;
      active = el;
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      el.style.setProperty('--mx', `${(x * 7).toFixed(1)}px`);
      el.style.setProperty('--my', `${(y * 5).toFixed(1)}px`);
    };
    const leave = () => {
      if (active) clear(active);
      active = null;
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, []);
}
