import Media from './Media.jsx';
import Title from './Title.jsx';
import Waveform from './Waveform.jsx';
import { why } from '../data/site.js';
import { products } from '../data/products.js';
import { scrollToId, useGsap, useReveal } from '../hooks/useScroll.js';
import '../styles/sections/why.css';

const pips = (n) => [1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= n ? 'is-on' : ''} />);

/**
 * 06 — WHY RICA. Five principles as a spec sheet, a band of pure texture,
 * and the "sound check": every cut compared on one table.
 */
export default function Why() {
  const reveal = useReveal();
  const fx = useGsap((el, gsap) => {
    const band = el.querySelector('.why__band-inner:has(img)');
    if (band)
      gsap.fromTo(band, { yPercent: -9 }, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: band.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  }, []);

  const open = (id) => {
    window.dispatchEvent(new CustomEvent('rica:select', { detail: id }));
    scrollToId('cuts');
  };

  return (
    <section
      id="why"
      className="why"
      data-nav="dark"
      ref={(el) => {
        reveal.current = el;
        fx.current = el;
      }}
      aria-labelledby="why-title"
    >
      <div className="wrap why__head">
        <p className="label" data-reveal>
          <span className="why__no">06</span>
          {why.eyebrow}
        </p>
        <Title id="why-title" className="why__title quiet" lines={why.title} />
      </div>

      <div className="why__band" data-reveal>
        <div className="why__band-inner">
          <Media id="texture-snap" fill sizes="100vw" />
        </div>
      </div>

      <div className="wrap">
        <ol className="why__points">
          {why.points.map((pt, i) => (
            <li key={pt.no} className="point" data-reveal style={{ '--d': `${i * 0.07}s` }}>
              <p className="point__no loud">{pt.no}</p>
              <h3 className="point__title">
                {pt.title}
                {pt.ja && (
                  <span className="ja" lang="ja">
                    {pt.ja}
                  </span>
                )}
              </h3>
              <p className="point__body">{pt.body}</p>
            </li>
          ))}
        </ol>

        <div className="check">
          <div className="check__head" data-reveal>
            <h3 className="quiet">The sound check</h3>
            <p className="label">Five cuts, side by side. Pick one to hear it.</p>
          </div>
          <ul className="check__table" aria-label="The sound check: every cut compared">
            <li className="check__row check__row--head label" aria-hidden="true">
              <span>No.</span>
              <span>Cut</span>
              <span>Sound</span>
              <span className="check__wave-col">
                Signature
              </span>
              <span>Loud</span>
              <span>Rich</span>
              <span>Light</span>
              <span className="check__pair-col">
                Pairs with
              </span>
            </li>
            {products.map((p, i) => (
              <li key={p.id}>
              <button
                type="button"
                aria-label={`${p.cut}: ${p.kana}, ${p.sound} — ${p.soundLine.toLowerCase()}. Loud ${p.meters.loud}, rich ${p.meters.rich}, light ${p.meters.light} out of 5. Pairs with: ${p.pair} Show this cut.`}
                className="check__row"
                style={{ '--r-bg': p.bg, '--r-ink': p.ink, '--r-text': p.text, '--d': `${i * 0.05}s` }}
                onClick={() => open(p.id)}
                data-reveal
              >
                <span className="label">
                  {p.no}
                </span>
                <span className="check__cut loud">
                  {p.cut}
                </span>
                <span className="check__sound">
                  <span className="loud" lang="ja">
                    {p.kana}
                  </span>
                  <span className="quiet">{p.sound}</span>
                </span>
                <span className="check__wave-col">
                  <Waveform values={p.wave} label={`${p.cut} waveform`} />
                </span>
                <span className="check__pips" data-label="Loud">
                  {pips(p.meters.loud)}
                </span>
                <span className="check__pips" data-label="Rich">
                  {pips(p.meters.rich)}
                </span>
                <span className="check__pips" data-label="Light">
                  {pips(p.meters.light)}
                </span>
                <span className="check__pair check__pair-col quiet">
                  {p.pair}
                </span>
              </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
