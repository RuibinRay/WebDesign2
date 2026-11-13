import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { prefersReducedMotion } from '../hooks/useScroll.js';

/**
 * Salt. A canvas of drifting crystals in three depth layers that lean away
 * from the pointer, plus `burst(x, y)` — the spray when something snaps.
 *
 *   ambient  how many crystals drift when nothing is happening (0 = bursts only)
 *   color    crystal colour (any CSS colour)
 */
const SaltCanvas = forwardRef(function SaltCanvas({ ambient = 120, color = '#F2ECE1', className = '' }, ref) {
  const canvasRef = useRef(null);
  const api = useRef({ burst: () => {} });

  useImperativeHandle(ref, () => ({ burst: (x, y, n) => api.current.burst(x, y, n) }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const still = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    const pointer = { x: -9999, y: -9999 };
    const flakes = [];
    const sparks = [];

    const make = (anywhere) => {
      const z = Math.random(); // 0 far … 1 near
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -10,
        z,
        s: 0.7 + z * z * 3.4,
        vy: 9 + z * 38,
        vx: (Math.random() - 0.5) * 8,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 1.6,
        a: 0.16 + z * 0.62,
        px: 0,
        py: 0,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(ambient * Math.min(1, (w * h) / (1440 * 800)) ** 0.6);
      while (flakes.length < target) flakes.push(make(true));
      flakes.length = target;
      if (still) draw(0);
    };

    const crystal = (x, y, s, r, a) => {
      ctx.globalAlpha = a;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(r);
      ctx.fillRect(-s / 2, -s / 2, s, s * 0.82);
      ctx.restore();
    };

    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (const f of flakes) {
        if (dt) {
          const dx = f.x - pointer.x;
          const dy = f.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const reach = 150 + f.z * 90;
          if (d2 < reach * reach) {
            const d = Math.sqrt(d2) || 1;
            const push = (1 - d / reach) * 260 * (0.3 + f.z);
            f.px += (dx / d) * push * dt;
            f.py += (dy / d) * push * dt;
          }
          f.px *= 0.93;
          f.py *= 0.93;
          f.x += (f.vx + f.px) * dt;
          f.y += (f.vy + f.py) * dt;
          f.r += f.vr * dt;
          if (f.y > h + 12 || f.x < -20 || f.x > w + 20) Object.assign(f, make(false), { x: Math.random() * w });
        }
        crystal(f.x, f.y, f.s, f.r, f.a);
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.life -= dt;
        if (p.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        p.vy += 520 * dt;
        p.vx *= 0.985;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.r += p.vr * dt;
        crystal(p.x, p.y, p.s, p.r, Math.min(1, p.life / 0.5) * p.a);
      }
      ctx.globalAlpha = 1;
    }

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) draw(dt);
      raf = requestAnimationFrame(loop);
    };

    api.current.burst = (x, y, n = 70) => {
      if (still) return;
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = 90 + Math.random() * 520;
        sparks.push({
          x,
          y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - 160,
          s: 1 + Math.random() * 4.2,
          r: Math.random() * 3,
          vr: (Math.random() - 0.5) * 14,
          a: 0.5 + Math.random() * 0.5,
          life: 0.5 + Math.random() * 0.9,
        });
      }
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    if (!still) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [ambient, color]);

  return <canvas ref={canvasRef} className={`salt ${className}`} aria-hidden="true" />;
});

export default SaltCanvas;
