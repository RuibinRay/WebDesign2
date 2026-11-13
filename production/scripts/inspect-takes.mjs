/**
 * Look at the rendered takes before cutting: for each one, print its length and where the
 * action is (the frame-to-frame motion curve), and write a frame sheet to production/edit/review/.
 * Use the "peak" time to choose in-points for production/edit/cuts.json.
 *
 *   node production/scripts/inspect-takes.mjs            # every take
 *   node production/scripts/inspect-takes.mjs S06 S07    # takes whose name starts with these
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = path.join(ROOT, 'production/renders/video');
const REVIEW = path.join(ROOT, 'production/edit/review');
const W = 96;
const H = 54;
const FPS = 24;
const want = process.argv.slice(2);

const run = (bin, args, binary = false) =>
  new Promise((resolve, reject) => {
    const c = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = [];
    let e = '';
    c.stdout.on('data', (d) => chunks.push(d));
    c.stderr.on('data', (d) => (e += d));
    c.on('error', reject);
    c.on('close', (code) => (code === 0 ? resolve(binary ? Buffer.concat(chunks) : Buffer.concat(chunks).toString()) : reject(new Error(e.slice(-300)))));
  });

fs.mkdirSync(REVIEW, { recursive: true });
const files = fs
  .readdirSync(DIR)
  .filter((f) => /\.mp4$/.test(f) && !/_v\d+\.mp4$/.test(f) && (!want.length || want.some((w) => f.startsWith(w))))
  .sort();

for (const f of files) {
  const file = path.join(DIR, f);
  const raw = await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', file, '-vf', `fps=${FPS},scale=${W}:${H},format=gray`, '-f', 'rawvideo', '-'], true);
  const n = Math.floor(raw.length / (W * H));
  const energy = [];
  for (let i = 1; i < n; i++) {
    let sum = 0;
    const a = (i - 1) * W * H;
    const b = i * W * H;
    for (let p = 0; p < W * H; p++) sum += Math.abs(raw[b + p] - raw[a + p]);
    energy.push(sum / (W * H));
  }
  const max = Math.max(...energy);
  const peak = energy.indexOf(max) + 1;
  const mean = energy.reduce((a, b) => a + b, 0) / energy.length;
  const onset = energy.findIndex((v) => v > mean + (max - mean) * 0.5) + 1;
  // coarse curve: one character per quarter second
  const bars = ' ▁▂▃▄▅▆▇█';
  let curve = '';
  for (let i = 0; i < energy.length; i += 6) {
    const v = Math.max(...energy.slice(i, i + 6));
    curve += bars[Math.min(8, Math.round((v / max) * 8))];
  }
  console.log(`${f.replace('.mp4', '').padEnd(14)} ${(n / FPS).toFixed(2)} s   peak ${(peak / FPS).toFixed(2)} s   onset ${(onset / FPS).toFixed(2)} s   motion ${mean.toFixed(2)} avg / ${max.toFixed(2)} max   |${curve}|`);
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', file, '-vf', 'fps=2,scale=480:-1,tile=5x2', '-frames:v', '1', path.join(REVIEW, f.replace('.mp4', '.jpg'))]);
}
console.log(`\nFrame sheets (2 frames per second) are in ${path.relative(ROOT, REVIEW).replaceAll('\\', '/')}/`);
