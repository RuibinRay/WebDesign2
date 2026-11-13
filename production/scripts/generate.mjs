/**
 * Generate stills on Higgsfield from production/stills.mjs.
 *
 *   node production/scripts/generate.mjs hero story-slice      # named jobs
 *   node production/scripts/generate.mjs all                   # everything not yet done
 *   node production/scripts/generate.mjs hero --force          # re-roll (keeps the old file as _vN)
 *   node production/scripts/generate.mjs all --quality high --resolution 4k   # upgrade pass for gpt_image_2_6 jobs
 *
 * Needs the Higgsfield CLI, logged in (`higgsfield auth login`).
 * Set HF_BIN if the binary is not on PATH. Every run is recorded in production/manifest.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stills } from '../stills.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HF = process.env.HF_BIN || 'higgsfield';
const MANIFEST = path.join(ROOT, 'production/manifest.json');
const OUT = path.join(ROOT, 'production/renders/stills');
const CONCURRENCY = Number(process.env.HF_CONCURRENCY || 4);

const argv = process.argv.slice(2);
const flag = (n) => {
  const i = argv.indexOf(`--${n}`);
  return i > -1 ? argv[i + 1] : undefined;
};
const force = argv.includes('--force');
const ids = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').match(/^--(quality|resolution)$/));
const override = { quality: flag('quality'), resolution: flag('resolution') };

const readManifest = () => (fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : { stills: {}, video: {}, audio: {} });
const writeManifest = (m) => fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));

function hf(args) {
  return new Promise((resolve, reject) => {
    const c = spawn(HF, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '';
    let e = '';
    c.stdout.on('data', (d) => (o += d));
    c.stderr.on('data', (d) => (e += d));
    c.on('error', reject);
    c.on('close', (code) => (code === 0 ? resolve(o) : reject(new Error((e || o).trim().slice(0, 500)))));
  });
}

const findUrl = (j) => {
  const s = JSON.stringify(j);
  const m = s.match(/https?:\/\/[^"\\]+?\.(?:png|jpe?g|webp)(?:\?[^"\\]*)?/i);
  return m ? m[0] : null;
};

async function runJob(job) {
  const params = { ...job.params };
  if (job.model === 'gpt_image_2_6') {
    if (override.quality) params.quality = override.quality;
    if (override.resolution) params.resolution = override.resolution;
  }
  const args = ['generate', 'create', job.model, '--prompt', job.prompt, '--aspect_ratio', job.aspect];
  for (const [k, v] of Object.entries(params)) args.push(`--${k}`, String(v));
  for (const ref of job.refs || []) args.push('--image', path.join(ROOT, ref));
  args.push('--wait', '--wait-timeout', '15m', '--json');

  const started = Date.now();
  const raw = await hf(args);
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error('unparseable CLI output: ' + raw.slice(0, 300));
  }
  const first = Array.isArray(json) ? json[0] : json;
  const url = first?.result_url || first?.results?.[0]?.url || findUrl(json);
  if (!url) throw new Error('no result url: ' + JSON.stringify(json).slice(0, 400));

  const ext = (url.match(/\.(png|jpe?g|webp)(?:\?|$)/i)?.[1] || 'png').toLowerCase().replace('jpeg', 'jpg');
  const file = path.join(OUT, `${job.id}.${ext}`);
  fs.mkdirSync(OUT, { recursive: true });
  if (fs.existsSync(file)) {
    let n = 1;
    while (fs.existsSync(path.join(OUT, `${job.id}_v${n}.${ext}`))) n++;
    fs.renameSync(file, path.join(OUT, `${job.id}_v${n}.${ext}`));
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));

  return {
    status: 'done',
    model: job.model,
    params,
    aspect: job.aspect,
    refs: job.refs || [],
    job_id: first?.id || first?.job_id || null,
    local_path: path.relative(ROOT, file).replaceAll('\\', '/'),
    seconds: Math.round((Date.now() - started) / 1000),
    at: new Date().toISOString(),
  };
}

const manifest = readManifest();
const wanted = ids.includes('all') ? stills : stills.filter((s) => ids.includes(s.id));
const unknown = ids.filter((i) => i !== 'all' && !stills.some((s) => s.id === i));
if (unknown.length) console.error('unknown ids:', unknown.join(', '));
const queue = wanted.filter((s) => force || manifest.stills[s.id]?.status !== 'done');
console.log(`queue: ${queue.map((q) => q.id).join(', ') || '(nothing to do)'}`);

let active = 0;
let idx = 0;
await new Promise((done) => {
  const next = () => {
    if (idx >= queue.length && active === 0) return done();
    while (active < CONCURRENCY && idx < queue.length) {
      const job = queue[idx++];
      active++;
      runJob(job)
        .then((r) => {
          manifest.stills[job.id] = r;
          console.log(`✓ ${job.id}  (${r.seconds}s)  ${r.local_path}`);
        })
        .catch((e) => {
          manifest.stills[job.id] = { status: 'failed', error: String(e.message || e), at: new Date().toISOString() };
          console.log(`✗ ${job.id}  ${e.message}`);
        })
        .finally(() => {
          writeManifest(manifest);
          active--;
          next();
        });
    }
  };
  next();
});
