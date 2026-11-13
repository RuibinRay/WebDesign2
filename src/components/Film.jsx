import { useEffect, useRef, useState } from 'react';
import Media from './Media.jsx';
import Wordmark from './Wordmark.jsx';
import { film, shots } from '../../production/film.mjs';
import { products } from '../data/products.js';
import { getMedia, videoSlots, videoUrl } from '../data/media.js';
import { useReveal } from '../hooks/useScroll.js';
import '../styles/sections/film.css';

/** What each storyboard frame shows on the site (the film's real start frames live in production/). */
const FRAME = {
  S01: { type: 'salt' },
  S02: { type: 'media', id: 'story-slice', focus: '50% 64%' },
  S03: { type: 'media', id: 'story-dry' },
  S04: { type: 'media', id: 'story-salt' },
  S05: { type: 'media', id: 'life-highball' },
  S06: { type: 'media', id: 'life-bite', focus: '50% 40%' },
  S07: { type: 'four' },
  S08: { type: 'media', id: 'pack-lineup' },
  S09: { type: 'name' },
};

const tc = (s) => {
  const whole = Math.floor(s);
  const frames = Math.round((s - whole) * film.fps);
  return `00:${String(whole).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
};

function Frame({ shot }) {
  const f = FRAME[shot.id];
  if (f.type === 'media') return <Media id={f.id} fill focus={f.focus} sizes="360px" quiet />;
  if (f.type === 'salt')
    return (
      <div className="frame-salt" aria-label="A single flake of salt falling through a shaft of light" role="img">
        <i />
      </div>
    );
  if (f.type === 'four')
    return (
      <div className="frame-four" role="img" aria-label="Four colour fields, one per cut, each with its sound word">
        {products.slice(0, 4).map((p) => (
          <span key={p.id} style={{ background: p.bg, color: p.ink }} lang="ja">
            {p.kana}
          </span>
        ))}
      </div>
    );
  return (
    <div className="frame-name" role="img" aria-label="The Rica wordmark on black">
      <Wordmark />
    </div>
  );
}

/**
 * 05 — CAMPAIGN EXPERIENCE. The film "OTO", plus its storyboard as a strip
 * you can drag through. The player uses public/videos/rica-oto-film.mp4 when
 * it exists (or the teaser); until then it shows a production slate.
 */
export default function Film() {
  const reveal = useReveal();
  const video = useRef(null);
  const strip = useRef(null);
  const cards = useRef([]);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(0);

  const file = videoSlots.film ? 'rica-oto-film.mp4' : videoSlots.teaser ? 'rica-oto-teaser.mp4' : null;
  const poster = getMedia('campaign-key').ready ? getMedia('campaign-key') : getMedia('hero');

  // drag to scroll the strip with a mouse
  useEffect(() => {
    const el = strip.current;
    if (!el) return undefined;
    let down = false;
    let moved = 0;
    let lastX = 0;
    const onDown = (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true;
      moved = 0;
      lastX = e.clientX;
    };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      el.scrollLeft -= dx;
      if (moved > 4) el.classList.add('is-dragging');
    };
    const onUp = () => {
      down = false;
      el.classList.remove('is-dragging');
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // keep the timeline in step with the card nearest the strip's left edge
  useEffect(() => {
    const el = strip.current;
    if (!el) return undefined;
    let raf = 0;
    const read = () => {
      raf = 0;
      const x = el.scrollLeft + el.clientWidth * 0.3;
      let best = 0;
      cards.current.forEach((c, i) => {
        if (c && c.offsetLeft <= x) best = i;
      });
      setActive(best);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    el.addEventListener('scroll', on, { passive: true });
    return () => {
      el.removeEventListener('scroll', on);
      cancelAnimationFrame(raf);
    };
  }, []);

  const jump = (i) => {
    const el = strip.current;
    const c = cards.current[i];
    if (!el || !c) return;
    setActive(i);
    el.scrollTo({ left: c.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft || 0), behavior: 'smooth' });
  };

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  return (
    <section id="film" ref={reveal} className="film" data-nav="light" aria-labelledby="film-title">
      <div className="wrap film__head">
        <p className="label" data-reveal>
          <span className="film__no">05</span>The campaign film
        </p>
        <h2 id="film-title" className="film__title" data-reveal>
          <span className="loud">{film.title}</span>
          <span className="ja" lang="ja" aria-label="oto, meaning sound">
            {film.titleJa}
          </span>
        </h2>
        <div className="film__side">
          <p className="film__line quiet" data-reveal style={{ '--d': '0.1s' }}>
            A film you listen to.
          </p>
          <p className="film__idea" data-reveal style={{ '--d': '0.2s' }}>
            {film.idea.split('. ').slice(1).join('. ')}
          </p>
        </div>
      </div>

      <div className="wrap">
        <div className={`player ${playing ? 'is-playing' : ''}`} data-reveal>
          {file ? (
            <>
              <video
                ref={video}
                className="player__video"
                src={videoUrl(file)}
                poster={poster.largest || undefined}
                preload="metadata"
                playsInline
                controls={playing}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
              {!playing && (
                <button type="button" className="player__play" onClick={toggle} aria-label={`Play the film ${film.title}, ${film.duration} seconds`}>
                  <span className="player__disc">
                    <svg viewBox="0 0 12 14" aria-hidden="true">
                      <path d="M0 0v14l12-7z" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="label">{videoSlots.film ? 'Play film' : 'Play teaser'} — 00:{String(film.duration).padStart(2, '0')}</span>
                </button>
              )}
            </>
          ) : (
            <div className="slate">
              <Media id={poster.id} fill sizes="100vw" focus="70% 60%" quiet />
              <div className="slate__veil" aria-hidden="true" />
              <dl className="slate__grid label">
                <div>
                  <dt>Prod.</dt>
                  <dd>Rica Beef</dd>
                </div>
                <div>
                  <dt>Title</dt>
                  <dd>
                    {film.title} <span lang="ja">{film.titleJa}</span>
                  </dd>
                </div>
                <div>
                  <dt>Length</dt>
                  <dd>00:{film.duration}:00</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>
                    {film.aspect} · {film.fps} fps
                  </dd>
                </div>
                <div>
                  <dt>Frames</dt>
                  <dd>{String(shots.length).padStart(2, '0')}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd className="slate__status">Storyboard locked · in production</dd>
                </div>
              </dl>
              <p className="slate__note quiet">
                The film is being shot.
                <br />
                Until it lands, here it is frame by frame.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="board">
        <div className="wrap board__head">
          <p className="label">Frame by frame — drag to scrub</p>
          <div className="timeline" role="group" aria-label="Film timeline">
            {shots.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-current={i === active ? "true" : undefined}
                aria-label={`Frame ${s.frame}: ${s.name}, ${s.t[0]} to ${s.t[1]} seconds`}
                className={`timeline__seg ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}
                style={{ flexGrow: s.t[1] - s.t[0] }}
                onClick={() => jump(i)}
              >
                <span className="label">{String(s.frame).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
          <p className="label board__clock" aria-live="off">
            {tc(shots[active].t[0])} <span>/ {tc(film.duration)}</span>
          </p>
        </div>

        <ol className="board__strip" ref={strip} tabIndex={0} aria-label="Storyboard">
          {shots.map((s, i) => (
            <li key={s.id} ref={(el) => (cards.current[i] = el)} className={`shot ${i === active ? 'is-active' : ''}`}>
              <div className="shot__frame">
                <Frame shot={s} />
                <span className="shot__tc label">
                  {tc(s.t[0])} → {tc(s.t[1])}
                </span>
              </div>
              <p className="shot__head">
                <span className="label">F{String(s.frame).padStart(2, '0')}</span>
                <span className="shot__name loud">{s.name}</span>
              </p>
              <p className="shot__visual">{s.visual}</p>
              <p className="shot__sound">
                <span className="label">Sound</span>
                {s.sound}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
