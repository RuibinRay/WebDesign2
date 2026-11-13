/**
 * RICA BEEF — product range. Single source of truth.
 * Read by the website (collection, 3D packs, crunch synth) AND by the
 * brand-asset build script (pack artwork, reference sheets for image generation).
 *
 * ⚠ Items marked `confirm` are creative proposals, not verified facts:
 *   net weights, the exact cut list beyond ribeye / brisket / jerky,
 *   and all tasting language. Edit here and everything downstream updates.
 */

export const palette = {
  sumi: '#0F0E0D', // ink black — night, type, the dark one
  bone: '#F2ECE1', // paper — editorial ground
  shu: '#E4381C', // vermilion — the signature
  karashi: '#E2A31F', // mustard
  shio: '#F7F3EA', // salt white
  kuro: '#1C1A18', // charcoal
  ai: '#1E3559', // indigo
  amber: '#D58A2A', // tungsten / highball
};

export const products = [
  {
    id: 'ribeye',
    no: '01',
    line: 'Beef Crisps',
    cut: 'Ribeye',
    cutJa: 'リブアイ',
    sound: 'Pari',
    kana: 'パリッ',
    soundLine: 'The glass snap',
    colorName: 'Shu',
    bg: palette.shu,
    ink: palette.bone,
    weight: '40 g', // confirm
    blurb:
      'The marbled one. The fat renders into lace, then sets like glass. One clean, high snap — and then it turns to butter.',
    notes: ['Rich', 'Buttery', 'Clean finish'],
    pair: 'A highball. Extra ice.',
    meters: { loud: 5, rich: 5, light: 3 },
    // 24 bars, 0–1. One sharp transient, fast decay.
    wave: [0.06, 0.1, 1, 0.82, 0.5, 0.34, 0.22, 0.16, 0.12, 0.09, 0.07, 0.06, 0.05, 0.05, 0.04, 0.04, 0.03, 0.03, 0.03, 0.02, 0.02, 0.02, 0.02, 0.02],
    synth: { grains: 2, spread: 0.035, freq: 5200, q: 0.9, decay: 0.07, gain: 0.9 },
  },
  {
    id: 'brisket',
    no: '02',
    line: 'Beef Crisps',
    cut: 'Brisket',
    cutJa: 'ブリスケット',
    sound: 'Zaku',
    kana: 'ザクッ',
    soundLine: 'The deep crunch',
    colorName: 'Karashi',
    bg: palette.karashi,
    ink: palette.sumi,
    weight: '40 g', // confirm
    blurb:
      'Long grain, deep crunch. It breaks in layers — zaku, zaku — and stays beefy all the way down.',
    notes: ['Deep', 'Roasty', 'Long'],
    pair: 'A cold lager.',
    meters: { loud: 4, rich: 4, light: 2 },
    wave: [0.08, 0.7, 0.45, 0.2, 0.85, 0.5, 0.25, 0.62, 0.4, 0.2, 0.74, 0.44, 0.22, 0.5, 0.3, 0.16, 0.36, 0.2, 0.12, 0.2, 0.1, 0.07, 0.05, 0.04],
    synth: { grains: 7, spread: 0.26, freq: 1900, q: 0.7, decay: 0.06, gain: 0.8 },
  },
  {
    id: 'sirloin',
    no: '03',
    line: 'Beef Crisps',
    cut: 'Sirloin',
    cutJa: 'サーロイン',
    sound: 'Saku',
    kana: 'サクッ',
    soundLine: 'The light crisp',
    colorName: 'Shio',
    bg: palette.shio,
    ink: palette.shu,
    weight: '40 g', // confirm
    blurb:
      'The light one. Lean, airy, gone before you have decided to have another. You will have another.',
    notes: ['Clean', 'Bright', 'Salt-forward'],
    pair: 'Anything sparkling.',
    meters: { loud: 3, rich: 2, light: 5 },
    wave: [0.05, 0.34, 0.5, 0.42, 0.3, 0.38, 0.28, 0.2, 0.26, 0.18, 0.14, 0.18, 0.12, 0.1, 0.12, 0.08, 0.07, 0.08, 0.05, 0.05, 0.04, 0.03, 0.03, 0.02],
    synth: { grains: 5, spread: 0.12, freq: 3600, q: 0.5, decay: 0.035, gain: 0.55 },
  },
  {
    id: 'shortrib',
    no: '04',
    line: 'Beef Crisps',
    cut: 'Short Rib',
    cutJa: 'カルビ',
    sound: 'Kari',
    kana: 'カリッ',
    soundLine: 'The hard crackle',
    colorName: 'Kuro',
    bg: palette.kuro,
    ink: palette.shu,
    weight: '40 g', // confirm
    blurb:
      'The dark one. Dense with flavour, with a hard caramel crackle right at the edge. Eat it slowly. You will not.',
    notes: ['Dark', 'Sweet-savoury', 'Crackly'],
    pair: 'Whisky, neat.',
    meters: { loud: 5, rich: 4, light: 2 },
    wave: [0.05, 0.08, 0.95, 0.6, 0.24, 0.12, 0.08, 0.06, 1, 0.7, 0.36, 0.2, 0.12, 0.08, 0.06, 0.05, 0.04, 0.04, 0.03, 0.03, 0.02, 0.02, 0.02, 0.02],
    synth: { grains: 3, spread: 0.11, freq: 4300, q: 1.6, decay: 0.05, gain: 0.95 },
  },
  {
    id: 'jerky',
    no: '05',
    line: 'Beef Jerky',
    cut: 'Jerky',
    cutJa: 'ジャーキー',
    sound: 'Gyu',
    kana: 'ギュッ',
    soundLine: 'The slow chew',
    colorName: 'Ai',
    bg: palette.ai,
    ink: palette.bone,
    weight: '60 g', // confirm
    blurb:
      'Not a crisp. A commitment. Thick-cut and slow-dried, with a tight chew that keeps on giving. Gyū means beef. Gyu is the sound of flavour packed in tight. Same word, basically.',
    notes: ['Dense', 'Savoury', 'Endless'],
    pair: 'A long walk home.',
    meters: { loud: 1, rich: 5, light: 1 },
    wave: [0.04, 0.1, 0.18, 0.26, 0.32, 0.36, 0.4, 0.42, 0.44, 0.44, 0.43, 0.42, 0.4, 0.38, 0.36, 0.33, 0.3, 0.26, 0.22, 0.18, 0.14, 0.1, 0.07, 0.04],
    synth: { grains: 1, spread: 0, freq: 420, q: 0.6, decay: 0.42, gain: 0.5 },
  },
];

/** Body-copy colour on each cut's panel (display type uses `ink`; small text needs more contrast). */
const TEXT = { ribeye: palette.sumi, brisket: palette.sumi, sirloin: palette.sumi, shortrib: palette.bone, jerky: palette.bone };
for (const p of products) p.text = TEXT[p.id];

export const productById =Object.fromEntries(products.map((p) => [p.id, p]));
