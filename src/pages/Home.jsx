import Hero from '../components/Hero.jsx';
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
  return (
    <>
      <Hero ready={ready} />
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
