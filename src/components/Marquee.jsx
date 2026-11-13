import { products } from '../data/products.js';
import '../styles/sections/marquee.css';

/** The five sound words on a loop. Decorative: hidden from assistive tech. */
export default function Marquee({ tone = 'shu', reverse = false }) {
  const run = (
    <span className="marquee__run">
      {products.map((p) => (
        <span className="marquee__item" key={p.id}>
          <span className="loud" lang="ja">
            {p.kana}
          </span>
          <span className="quiet">{p.sound}</span>
          <span className="marquee__sep" />
        </span>
      ))}
    </span>
  );
  return (
    <div className={`marquee marquee--${tone} ${reverse ? 'marquee--rev' : ''}`} aria-hidden="true">
      <div className="marquee__track">
        {run}
        {run}
        {run}
      </div>
    </div>
  );
}
