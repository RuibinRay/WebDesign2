import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Reduced motion is a choice made on this site (the "Reduce motion" control, top right), not read
 * from the operating system: every visitor starts with the full experience. index.html sets
 * <html data-motion="reduced"> from the saved choice before anything renders.
 */
export const MOTION_KEY = 'rica-motion';
export const prefersReducedMotion = () => typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced';

let lenis = null;
export const getLenis = () => lenis;

/** Smooth scrolling, wired into GSAP's ticker so ScrollTrigger and Lenis share one clock. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
    };
  }, []);
}

/** Scroll to an in-page target (used by nav and CTAs). Falls back to native scrolling. */
export function scrollToId(id, offset = 0) {
  const el = typeof id === 'string' ? document.getElementById(id) : id;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  if (typeof id === 'string') history.replaceState(null, '', `#${id}`);
}

/**
 * Adds `.is-in` to every [data-reveal] / .rise-group inside the returned ref
 * as it enters the viewport. CSS does the rest (see base.css).
 */
export function useReveal(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const targets = [...root.querySelectorAll('[data-reveal], [data-rise]')];
    if (root.matches('[data-reveal], [data-rise]')) targets.push(root);
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/** Runs a GSAP setup function inside a context scoped to the ref; cleans up on unmount. Skipped for reduced motion. */
export function useGsap(setup, deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => setup(ref.current, gsap, ScrollTrigger), ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export function useMediaQuery(query) {
  const [match, setMatch] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

export { gsap, ScrollTrigger };
