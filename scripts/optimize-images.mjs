/**
 * Turns generated masters (production/renders/stills/<id>.png) into the
 * responsive WebP set the site loads (src/assets/images/<id>-<width>.webp),
 * plus the social card (public/og.jpg).
 *
 * The site discovers these files by name at build time, so a frame that was a
 * "pending" placeholder becomes the real picture as soon as its files exist:
 *
 *   node production/scripts/generate.mjs <id>   →   npm run images   →   done
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'production/renders/stills');
const OUT = path.join(ROOT, 'src/assets/images');
const WIDTHS = [640, 1024, 1600, 2048];

/** Per-image fixes. `inset` trims a fraction off every edge (frame-line artefacts). */
const FIX = {
  hero: { inset: 0.022 },
  'hero-mobile': { inset: 0.022 },
};

fs.mkdirSync(OUT, { recursive: true });
const masters = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/_v\d+\./.test(f) && !/^(kf|f|cast|scroll)-/.test(f)) : [];

for (const file of masters) {
  const id = file.replace(/\.[^.]+$/, '');
  let img = sharp(path.join(SRC, file));
  const meta = await img.metadata();
  let { width, height } = meta;
  const fix = FIX[id];
  if (fix?.inset) {
    const dx = Math.round(width * fix.inset);
    const dy = Math.round(height * fix.inset);
    img = img.extract({ left: dx, top: dy, width: width - dx * 2, height: height - dy * 2 });
    width -= dx * 2;
    height -= dy * 2;
  }
  const buf = await img.toBuffer();
  const made = [];
  for (const w of WIDTHS) {
    const tw = Math.min(w, width);
    if (made.includes(tw)) continue;
    made.push(tw);
    await sharp(buf)
      .resize({ width: tw })
      .webp({ quality: tw >= 1600 ? 78 : 80, effort: 5 })
      .toFile(path.join(OUT, `${id}-${tw}.webp`));
  }
  console.log(`✓ ${id.padEnd(22)} ${width}×${height}  →  ${made.join(', ')}`);
}

/* social card: hero + lockup */
const heroMaster = path.join(SRC, 'hero.png');
if (fs.existsSync(heroMaster)) {
  const lockup = fs.readFileSync(path.join(ROOT, 'src/assets/brand/rica-lockup.svg'), 'utf8').replace('fill="currentColor"', 'fill="#F2ECE1"');
  const m = await sharp(heroMaster).metadata();
  const base = await sharp(heroMaster)
    .extract({ left: Math.round(m.width * 0.03), top: Math.round(m.height * 0.03), width: Math.round(m.width * 0.94), height: Math.round(m.height * 0.94) })
    .resize(1200, 630, { fit: 'cover', position: 'right' })
    .toBuffer();
  const mark = await sharp(Buffer.from(lockup), { density: 200 }).resize({ width: 430 }).png().toBuffer();
  await sharp(base)
    .composite([{ input: mark, left: 72, top: 215 }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(ROOT, 'public/og.jpg'));
  console.log('✓ public/og.jpg');
}
if (!masters.length) console.log('no masters found in production/renders/stills');
