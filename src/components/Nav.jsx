import { useEffect, useRef, useState } from 'react';
import Wordmark from './Wordmark.jsx';
import { site } from '../data/site.js';
import { useCrunch } from '../hooks/useCrunch.jsx';
import { scrollToId, getLenis } from '../hooks/useScroll.js';
import '../styles/sections/nav.css';

export function SoundToggle({ className = '' }) {
  const { on, toggle } = useCrunch();
  return (
    <button type="button" className={`sound ${on ? 'is-on' : ''} ${className}`} aria-pressed={on} onClick={toggle}>
      <span className="sound__bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="label">Sound {on ? 'on' : 'off'}</span>
    </button>
  );
}

/**
 * Fixed header. Its colour follows whatever section sits underneath it:
 * every section declares data-nav="light" (light text) or "dark".
 */
export default function Nav() {
  const [theme, setTheme] = useState('light');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hot, setHot] = useState(false);
  const burger = useRef(null);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const y = 36;
      let t = 'light';
      for (const el of document.querySelectorAll('[data-nav]')) {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) t = el.dataset.nav;
      }
      setTheme(t);
      setScrolled(window.scrollY > 40);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    window.addEventListener('rica:navtheme', queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      window.removeEventListener('rica:navtheme', queue);
    };
  }, []);

  // mobile menu: lock scroll, close on Escape, return focus
  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.documentElement.classList.add('menu-open');
    } else {
      lenis?.start();
      document.documentElement.classList.remove('menu-open');
    }
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        burger.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <header className={`nav nav--${open ? 'light' : theme} ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <a
        href="#top"
        className="nav__logo"
        aria-label="Rica Beef — back to top"
        onClick={go('top')}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
      >
        <Wordmark state={hot ? 'whole' : 'snapped'} title="Rica Beef" />
      </a>

      <nav className="nav__links" aria-label="Primary">
        <ul>
          {site.nav.map((n) => (
            <li key={n.id}>
              <a className="label link" href={`#${n.id}`} onClick={go(n.id)}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="nav__right">
        <SoundToggle className="nav__sound" />
        <a className="btn nav__cta" href={site.shopUrl} onClick={site.shopUrl.startsWith('#') ? go(site.shopUrl.slice(1)) : undefined}>
          Get a pack
        </a>
        <button
          ref={burger}
          type="button"
          className="nav__burger"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="label">{open ? 'Close' : 'Menu'}</span>
          <span className="nav__burger-icon" aria-hidden="true" />
        </button>
      </div>

      <div id="site-menu" className="nav__menu" hidden={!open}>
        <nav aria-label="Menu">
          <ul>
            {site.nav.map((n, i) => (
              <li key={n.id} style={{ '--i': i }}>
                <a href={`#${n.id}`} onClick={go(n.id)}>
                  <span className="label">0{i + 1}</span>
                  <span className="quiet">{n.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav__menu-foot">
          <SoundToggle />
          <p className="ja" lang="ja">
            {site.lineJa}
          </p>
        </div>
      </div>
    </header>
  );
}
