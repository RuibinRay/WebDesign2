import { useState } from 'react';
import Hero from '../components/Hero.jsx';
import HeroScroll from '../components/HeroScroll.jsx';
import { videoSlots } from '../data/media.js';
import { prefersReducedMotion } from '../hooks/useScroll.js';
import Marquee from '../components/Marquee.jsx';
import Story from '../components/Story.jsx';
import Collection from '../components/Collection.jsx';
import World from '../components/World.jsx';
import Film from '../components/Film.jsx';
import Why from '../components/Why.jsx';
import Finale from '../components/Finale.jsx';

/**
 * The home page, in the order the brand is meant to be met:
 * 01 Hero → 02 Story → 03 Collection → 04 Lifestyle → 05 Film → 06 Why Rica → 07 Final moment.
 */
export default function Home({ ready }) {
  // The scroll-driven film needs its encodes and a visitor who has not asked for less motion;
  // otherwise the still hero stands in.
  const [scrub] = useState(() => videoSlots.scrollHero && !prefersReducedMotion());
  return (
    <>
      {scrub ? <HeroScroll ready={ready} /> : <Hero ready={ready} />}
      <Marquee />
      <Story />
      <Collection />
      <World />
      <Film />
      <Marquee tone="ink" reverse />
      <Why />
      <Finale />
    </>
  );
}
