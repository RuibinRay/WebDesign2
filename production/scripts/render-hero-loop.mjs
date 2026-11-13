/**
 * The website's hero background: the hero still, brought to life and made to loop.
 *
 *   node production/scripts/render-hero-loop.mjs            # DRY RUN: shows the call and the cost
 *   node production/scripts/render-hero-loop.mjs --go       # render the take (spends credits), then build the loop
 *   node production/scripts/render-hero-loop.mjs --loop     # rebuild the loop from the existing take (free)
 *
 * 1. Trims the frame-line artefacts off production/renders/stills/hero.png (same inset the site uses).
 * 2. Animates it image-to-video with the film's model: slow, locked-off, nothing but drifting crisps and salt.
 * 3. Cross-fades the tail of the take into its head so the loop has no visible seam, and writes
 *    public/videos/hero-loop.mp4 (H.264, no audio, +faststart). The site switches it on automatically.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { film, VIDEO_RULES } from '../film.mjs';
import { videoArgs, shellLine } from '../video-cli.mjs';
import { videoPrice } from '../prices.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HF = process.env.HF_BIN || 'higgsfield';
const MANIFEST = path.join(ROOT, 'production/manifest.json');
const STILL = path.join(ROOT, 'production/renders/stills/hero.png');
const START = path.join(ROOT, 'production/renders/stills/hero-loop-start.png');
const TAKE = path.join(ROOT, 'production/renders/video/hero-loop_take.mp4');
const OUT = path.join(ROOT, 'public/videos/hero-loop.mp4');
const DURATION = 6;
const FADE = 1.2; // seconds of tail folded into the head
const argv = process.argv.slice(2);

export const HERO_LOOP_PROMPT =
  'Extreme slow motion, locked-off camera. The paper-thin beef crisps hang and turn very slowly in the air; the coarse salt crystals drift ' +
  'downward and sparkle as they pass through the warm key light. Calm, continuous, weightless motion with no sudden events. ' +
  'The left third of the frame stays black and empty. ' +
  VIDEO_RULES;

const exec = (bin, args) =>
  new Promise((resolve, reject) => {
    const c = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '';
    let e = '';
    c.stdout.on('data', (d) => (o += d));
    c.stderr.on('data', (d) => (e += d));
    c.on('error', reject);
    c.on('close', (code) => (code === 0 ? resolve(o) : reject(new Error((e || o).trim().slice(-500)))));
  });

async function makeStart() {
  const m = await sharp(STILL).metadata();
  const dx = Math.round(m.width * 0.022);
  const dy = Math.round(m.height * 0.022);
  await sharp(STILL)
    .extract({ left: dx, top: dy, width: m.width - dx * 2, height: m.height - dy * 2 })
    .resize(1920, 1080, { fit: 'cover' })
    .png()
    .toFile(START);
}

async function buildLoop() {
  if (!fs.existsSync(TAKE)) throw new Error('no take yet: run with --go first');
  const dur = Number((await exec('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', TAKE])).trim());
  const body = dur - FADE;
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  // head = [0, FADE) cross-faded in from the tail [body, dur); then the untouched middle [FADE, body)
  await exec('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', TAKE,
    '-filter_complex',
    // delogo paints out the small red flare the hero still carries in its top-left corner
    `[0:v]fps=24,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,delogo=x=36:y=1:w=160:h=80,format=yuv420p,split=3[a][b][c];` +
      `[a]trim=${body.toFixed(3)}:${dur.toFixed(3)},setpts=PTS-STARTPTS[tail];` +
      `[b]trim=0:${FADE},setpts=PTS-STARTPTS[head];` +
      `[c]trim=${FADE}:${body.toFixed(3)},setpts=PTS-STARTPTS[mid];` +
      `[tail][head]xfade=transition=fade:duration=${FADE}:offset=0[x];` +
      `[x][mid]concat=n=2:v=1:a=0[o]`,
    '-map', '[o]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-movflags', '+faststart', OUT,
  ]);
  const size = (fs.statSync(OUT).size / 1e6).toFixed(2);
  console.log(`Loop written: public/videos/hero-loop.mp4  (${body.toFixed(2)} s, ${size} MB). Restart the dev server or rebuild to switch it on.`);
}

if (argv.includes('--loop')) {
  await buildLoop();
  process.exit(0);
}

if (!fs.existsSync(STILL)) {
  console.error('production/renders/stills/hero.png does not exist. Generate it first: node production/scripts/generate.mjs hero');
  process.exit(1);
}
await makeStart();
const resolution = film.modelParams.resolution;
const args = videoArgs({ model: film.model, resolution, prompt: HERO_LOOP_PROMPT, startImage: START, duration: DURATION });
const credits = videoPrice(film.model, resolution, DURATION);
console.log(`Hero loop: ${film.model}, ${resolution}, ${DURATION} s — about ${credits ?? '?'} credits.`);
if (!argv.includes('--go')) {
  console.log('\n' + shellLine(HF, args.map((a) => (a === START ? path.relative(ROOT, a).replaceAll('\\', '/') : a))));
  console.log('\nDRY RUN — nothing was sent. Add --go to render.');
  process.exit(0);
}

const raw = await exec(HF, args);
const json = JSON.parse(raw);
const first = Array.isArray(json) ? json[0] : json;
const url = first?.result_url || JSON.stringify(json).match(/https?:\/\/[^"\\]+?\.mp4(?:\?[^"\\]*)?/i)?.[0];
if (!url) throw new Error('no result url: ' + raw.slice(0, 300));
fs.mkdirSync(path.dirname(TAKE), { recursive: true });
if (fs.existsSync(TAKE)) {
  let n = 1;
  while (fs.existsSync(TAKE.replace('.mp4', `_v${n}.mp4`))) n++;
  fs.renameSync(TAKE, TAKE.replace('.mp4', `_v${n}.mp4`));
}
const res = await fetch(url);
if (!res.ok) throw new Error(`download failed ${res.status}`);
fs.writeFileSync(TAKE, Buffer.from(await res.arrayBuffer()));
const m = { stills: {}, video: {}, audio: {}, ...(fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {}) };
m.video['hero-loop'] = {
  status: 'done',
  model: film.model,
  params: { resolution, duration: DURATION, aspect: film.aspect },
  start: 'hero',
  prompt: HERO_LOOP_PROMPT,
  job_id: first?.id || null,
  local_path: path.relative(ROOT, TAKE).replaceAll('\\', '/'),
  credits_estimate: credits,
  at: new Date().toISOString(),
};
fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
console.log('Take downloaded: ' + path.relative(ROOT, TAKE).replaceAll('\\', '/'));
await buildLoop();
