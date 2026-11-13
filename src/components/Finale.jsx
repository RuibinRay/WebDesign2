import { useState } from 'react';
import Media from './Media.jsx';
import Title from './Title.jsx';
import Wordmark, { Seal } from './Wordmark.jsx';
import { finale, site } from '../data/site.js';
import { getMedia } from '../data/media.js';
import { scrollToId, useGsap, useReveal } from '../hooks/useScroll.js';
import '../styles/sections/finale.css';

/**
 * 07 — FINAL BRAND MOMENT. Everything goes vermilion. The last picture is an
 * empty dish; the last word is ごちそうさま. Then the name, as big as the screen.
 */
export default function Finale() {
  const reveal = useReveal();
  const [whole, setWhole] = useState(false);
  const closing = getMedia('closing-gone');

  const fx = useGsap((el, gsap) => {
    const finaleEl = el.querySelector('.finale');
    // the last line slides in from the left as the red arrives, and the dish settles into place
    gsap.fromTo(
      el.querySelector('.finale__title'),
      { xPercent: -7 },
      { xPercent: 0, ease: 'none', scrollTrigger: { trigger: finaleEl, start: 'top bottom', end: 'top 12%', scrub: true } },
    );
    const dish = el.querySelector('.finale__photo .media') || el.querySelector('.finale__dish i');
    if (dish && dish.classList.contains('media'))
      gsap.fromTo(dish, { yPercent: 9, rotate: -7, scale: 1.08 }, { yPercent: 0, rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: finaleEl, start: 'top bottom', end: 'top top', scrub: true } });
    gsap.fromTo(
      el.querySelector('.footer__mark'),
      { yPercent: 28 },
      { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el.querySelector('.footer'), start: 'top bottom', end: 'bottom bottom', scrub: true } },
    );
  }, []);

  const go = (id) => (e) => {
    e.preventDefault();
    scrollToId(id);
  };
  const shopIsAnchor = site.shopUrl.startsWith('#');

  return (
    <div
      ref={(el) => {
        reveal.current = el;
        fx.current = el;
      }}
    >
      <section id="finale" className={`finale ${closing.ready ? 'has-photo' : ''}`} data-nav="dark" aria-labelledby="finale-title">
        {closing.ready && (
          <div className="finale__photo">
            <Media id="closing-gone" fill sizes="(min-width: 901px) 90vw, 160vw" focus="50% 50%" />
          </div>
        )}
        {!closing.ready && (
          <div className="finale__dish" role="img" aria-label="An empty dish. Only crumbs and salt are left.">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        )}

        <div className="wrap finale__inner">
          <p className="finale__ja" data-reveal>
            <span className="ja" lang="ja">
              {finale.ja}
            </span>
            <span className="label">{finale.jaNote}</span>
          </p>

          <Title id="finale-title" className="finale__title quiet" lines={finale.title} step={0.09} />

          <div className="finale__foot">
            <p className="finale__body" data-reveal style={{ '--d': '0.2s' }}>
              {finale.body}
            </p>
            <div className="finale__cta" data-reveal style={{ '--d': '0.3s' }}>
              <a className="btn btn--ink finale__btn" href={site.shopUrl} onClick={shopIsAnchor ? go(site.shopUrl.slice(1)) : undefined}>
                <span className="btn__dot" aria-hidden="true" />
                {finale.cta}
              </a>
              <ul className="finale__social" aria-label="Rica Beef on social media">
                {site.social.map((s) => (
                  <li key={s.label} className="label">
                    {s.href ? (
                      <a className="link" href={s.href} target="_blank" rel="noreferrer">
                        {s.label}
                      </a>
                    ) : (
                      <span title="Profile link not set yet">{s.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Seal className="finale__seal" />
      </section>

      <footer className="footer" data-nav="light">
        <div className="wrap footer__top">
          <p className="footer__line quiet">{site.line}</p>
          <nav aria-label="Footer">
            <ul className="footer__nav">
              {site.nav.map((n) => (
                <li key={n.id}>
                  <a className="label link" href={`#${n.id}`} onClick={go(n.id)}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="ja footer__ja" lang="ja">
            {site.lineJa}
          </p>
        </div>

        <a
          className="footer__mark"
          href="#top"
          onClick={go('top')}
          onMouseEnter={() => setWhole(true)}
          onMouseLeave={() => setWhole(false)}
          onFocus={() => setWhole(true)}
          onBlur={() => setWhole(false)}
          aria-label="Rica Beef — back to top"
        >
          <Wordmark state={whole ? 'whole' : 'snapped'} title="Rica Beef" />
        </a>

        <div className="wrap footer__legal label">
          <p>© {new Date().getFullYear()} Rica Beef</p>
          <p>Beef crisps &amp; jerky — Made in Japan</p>
          <a className="link" href="#top" onClick={go('top')}>
            Back to top ↑
          </a>
        </div>
      </footer>
    </div>
  );
}
