/**
 * RICA BEEF — every still image the brand needs, as data.
 *
 *   web:  where it sits on the website and what it has to do there
 *   film: which film shot it is the start frame for (see film.mjs)
 *
 * Models: `soul_cinematic` for frames without packaging (cinematic, cheap),
 *         `gpt_image_2_6` wherever the pack appears (it holds the artwork reference).
 * Generate with:  node production/scripts/generate.mjs <id> [<id> …]   (or `all`)
 */
import { NIGHT, STUDIO, CRISP, PACK, NEG_CLEAN, NEG_PACK, CUTS } from './look.mjs';
import { products } from '../src/data/products.js';

const soul = (o) => ({ model: 'soul_cinematic', params: { quality: '2k' }, ...o });
const gpt = (o, quality = 'medium') => ({ model: 'gpt_image_2_6', params: { resolution: '2k', quality }, ...o });

export const stills = [
  /* ─────────── HERO ─────────── */
  soul({
    id: 'hero',
    aspect: '16:9',
    web: { section: '01 Hero', purpose: 'Full-screen opening image and video poster. Subject sits right; the left third stays black for the headline and nav.' },
    film: 'S08 (alt)',
    prompt: `${NIGHT} Extreme close-up, frozen slow motion: several paper-thin beef crisps tumbling through the air in the right two-thirds of the frame, one of them snapping cleanly in half, shards and coarse white salt crystals bursting outward and hanging in the air, every crystal catching the warm key light. Pure black background. The left third of the frame is empty deep black negative space. ${CRISP} 100mm macro lens. ${NEG_CLEAN} No hands.`,
  }),
  soul({
    id: 'hero-mobile',
    aspect: '9:16',
    web: { section: '01 Hero (mobile)', purpose: 'Portrait crop of the hero. Subject in the upper half; the lower half stays black for the headline.' },
    prompt: `${NIGHT} Extreme close-up, frozen slow motion: several paper-thin beef crisps tumbling through the air in the upper half of the frame, one of them snapping cleanly in half, shards and coarse white salt crystals bursting outward and hanging in the air, every crystal catching the warm key light. Pure black background. The lower half of the frame is empty deep black negative space. ${CRISP} 100mm macro lens. ${NEG_CLEAN} No hands.`,
  }),

  /* ─────────── BRAND STORY ─────────── */
  soul({
    id: 'story-slice',
    aspect: '3:4',
    web: { section: '02 Story — Slice', purpose: 'Chapter one. The thinness, proven by light passing through the slice.' },
    prompt: `${NIGHT} Close-up of a craftsperson's hands, no face in frame, drawing a long thin Japanese slicing knife through a block of well-marbled raw ribeye and lifting away a slice so thin that warm backlight glows through it, showing the fat marbling like lace. Dark wooden cutting board, black background. The top third of the frame is dark and empty. 85mm lens. ${NEG_CLEAN}`,
  }),
  gpt({
    id: 'story-salt',
    aspect: '3:4',
    web: { section: '02 Story — Salt', purpose: 'Chapter two. The house salt blend as the hero ingredient.' },
    prompt: `${NIGHT} Macro: the fingertips of a hand in natural, warm-lit skin tone (not red) enter from the top of the frame and pinch and release a seasoning salt blend — coarse white salt flakes mixed with tiny dark and amber flecks of toasted spice — the grains falling in a sparkling stream, frozen in mid-air, onto a small mound on a matte black stone plate. Every crystal catches the warm light against a black background. 100mm macro lens. ${NEG_CLEAN}`,
  }),
  gpt({
    id: 'story-dry',
    aspect: '16:9',
    web: { section: '02 Story — Sound', purpose: 'Chapter three. Slow drying; sheets glowing like stained glass. Wide, calm, full-bleed.' },
    film: 'S03',
    prompt: `${NIGHT} A dark drying room: long rows of paper-thin slices of marbled beef hanging from thin horizontal steel rods, dozens of slices per row, the rows receding into the distance. A strong warm amber backlight shines through the slices so each one glows translucent like stained glass, the marbling visible as paler lace; the room itself stays in deep shadow. Camera at slice height looking down the aisle between two rows, 35mm lens, the nearest slices sharp, the far ones soft. No people. ${NEG_CLEAN}`,
  }, 'high'),

  /* ─────────── INGREDIENTS & TEXTURE ─────────── */
  soul({
    id: 'texture-macro',
    aspect: '21:9',
    web: { section: '06 Why Rica', purpose: 'Edge-to-edge texture band: translucency, marbling lace, salt. Proof without words.' },
    prompt: `${NIGHT} Extreme macro filling the whole frame edge to edge: a single beef crisp held against a warm backlight so it glows translucent — mahogany-red lean, amber lace of rendered marbling, a rough broken edge, coarse white salt crystals and specks of toasted spice clinging to the surface. Razor-thin focal plane, 100mm macro lens. ${NEG_CLEAN} No hands.`,
  }),

  /* ─────────── LIFESTYLE — "a loud snack for quiet places" ─────────── */
  soul({
    id: 'life-listening-bar',
    aspect: '16:9',
    web: { section: '04 Lifestyle', purpose: 'Establishes the world: the listening bar. Wide, atmospheric; top-left stays dark for a caption.' },
    prompt: `${NIGHT} A dim Tokyo listening bar at night: a long dark wooden counter; softly out of focus in the background a vintage turntable spinning a record, a glowing tube amplifier and shelves of vinyl sleeves. In the foreground on the counter, a tall whisky highball with clear block ice and fine bubbles, and a small black ceramic dish piled with paper-thin beef crisps. A hand reaches in from the right to take one crisp. 35mm lens. The top-left of the frame is dark and uncluttered. ${NEG_CLEAN} No readable signs.`,
  }),
  soul({
    id: 'life-bite',
    aspect: '3:4',
    web: { section: '04 Lifestyle', purpose: 'The human moment: the snap itself. Portrait.' },
    prompt: `${NIGHT} Candid close-up portrait of a Japanese woman in her late twenties with a dark bob haircut and a black knit top, sitting at a dim listening-bar counter, caught mid-laugh as she snaps a paper-thin beef crisp between her teeth, tiny shards and salt crystals flying in the warm light. She is looking at someone off-camera. Natural skin texture, 85mm lens, turntable glow softly out of focus behind her. ${NEG_CLEAN}`,
  }),
  soul({
    id: 'life-train',
    aspect: '3:4',
    web: { section: '04 Lifestyle', purpose: 'The quiet place, broken: last train home. Adds humour and a second location.' },
    prompt: `Photoreal cinematic photography, shot on ARRI Alexa 35, fine 35mm film grain, shallow depth of field. A nearly empty late-night commuter train carriage in Tokyo: a Japanese man in his late twenties in a dark overcoat sits alone on the bench seat, eyes closed in bliss as he bites a paper-thin beef crisp, a few crumbs falling; further down the carriage, out of focus, one other passenger glances over. Cool overhead carriage light mixed with warm amber light from the windows at camera-left, deep shadows, a vermilion-red seat fabric. Palette: ink black, bone white, vermilion, amber. 35mm lens. ${NEG_CLEAN} No readable signs or advertisements.`,
  }),
  gpt({
    id: 'life-highball',
    aspect: '16:9',
    refs: ['production/refs/pack-ribeye.png'],
    web: { section: '04 Lifestyle', purpose: 'The pairing, with the pack in the world. Glass centre-left, pack right of centre; crops to portrait.' },
    film: 'S05',
    prompt: `${NIGHT} On the dark wooden counter of a dim listening bar: whisky soda being poured from above into a tall thin highball glass packed with clear block ice, the liquid splashing, fine bubbles rising, frozen in motion, condensation on the glass. Beside it, standing upright, the RICA Ribeye beef crisps box: ${PACK} A few paper-thin beef crisps sit on a small black dish in front. A turntable is softly out of focus in the background. Glass centre-left, pack right of centre. 50mm lens. ${NEG_PACK}`,
  }),

  /* ─────────── PRODUCT COLLECTION ─────────── */
  gpt(
    {
      id: 'pack-lineup',
      aspect: '16:9',
      refs: ['production/refs/pack-sheet.png'],
      web: { section: '03 Collection', purpose: 'The whole range in one frame. Opens the collection and closes the film.' },
      film: 'S08',
      prompt: `${NIGHT} Five slim upright rectangular cartons in matte uncoated paperboard (each about 10 cm wide, 15 cm tall, 3 cm deep) standing side by side in a slightly staggered row on a matte black stone surface against a black background, fronts turned a little toward camera. Each carton's front reproduces exactly the corresponding flat artwork from the reference sheet, left to right: vermilion red RIBEYE with white パリッ, mustard yellow BRISKET with black ザクッ, off-white SIRLOIN with red サクッ, black SHORT RIB with red カリッ, indigo blue JERKY with white ギュッ. Keep every artwork faithful: RICA wordmark top-left, one huge vertical katakana word, cut name bottom-left, small waveform bars bottom-right. Do not redesign or add to the artwork. In front of the cartons, scattered paper-thin beef crisps and coarse white salt flakes. 50mm lens. ${NEG_PACK}`,
    },
    'high',
  ),
  ...products.map((p) =>
    gpt({
      id: `cut-${p.id}`,
      aspect: '4:5',
      refs: [`production/refs/pack-${p.id}.png`],
      web: { section: '03 Collection', purpose: `Individual flavour image for ${p.cut} (${p.kana}). Pack right of centre, beef in front; top quarter empty.` },
      prompt: `${STUDIO} The RICA ${p.cut} box standing upright, turned slightly, right of centre: ${PACK} In front of it and to the left, a loose stack of ${CUTS[p.id].crisp}, with a few broken pieces and scattered salt flakes. The backdrop and floor are ${CUTS[p.id].backdrop}. The top quarter of the frame is empty backdrop. ${NEG_PACK}`,
    }),
  ),

  /* ─────────── CAMPAIGN ─────────── */
  gpt({
    id: 'campaign-key',
    aspect: '16:9',
    refs: ['production/refs/pack-ribeye.png'],
    web: { section: '05 Campaign', purpose: 'Key visual and film poster. The snap, with the pack as emblem. Left 40% is black for the title.' },
    prompt: `${NIGHT} Campaign key visual: one large paper-thin ribeye crisp snapping cleanly in half in mid-air, centre-right of the frame, a burst of shards and white salt crystals radiating from the break, frozen tack-sharp. Below and behind it, slightly out of focus, standing on black stone, the RICA Ribeye box: ${PACK} Pure black background, thin vermilion rim light from behind right. The left 40% of the frame is clean black negative space. ${CRISP} 100mm macro lens. ${NEG_PACK}`,
  }),

  /* ─────────── CLOSING ─────────── */
  soul({
    id: 'closing-gone',
    aspect: '16:9',
    web: { section: '07 Final moment', purpose: 'The last image: an empty dish. "It never lasts." Dish lower-right; the rest is vermilion for the statement.' },
    prompt: `${STUDIO} Top-down view of a small matte black ceramic dish, completely empty except for a few tiny beef crisp crumbs and scattered coarse white salt flakes; a few more crumbs and salt flakes lie on the surface around it. The surface is seamless matte vermilion red (#E4381C) filling the whole frame. The dish sits in the lower-right third; the rest of the frame is empty vermilion negative space. ${NEG_CLEAN} No hands.`,
  }),

  /* ─────────── FILM-ONLY START FRAMES (16:9) ─────────── */
  gpt({
    id: 'kf-salt-crystal',
    aspect: '16:9',
    film: 'S01',
    prompt: `${NIGHT} Extreme macro: one single small flake of coarse white salt — a flat, irregular, translucent white crystal, small in the frame — falling through a narrow diagonal shaft of warm light in pitch-black space, tack-sharp, a few tiny dust motes sparkling around it. Far below at the bottom edge, out of focus, the dark mahogany surface of a beef crisp. The flake is in the centre of the frame and everything else is black. 100mm macro lens. ${NEG_CLEAN}`,
  }),
  soul({
    id: 'kf-slice',
    aspect: '16:9',
    film: 'S02',
    prompt: `${NIGHT} Close-up of a craftsperson's hands, no face in frame, drawing a long thin Japanese slicing knife from right to left through a block of well-marbled raw ribeye, a slice so thin lifting away that warm backlight glows through it and shows the fat marbling like lace. Dark wooden cutting board, black background. 85mm lens. ${NEG_CLEAN}`,
  }),
  soul({
    id: 'kf-salt-rain',
    aspect: '16:9',
    film: 'S04',
    prompt: `${NIGHT} Macro: fingers at the top of the frame pinch and release a seasoning salt blend — coarse white salt flakes with tiny dark and amber flecks of toasted spice — the grains falling in a wide sparkling curtain, frozen in mid-air, toward paper-thin beef crisps lying on a matte black stone surface below. Every crystal catches the warm light against a black background. 100mm macro lens. ${NEG_CLEAN}`,
  }),
  soul({
    id: 'kf-bite',
    aspect: '16:9',
    film: 'S06',
    prompt: `${NIGHT} Medium close-up of a Japanese woman in her late twenties with a dark bob haircut and a black knit top, sitting at a dim listening-bar counter, holding a paper-thin beef crisp up to the warm light between two fingers so that it glows translucent, smiling, about to bite it. Two friends softly out of focus beside her, a turntable glowing in the background. Natural skin texture, 50mm lens. ${NEG_CLEAN}`,
  }),
  ...products
    .filter((p) => p.id !== 'jerky')
    .map((p) =>
      gpt({
        id: `kf-snap-${p.id}`,
        aspect: '16:9',
        film: 'S07',
        prompt: `${STUDIO} Extreme close-up, the same framing as a matching set of four: one single piece of ${CUTS[p.id].crisp.replace('crisps:', 'crisp:')} floating in mid-air in the exact centre of the frame, filling about half its width, snapping cleanly in half down the middle — the two halves a finger-width apart, small shards and salt crystals bursting from the break, frozen tack-sharp. The whole background is ${CUTS[p.id].backdrop}: one flat seamless colour edge to edge, no floor line, no horizon, no surface. ${NEG_CLEAN} No hands.`,
      }),
    ),
];

export const stillById = Object.fromEntries(stills.map((s) => [s.id, s]));
