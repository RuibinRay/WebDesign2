import { useEffect, useRef, useState } from 'react';
import SaltCanvas from './SaltCanvas.jsx';
import { SoundToggle } from './Nav.jsx';
import { products } from '../data/products.js';
import { site } from '../data/site.js';
import { videoUrl } from '../data/media.js';
import { useCrunch } from '../hooks/useCrunch.jsx';
import { scrollToId } from '../hooks/useScroll.js';
import '../styles/sections/hero.css';
import '../styles/sections/hero-scroll.css';

/**
 * Where things happen along the scroll, as a share of the whole hero (0 → 1).
 * SNAP is the moment the crisp breaks in the film: if the shot is ever re-rendered,
 * find the new moment with `node production/scripts/inspect-takes.mjs scroll-hero`
 * (peak time ÷ duration × FILM_END) and change it here.
 */
const FILM_END = 0.92; // the film finishes here; the last frame holds for the call to action
const SNAP = 0.21; // the crack runs through the crisp 2.3 s into the 10 s shot
const BEAT_2 = 0.12; // the headline has gone
const BEAT_3 = 0.66; // the pack is sharp (7 s into the shot)
// Portrait screens. The pack ends up 53% as wide as the picture is tall, and its foot sits 86% of the
// way down. The picture steps back until the pack is at most 80% of the screen's width (PACK_FIT ×
// width ÷ height) and its foot is clear of the closing line in the bottom third (PACK_ROOM).
const PACK_FIT = 1.5;
const PACK_ROOM = 0.72;
const PORTRAIT_ASPECT = 900 / 1280; // scroll-hero-m.mp4

/** One 4K shot, three encodes. Phones get a portrait crop cut from the middle of the frame. */
function pickSource() {
  if (typeof window === 'undefined') return { file: 'scroll-hero-1080.mp4', poster: 'scroll-hero-poster.webp' };
  const portrait = window.matchMedia('(max-width: 720px), (max-width: 1024px) and (orientation: portrait)').matches;
  if (portrait) return { file: 'scroll-hero-m.mp4', poster: 'scroll-hero-poster-m.webp', portrait: true };
  const saveData = navigator.connection?.saveData;
  const big = window.innerWidth * (window.devicePixelRatio || 1) >= 3000 && !saveData;
  return { file: big ? 'scroll-hero-2160.mp4' : 'scroll-hero-1080.mp4', poster: 'scroll-hero-poster.webp' };
}

/**
 * 01 — HERO, scroll-driven. One continuous 4K shot that the visitor plays by scrolling:
 * a whole crisp → it snaps → the camera pushes through to the pack.
 *
 * How the scrub stays smooth:
 *  - the clip is fetched whole and played from an in-memory blob, so every frame is seekable
 *    on any host;
 *  - scroll position is eased, and a new seek is only issued once the previous one has landed
 *    (a fast flick never queues a backlog of seeks);
 *  - the poster stays up until the first real frame has painted;
 *  - on touch devices the video is primed on the first touch, or iOS will not paint seeked frames.
 */
export default function HeroScroll({ ready }) {
  const root = useRef(null);
  const pin = useRef(null);
  const video = useRef(null);
  const salt = useRef(null);
  const { cue } = useCrunch();
  const cueRef = useRef(cue);
  cueRef.current = cue;
  const [source] = useState(pickSource);
  const [loaded, setLoaded] = useState(0);
  const [painted, setPainted] = useState(false);
  const [hit, setHit] = useState(0);

  useEffect(() => {
    const section = root.current;
    const pinEl = pin.current;
    const v = video.current;
    let alive = true;
    let url = null;
    let dur = 0;
    let target = 0;
    let cur = 0;
    let lastSeek = -1;
    let snapped = false;
    let raf = 0;

    (async () => {
      try {
        const res = await fetch(videoUrl(source.file));
        if (!res.ok || !res.body) throw new Error('no film');
        const total = Number(res.headers.get('content-length')) || 0;
        const reader = res.body.getReader();
        const chunks = [];
        let got = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          got += value.length;
          if (alive && total) setLoaded(Math.min(0.99, got / total));
        }
        if (!alive) return;
        url = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
        v.src = url;
        v.load();
        setLoaded(1);
      } catch {
        if (alive) setLoaded(-1); // the poster simply stays
      }
    })();

    const onMeta = () => {
      dur = v.duration || 0;
    };
    const onPaint = () => setPainted(true);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('seeked', onPaint, { once: true });

    // how far the picture steps back when the pack arrives (portrait only; see hero-scroll.css)
    const fit = () => {
      const w = pinEl.clientWidth;
      const h = Math.max(1, pinEl.clientHeight);
      const pictureH = Math.max(h, w / PORTRAIT_ASPECT); // the picture always covers the screen
      const s = Math.min(1, (PACK_FIT * w) / h, (PACK_ROOM * h) / pictureH);
      pinEl.style.setProperty('--end-scale', s.toFixed(3));
    };
    fit();
    window.addEventListener('resize', fit);

    const prime = () => {
      v.play()
        .then(() => v.pause())
        .catch(() => {});
    };
    window.addEventListener('touchstart', prime, { passive: true, once: true });

    const tick = () => {
      // Where the section sits is read straight from the layout every frame. It costs almost
      // nothing and does not depend on scroll events arriving in any particular order.
      const box = section.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      target = travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 0;
      cur += (target - cur) * 0.16;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      pinEl.style.setProperty('--p', cur.toFixed(4));
      const beat = cur < BEAT_2 ? '1' : cur < BEAT_3 ? '2' : '3';
      if (pinEl.dataset.beat !== beat) pinEl.dataset.beat = beat;

      if (dur && !v.seeking) {
        const t = Math.max(0, Math.min(dur - 0.04, (cur / FILM_END) * dur));
        if (Math.abs(t - lastSeek) > 1 / 48) {
          v.currentTime = t;
          lastSeek = t;
        }
      }

      // the snap: once on the way down, re-armed when the visitor scrolls back above it
      if (!snapped && cur >= SNAP && target >= SNAP) {
        snapped = true;
        setHit((n) => n + 1);
        const r = pinEl.getBoundingClientRect();
        salt.current?.burst(r.width / 2, r.height / 2, 130);
        cueRef.current(products[0].synth);
      } else if (snapped && cur < SNAP - 0.07) {
        snapped = false;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      v.removeEventListener('loadedmetadata', onMeta);
      window.removeEventListener('touchstart', prime);
      window.removeEventListener('resize', fit);
      if (url) URL.revokeObjectURL(url);
    };
  }, [source]);

  const go = (id) => (e) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <section id="top" ref={root} className={`hero hero--scroll ${source.portrait ? 'hero--portrait' : ''} ${ready ? 'is-ready' : ''}`} data-nav="light">
      <div className="hero__pin" ref={pin} data-beat="1">
        <div className="hero__film">
          <video ref={video} className="hero__scrub" muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
          <img
            className={`hero__poster ${painted ? 'is-hidden' : ''}`}
            src={videoUrl(source.poster)}
            alt="A single paper-thin beef crisp hanging in warm light, about to snap."
            fetchPriority="high"
            decoding="sync"
            draggable="false"
          />
        </div>
        <div className="hero__scrim" aria-hidden="true" />
        <SaltCanvas ref={salt} ambient={60} className="hero__salt" />

        <p className={`hero__snapword loud ${hit ? 'is-hit' : ''}`} key={hit} lang="ja" aria-hidden="true">
          {[...products[0].kana].map((c, i) => (
            <span key={i} style={{ '--i': i }}>
              {c}
            </span>
          ))}
        </p>

        <div className="hero__content wrap hero__beat hero__beat--1">
          <p className="hero__eyebrow label" data-hero>
            <span>Beef crisps from Japan</span>
            <span className="ja" lang="ja">
              日本製
            </span>
          </p>
          <h1 className="hero__title quiet">
            <span className="rise" style={{ '--d': '0.05s' }}>
              <span>Every cut</span>
            </span>
            <span className="rise" style={{ '--d': '0.16s' }}>
              <span>
                has a <em>sound</em>
                <i className="hero__dot">.</i>
              </span>
            </span>
          </h1>
          <div className="hero__foot">
            <p className="hero__lede" data-hero style={{ '--d': '0.42s' }}>
              Beef, sliced paper-thin, seasoned with our house salt and dried until it snaps. Scroll, and hear what we mean.
            </p>
            <div className="hero__cta" data-hero style={{ '--d': '0.52s' }}>
              <a className="btn btn--shu" href="#cuts" onClick={go('cuts')}>
                <span className="btn__dot" aria-hidden="true" />
                Hear the cuts
              </a>
              <a className="btn btn--ghost" href="#film" onClick={go('film')}>
                Watch the film
              </a>
            </div>
          </div>
        </div>

        <div className="hero__beat hero__beat--3 wrap" aria-hidden={false}>
          <p className="label hero__payoff-meta">
            <span>Cut 01</span>
            <span>Ribeye</span>
            <span lang="ja">{products[0].cutJa}</span>
            <span>{products[0].sound} — {products[0].soundLine}</span>
          </p>
          <p className="hero__payoff quiet">
            One cut per pack.
            <br />
            Five different sounds.
          </p>
          <div className="hero__cta">
            <a className="btn btn--shu" href="#cuts" onClick={go('cuts')}>
              <span className="btn__dot" aria-hidden="true" />
              Hear all five
            </a>
            <a className="btn btn--ghost" href="#story" onClick={go('story')}>
              How it is made
            </a>
          </div>
        </div>

        <div className="hero__rail" aria-hidden="true">
          <span className="label">Whole</span>
          <span className="hero__rail-line">
            <i />
          </span>
          <span className="label">Snap</span>
          <span className="hero__rail-line hero__rail-line--2">
            <i />
          </span>
          <span className="label">Pack</span>
        </div>

        <div className="hero__under">
          <p className="hero__hint label" aria-hidden="true">
            <span className="hero__hint-line" />
            Scroll to snap it
          </p>
          <SoundToggle className="hero__soundtoggle" />
          {loaded >= 0 && loaded < 1 && (
            <p className="hero__loading label" role="status">
              Loading the shot {Math.round(loaded * 100)}%
            </p>
          )}
        </div>

        <p className="hero__ja ja vertical" lang="ja" data-hero style={{ '--d': '0.8s' }}>
          {site.lineJa}
        </p>
      </div>
    </section>
  );
}
