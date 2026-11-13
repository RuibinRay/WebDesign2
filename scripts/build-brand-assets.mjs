/**
 * Builds every vector brand asset from the type itself, so the logo and the
 * pack artwork are font-independent (pure outlines) and identical everywhere:
 *
 *   src/assets/brand/rica-wordmark.svg      — the snapped wordmark (currentColor)
 *   src/assets/brand/rica-lockup.svg        — wordmark + BEEF + リカビーフ
 *   src/assets/brand/rica-seal.svg          — round リカ seal
 *   src/assets/brand/packs/pack-<id>.svg    — pack front artwork per cut
 *   public/favicon.svg
 *   production/refs/pack-<id>.png           — reference images for AI generation
 *   production/refs/pack-sheet.png          — all five fronts on one sheet
 *   production/refs/logo-preview.png        — QA preview
 *
 * Run: npm run brand
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { products, palette } from '../src/data/products.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FS = path.join(ROOT, 'node_modules', '@fontsource');
const load = (p) => {
  const b = fs.readFileSync(p);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const delaL = load(path.join(FS, 'dela-gothic-one/files/dela-gothic-one-latin-400-normal.woff'));
const delaJ = load(path.join(FS, 'dela-gothic-one/files/dela-gothic-one-japanese-400-normal.woff'));
const mono = load(path.join(FS, 'dm-mono/files/dm-mono-latin-500-normal.woff'));

const out = (rel, data) => {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
  return f;
};
const r = (n) => Math.round(n * 100) / 100;

/** Serialise an opentype.js path ourselves (its own toPathData can emit NaN on repeated points). */
function pd(p) {
  let out = "";
  let px = null;
  let py = null;
  for (const c of p.commands) {
    if (c.type === "M") out += `M${r(c.x)} ${r(c.y)}`;
    else if (c.type === "L") {
      if (c.x === px && c.y === py) continue;
      out += `L${r(c.x)} ${r(c.y)}`;
    } else if (c.type === "Q") out += `Q${r(c.x1)} ${r(c.y1)} ${r(c.x)} ${r(c.y)}`;
    else if (c.type === "C") out += `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${r(c.x)} ${r(c.y)}`;
    else if (c.type === "Z") out += "Z";
    if (c.x !== undefined) {
      px = c.x;
      py = c.y;
    }
  }
  return out;
}

/** Outline a run of text. Returns { d, w, box } with the run starting at x=0, baseline y=0. */
function run(font, text, size, tracking = 0) {
  let x = 0;
  const parts = [];
  let box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  for (const ch of [...text]) {
    const g = font.charToGlyph(ch);
    const p = g.getPath(x, 0, size);
    const b = p.getBoundingBox();
    if (p.commands.length) {
      parts.push(pd(p));
      box = { x1: Math.min(box.x1, b.x1), y1: Math.min(box.y1, b.y1), x2: Math.max(box.x2, b.x2), y2: Math.max(box.y2, b.y2) };
    }
    x += (g.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  return { d: parts.join(''), w: x - tracking, box };
}

/** A single glyph outlined and normalised so its ink box starts at 0,0. */
function glyph(font, ch, size) {
  const p = font.charToGlyph(ch).getPath(0, 0, size);
  const b = p.getBoundingBox();
  return { d: pd(p), box: b, w: b.x2 - b.x1, h: b.y2 - b.y1 };
}

/* ───────────────────────── 1. WORDMARK — snapped in two ───────────────────────── */
const WM_SIZE = 240;
const wm = run(delaL, 'RICA', WM_SIZE, -4);
const wmW = wm.box.x2 - wm.box.x1;
const wmH = wm.box.y2 - wm.box.y1;
const PAD = 14;
const VBW = wmW + PAD * 2 + 10;
const VBH = wmH + PAD * 2 + 12;
const ox = PAD - wm.box.x1;
const oy = PAD - wm.box.y1;

// The crack: a jagged line through the bowl of the C. Left piece stays, right piece drops.
const cx = wmW * 0.565; // where it crosses, as a share of the ink width
const crack = [
  [cx + 34, -30],
  [cx + 12, wmH * 0.2],
  [cx + 30, wmH * 0.36],
  [cx - 6, wmH * 0.55],
  [cx + 14, wmH * 0.72],
  [cx - 22, wmH + 40],
].map(([x, y]) => [r(x + PAD), r(y + PAD)]);
const gap = 3.2;
const leftPoly = [[-50, -50], ...crack.map(([x, y]) => [r(x - gap), y]), [-50, VBH + 50]];
const rightPoly = [[VBW + 80, -50], ...crack.map(([x, y]) => [r(x + gap), y]), [VBW + 80, VBH + 50]];
const pts = (a) => a.map((p) => p.join(',')).join(' ');
const SNAP = 'translate(5 9) rotate(1.6 ' + r(VBW * 0.6) + ' ' + r(VBH * 0.5) + ')';

const wordmarkInner = (id = 'w') => `
  <defs>
    <clipPath id="${id}-l"><polygon points="${pts(leftPoly)}"/></clipPath>
    <clipPath id="${id}-r"><polygon points="${pts(rightPoly)}"/></clipPath>
  </defs>
  <g clip-path="url(#${id}-l)"><path transform="translate(${r(ox)} ${r(oy)})" d="${wm.d}"/></g>
  <g transform="${SNAP}"><g clip-path="url(#${id}-r)"><path transform="translate(${r(ox)} ${r(oy)})" d="${wm.d}"/></g></g>`;

const wordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(VBW)} ${r(VBH)}" fill="currentColor" role="img" aria-label="Rica">${wordmarkInner('w')}
</svg>
`;
out('src/assets/brand/rica-wordmark.svg', wordmarkSvg);

/* ───────────────────────── 2. LOCKUP ───────────────────────── */
const beef = run(mono, 'BEEF', 44, 30);
const kanaLock = run(delaJ, 'リカビーフ', 30, 8);
const LW = VBW;
const LH = VBH + 78;
const lockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(LW)} ${r(LH)}" fill="currentColor" role="img" aria-label="Rica Beef">${wordmarkInner('k')}
  <rect x="${PAD}" y="${r(VBH + 6)}" width="${r(wmW)}" height="2.5"/>
  <path transform="translate(${r(PAD - beef.box.x1)} ${r(VBH + 62)})" d="${beef.d}"/>
  <path transform="translate(${r(PAD + wmW - kanaLock.box.x2)} ${r(VBH + 60)})" d="${kanaLock.d}"/>
</svg>
`;
out('src/assets/brand/rica-lockup.svg', lockupSvg);

/* ───────────────────────── 3. SEAL ───────────────────────── */
const ri = glyph(delaJ, 'リ', 78);
const ka = glyph(delaJ, 'カ', 78);
const sealSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Rica seal">
  <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width="7"/>
  <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <g fill="currentColor">
    <path transform="translate(${r(100 - ri.w / 2 - ri.box.x1)} ${r(92 - ri.box.y2)})" d="${ri.d}"/>
    <path transform="translate(${r(100 - ka.w / 2 - ka.box.x1)} ${r(102 - ka.box.y1)})" d="${ka.d}"/>
  </g>
</svg>
`;
out('src/assets/brand/rica-seal.svg', sealSvg);

/* ───────────────────────── 4. FAVICON ───────────────────────── */
const R = glyph(delaL, 'R', 150);
const favSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs><clipPath id="a"><polygon points="0,0 132,0 108,70 126,112 84,200 0,200"/></clipPath><clipPath id="b"><polygon points="140,0 200,0 200,200 92,200 134,112 116,70"/></clipPath></defs>
  <rect width="200" height="200" rx="44" fill="${palette.shu}"/>
  <g fill="${palette.bone}">
    <g clip-path="url(#a)"><path transform="translate(${r(100 - R.w / 2 - R.box.x1)} ${r(100 + R.h / 2 - R.box.y2)})" d="${R.d}"/></g>
    <g transform="translate(3 6)"><g clip-path="url(#b)"><path transform="translate(${r(100 - R.w / 2 - R.box.x1)} ${r(100 + R.h / 2 - R.box.y2)})" d="${R.d}"/></g></g>
  </g>
</svg>
`;
out('public/favicon.svg', favSvg);

/* ───────────────────────── 5. PACK FRONT ARTWORK ───────────────────────── */
const PW = 800;
const PH = 1200;
const M = 62;

function packSvg(p, { standalone = true } = {}) {
  const ink = p.ink;
  // top: wordmark left, line right
  const s = 0.26; // wordmark scale
  const lineTxt = run(mono, p.line.toUpperCase(), 21, 5);
  const noTxt = run(mono, `CUT ${p.no}`, 21, 5);

  // centre: vertical sound word
  const chars = [...p.kana];
  const KS = 318;
  const cells = chars.map((ch) => {
    const small = 'ッャュョァィゥェォ'.includes(ch);
    const g = glyph(delaJ, ch, small ? KS * 0.98 : KS);
    return { ...g, small };
  });
  const gapY = 20;
  const totalH = cells.reduce((a, c) => a + c.h, 0) + gapY * (cells.length - 1);
  const top = 196;
  const avail = 936 - top;
  const k = Math.min(1, avail / totalH);
  let y = top + (avail - totalH * k) / 2;
  const colCx = PW / 2;
  const widest = Math.max(...cells.filter((c) => !c.small).map((c) => c.w));
  const kanaPaths = cells
    .map((c) => {
      // small kana hugs the right edge of the column, as in vertical setting
      const x = c.small ? colCx + (widest * k) / 2 - c.w * k : colCx - (c.w * k) / 2;
      const t = `translate(${r(x - c.box.x1 * k)} ${r(y - c.box.y1 * k)}) scale(${r(k)})`;
      y += c.h * k + gapY;
      return `<path transform="${t}" d="${c.d}"/>`;
    })
    .join('\n    ');

  // bottom: cut name, kana, weight, waveform
  let cutSize = 92;
  let cut = run(delaL, p.cut.toUpperCase(), cutSize, -1);
  const maxCutW = 440;
  if (cut.box.x2 - cut.box.x1 > maxCutW) {
    cutSize = (cutSize * maxCutW) / (cut.box.x2 - cut.box.x1);
    cut = run(delaL, p.cut.toUpperCase(), cutSize, -1);
  }
  const cutJa = run(delaJ, p.cutJa, 30, 5);
  const wt = run(mono, p.weight.toUpperCase(), 21, 4);
  const snd = run(mono, `${p.sound.toUpperCase()} — ${p.soundLine.toUpperCase()}`, 17, 3.4);

  const bars = p.wave
    .map((v, i) => {
      const bw = 5.2;
      const step = 8.6;
      const h = Math.max(3, v * 84);
      const x = PW - M - p.wave.length * step + i * step + (step - bw);
      return `<rect x="${r(x)}" y="${r(1118 - h)}" width="${bw}" height="${r(h)}"/>`;
    })
    .join('');

  const body = `
  <rect width="${PW}" height="${PH}" fill="${p.bg}"/>
  <g fill="${ink}">
    <g transform="translate(${M - PAD * s} ${58}) scale(${s})">${wordmarkInner('p' + p.id)}</g>
    <path transform="translate(${r(PW - M - lineTxt.box.x2)} 92)" d="${lineTxt.d}"/>
    <path transform="translate(${r(PW - M - noTxt.box.x2)} 124)" d="${noTxt.d}"/>
    <rect x="${M}" y="156" width="${PW - M * 2}" height="3"/>
    ${kanaPaths}
    <rect x="${M}" y="962" width="${PW - M * 2}" height="3"/>
    <path transform="translate(${r(M - snd.box.x1)} 1004)" d="${snd.d}"/>
    <path transform="translate(${r(M - cut.box.x1)} ${r(1118)})" d="${cut.d}"/>
    <path transform="translate(${r(M - cutJa.box.x1)} 1160)" d="${cutJa.d}"/>
    <path transform="translate(${r(PW - M - wt.box.x2)} 1160)" d="${wt.d}"/>
    ${bars}
  </g>`;
  return standalone
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}" role="img" aria-label="Rica Beef ${p.cut} pack front">${body}\n</svg>\n`
    : body;
}

const pngJobs = [];
for (const p of products) {
  const svg = packSvg(p);
  out(`src/assets/brand/packs/pack-${p.id}.svg`, svg);
  const png = path.join(ROOT, `production/refs/pack-${p.id}.png`);
  fs.mkdirSync(path.dirname(png), { recursive: true });
  pngJobs.push(sharp(Buffer.from(svg), { density: 144 }).resize(1200, 1800).png().toFile(png));
}

// reference sheet: five fronts, flat, on neutral grey
const SH_GAP = 70;
const SH_W = products.length * PW + (products.length + 1) * SH_GAP;
const SH_H = PH + SH_GAP * 2;
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SH_W} ${SH_H}">
  <rect width="${SH_W}" height="${SH_H}" fill="#8f8d89"/>
  ${products.map((p, i) => `<g transform="translate(${SH_GAP + i * (PW + SH_GAP)} ${SH_GAP})">${packSvg(p, { standalone: false })}</g>`).join('\n')}
</svg>`;
pngJobs.push(sharp(Buffer.from(sheet), { density: 96 }).resize(3000).png().toFile(path.join(ROOT, 'production/refs/pack-sheet.png')));

// logo QA preview
const prev = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 700">
  <rect width="800" height="700" fill="${palette.bone}"/><rect x="800" width="800" height="700" fill="${palette.shu}"/>
  <g transform="translate(90 150) scale(0.86)" fill="${palette.sumi}">${lockupSvg.replace(/<\/?svg[^>]*>/g, '')}</g>
  <g transform="translate(890 190) scale(0.86)" fill="${palette.bone}">${wordmarkSvg.replace(/<\/?svg[^>]*>/g, '').replaceAll('w-', 'x-')}</g>
  <g transform="translate(1380 470) scale(0.8)" color="${palette.bone}">${sealSvg.replace(/<\/?svg[^>]*>/g, '').replaceAll('currentColor', palette.bone)}</g>
</svg>`;
pngJobs.push(sharp(Buffer.from(prev)).png().toFile(path.join(ROOT, 'production/refs/logo-preview.png')));

await Promise.all(pngJobs);
console.log('brand assets built:', { wordmark: `${r(VBW)}×${r(VBH)}`, packs: products.length });
