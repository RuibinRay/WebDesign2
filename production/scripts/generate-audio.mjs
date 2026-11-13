/**
 * Generate the film's sound on Higgsfield from production/sound.mjs.
 *
 *   node production/scripts/generate-audio.mjs all            # music + every effect not yet made
 *   node production/scripts/generate-audio.mjs music          # every music cue (or name one: music-a)
 *   node production/scripts/generate-audio.mjs sfx            # every effect
 *   node production/scripts/generate-audio.mjs snap pari      # named effects
 *   node production/scripts/generate-audio.mjs snap --force   # re-roll (keeps the old file as _vN)
 *
 * Writes production/renders/audio/<cue>.<ext> and production/renders/audio/sfx/<time>_<name>.<ext>,
 * which is exactly where edit-film.mjs looks. Recorded under `audio` in production/manifest.json.
 * Needs the Higgsfield CLI, logged in. Set HF_BIN if it is not on PATH.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { MUSIC, SFX } from '../sound.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HF = process.env.HF_BIN || 'higgsfield';
const MANIFEST = path.join(ROOT, 'production/manifest.json');
const AUDIO = path.join(ROOT, 'production/renders/audio');
const CONCURRENCY = Number(process.env.HF_CONCURRENCY || 4);

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const ids = argv.filter((a) => !a.startsWith('--'));
if (!ids.length) {
  console.error('Usage: node production/scripts/generate-audio.mjs <all|music|sfx|cue or effect name …> [--force]');
  console.error('Effects: ' + SFX.map((s) => s[1]).join(', '));
  process.exit(1);
}

const jobs = [];
for (const m of MUSIC) {
  if (ids.includes('all') || ids.includes('music') || ids.includes(m.key))
    jobs.push({
      key: m.key,
      dir: AUDIO,
      base: m.key,
      match: new RegExp(`^${m.key}\\.(mp3|wav|m4a)$`, 'i'),
      args: ['generate', 'create', 'sonilo_music', '--prompt', m.prompt, '--duration', String(m.seconds)],
    });
}
for (const [t, name, prompt] of SFX) {
  if (ids.includes('all') || ids.includes('sfx') || ids.includes(name))
    jobs.push({
      key: `sfx:${name}`,
      dir: path.join(AUDIO, 'sfx'),
      base: `${t}_${name}`,
      match: new RegExp(`^\\d+(?:\\.\\d+)?_${name}\\.(mp3|wav|m4a)$`, 'i'),
      args: ['generate', 'create', 'seed_audio', '--prompt', prompt, '--format', 'wav', '--sample_rate', '48000'],
    });
}

const exists = (job) => {
  if (!fs.existsSync(job.dir)) return null;
  const hit = fs.readdirSync(job.dir).find((f) => job.match.test(f));
  return hit ? path.join(job.dir, hit) : null;
};

function hf(args) {
  return new Promise((resolve, reject) => {
    const c = spawn(HF, args, { stdio: ['ignore', 'pipe', 'pipe'] }); // args array, no shell
    let o = '';
    let e = '';
    c.stdout.on('data', (d) => (o += d));
    c.stderr.on('data', (d) => (e += d));
    c.on('error', (err) => reject(new Error(`could not start "${HF}": ${err.message}. Set HF_BIN to the CLI path.`)));
    c.on('close', (code) => (code === 0 ? resolve(o) : reject(new Error((e || o).trim().slice(0, 500)))));
  });
}
const record = (key, entry) => {
  const m = { stills: {}, video: {}, audio: {}, ...(fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {}) };
  m.audio = { ...m.audio, [key]: entry };
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
};
const findUrl = (j) => JSON.stringify(j).match(/https?:\/\/[^"\\]+?\.(?:mp3|wav|m4a|ogg)(?:\?[^"\\]*)?/i)?.[0] || null;

async function run(job) {
  const raw = await hf([...job.args, '--wait', '--wait-timeout', '10m', '--json']);
  const json = JSON.parse(raw);
  const first = Array.isArray(json) ? json[0] : json;
  const url = first?.result_url || first?.results?.[0]?.url || findUrl(json);
  if (!url) throw new Error('no result url: ' + JSON.stringify(json).slice(0, 300));
  const ext = (url.match(/\.(mp3|wav|m4a)(?:\?|$)/i)?.[1] || 'mp3').toLowerCase();
  fs.mkdirSync(job.dir, { recursive: true });
  const old = exists(job);
  if (old) {
    const p = path.parse(old);
    let n = 1;
    // versions are parked next to the folder edit-film.mjs reads, so they are never laid in twice
    const park = path.join(AUDIO, 'versions');
    fs.mkdirSync(park, { recursive: true });
    while (fs.existsSync(path.join(park, `${p.name}_v${n}${p.ext}`))) n++;
    fs.renameSync(old, path.join(park, `${p.name}_v${n}${p.ext}`));
  }
  const file = path.join(job.dir, `${job.base}.${ext}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return { status: 'done', job_id: first?.id || null, local_path: path.relative(ROOT, file).replaceAll('\\', '/'), at: new Date().toISOString() };
}

const queue = jobs.filter((j) => force || !exists(j));
console.log(`queue: ${queue.map((q) => q.key).join(', ') || '(nothing to do)'}`);
let i = 0;
let failed = 0;
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (i < queue.length) {
      const job = queue[i++];
      try {
        const r = await run(job);
        record(job.key, r);
        console.log(`✓ ${job.key}  ${r.local_path}`);
      } catch (e) {
        failed++;
        record(job.key, { status: 'failed', error: String(e.message || e), at: new Date().toISOString() });
        console.log(`✗ ${job.key}  ${e.message}`);
      }
    }
  }),
);
process.exit(failed ? 1 : 0);
