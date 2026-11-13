import { useCallback, useEffect, useRef, useState } from 'react';
import Pack3D from './Pack3D.jsx';
import Media from './Media.jsx';
import SaltCanvas from './SaltCanvas.jsx';
import Waveform from './Waveform.jsx';
import Title from './Title.jsx';
import { products } from '../data/products.js';
import { useCrunch } from '../hooks/useCrunch.jsx';
import { useReveal, prefersReducedMotion } from '../hooks/useScroll.js';
import '../styles/sections/collection.css';

const METERS = [
  ['loud', 'Loud'],
  ['rich', 'Rich'],
  ['light', 'Light'],
];

/**
 * 03 — PRODUCT COLLECTION. One stage, five cuts. Choosing a cut repaints the
 * whole section in its colour, turns the pack round to the new artwork and
 * slams its sound word across the stage. "Hear it" plays that cut's crunch.
 */
export default function Collection() {
  const [index, setIndex] = useState(0);
  const [hit, setHit] = useState(0);
  // `base` is the colour the panel has settled on; a change of cut opens a crack of the new colour over it
  const [base, setBase] = useState(products[0].bg);
  const [wipe, setWipe] = useState(0);
  const firstPaint = useRef(true);
  const stage = useRef(null);
  const salt = useRef(null);
  const tabs = useRef([]);
  const reveal = useReveal();
  const { play, cue } = useCrunch();
  const p = products[index];

  const select = useCallback(
    (i, focus = false) => {
      const n = (i + products.length) % products.length;
      setIndex(n);
      cue(products[n].synth);
      if (focus) tabs.current[n]?.focus();
    },
    [cue],
  );

  // other sections can ask for a cut (hero chip, sound-check table)
  useEffect(() => {
    const on = (e) => {
      const i = products.findIndex((x) => x.id === e.detail);
      if (i > -1) setIndex(i);
    };
    window.addEventListener('rica:select', on);
    return () => window.removeEventListener('rica:select', on);
  }, []);

  // the header re-reads its colour when the panel repaints
  useEffect(() => {
    window.dispatchEvent(new Event('rica:navtheme'));
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    if (prefersReducedMotion()) setBase(products[index].bg);
    else setWipe((w) => w + 1);
  }, [index]);

  const snap = () => {
    play(p.synth);
    setHit((h) => h + 1);
    const r = stage.current?.getBoundingClientRect();
    if (r) salt.current?.burst(r.width / 2, r.height * 0.42, 110);
  };

  const onKey = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      select(index + 1, true);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      select(index - 1, true);
    } else if (e.key === 'Home') {
      e.preventDefault();
      select(0, true);
    } else if (e.key === 'End') {
      e.preventDefault();
      select(products.length - 1, true);
    }
  };

  const light = p.text === '#F2ECE1';

  return (
    <section
      id="cuts"
      ref={reveal}
      className="cuts"
      data-nav={light ? 'light' : 'dark'}
      style={{ '--c-base': base, '--c-bg': p.bg, '--c-ink': p.ink, '--c-text': p.text }}
      aria-labelledby="cuts-title"
    >
      {wipe > 0 && <div className="cuts__wipe" key={wipe} aria-hidden="true" onAnimationEnd={() => setBase(p.bg)} />}
      <div className="wrap">
        <header className="cuts__head">
          <p className="label" data-reveal>
            <span className="cuts__no">03</span> The cuts
          </p>
          <Title id="cuts-title" className="cuts__title quiet" lines={['Five cuts.', 'Five sounds.']} />
          <p className="cuts__intro" data-reveal style={{ '--d': '0.2s' }}>
            We do not blend. Each pack holds one cut, named for the noise it makes when it breaks.
          </p>
        </header>

        <div className="cuts__tabs" role="tablist" aria-label="Choose a cut" onKeyDown={onKey} data-reveal>
          {products.map((x, i) => (
            <button
              key={x.id}
              ref={(el) => (tabs.current[i] = el)}
              type="button"
              role="tab"
              id={`tab-${x.id}`}
              aria-selected={i === index}
              aria-controls="cut-panel"
              tabIndex={i === index ? 0 : -1}
              className={`cuts__tab ${i === index ? 'is-active' : ''}`}
              onClick={() => select(i)}
            >
              <span className="label">{x.no}</span>
              <span className="cuts__tab-name">{x.cut}</span>
              <span className="cuts__tab-kana loud" lang="ja" aria-hidden="true">
                {x.kana}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div id="cut-panel" role="tabpanel" aria-labelledby={`tab-${p.id}`} tabIndex={-1}>
        <div className="cuts__stage" ref={stage}>
          <p className={`cuts__kana loud ${hit ? 'is-hit' : ''}`} lang="ja" aria-hidden="true" key={`${p.id}-${hit}`}>
            {[...p.kana].map((c, i) => (
              <span key={i} style={{ '--i': i }}>
                {c}
              </span>
            ))}
          </p>
          <SaltCanvas ref={salt} ambient={0} color={p.ink} className="cuts__salt" />
          <div className="cuts__pack" data-reveal>
            <Pack3D product={p} hit={hit} stageRef={stage} />
          </div>
          <div className="cuts__stage-meta wrap">
            <p className="label">
              Cut {p.no} — {p.cut} — <span lang="ja">{p.cutJa}</span>
            </p>
            <p className="label cuts__drag" aria-hidden="true">
              Drag the pack to turn it
            </p>
          </div>
          <div className="cuts__arrows wrap">
            <button type="button" className="cuts__arrow" onClick={() => select(index - 1)} aria-label="Previous cut">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button type="button" className="cuts__arrow" onClick={() => select(index + 1)} aria-label="Next cut">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 4 8 8-8 8" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>

        <div className="wrap">
          <div className="cuts__detail" key={p.id}>
            <div className="cuts__copy">
              <p className="label cuts__sound">
                {p.sound} — {p.soundLine}
              </p>
              <h3 className="cuts__name">
                <span className="loud">{p.cut}</span>
                <span className="quiet">{p.soundLine.toLowerCase()}.</span>
              </h3>
              <p className="cuts__blurb">{p.blurb}</p>
              <ul className="cuts__notes" aria-label="Tasting notes">
                {p.notes.map((n) => (
                  <li key={n} className="label">
                    {n}
                  </li>
                ))}
              </ul>
            </div>

            <div className="cuts__spec">
              <dl className="cuts__meters">
                {METERS.map(([k, label]) => (
                  <div key={k} className="cuts__meter">
                    <dt className="label">{label}</dt>
                    <dd aria-label={`${p.meters[k]} out of 5`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <i key={n} className={n <= p.meters[k] ? 'is-on' : ''} style={{ '--i': n }} />
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="cuts__listen">
                <Waveform values={p.wave} hit={hit} label={`${p.cut}: ${p.soundLine.toLowerCase()} waveform`} />
                <button type="button" className="btn cuts__hear" onClick={snap}>
                  <svg viewBox="0 0 12 14" aria-hidden="true">
                    <path d="M0 0v14l12-7z" fill="currentColor" />
                  </svg>
                  Hear the {p.id === 'jerky' ? 'chew' : 'snap'}
                </button>
              </div>

              <dl className="cuts__facts">
                <div>
                  <dt className="label">Pairs with</dt>
                  <dd>{p.pair}</dd>
                </div>
                <div>
                  <dt className="label">Net</dt>
                  <dd>{p.weight}</dd>
                </div>
              </dl>
            </div>

            <figure className="cuts__photo">
              <Media id={`cut-${p.id}`} sizes="(min-width: 1000px) 24vw, 70vw" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
