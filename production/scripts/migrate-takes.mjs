/**
 * The second cut of the film reuses some takes from the first cut (the product shots).
 * This copies each reused take to the name the current film.mjs expects and records it in
 * production/manifest.json, so render-film.mjs treats it as already rendered. Free: nothing
 * is generated. Safe to run again; it never overwrites a take that is already there.
 *
 *   node production/scripts/migrate-takes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shots } from '../film.mjs';
import { jobsForShot } from '../video-cli.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = path.join(ROOT, 'production/renders/video');
const MANIFEST = path.join(ROOT, 'production/manifest.json');
const manifest = { stills: {}, video: {}, audio: {}, ...(fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {}) };

let copied = 0;
for (const shot of shots) {
  if (!shot.reuse) continue;
  for (const job of jobsForShot(shot)) {
    const from = typeof shot.reuse === 'string' ? shot.reuse : shot.reuse[job.cut] ?? shot.reuse[job.start];
    if (!from) continue;
    const src = path.join(DIR, `${from}.mp4`);
    const dst = path.join(DIR, `${job.key}.mp4`);
    if (fs.existsSync(dst)) {
      console.log(`· ${job.key} already present`);
    } else if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      copied++;
      console.log(`✓ ${job.key}  ←  ${from}`);
    } else {
      console.log(`✗ ${job.key}: the first-cut take ${from}.mp4 is not on disk; render it with render-film.mjs ${shot.id} --go`);
      continue;
    }
    const prev = manifest.video[from] || {};
    manifest.video[job.key] = {
      status: 'done',
      shot: shot.id,
      cut: job.cut,
      model: prev.model || null,
      params: prev.params || null,
      start: job.start,
      prompt: job.prompt,
      job_id: prev.job_id || null,
      reused_from: from,
      local_path: path.relative(ROOT, dst).replaceAll('\\', '/'),
      at: prev.at || new Date().toISOString(),
    };
  }
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`${copied} take(s) copied.`);
