import { useEffect, useRef, useState } from 'react';
import Media from './Media.jsx';
import SaltCanvas from './SaltCanvas.jsx';
import Waveform from './Waveform.jsx';
import { products } from '../data/products.js';
import { site } from '../data/site.js';
import { getMedia, videoSlots, videoUrl } from '../data/media.js';
import { useCrunch } from '../hooks/useCrunch.jsx';
import { scrollToId, useGsap, useMediaQuery, prefersReducedMotion } from '../hooks/useScroll.js';
import '../styles/sections/hero.css';

/**
 * 01 — HERO. Full-screen, dark, the product in mid-snap.
 * The frame is alive: salt drifts and leans away from the pointer, and a click
 * anywhere on the picture snaps — a burst of salt, the sound word, and (if
 * sound is on) the crunch itself.
 */
export default function Hero({ ready }) {
  const salt = useRef(null);
  const { cue } = useCrunch();
  const [now, setNow] = useState(0); // which cut the "now snapping" chip shows
  const [hits, setHits] = useState([]);
  const hitId = useRef(0);
  const poster = getMedia('hero');
  const portrait = getMedia('hero-mobile');
  // The moving background is for larger screens with motion allowed; phones get the portrait still.
  const film = useMediaQuery('(min-width: 721px) and (prefers-reduced-motion: no-preference)') && videoSlots.heroLoop;

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const t = setInterval(() => setNow((n) => (n + 1) % products.length), 2600);
    return () => clearInterval(t);
  }, []);

  const root = useGsap((el, gsap) => {
    gsap.to(el.querySelector('.hero__media'), {
      yPercent: 14,
      scale: 1.08,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to(el.querySelector('.hero__content'), {
      yPercent: -12,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: el, start: '35% top', end: 'bottom top', scrub: true },
    });
    gsap.to(el.querySelector('.hero__kana'), {
      yPercent: -22,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
    });
  }, []);

  const snap = (e) => {
    if (e.target.closest('a, button')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const p = products[hitId.current % products.length];
    const id = ++hitId.current;
    salt.current?.burst(x, y, 90);
    cue(p.synth);
    setHits((h) => [...h.slice(-4), { id, x, y, kana: p.kana, rot: -14 + Math.random() * 28 }]);
    setTimeout(() => setHits((h) => h.filter((k) => k.id !== id)), 900);
  };

  const p = products[now];

  return (
    <section id="top" ref={root} className={`hero ${ready ? 'is-ready' : ''}`} data-nav="light" onPointerDown={snap}>
      <div className="hero__media">
        {film ? (
          <video className="hero__video" src={videoUrl('hero-loop.mp4')} poster={poster.largest || undefined} autoPlay muted loop playsInline aria-hidden="true" />
        ) : (
          poster.ready ? (
            <picture>
              {portrait.ready && <source media="(max-width: 720px)" srcSet={portrait.srcSet} sizes="100vw" />}
              <img className="media media--fill" src={poster.src} srcSet={poster.srcSet} sizes="100vw" alt={poster.alt} fetchPriority="high" decoding="sync" draggable="false" />
            </picture>
          ) : (
            <Media id="hero" fill priority sizes="100vw" quiet />
          )
        )}
      </div>
      <div className="hero__scrim" aria-hidden="true" />
      <SaltCanvas ref={salt} ambient={130} className="hero__salt" />

      <p className="hero__kana loud" lang="ja" aria-hidden="true">
        {[...'パリッ'].map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </p>

      {hits.map((h) => (
        <span key={h.id} className="hero__hit loud" lang="ja" aria-hidden="true" style={{ left: h.x, top: h.y, '--rot': `${h.rot}deg` }}>
          {h.kana}
        </span>
      ))}

      <div className="hero__content wrap">
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
            Beef, sliced paper-thin, seasoned with our house salt and dried until it snaps. One cut per pack. Five different sounds.
          </p>
          <div className="hero__cta" data-hero style={{ '--d': '0.52s' }}>
            <a
              className="btn btn--shu"
              href="#cuts"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('cuts');
              }}
            >
              <span className="btn__dot" aria-hidden="true" />
              Hear the cuts
            </a>
            <a
              className="btn btn--ghost"
              href="#film"
              onClick={(e) => {
                e.preventDefault();
                scrollToId('film');
              }}
            >
              Watch the film
            </a>
          </div>
        </div>
      </div>

      <a
        className="hero__now"
        href="#cuts"
        data-hero
        style={{ '--d': '0.7s' }}
        onClick={(e) => {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('rica:select', { detail: p.id }));
          scrollToId('cuts');
        }}
      >
        <span className="label">Now snapping</span>
        <span className="hero__now-row" key={p.id}>
          <Waveform values={p.wave} hit={now + 1} label={`${p.cut} waveform`} />
          <span className="hero__now-kana loud" lang="ja">
            {p.kana}
          </span>
          <span className="label">
            {p.no} {p.cut}
          </span>
        </span>
      </a>

      <p className="hero__ja ja vertical" lang="ja" data-hero style={{ '--d': '0.8s' }}>
        {site.lineJa}
      </p>

      <p className="hero__hint label" aria-hidden="true" data-hero style={{ '--d': '1s' }}>
        <span className="hero__hint-line" />
        Click the dark. Go on.
      </p>
    </section>
  );
}
