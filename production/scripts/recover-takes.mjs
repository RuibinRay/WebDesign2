/**
 * Recover film takes that were submitted to Higgsfield but never downloaded
 * (the render script was interrupted, the terminal closed, the connection dropped).
 * The credits are already spent, so this costs nothing: it finds the jobs, waits for
 * any still running, downloads them and records them in production/manifest.json.
 *
 *   node production/scripts/recover-takes.mjs                 # jobs from the last 3 hours
 *   node production/scripts/recover-takes.mjs --since 2026-11-13T18:30:00Z
 *   node production/scripts/recover-takes.mjs --dry-run       # list what it would fetch
 *
 * A job is matched to its shot by its prompt. Takes that share a prompt (the four snaps) are
 * told apart by the colour of their first frame against the shot’s start stills.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { film, shots } from '../film.mjs';
import { jobsForShot, stillFile, VIDEO_MODELS } from '../video-cli.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HF = process.env.HF_BIN || 'higgsfield';
const MANIFEST = path.join(ROOT, 'production/manifest.json');
const OUT = path.join(ROOT, 'production/renders/video');
const argv = process.argv.slice(2);
const dry = argv.includes('--dry-run');
const sinceArg = argv[argv.indexOf('--since') + 1];
const since = argv.includes('--since') && sinceArg ? new Date(sinceArg) : new Date(Date.now() - 3 * 3600 * 1000);

function exec(bin, args) {
  return new Promise((resolve, reject) => {
    const c = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '';
    let e = '';
    c.stdout.on('data', (d) => (o += d));
    c.stderr.on('data', (d) => (e += d));
    c.on('error', reject);
    c.on('close', (code) => (code === 0 ? resolve(o) : reject(new Error((e || o).trim().slice(0, 400)))));
  });
}
const readManifest = () => ({ stills: {}, video: {}, audio: {}, ...(fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {}) });
const record = (key, entry) => {
  const m = readManifest();
  m.video = { ...m.video, [key]: entry };
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
};

const meanRgb = async (file) => {
  const { channels } = await sharp(file).resize(64, 36, { fit: 'fill' }).removeAlpha().stats();
  return channels.slice(0, 3).map((c) => c.mean);
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const known = new Set(
  Object.values(readManifest().video)
    .flatMap((v) => [v.job_id, ...(v.previous_job_ids || [])])
    .filter(Boolean),
);
const list = JSON.parse(await exec(HF, ['generate', 'list', '--video', '--size', '50', '--json']));
const models = Object.keys(VIDEO_MODELS);
const jobs = list
  .filter((j) => models.includes(j.job_type) && new Date(j.created_at) >= since && !known.has(j.id))
  .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

if (!jobs.length) {
  console.log('Nothing to recover: every film job since ' + since.toISOString() + ' is already in the manifest.');
  process.exit(0);
}


fs.mkdirSync(OUT, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rica-recover-'));
let n = 0;
for (const j of jobs) {
  const prompt = String(j.params?.prompt || '');
  const prompts = (s) => (s.video && typeof s.video === 'object' ? Object.values(s.video) : [s.video]);
  const shot = shots.find((s) => s.video && prompts(s).some((p) => prompt.startsWith(p.slice(0, 60))));
  if (!shot) {
    console.log(`· ${j.id.slice(0, 8)}  not a film shot (prompt: ${prompt.slice(0, 50)}…) — skipped`);
    continue;
  }
  let job = j;
  if (!/completed|failed|canceled|cancelled|nsfw/i.test(job.status)) {
    console.log(`… ${shot.id}  ${j.id.slice(0, 8)} is ${job.status}; waiting`);
    if (dry) continue;
    await exec(HF, ['generate', 'wait', j.id, '--wait-timeout', '20m']).catch(() => {});
    const got = JSON.parse(await exec(HF, ['generate', 'get', j.id, '--json']));
    job = Array.isArray(got) ? got[0] : got;
  }
  if (!job.result_url) {
    console.log(`✗ ${shot.id}  ${j.id.slice(0, 8)} ended as "${job.status}" with no result`);
    continue;
  }
  if (dry) {
    console.log(`would fetch ${shot.id}  ${j.id.slice(0, 8)}  (${job.params?.duration} s)`);
    continue;
  }
  const res = await fetch(job.result_url);
  if (!res.ok) {
    console.log(`✗ ${shot.id}  download failed ${res.status}`);
    continue;
  }
  const raw = path.join(tmp, `${j.id}.mp4`);
  fs.writeFileSync(raw, Buffer.from(await res.arrayBuffer()));

  let key = shot.id;
  let cut = null;
  let start = Array.isArray(shot.start) ? null : shot.start;
  if (Array.isArray(shot.start)) {
    const frame = path.join(tmp, `${j.id}.png`);
    await exec('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-frames:v', '1', frame]);
    const rgb = await meanRgb(frame);
    const refs = [];
    for (const job of jobsForShot(shot)) {
      const f = stillFile(ROOT, job.start);
      if (f) refs.push({ key: job.key, cut: job.cut, start: job.start, rgb: await meanRgb(f) });
    }
    const best = refs.map((r) => ({ ...r, d: dist(rgb, r.rgb) })).sort((a, b) => a.d - b.d)[0];
    key = best.key;
    cut = best.cut;
    start = best.start;
  }

  const file = path.join(OUT, `${key}.mp4`);
  const prev = readManifest().video[key];
  if (fs.existsSync(file)) {
    let v = 1;
    while (fs.existsSync(path.join(OUT, `${key}_v${v}.mp4`))) v++;
    fs.renameSync(file, path.join(OUT, `${key}_v${v}.mp4`));
  }
  fs.copyFileSync(raw, file);
  record(key, {
    status: 'done',
    shot: shot.id,
    cut,
    model: job.job_type,
    params: { resolution: job.params?.resolution, duration: job.params?.duration, aspect: film.aspect },
    start,
    prompt,
    job_id: j.id,
    previous_job_ids: [prev?.job_id, ...(prev?.previous_job_ids || [])].filter(Boolean),
    local_path: path.relative(ROOT, file).replaceAll('\\', '/'),
    recovered: true,
    at: new Date().toISOString(),
  });
  n++;
  console.log(`✓ ${key}  recovered from job ${j.id.slice(0, 8)}  →  ${path.relative(ROOT, file).replaceAll('\\', '/')}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(dry ? 'DRY RUN — nothing downloaded.' : `Recovered ${n} take(s).`);
