/**
 * Render the film shots on Higgsfield from production/film.mjs.
 * Each shot is image-to-video from its approved start frame in production/renders/stills/.
 *
 *   node production/scripts/render-film.mjs all                 # DRY RUN: commands + credit estimate, nothing sent
 *   node production/scripts/render-film.mjs all --go            # actually render (spends credits)
 *   node production/scripts/render-film.mjs S01 S05 --go        # named shots only
 *   node production/scripts/render-film.mjs S06 --go --force    # re-roll a shot (keeps the old take as _vN)
 *   node production/scripts/render-film.mjs all --model kling4_0                    # economy route
 *   node production/scripts/render-film.mjs all --model seedance_2_0 --resolution 4k  # 4K master
 *
 * It is a dry run unless --go is passed, because the full film is several hundred credits.
 * With --go it reads the account balance first and stops if the estimate does not fit.
 *
 * Needs the Higgsfield CLI, logged in (`higgsfield auth login`). Set HF_BIN if it is not on PATH.
 * Every take is recorded under `video` in production/manifest.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { film, shots } from '../film.mjs';
import { VIDEO_MODELS, jobsForShot, stillFile, videoArgs, shellLine } from '../video-cli.mjs';
import { videoPrice, REROLL } from '../prices.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HF = process.env.HF_BIN || 'higgsfield';
const MANIFEST = path.join(ROOT, 'production/manifest.json');
const OUT = path.join(ROOT, 'production/renders/video');
const CONCURRENCY = Number(process.env.HF_CONCURRENCY || 2);

/* ───────────── arguments ───────────── */
const argv = process.argv.slice(2);
const VALUE_FLAGS = ['model', 'resolution'];
const flag = (n) => {
  const i = argv.indexOf(`--${n}`);
  return i > -1 ? argv[i + 1] : undefined;
};
const has = (n) => argv.includes(`--${n}`);
const ids = argv.filter((a, i) => !a.startsWith('--') && !VALUE_FLAGS.includes((argv[i - 1] || '').replace(/^--/, '')));
const model = flag('model') || film.model;
const go = has('go') && !has('dry-run');
const force = has('force');

if (!VIDEO_MODELS[model]) {
  console.error(`Unknown video model "${model}". Known: ${Object.keys(VIDEO_MODELS).join(', ')}`);
  process.exit(1);
}
const resolution = flag('resolution') || (model === film.model ? film.modelParams.resolution : VIDEO_MODELS[model].defaultResolution);
if (!VIDEO_MODELS[model].resolutions.includes(resolution)) {
  console.error(`${model} does not offer ${resolution}. Allowed: ${VIDEO_MODELS[model].resolutions.join(', ')}`);
  process.exit(1);
}
if (!ids.length) {
  console.error('Usage: node production/scripts/render-film.mjs <shot id …|all> [--go] [--force] [--model <id>] [--resolution <r>]');
  console.error(`Shots: ${shots.filter((s) => s.video).map((s) => s.id).join(', ')}`);
  process.exit(1);
}

/* ───────────── manifest: read-modify-write, never clobber other sections ───────────── */
const readManifest = () => {
  const m = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
  return { stills: {}, video: {}, audio: {}, ...m };
};
const record = (key, entry) => {
  const m = readManifest(); // re-read: generate.mjs may have written stills in the meantime
  m.video = { ...m.video, [key]: entry };
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
};

/* ───────────── plan ───────────── */
const all = ids.includes('all');
const unknown = ids.filter((i) => i !== 'all' && !shots.some((s) => s.id === i));
if (unknown.length) console.error(`Unknown shot ids ignored: ${unknown.join(', ')}`);
const wanted = shots.filter((s) => all || ids.includes(s.id));
const manifest = readManifest();

const queue = [];
const blocked = [];
const already = [];
for (const shot of wanted) {
  if (!shot.video) {
    console.log(`· ${shot.id} "${shot.name}" is not generated (it is rendered in code by edit-film.mjs).`);
    continue;
  }
  for (const job of jobsForShot(shot, model)) {
    const startImage = stillFile(ROOT, job.start);
    if (!startImage) {
      blocked.push({ ...job, credits: videoPrice(model, resolution, job.duration) });
      continue;
    }
    const prev = manifest.video[job.key];
    if (!force && prev?.status === 'done' && fs.existsSync(path.join(ROOT, prev.local_path))) {
      already.push(job);
      continue;
    }
    const credits = videoPrice(model, resolution, job.duration);
    queue.push({ ...job, startImage, credits, args: videoArgs({ model, resolution, prompt: job.prompt, startImage, duration: job.duration }) });
  }
}

const total = queue.reduce((a, j) => a + (j.credits ?? 0), 0);
const unpriced = queue.some((j) => j.credits == null);

console.log(`\nRICA "${film.title}" — ${VIDEO_MODELS[model].label} (${model}), ${resolution}, ${film.aspect}`);
console.log('─'.repeat(72));
for (const j of queue) console.log(`  ${j.key.padEnd(14)} ${String(j.duration).padStart(2)} s   ${j.credits == null ? '   ?' : j.credits.toFixed(2).padStart(7)} cr   start: ${j.start}`);
for (const j of already) console.log(`  ${j.key.padEnd(14)} already rendered — pass --force to re-roll`);
for (const j of blocked) console.log(`  ${j.key.padEnd(14)} ${String(j.duration).padStart(2)} s   ${j.credits == null ? '   ?' : j.credits.toFixed(2).padStart(7)} cr   BLOCKED — start frame "${j.start}" does not exist yet`);
console.log('─'.repeat(72));
console.log(`  Ready now: ${queue.length} take(s), ${queue.reduce((a, j) => a + j.duration, 0)} s of footage, estimate ${total.toFixed(2)} credits${unpriced ? ' (+ unpriced takes)' : ''}`);
console.log(`  Allow ×${REROLL} for re-rolls: about ${(total * REROLL).toFixed(0)} credits.`);
if (blocked.length) {
  const bt = blocked.reduce((a, j) => a + (j.credits ?? 0), 0);
  console.log(`  Blocked: ${blocked.length} take(s), ${blocked.reduce((a, j) => a + j.duration, 0)} s, a further ${bt.toFixed(2)} credits once their start frames exist (×${REROLL} ≈ ${(bt * REROLL).toFixed(0)}).`);
}
if (blocked.length) {
  const need = [...new Set(blocked.map((b) => b.start))];
  console.log(`\n  Generate the missing start frames first:\n    node production/scripts/generate.mjs ${need.join(' ')}`);
}

if (!go) {
  if (queue.length) {
    console.log('\nCommands that would be sent:\n');
    for (const j of queue) console.log(shellLine(HF, j.args.map((a) => (a === j.startImage ? path.relative(ROOT, a).replaceAll('\\', '/') : a))) + '\n');
  }
  console.log('DRY RUN — nothing was sent and no credits were spent. Add --go to render.');
  process.exit(0);
}
if (!queue.length) {
  console.log('\nNothing to render.');
  process.exit(0);
}

/* ───────────── run ───────────── */
function hf(args) {
  return new Promise((resolve, reject) => {
    const c = spawn(HF, args, { stdio: ['ignore', 'pipe', 'pipe'] }); // args array, no shell
    let o = '';
    let e = '';
    c.stdout.on('data', (d) => (o += d));
    c.stderr.on('data', (d) => (e += d));
    c.on('error', (err) => reject(new Error(`could not start "${HF}": ${err.message}. Set HF_BIN to the CLI path.`)));
    c.on('close', (code) => (code === 0 ? resolve(o) : reject(new Error((e || o).trim().slice(0, 600)))));
  });
}

// Balance gate: never start a batch the account cannot finish.
try {
  const status = await hf(['account', 'status']);
  const balance = Number(status.match(/([\d.]+)\s+credits/)?.[1]);
  if (Number.isFinite(balance)) {
    console.log(`\nBalance: ${balance} credits. This run: about ${total.toFixed(2)}.`);
    if (balance < total && !has('ignore-balance')) {
      console.error(`Not enough credits (short by ${(total - balance).toFixed(2)}). Top up, render fewer shots, or pick a cheaper route (--model kling4_0). Nothing was sent.`);
      process.exit(2);
    }
  } else {
    console.log('\nCould not read the balance; continuing.');
  }
} catch (e) {
  console.error(String(e.message || e));
  process.exit(1);
}

const findUrl = (j) => JSON.stringify(j).match(/https?:\/\/[^"\\]+?\.(?:mp4|mov|webm)(?:\?[^"\\]*)?/i)?.[0] || null;

async function run(job) {
  const started = Date.now();
  const raw = await hf(job.args);
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error('unparseable CLI output: ' + raw.slice(0, 300));
  }
  const first = Array.isArray(json) ? json[0] : json;
  const url = first?.result_url || first?.results?.[0]?.url || findUrl(json);
  if (!url) throw new Error('no result url: ' + JSON.stringify(json).slice(0, 400));

  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `${job.key}.mp4`);
  if (fs.existsSync(file)) {
    let n = 1;
    while (fs.existsSync(path.join(OUT, `${job.key}_v${n}.mp4`))) n++;
    fs.renameSync(file, path.join(OUT, `${job.key}_v${n}.mp4`));
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));

  return {
    status: 'done',
    shot: job.shot,
    cut: job.cut,
    model,
    params: { resolution, duration: job.duration, aspect: film.aspect },
    start: job.start,
    prompt: job.prompt,
    job_id: first?.id || first?.job_id || null,
    local_path: path.relative(ROOT, file).replaceAll('\\', '/'),
    credits_estimate: job.credits,
    seconds: Math.round((Date.now() - started) / 1000),
    at: new Date().toISOString(),
  };
}

let active = 0;
let idx = 0;
let failed = 0;
await new Promise((done) => {
  const next = () => {
    if (idx >= queue.length && active === 0) return done();
    while (active < CONCURRENCY && idx < queue.length) {
      const job = queue[idx++];
      active++;
      console.log(`→ ${job.key} …`);
      run(job)
        .then((r) => {
          record(job.key, r);
          console.log(`✓ ${job.key}  (${r.seconds}s)  ${r.local_path}`);
        })
        .catch((e) => {
          failed++;
          record(job.key, { status: 'failed', shot: job.shot, cut: job.cut, model, error: String(e.message || e), at: new Date().toISOString() });
          console.log(`✗ ${job.key}  ${e.message}`);
        })
        .finally(() => {
          active--;
          next();
        });
    }
  };
  next();
});

console.log(failed ? `\n${failed} take(s) failed. Re-run the same command to retry only those.` : '\nAll takes rendered. Next: node production/scripts/edit-film.mjs');
process.exit(failed ? 1 : 0);
