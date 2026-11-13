import { useEffect, useState } from 'react';
import Wordmark from './Wordmark.jsx';
import { prefersReducedMotion } from '../hooks/useScroll.js';
import '../styles/sections/preloader.css';

/**
 * 1.6 seconds of brand before the page: the wordmark arrives whole, snaps,
 * and the curtain breaks open along the same crack. Purely decorative —
 * the page underneath is already rendered and is never blocked for long.
 */
export default function Preloader({ onDone }) {
  const [phase, setPhase] = useState('whole'); // whole → snapped → open → gone

  useEffect(() => {
    if (prefersReducedMotion()) {
      setPhase('gone');
      onDone?.();
      return undefined;
    }
    document.documentElement.classList.add('is-loading');
    const t = [
      setTimeout(() => setPhase('snapped'), 720),
      setTimeout(() => {
        setPhase('open');
        document.documentElement.classList.remove('is-loading');
        onDone?.();
      }, 1250),
      setTimeout(() => setPhase('gone'), 2300),
    ];
    return () => {
      t.forEach(clearTimeout);
      document.documentElement.classList.remove('is-loading');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'gone') return null;
  return (
    <div className={`preloader preloader--${phase}`} aria-hidden="true">
      <div className="preloader__half preloader__half--l" />
      <div className="preloader__half preloader__half--r" />
      <div className="preloader__mark">
        <Wordmark state={phase === 'whole' ? 'whole' : 'snapped'} />
        <span className="preloader__kana" lang="ja">
          パリッ
        </span>
      </div>
    </div>
  );
}
