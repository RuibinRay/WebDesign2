import '../styles/sections/crack.css';

/**
 * The brand's signature transition. Whatever is inside arrives as two broken
 * pieces and clicks together along the same jagged line that splits the logo.
 * On hover the right-hand piece slips again.
 * Needs a parent using useReveal() (it listens for `.is-in` via data-rise).
 */
export default function Crack({ children, className = '', delay = 0 }) {
  return (
    <div className={`crack ${className}`} data-rise style={{ '--d': `${delay}s` }}>
      <div className="crack__piece crack__piece--l">{children}</div>
      <div className="crack__piece crack__piece--r" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
