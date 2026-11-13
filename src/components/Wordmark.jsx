import { useId, useMemo } from 'react';
import raw from '../assets/brand/rica-wordmark.svg?raw';
import sealRaw from '../assets/brand/rica-seal.svg?raw';
import '../styles/sections/wordmark.css';

/**
 * The Snap. The wordmark is drawn from outlines (scripts/build-brand-assets.mjs)
 * and split along a crack through the C. `state` moves the right-hand piece:
 *
 *   "snapped" (default)  the logo as it normally appears — broken
 *   "whole"              joined; used just before a snap (preloader, footer hover)
 */
export default function Wordmark({ state = 'snapped', className = '', title = 'Rica' }) {
  const uid = useId().replace(/[^a-z0-9]/gi, '');
  const html = useMemo(
    () =>
      raw
        .replaceAll('w-l', `wl${uid}`)
        .replaceAll('w-r', `wr${uid}`)
        .replace(/aria-label="[^"]*"/, `aria-label="${title}"`),
    [uid, title],
  );
  return <span className={`wordmark wordmark--${state} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Seal({ className = '' }) {
  return <span className={`seal ${className}`} dangerouslySetInnerHTML={{ __html: sealRaw }} />;
}
