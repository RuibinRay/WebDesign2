/**
 * The scroll-driven hero: ONE continuous 4K shot that the visitor scrubs by scrolling.
 * It opens on a whole crisp, the crisp snaps, and the camera pushes through to the pack.
 *
 *   node production/scripts/render-scroll-hero.mjs            # DRY RUN: the call and the cost
 *   node production/scripts/render-scroll-hero.mjs --go       # submit the 4K job (spends credits) and return
 *   node production/scripts/render-scroll-hero.mjs --fetch    # when the job is done: download + encode
 *   node production/scripts/render-scroll-hero.mjs --encode   # re-encode from the take on disk (free)
 *
 * A 4K take can run longer than a terminal session likes, so submitting and fetching are separate
 * steps: --go records the job id in production/manifest.json and --fetch picks it up later.
 *
 * Start and end frames (production/stills.mjs: scroll-start, scroll-end) pin both ends of the shot.
 *
 * Encodes written to public/videos/ (scrubbing needs short GOPs; see the engine in
 * src/components/ScrollFilm.jsx, which loads them as blobs so every frame is seekable):
 *   scroll-hero-2160.mp4   3840×2160  for very large / high-density screens
 *   scroll-hero-1080.mp4   1920×1080  the default
 *   scroll-hero-m.mp4       900×1280  a portrait crop of the centre, for phones. Wider than a phone
 *                           screen on purpose: the page steps the picture back at the end so the
 *                           whole pack shows (see .hero--portrait in hero-scroll.css)
 *   scroll-hero-poster.webp / scroll-hero-poster-m.webp   the first frame, shown until video paints
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { VIDEO_RULES } from '../film.mjs';
import { shellLine } from '../video-cli.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HF = process.env.HF_BIN || 'higgsfield';
const MANIFEST = path.join(ROOT, 'production/manifest.json');
const START = path.join(ROOT, 'production/renders/stills/scroll-start.png');
const END = path.join(ROOT, 'production/renders/stills/scroll-end.png');
const TAKE = path.join(ROOT, 'production/renders/video/scroll-hero_take.mp4');
const PUB = path.join(ROOT, 'public/videos');
// Seedance 2.0 is the model that renders native 4K here. Seedance 2.5 quotes a 4K price but its
// 4K jobs were refused ("Not found") on 2026-11-13.
const MODEL = 'seedance_2_0';
const DURATION = 10;
const RESOLUTION = '4k';
const CREDITS_PER_SECOND = 22; // measured 2026-11-13
const argv = process.argv.slice(2);

export const SCROLL_HERO_PROMPT =
  'One continuous shot in extreme slow motion with a slow, steady push-in at constant speed. ' +
  'First the whole paper-thin beef crisp hangs in the air, turning very slightly, glowing in the warm backlight. ' +
  'Then a crack runs across it and it snaps cleanly in two; the two halves and a burst of small shards and salt crystals drift outward toward the edges of the frame. ' +
  'The camera keeps pushing forward through the gap between the halves while the focus moves to the red box behind, which becomes sharp and bright in the centre of the frame; ' +
  'the last shards and salt settle on the black stone at its base. The box never moves and its artwork never changes. ' +
  'Locked exposure, very little motion blur, every frame sharp. ' +
  VIDEO_RULES;

const exec = (bin, args) =>
  new Promise((resolve, reject) => {
    const c = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '';
    let e = '';
    c.stdout.on('data', (d) => (o += d));
    c.stderr.on('data', (d) => (e += d));
    c.on('error', reject);
    c.on('close', (code) => (code === 0 ? resolve(o) : reject(new Error((e || o).trim().slice(-600)))));
  });
const ffmpeg = (args) => exec('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
const readManifest = () => ({ stills: {}, video: {}, audio: {}, ...(fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {}) });
const record = (entry) => {
  const m = readManifest();
  m.video = { ...m.video, 'scroll-hero': { ...(m.video['scroll-hero'] || {}), ...entry } };
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
};
const mb = (f) => (fs.statSync(f).size / 1e6).toFixed(1) + ' MB';

async function encode() {
  if (!fs.existsSync(TAKE)) throw new Error('no take on disk: run --go, then --fetch');
  fs.mkdirSync(PUB, { recursive: true });
  const common = ['-an', '-c:v', 'libx264', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-sc_threshold', '0', '-movflags', '+faststart'];
  const out = (n) => path.join(PUB, n);
  // The pack at the end of the shot is 30% of the frame wide; this crop keeps it whole with air around it.
  const PORTRAIT = 'crop=1520:2160,scale=900:1280:flags=lanczos';
  // 4K: only very large screens fetch this one
  await ffmpeg(['-i', TAKE, '-vf', 'fps=24,scale=3840:2160:flags=lanczos', ...common, '-crf', '24', '-g', '8', out('scroll-hero-2160.mp4')]);
  // 1080p: the default; a light unsharp counters the softness of the downscale
  await ffmpeg(['-i', TAKE, '-vf', 'fps=24,scale=1920:1080:flags=lanczos,unsharp=3:3:0.4', ...common, '-crf', '20', '-g', '8', out('scroll-hero-1080.mp4')]);
  // phones: a portrait window cut from the centre of the 4K frame, so no second generation is needed
  await ffmpeg(['-i', TAKE, '-vf', `fps=24,${PORTRAIT},unsharp=3:3:0.3`, ...common, '-crf', '24', '-g', '4', out('scroll-hero-m.mp4')]);
  await ffmpeg(['-i', TAKE, '-frames:v', '1', '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libwebp', '-q:v', '82', out('scroll-hero-poster.webp')]);
  await ffmpeg(['-i', TAKE, '-frames:v', '1', '-vf', PORTRAIT, '-c:v', 'libwebp', '-q:v', '80', out('scroll-hero-poster-m.webp')]);
  for (const n of ['scroll-hero-2160.mp4', 'scroll-hero-1080.mp4', 'scroll-hero-m.mp4', 'scroll-hero-poster.webp', 'scroll-hero-poster-m.webp']) console.log(`  ${n.padEnd(28)} ${mb(out(n))}`);
  console.log('Encoded. Restart the dev server or rebuild so the site switches the scroll hero on.');
}

if (argv.includes('--encode')) {
  await encode();
  process.exit(0);
}

if (argv.includes('--fetch')) {
  const rec = readManifest().video['scroll-hero'];
  if (!rec?.job_id) {
    console.error('No submitted job on record. Run with --go first.');
    process.exit(1);
  }
  const got = JSON.parse(await exec(HF, ['generate', 'get', rec.job_id, '--json']));
  const job = Array.isArray(got) ? got[0] : got;
  if (!/completed/i.test(job.status)) {
    console.log(`Job ${rec.job_id.slice(0, 8)} is "${job.status}". Try again in a minute.`);
    process.exit(/failed|cancel|nsfw/i.test(job.status) ? 1 : 3);
  }
  if (!job.result_url) throw new Error('job completed without a result url');
  fs.mkdirSync(path.dirname(TAKE), { recursive: true });
  if (fs.existsSync(TAKE)) {
    let n = 1;
    while (fs.existsSync(TAKE.replace('.mp4', `_v${n}.mp4`))) n++;
    fs.renameSync(TAKE, TAKE.replace('.mp4', `_v${n}.mp4`));
  }
  const res = await fetch(job.result_url);
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  fs.writeFileSync(TAKE, Buffer.from(await res.arrayBuffer()));
  record({ status: 'done', local_path: path.relative(ROOT, TAKE).replaceAll('\\', '/'), at: new Date().toISOString() });
  console.log(`Take downloaded: ${path.relative(ROOT, TAKE).replaceAll('\\', '/')}  (${mb(TAKE)})`);
  await encode();
  process.exit(0);
}

for (const f of [START, END]) {
  if (!fs.existsSync(f)) {
    console.error(`Missing ${path.relative(ROOT, f)}. Generate it first: node production/scripts/generate.mjs scroll-start scroll-end`);
    process.exit(1);
  }
}
const args = [
  'generate', 'create', MODEL,
  '--prompt', SCROLL_HERO_PROMPT,
  '--mode', 'std',
  '--start-image', START,
  '--end-image', END,
  '--duration', String(DURATION),
  '--resolution', RESOLUTION,
  '--aspect_ratio', '16:9',
  '--bitrate_mode', 'high',
  '--generate_audio', 'false',
  '--json',
];
console.log(`Scroll hero: ${MODEL}, ${RESOLUTION}, ${DURATION} s, first and last frames pinned — about ${DURATION * CREDITS_PER_SECOND} credits.`);
if (!argv.includes('--go')) {
  console.log('\n' + shellLine(HF, args.map((a) => (a === START || a === END ? path.relative(ROOT, a).replaceAll('\\', '/') : a))));
  console.log('\nDRY RUN — nothing was sent. Add --go to submit.');
  process.exit(0);
}
// Upload the two 4K frames first and pass their ids: letting `generate create` upload two
// 10 MB files itself failed with "Not found" on 2026-11-13.
const upload = async (file) => {
  const j = JSON.parse(await exec(HF, ['upload', 'create', file, '--json']));
  if (!j.id) throw new Error('upload returned no id for ' + path.basename(file));
  return j.id;
};
const startId = await upload(START);
const endId = await upload(END);
const sendArgs = args.map((a) => (a === START ? startId : a === END ? endId : a));
const raw = await exec(HF, sendArgs);
const id = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0];
if (!id) throw new Error('could not read a job id from: ' + raw.slice(0, 300));
record({
  status: 'submitted',
  model: MODEL,
  params: { resolution: RESOLUTION, duration: DURATION, aspect: '16:9', bitrate_mode: 'high' },
  start: 'scroll-start',
  end: 'scroll-end',
  prompt: SCROLL_HERO_PROMPT,
  job_id: id,
  credits_estimate: DURATION * CREDITS_PER_SECOND,
  submitted_at: new Date().toISOString(),
});
console.log(`Submitted: job ${id}. When it finishes: node production/scripts/render-scroll-hero.mjs --fetch`);
