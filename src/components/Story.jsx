import Media from './Media.jsx';
import Crack from './Crack.jsx';
import Title from './Title.jsx';
import { story } from '../data/site.js';
import { useReveal, useGsap } from '../hooks/useScroll.js';
import '../styles/sections/story.css';

/**
 * 02 — BRAND STORY. Paper-white, editorial. Three acts — Slice, Salt, Sound —
 * each with one picture that arrives broken and clicks together.
 */
export default function Story() {
  const reveal = useReveal();
  const fx = useGsap((el, gsap) => {
    el.querySelectorAll('.chapter__kanji').forEach((k) => {
      gsap.fromTo(
        k,
        { yPercent: 18 },
        { yPercent: -18, ease: 'none', scrollTrigger: { trigger: k.closest('.chapter'), start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    });
    // each picture eases out of a slight zoom as it crosses the screen
    el.querySelectorAll('.chapter .crack__piece .media').forEach((img) => {
      gsap.fromTo(
        img,
        { scale: 1.16 },
        { scale: 1, ease: 'none', scrollTrigger: { trigger: img.closest('.chapter__media'), start: 'top bottom', end: 'bottom 35%', scrub: true } },
      );
    });
    el.querySelectorAll('.chapter__media').forEach((m) => {
      gsap.fromTo(
        m,
        { yPercent: 5 },
        { yPercent: -5, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    });
  }, []);

  const { intro, chapters } = story;

  return (
    <section
      id="story"
      className="story"
      data-nav="dark"
      ref={(el) => {
        reveal.current = el;
        fx.current = el;
      }}
      aria-labelledby="story-title"
    >
      <div className="wrap">
        <header className="story__intro">
          <p className="label story__eyebrow" data-reveal>
            <span>02</span>
            {intro.eyebrow}
          </p>
          <Title id="story-title" className="story__title quiet" lines={intro.title} />
          <p className="story__lede" data-reveal style={{ '--d': '0.25s' }}>
            {intro.body}
          </p>
        </header>

        <ol className="story__chapters">
          {chapters.map((c, i) => (
            <li className={`chapter chapter--${i + 1}`} key={c.no}>
              <div className="chapter__media">
                <Crack>
                  <Media id={c.media} sizes={i === 2 ? '(min-width: 900px) 92vw, 100vw' : '(min-width: 900px) 42vw, 100vw'} />
                </Crack>
                <span className="chapter__kanji ja" lang="ja" aria-hidden="true">
                  {c.kanji}
                </span>
              </div>
              <div className="chapter__text">
                <p className="label chapter__meta" data-reveal>
                  <span>{c.no}</span>
                  <span>{c.word}</span>
                  <span lang="ja" className="chapter__romaji">
                    {c.kanji} — {c.romaji}
                  </span>
                </p>
                <h3 className="chapter__title quiet" data-rise>
                  <span className="rise">
                    <span>{c.title}</span>
                  </span>
                </h3>
                <p className="chapter__body" data-reveal style={{ '--d': '0.15s' }}>
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
