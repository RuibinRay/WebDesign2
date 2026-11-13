import { useEffect, useState } from 'react';
import Nav from './components/Nav.jsx';
import Preloader from './components/Preloader.jsx';
import Home from './pages/Home.jsx';
import { ScrollProgress, useMagneticButtons } from './components/Motion.jsx';
import { SoundProvider } from './hooks/useCrunch.jsx';
import { ScrollTrigger, useSmoothScroll } from './hooks/useScroll.js';

export default function App() {
  const [ready, setReady] = useState(false);
  useSmoothScroll();
  useMagneticButtons();

  // Web fonts change line lengths; re-measure every scroll-driven section once they land.
  useEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => alive && ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => {
      alive = false;
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return (
    <SoundProvider>
      <Preloader onDone={() => setReady(true)} />
      <ScrollProgress />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main id="main">
        <Home ready={ready} />
      </main>
    </SoundProvider>
  );
}
