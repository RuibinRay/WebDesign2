/**
 * Site-wide settings and copy that is not product data.
 * Everything a non-developer is likely to change lives here or in products.js.
 */
export const site = {
  name: 'Rica Beef',
  line: 'Every cut has a sound.',
  lineJa: '部位ごとに、音がある。',

  // ⚠ Replace with the real shop / stockist URL. '#cuts' keeps the button useful until then.
  shopUrl: '#cuts',

  // ⚠ Replace with the real profiles. Links with `href: null` render as plain text, not dead links.
  social: [
    { label: 'Instagram', href: null },
    { label: 'TikTok', href: null },
    { label: 'YouTube', href: null },
  ],

  nav: [
    { id: 'story', label: 'Story' },
    { id: 'cuts', label: 'Cuts' },
    { id: 'world', label: 'World' },
    { id: 'film', label: 'Film' },
    { id: 'why', label: 'Why Rica' },
  ],
};

export const story = {
  intro: {
    eyebrow: 'The story',
    title: ['It started', 'with a sound.'],
    body: 'Not a recipe. A sound. The clean, bright crack of beef sliced so thin it stops being steak and becomes something else. We chased that sound cut by cut — and found that every one of them breaks differently.',
  },
  chapters: [
    {
      no: '01',
      kanji: '薄',
      romaji: 'usu',
      word: 'Slice',
      title: 'Thin enough to read through.',
      body: 'Every cut is sliced against the light. If the light does not come through, the slice goes back. Thin is the whole point: it is what turns beef into a crisp.',
      media: 'story-slice',
    },
    {
      no: '02',
      kanji: '塩',
      romaji: 'shio',
      word: 'Salt',
      title: 'Rica Salt. One blend, on everything.',
      body: 'Our house salt — うま塩, uma-shio — is the only seasoning we use. Salt, and a short list of aromatics. We will tell you everything about it except the ratio.',
      media: 'story-salt',
    },
    {
      no: '03',
      kanji: '音',
      romaji: 'oto',
      word: 'Sound',
      title: 'Dried until it finds its voice.',
      body: 'No fryer. No shortcuts. Low and slow, until the slice gives up its last bend and snaps. Ribeye goes glassy. Brisket goes deep. No two cuts sound the same — which is why we never mix them.',
      media: 'story-dry',
    },
  ],
};

export const world = {
  eyebrow: 'The world',
  title: ['A loud snack', 'for quiet places.'],
  body: 'Rica lives where people are listening. The bar with one turntable and no talking over the record. The last train. The kitchen at 2 a.m. Bring a pack. Apologise in advance.',
  places: [
    { media: 'life-listening-bar', place: 'Listening bar', time: '23:40', line: 'Side B. Highball. Sorry about the noise.', shape: 'wide' },
    { media: 'life-bite', place: 'Counter seat', time: '23:52', line: 'She is not sorry.', shape: 'tall' },
    { media: 'life-highball', place: 'Same bar', time: '00:05', line: 'Pairs with ice. Loudly.', shape: 'wide' },
    { media: 'life-train', place: 'Last train', time: '00:48', line: 'Carriage four would like a word.', shape: 'tall' },
  ],
};

export const why = {
  eyebrow: 'Why Rica',
  title: ['Thin & loud.', 'On purpose.'],
  points: [
    {
      no: '01',
      title: 'One cut per pack',
      body: 'Ribeye is ribeye. Brisket is brisket. Every cut has its own grain, its own fat, its own sound — so we never blend them.',
    },
    {
      no: '02',
      title: 'Sliced paper-thin',
      body: 'Thin enough for light to pass through. That is the test, and it is the reason a Rica crisp shatters instead of chews.',
    },
    {
      no: '03',
      title: 'Rica Salt',
      ja: 'うま塩',
      body: 'One house blend does all the seasoning. It is there to make the beef louder, not to cover it up.',
    },
    {
      no: '04',
      title: 'Dried, never fried',
      body: 'Slow heat and patience. Nothing between you and the beef but salt.',
    },
    {
      no: '05',
      title: 'Made in Japan',
      ja: '日本製',
      body: 'Made in Japan, for counters, carriages and kitchens everywhere.',
    },
  ],
};

export const finale = {
  ja: 'ごちそうさま。',
  jaNote: 'gochisōsama — said when the plate is empty',
  title: ['It never', 'lasts.'],
  body: 'The pack is small. The silence afterwards is long. You know what to do.',
  cta: 'Get the next pack',
};
