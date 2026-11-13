/**
 * A heading that arrives word by word. Each word rises out of its own mask, staggered,
 * when the nearest ancestor with [data-rise] enters the viewport (see hooks/useScroll.js).
 *
 *   <Title as="h2" className="story__title quiet" lines={['It started', 'with a sound.']} />
 *
 * Screen readers get the plain sentence; the animated words are hidden from them.
 */
export default function Title({ as: Tag = 'h2', lines, className = '', id, step = 0.055, delay = 0 }) {
  let n = 0;
  return (
    <Tag id={id} className={`title ${className}`} data-rise>
      <span className="sr-only">{lines.join(' ')}</span>
      {lines.map((line, li) => (
        <span className={`title__line title__line--${li + 1}`} key={li} aria-hidden="true">
          {line.split(' ').map((word, wi) => (
            <span className="rise rise--word" key={wi} style={{ '--d': `${(delay + n++ * step).toFixed(3)}s` }}>
              <span>{word}</span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
