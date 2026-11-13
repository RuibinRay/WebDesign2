/**
 * Self-hosts the brand typefaces in src/assets/fonts/ (no third-party font CDN).
 * Latin files are copied as shipped; the two Japanese faces are subset to the
 * kana blocks plus the handful of kanji the brand actually sets, which takes
 * them from ~1 MB each to a few tens of KB.
 *
 * Run: npm run fonts   (only needed if you add new Japanese characters — add them to KANJI)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NM = path.join(ROOT, 'node_modules');
const OUT = path.join(ROOT, 'src/assets/fonts');
fs.mkdirSync(OUT, { recursive: true });

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join('');
const KANA = range(0x3041, 0x3096) + range(0x30a1, 0x30fc) + '、。「」『』・ー〜　！？';
// every kanji used anywhere on the site, the packs or the film end card
const KANJI = '音牛塩薄部位日本製旨静場所終電深夜時分未';

const copy = [
  ['@fontsource/dela-gothic-one/files/dela-gothic-one-latin-400-normal.woff2', 'DelaGothicOne-latin.woff2'],
  ['@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-standard-normal.woff2', 'BodoniModa-latin-var.woff2'],
  ['@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-standard-italic.woff2', 'BodoniModa-latin-var-italic.woff2'],
  ['@fontsource-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2', 'InstrumentSans-latin-var.woff2'],
  ['@fontsource/dm-mono/files/dm-mono-latin-400-normal.woff2', 'DMMono-latin-400.woff2'],
  ['@fontsource/dm-mono/files/dm-mono-latin-500-normal.woff2', 'DMMono-latin-500.woff2'],
];
for (const [src, dst] of copy) fs.copyFileSync(path.join(NM, src), path.join(OUT, dst));

const subset = [
  ['@fontsource/dela-gothic-one/files/dela-gothic-one-japanese-400-normal.woff2', 'DelaGothicOne-jp-subset.woff2'],
  ['@fontsource/shippori-mincho/files/shippori-mincho-japanese-500-normal.woff2', 'ShipporiMincho-jp-500-subset.woff2'],
];
for (const [src, dst] of subset) {
  const buf = await subsetFont(fs.readFileSync(path.join(NM, src)), KANA + KANJI, { targetFormat: 'woff2' });
  fs.writeFileSync(path.join(OUT, dst), buf);
}

for (const f of fs.readdirSync(OUT)) console.log(String(Math.round(fs.statSync(path.join(OUT, f)).size / 1024)).padStart(5) + ' KB  ' + f);
