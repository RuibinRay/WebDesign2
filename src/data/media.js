/**
 * The image catalogue.
 *
 * Every picture on the site is addressed by id. If optimised files exist in
 * src/assets/images/ (named <id>-<width>.webp, written by `npm run images`),
 * <Media id="…"> renders them. If not, it renders an art-directed "frame
 * pending" panel that says exactly what belongs there. Nothing is ever a
 * random stock photo.
 *
 * `ratio`  intrinsic aspect of the master (w / h)
 * `tone`   which world the frame belongs to — drives the placeholder
 * `alt`    alt text once the real image is in
 * `brief`  one line: the picture that must replace the placeholder
 */
const files = import.meta.glob('../assets/images/*.webp', { eager: true, query: '?url', import: 'default' });

const sources = {};
for (const [path, url] of Object.entries(files)) {
  const m = path.match(/\/([a-z0-9-]+)-(\d+)\.webp$/i);
  if (!m) continue;
  (sources[m[1]] ||= []).push({ w: Number(m[2]), url });
}
for (const list of Object.values(sources)) list.sort((a, b) => a.w - b.w);

export const catalogue = {
  hero: {
    ratio: 16 / 9,
    tone: 'night',
    alt: 'Paper-thin beef crisps snapping in mid-air, salt crystals bursting into the dark.',
    brief: 'Crisps tumbling and snapping in mid-air on the right, salt bursting; left third pure black for the headline.',
  },
  'hero-mobile': {
    ratio: 9 / 16,
    tone: 'night',
    alt: 'Paper-thin beef crisps snapping in mid-air, salt crystals bursting into the dark.',
    brief: 'Portrait hero: crisps snapping in the upper half, the lower half black for the headline.',
  },
  'story-slice': {
    ratio: 3 / 4,
    tone: 'night',
    alt: 'A long knife lifting a slice of beef so thin that light glows through it.',
    brief: 'Hands and a long knife lifting a slice of marbled beef thin enough to glow in the backlight.',
  },
  'story-salt': {
    ratio: 3 / 4,
    tone: 'night',
    alt: 'Fingers releasing a pinch of seasoning salt, the grains frozen in mid-air.',
    brief: 'Fingers releasing the house salt; grains frozen mid-air, sparkling against black, landing on a black stone plate.',
  },
  'story-dry': {
    ratio: 16 / 9,
    tone: 'night',
    alt: 'Rows of paper-thin beef slices hanging to dry, glowing amber in the backlight.',
    brief: 'Rows of paper-thin slices hanging from steel rods, backlit amber so they glow like stained glass. Wide and calm.',
  },
  'texture-macro': {
    ratio: 21 / 9,
    tone: 'night',
    alt: 'Extreme close-up of a beef crisp held to the light: marbling like lace, salt crystals on the surface.',
    brief: 'Edge-to-edge macro of one crisp against the light: translucent lean, amber lace of marbling, salt crystals.',
  },
  'life-listening-bar': {
    ratio: 16 / 9,
    tone: 'night',
    alt: 'A highball and a dish of beef crisps on the counter of a dim listening bar; a hand reaches for one.',
    brief: 'Listening-bar counter: highball, dish of crisps, a hand reaching in; amplifier and turntable glowing behind.',
  },
  'life-bite': {
    ratio: 3 / 4,
    tone: 'night',
    alt: 'A woman at the bar laughing as she bites into a beef crisp.',
    brief: 'Candid portrait at the bar: mid-laugh, mid-snap, shards and salt flying in warm light.',
  },
  'life-highball': {
    ratio: 16 / 9,
    tone: 'night',
    alt: 'Whisky soda pouring over clear ice beside a red Rica Ribeye pack.',
    brief: 'Whisky soda pouring over clear block ice, frozen mid-splash; the red Ribeye pack standing beside the glass.',
  },
  'life-train': {
    ratio: 3 / 4,
    tone: 'night',
    alt: 'A man on a nearly empty late-night train, eyes closed, biting a beef crisp.',
    brief: 'Last train, nearly empty carriage: one passenger blissfully biting a crisp, another glancing over.',
  },
  'pack-lineup': {
    ratio: 16 / 9,
    tone: 'night',
    alt: 'The five Rica Beef packs standing in a row on black stone, crisps and salt scattered in front.',
    brief: 'All five cartons in a row on black stone, fronts readable, crisps and salt scattered at their feet.',
  },
  'campaign-key': {
    ratio: 16 / 9,
    tone: 'night',
    alt: 'A single beef crisp snapping in half above the Rica Ribeye pack.',
    brief: 'Key visual: one large crisp snapping in half mid-air above the Ribeye pack; left 40% black for the title.',
  },
  'closing-gone': {
    ratio: 16 / 9,
    tone: 'shu',
    alt: 'An empty black dish on a vermilion surface. Only crumbs and salt are left.',
    brief: 'Top-down: an empty black dish, only crumbs and salt left, on seamless vermilion. Dish lower-right.',
  },
  'cut-ribeye': {
    ratio: 4 / 5,
    tone: 'ribeye',
    alt: 'Rica Ribeye pack on a vermilion backdrop with a stack of marbled ribeye crisps in front.',
    brief: 'Ribeye pack on vermilion with a stack of marbled crisps in front.',
  },
  'cut-brisket': {
    ratio: 4 / 5,
    tone: 'brisket',
    alt: 'Rica Brisket pack on a mustard backdrop with long-grained brisket crisps in front.',
    brief: 'Brisket pack on mustard with long-grained, rugged crisps in front.',
  },
  'cut-sirloin': {
    ratio: 4 / 5,
    tone: 'sirloin',
    alt: 'Rica Sirloin pack on a bone-white backdrop with fine, airy sirloin crisps in front.',
    brief: 'Sirloin pack on bone white with fine, airy, almost translucent crisps in front.',
  },
  'cut-shortrib': {
    ratio: 4 / 5,
    tone: 'shortrib',
    alt: 'Rica Short Rib pack on a charcoal backdrop with dark caramelised crisps in front.',
    brief: 'Short Rib pack on charcoal with dark, glossy, caramel-edged crisps in front.',
  },
  'cut-jerky': {
    ratio: 4 / 5,
    tone: 'jerky',
    alt: 'Rica Jerky pack on an indigo backdrop with thick-cut strips of jerky in front.',
    brief: 'Jerky pack on indigo with thick-cut, dense strips of jerky in front.',
  },
};

export function getMedia(id) {
  const meta = catalogue[id];
  if (!meta) throw new Error(`Unknown media id: ${id}`);
  const list = sources[id] || null;
  return {
    id,
    ...meta,
    ready: Boolean(list?.length),
    src: list ? list[Math.min(list.length - 1, 2)].url : null,
    largest: list ? list[list.length - 1].url : null,
    srcSet: list ? list.map((s) => `${s.url} ${s.w}w`).join(', ') : null,
  };
}

export const videoSlots = typeof __RICA_VIDEO__ !== 'undefined' ? __RICA_VIDEO__ : { heroLoop: false, film: false, teaser: false };
export const videoUrl = (name) => `${import.meta.env.BASE_URL}videos/${name}`;
