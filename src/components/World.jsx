import Media from './Media.jsx';
import { world } from '../data/site.js';
import { scrollToId, useGsap, useMediaQuery, useReveal } from '../hooks/useScroll.js';
import '../styles/sections/world.css';

/**
 * 04 — THE LIFESTYLE. "A loud snack for quiet places."
 * On desktop the section pins and the pictures travel sideways like a strip
 * of film; on touch screens it is a native swipe gallery.
 */
export default function World() {
  const desktop = useMediaQuery('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
  const reveal = useReveal();

  const fx = useGsap(
    (el, gsap) => {
      if (!desktop) return;
      const pin = el.querySelector('.world__pin');
      const track = el.querySelector('.world__track');
      const bar = el.querySelector('.world__progress i');
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            bar.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
    },
    [desktop],
  );

  return (
    <section
      id="world"
      className={`world ${desktop ? 'world--pinned' : 'world--swipe'}`}
      data-nav="light"
      ref={(el) => {
        reveal.current = el;
        fx.current = el;
      }}
      aria-labelledby="world-title"
    >
      <div className="wrap world__intro">
        <p className="label" data-reveal>
          <span className="world__no">04</span>
          {world.eyebrow}
        </p>
        <h2 id="world-title" className="world__title quiet" data-rise>
          {world.title.map((line, i) => (
            <span className="rise" key={line} style={{ '--d': `${i * 0.1}s` }}>
              <span>{line}</span>
            </span>
          ))}
        </h2>
        <p className="world__lede" data-reveal style={{ '--d': '0.2s' }}>
          {world.body}
        </p>
      </div>

      <div className="world__pin">
        <div className="world__view" tabIndex={desktop ? -1 : 0} role="group" aria-label="Scenes from the world of Rica">
          <ol className="world__track">
            {world.places.map((pl, i) => (
              <li className={`place place--${pl.shape}`} key={pl.media}>
                <figure>
                  <div className="place__frame">
                    <Media id={pl.media} fill sizes={pl.shape === 'wide' ? '(min-width: 901px) 110vh, 88vw' : '(min-width: 901px) 56vh, 70vw'} />
                  </div>
                  <figcaption>
                    <p className="label place__meta">
                      <span>0{i + 1}</span>
                      <span>{pl.place}</span>
                      <span>{pl.time}</span>
                    </p>
                    <p className="place__line quiet">{pl.line}</p>
                  </figcaption>
                </figure>
              </li>
            ))}
            <li className="place place--end">
              <p className="quiet">
                Wherever it is quiet,
                <br />
                bring the noise.
              </p>
              <a
                className="btn btn--shu"
                href="#cuts"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToId('cuts');
                }}
              >
                Choose your cut
              </a>
            </li>
          </ol>
        </div>
        <div className="world__progress wrap" aria-hidden="true">
          <span className="label">Listening bar</span>
          <span className="world__progress-line">
            <i />
          </span>
          <span className="label">Last train</span>
        </div>
      </div>
    </section>
  );
}
