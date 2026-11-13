/**
 * RICA BEEF — "OTO" (音, sound). The campaign film, as data.
 * 30 s · 16:9 master · 24 fps · one video model for every shot.
 *
 * Each shot is animated image-to-video from an approved start frame
 * (see stills.mjs — `start` is a still id), so packaging, palette and light are
 * locked before any video credit is spent. Type is never generated: the sound
 * words and the end card are added in the edit.
 *
 * Read by: production/scripts/render-film.mjs (generation),
 *          production/scripts/edit-film.mjs   (assembly),
 *          production/scripts/build-docs.mjs  (docs/02-film-storyboard.md),
 *          the website (campaign section storyboard strip).
 */

export const film = {
  title: 'OTO',
  titleJa: '音',
  line: 'Every cut has a sound.',
  lineJa: '部位ごとに、音がある。',
  duration: 30,
  aspect: '16:9',
  fps: 24,
  model: 'seedance_2_5',
  modelParams: { mode: 'omni_reference', resolution: '1080p' },
  idea:
    'A film you listen to. It opens in near silence and is built from the sounds of the product being made and eaten — ' +
    'a salt flake landing, a blade, a pour, a snap. The music does not start until the needle drops at the bar; ' +
    'from there, four snaps on four colours become the percussion.',
  structure: 'Brand film / demo-first hybrid: silence → craft → the world → the snap → the range → the name.',
  music:
    'Sparse late-night jazz trio heard as if from a record in a listening bar: upright bass and brushed snare, one muted trumpet phrase, ' +
    '92 bpm, warm vinyl crackle, dry and close. Enters at 12.5 s on a needle drop, lifts at 19.5 s, stops dead at 27.5 s for the final snap. Instrumental, no vocals.',
};

/** Suffix appended to every video prompt. */
export const VIDEO_RULES = 'Single continuous shot, no cuts. No text, no captions, no logos other than the pack artwork. Keep the lighting direction and colour of the start frame.';

export const shots = [
  {
    id: 'S01',
    frame: 1,
    name: 'Silence',
    t: [0, 3],
    gen: 5,
    start: 'kf-salt-crystal',
    visual:
      'Black. One flake of salt falls through a narrow shaft of warm light, turning slowly. It lands on the surface of a beef crisp; a few crystals bounce.',
    camera: 'Extreme close-up, 100mm macro, eye-level. Very slow tilt down following the flake. Extreme slow motion.',
    light: 'A single warm shaft from camera-left in a black void; dust motes sparkle. Nothing else is lit.',
    product: 'The crisp is only a dark, glossy plane at the bottom of frame until the flake lands on it.',
    video:
      'Extreme slow motion. The salt flake falls straight down through the shaft of warm light, rotating slowly and sparkling. The camera tilts down gently to follow it until it lands on the glossy surface of the beef crisp below, and a few tiny crystals bounce. Dust motes drift in the light.',
    sound: 'Room tone. Almost nothing. One dry "tick" on the landing.',
    transition: 'Hard cut on the tick. The downward motion carries into the blade stroke.',
  },
  {
    id: 'S02',
    frame: 2,
    name: 'Slice',
    t: [3, 6],
    gen: 5,
    start: 'kf-slice',
    visual:
      'A long knife draws through marbled ribeye in one stroke. The slice that lifts away is thin enough to glow: light passes straight through the marbling.',
    camera: 'Close-up, 85mm, slightly below blade height. Slow lateral dolly right-to-left, travelling with the blade.',
    light: 'Warm backlight through the slice; key from camera-left; background falls to black.',
    product: 'The raw cut. No packaging. This is the proof of "paper-thin".',
    video:
      'The knife glides smoothly from right to left through the beef in one long stroke. The paper-thin slice peels away and lifts, glowing translucent in the warm backlight. The camera dollies slowly left with the blade. Calm and precise.',
    sound: 'One long, soft "shhk" of the blade.',
    transition: 'Match cut: the glowing slice becomes the glowing sheets on the racks.',
  },
  {
    id: 'S03',
    frame: 3,
    name: 'Dry',
    t: [6, 9],
    gen: 5,
    start: 'story-dry',
    visual:
      'Rows of paper-thin slices hanging from steel rods, backlit so each one glows like stained glass. Warm air moves them, barely.',
    camera: 'Wide, 35mm, at slice height. Slow, steady dolly forward down the aisle between two rows.',
    light: 'Strong amber backlight through the slices, deep shadow in the aisle and the room.',
    product: 'The crisps in the making. No packaging.',
    video:
      'Slow, steady dolly forward down the aisle between the two rows of hanging slices. The translucent slices of beef glow amber in the backlight and sway very slightly in the warm air; a few dust motes float through the light.',
    sound: 'A low, warm hum. A faint tick of metal expanding.',
    transition: 'Hard cut on the beat into the salt.',
  },
  {
    id: 'S04',
    frame: 4,
    name: 'Salt',
    t: [9, 12.5],
    gen: 5,
    start: 'kf-salt-rain',
    visual:
      'Fingers release the house salt. It falls as a wide, sparkling curtain and scatters over the crisps below; grains bounce.',
    camera: 'Macro, 100mm, locked off, then a slow pedestal down with the fall. Extreme slow motion.',
    light: 'Warm key from camera-left catches every crystal against black.',
    product: 'The house salt blend as the hero ingredient, meeting the crisps.',
    video:
      'Extreme slow motion. The fingers rub together and release the salt blend. The grains fall in a wide sparkling curtain and scatter over the beef crisps below, some bouncing. The camera pedestals down slowly with the fall.',
    sound: 'A dry hiss of grains, then a patter as they land.',
    transition: 'Match cut on direction: falling salt becomes rising bubbles.',
  },
  {
    id: 'S05',
    frame: 5,
    name: 'Pour',
    t: [12.5, 15.5],
    gen: 5,
    start: 'life-highball',
    visual:
      'The listening bar. Whisky soda streams over clear block ice; bubbles race upward. The red Ribeye pack stands beside the glass.',
    camera: 'Medium close-up, 50mm, counter height. Slow push-in toward the glass.',
    light: 'Warm tungsten key from camera-left, vermilion glow far behind, turntable out of focus.',
    product: 'RICA Ribeye pack, right of centre, still and sharp. A dish of crisps in front.',
    video:
      'Slow motion. Whisky soda streams into the tall glass over the clear block ice; the liquid swirls and fine bubbles race upward; a bead of condensation runs down the glass. The camera pushes in slowly. The red box beside the glass stays perfectly still and sharp, and its artwork does not change.',
    sound: 'Needle drop — the music enters. Fizz, ice shifting, one "clink".',
    transition: 'Cut on the clink to her hand lifting a crisp.',
  },
  {
    id: 'S06',
    frame: 6,
    name: 'Snap',
    t: [15.5, 19.5],
    gen: 5,
    start: 'kf-bite',
    visual:
      'She holds a crisp up to the light — it glows — and bites. It snaps. Shards and salt fly; she laughs; her friends turn.',
    camera: 'Medium close-up, 50mm, subtle handheld. Slow push-in. Slow motion from the moment of the snap.',
    light: 'Warm key from camera-left on her face; the crisp is backlit; bar glow behind.',
    product: 'A single crisp, held to the light, then broken. The human proof.',
    video:
      'She bites the paper-thin beef crisp. It snaps cleanly in two with a sharp break, and tiny shards and salt crystals fly from the break and fall in slow motion. She laughs, her eyes closing; the friends beside her, out of focus, turn toward her. Subtle handheld camera, slow push-in. The light does not change: no flash, no flare, nothing glows or emits light.',
    sound: 'THE snap — the loudest sound in the film so far. A laugh under the music.',
    transition: 'Smash cut on the snap into flat colour.',
  },
  {
    id: 'S07',
    frame: 7,
    name: 'Four sounds',
    t: [19.5, 23.5],
    gen: 16,
    start: ['kf-snap-ribeye', 'kf-snap-brisket', 'kf-snap-sirloin', 'kf-snap-shortrib'],
    visual:
      'Four cuts, four colours, four snaps, one second each: ribeye on vermilion, brisket on mustard, sirloin on bone, short rib on charcoal. Each crisp breaks in half mid-air.',
    camera: 'Extreme close-up, locked off, centred. Extreme slow motion. Four separate takes.',
    light: 'Studio: one hard key from camera-left, one clean shadow, flat seamless colour.',
    product: 'Each cut as itself. In the edit the sound word hits with each snap: パリッ · ザクッ · サクッ · カリッ.',
    video:
      'Extreme slow motion. The crisp snaps cleanly in half; the two halves drift apart; small shards and salt crystals burst outward from the break and hang in the air. The flat coloured background does not change. Locked-off camera.',
    sound: 'Four different snaps, on the beat: high and glassy, deep and layered, light and airy, hard and double.',
    transition: 'Hard cuts on the beat. The last burst of salt wipes into the line-up.',
  },
  {
    id: 'S08',
    frame: 8,
    name: 'The range',
    t: [23.5, 27.5],
    gen: 5,
    start: 'pack-lineup',
    visual:
      'All five packs in a row on black stone. Crisps and salt fall through the foreground and scatter at their feet.',
    camera: 'Wide product shot, 50mm, slightly low. Slow push-in with a small crane down.',
    light: 'Warm key from camera-left rakes across the cartons; vermilion glow behind; black background.',
    product: 'The hero shot. All five fronts readable, still and sharp.',
    video:
      'Slow, steady push-in toward the row of five boxes. A few beef crisps and salt flakes fall through the foreground in slow motion and scatter on the black stone. The five boxes stay perfectly still and sharp, and their artwork does not change.',
    sound: 'The music resolves — then stops dead.',
    transition: 'Cut to black.',
  },
  {
    id: 'S09',
    frame: 9,
    name: 'The name',
    t: [27.5, 30],
    gen: 0,
    start: null,
    visual:
      'Black. The RICA wordmark, whole. On the last snap it breaks along the crack. Underneath: "Every cut has a sound." and 部位ごとに、音がある。',
    camera: 'Static title card. Rendered in code from the vector logo — never generated.',
    light: 'Bone on ink black. No effects.',
    product: 'The brand.',
    video: null,
    sound: 'Silence. One final snap as the wordmark breaks.',
    transition: 'End.',
  },
];
