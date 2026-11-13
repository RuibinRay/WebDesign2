import { useEffect, useRef, useState } from 'react';
import Media from './Media.jsx';
import { film, shots } from '../../production/film.mjs';
import { getMedia, videoSlots, videoUrl } from '../data/media.js';
import { useGsap, useReveal } from '../hooks/useScroll.js';
import '../styles/sections/film.css';

/** One frame per shot, cut from the finished film by production/scripts/edit-film.mjs. */
const frames = import.meta.glob('../assets/film/*.webp', { eager: true, query: '?url', import: 'default' });
const frameOf = (id) => frames[`../assets/film/${id}.webp`] || null;

const tc = (s) => {
  const whole = Math.floor(s);
  const fr = Math.round((s - whole) * film.fps);
  return `00:${String(whole).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
};

/**
 * 05 — CAMPAIGN EXPERIENCE. The film "OTO" and its storyboard.
 *
 * The storyboard is also the film's scrubber: pick a frame and the film jumps there;
 * play the film and the storyboard follows it. The player grows to full size as it
 * scrolls into view. Until public/videos/rica-oto-film.mp4 exists, a production slate
 * stands in for the player.
 */
export default function Film() {
  const reveal = useReveal();
  const video = useRef(null);
  const strip = useRef(null);
  const cards = useRef([]);
  const following = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState(0);

  const file = videoSlots.film ? 'rica-oto-film.mp4' : videoSlots.teaser ? 'rica-oto-teaser.mp4' : null;
  const still = getMedia('campaign-key').ready ? getMedia('campaign-key') : getMedia('hero');
  const poster = videoSlots.filmPoster ? videoUrl('rica-oto-film-poster.jpg') : still.largest || undefined;

  // the player opens up like a cinema screen as it arrives
  const fx = useGsap((el, gsap) => {
    const player = el.querySelector('.player');
    if (!player) return;
    gsap.fromTo(
      player,
      { scale: 0.84, borderRadius: 28, opacity: 0.5 },
      { scale: 1, borderRadius: 4, opacity: 1, ease: 'none', scrollTrigger: { trigger: player, start: 'top 96%', end: 'top 28%', scrub: true } },
    );
  }, []);

  const scrollStripTo = (i, smooth = true) => {
    const el = strip.current;
    const c = cards.current[i];
    if (!el || !c) return;
    el.scrollTo({ left: c.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft || 0), behavior: smooth ? 'smooth' : 'auto' });
  };

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
      // keep the class for a tick so the click that ends a drag does not also jump the film
      setTimeout(() => el.classList.remove('is-dragging'), 0);
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

  // when the film is not driving it, the timeline follows whichever card is at the left of the strip
  useEffect(() => {
    const el = strip.current;
    if (!el) return undefined;
    let raf = 0;
    const read = () => {
      raf = 0;
      if (following.current) return;
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

  // while the film plays, the storyboard follows it
  const onTime = () => {
    const v = video.current;
    if (!v || v.paused) return;
    const i = Math.max(0, shots.findIndex((s) => v.currentTime >= s.t[0] && v.currentTime < s.t[1]));
    setActive((prev) => {
      if (prev !== i) scrollStripTo(i);
      return i;
    });
  };

  /** Pick a frame: the strip moves there and, if there is a film, so does the film. */
  const jump = (i) => {
    if (strip.current?.classList.contains('is-dragging')) return;
    setActive(i);
    scrollStripTo(i);
    const v = video.current;
    if (v && file) {
      setStarted(true);
      v.currentTime = Math.min(shots[i].t[0] + 0.02, (v.duration || film.duration) - 0.1);
      v.play().catch(() => {});
    }
  };

  const play = () => {
    setStarted(true);
    video.current?.play().catch(() => {});
  };

  return (
    <section
      id="film"
      ref={(el) => {
        reveal.current = el;
        fx.current = el;
      }}
      className="film"
      data-nav="light"
      aria-labelledby="film-title"
    >
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
        <div className={`player ${playing ? 'is-playing' : ''} ${started ? 'is-started' : ''}`}>
          {file ? (
            <>
              <video
                ref={video}
                className="player__video"
                src={videoUrl(file)}
                poster={poster}
                preload="metadata"
                playsInline
                controls={started}
                onPlay={() => {
                  setPlaying(true);
                  following.current = true;
                }}
                onPause={() => {
                  setPlaying(false);
                  following.current = false;
                }}
                onEnded={() => {
                  setPlaying(false);
                  following.current = false;
                }}
                onTimeUpdate={onTime}
              />
              {!started && (
                <button type="button" className="player__play" onClick={play} aria-label={`Play the film ${film.title}, ${film.duration} seconds, with sound`}>
                  <span className="player__disc">
                    <svg viewBox="0 0 12 14" aria-hidden="true">
                      <path d="M0 0v14l12-7z" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="label">
                    {videoSlots.film ? 'Play the film' : 'Play teaser'} — 00:{String(film.duration).padStart(2, '0')} — sound on
                  </span>
                </button>
              )}
            </>
          ) : (
            <div className="slate">
              <Media id={still.id} fill sizes="100vw" focus="70% 60%" quiet />
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
          <p className="label">{file ? 'Frame by frame — pick one to jump there' : 'Frame by frame — drag to scrub'}</p>
          <div className="timeline" role="group" aria-label="Film timeline">
            {shots.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-current={i === active ? 'true' : undefined}
                aria-label={`Frame ${s.frame}: ${s.name}, ${s.t[0]} to ${s.t[1]} seconds`}
                className={`timeline__seg ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}
                style={{ flexGrow: s.t[1] - s.t[0] }}
                onClick={() => jump(i)}
              >
                <span className="label">{String(s.frame).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
          <p className="label board__clock">
            {tc(shots[active].t[0])} <span>/ {tc(film.duration)}</span>
          </p>
        </div>

        <ol className="board__strip" ref={strip} tabIndex={0} aria-label="Storyboard">
          {shots.map((s, i) => (
            <li key={s.id} ref={(el) => (cards.current[i] = el)} className={`shot ${i === active ? 'is-active' : ''}`}>
              <button type="button" className="shot__frame" onClick={() => jump(i)} aria-label={`Frame ${s.frame}, ${s.name}${file ? ': play from here' : ''}`}>
                {frameOf(s.id) ? (
                  <img src={frameOf(s.id)} alt="" loading="lazy" decoding="async" draggable="false" />
                ) : (
                  <span className="shot__blank loud" aria-hidden="true">
                    {String(s.frame).padStart(2, '0')}
                  </span>
                )}
                <span className="shot__tc label">
                  {tc(s.t[0])} → {tc(s.t[1])}
                </span>
                {file && (
                  <span className="shot__go" aria-hidden="true">
                    <svg viewBox="0 0 12 14">
                      <path d="M0 0v14l12-7z" fill="currentColor" />
                    </svg>
                  </span>
                )}
              </button>
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
