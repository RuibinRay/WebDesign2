import { getMedia } from '../data/media.js';
import '../styles/sections/media.css';

/**
 * One picture, addressed by id (see data/media.js).
 *
 *   fill      stretch to the parent (object-fit: cover) instead of using the intrinsic ratio
 *   priority  eager-load + high fetch priority (hero only)
 *   sizes     responsive `sizes` hint
 *   focus     object-position for cover crops, e.g. "70% 50%"
 *
 * When the optimised files do not exist yet, renders <Pending/> — a proof-sheet
 * style panel carrying the frame's id, ratio and brief.
 */
export default function Media({ id, fill = false, priority = false, sizes = '100vw', focus, className = '', quiet = false }) {
  const m = getMedia(id);
  const style = fill ? undefined : { aspectRatio: String(m.ratio) };

  if (!m.ready) return <Pending m={m} fill={fill} className={className} quiet={quiet} />;

  return (
    <img
      className={`media ${fill ? 'media--fill' : ''} ${className}`}
      src={m.src}
      srcSet={m.srcSet}
      sizes={sizes}
      alt={m.alt}
      style={{ ...style, objectPosition: focus }}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      draggable="false"
    />
  );
}

const ratioLabel = (r) => {
  const known = [
    [16 / 9, '16:9'],
    [3 / 4, '3:4'],
    [4 / 5, '4:5'],
    [21 / 9, '21:9'],
    [9 / 16, '9:16'],
    [1, '1:1'],
  ];
  return known.find(([v]) => Math.abs(v - r) < 0.01)?.[1] ?? r.toFixed(2);
};

function Pending({ m, fill, className, quiet }) {
  return (
    <div
      className={`pending pending--${m.tone} ${fill ? 'pending--fill' : ''} ${quiet ? 'pending--quiet' : ''} ${className}`}
      style={fill ? undefined : { aspectRatio: String(m.ratio) }}
      role="img"
      aria-label={`Image not yet produced. Planned: ${m.brief}`}
    >
      <span className="pending__mark pending__mark--tl" />
      <span className="pending__mark pending__mark--tr" />
      <span className="pending__mark pending__mark--bl" />
      <span className="pending__mark pending__mark--br" />
      <span className="pending__glyph" lang="ja" aria-hidden="true">
        未
      </span>
      {!quiet && (
        <>
          <p className="pending__head label" aria-hidden="true">
            <span>Frame pending</span>
            <span>{m.id}</span>
            <span>{ratioLabel(m.ratio)}</span>
          </p>
          <p className="pending__brief" aria-hidden="true">
            {m.brief}
          </p>
        </>
      )}
    </div>
  );
}
