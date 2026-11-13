/**
 * Assemble "OTO" from the rendered takes. ffmpeg is the edit suite.
 *
 *   node production/scripts/edit-film.mjs
 *
 * What it does, in order:
 *   1. Checks that every take exists. If any are missing it lists them and stops — no file is written.
 *   2. Conforms each take to 1920×1080, 24 fps, yuv420p and trims it to its cut length from film.mjs
 *      (S07 becomes four one-second pieces, each with its sound word laid over it).
 *   3. Renders the end card (S09) in code from src/assets/brand/rica-wordmark.svg: whole wordmark,
 *      then the snap, then the line. Bone on ink black. Nothing in the end card is AI-generated.
 *   4. Concatenates the picture.
 *   5. Builds the sound: music from production/renders/audio/music.mp3 entering at 12.5 s and stopping
 *      dead at 27.5 s, any effects in production/renders/audio/sfx/, and the final snap.
 *      Two-pass loudness normalisation to −14 LUFS, true peak under −1 dB.
 *   6. Writes public/videos/rica-oto-film.mp4 (H.264, CRF 18, +faststart) and a poster frame.
 *
 * In-points: each take is longer than its cut. Defaults are below; override any of them in
 * production/edit/cuts.json, e.g. { "S01": { "in": 1.6 }, "S07_brisket": { "in": 0.9 } }.
 *
 * Sound effects: drop files into production/renders/audio/sfx/ named "<start seconds>_<name>.mp3|wav",
 * e.g. "16.4_snap.mp3". A file whose name contains "endcard" replaces the synthesised final snap.
 *
 * Flags (mainly for testing): --clips <dir>  --audio <dir>  --out <file.mp4>  --poster-at <seconds>  --no-supers
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { film, shots } from '../film.mjs';
import { jobsForShot } from '../video-cli.mjs';
import { products, palette } from '../../src/data/products.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const flag = (n) => {
  const i = argv.indexOf(`--${n}`);
  return i > -1 ? argv[i + 1] : undefined;
};
const CLIPS = flag('clips') ? path.resolve(flag('clips')) : path.join(ROOT, 'production/renders/video');
const OUT = flag('out') ? path.resolve(flag('out')) : path.join(ROOT, 'public/videos/rica-oto-film.mp4');
const WORK = flag('out') ? path.join(path.dirname(OUT), 'edit-work') : path.join(ROOT, 'production/edit/work');
const AUDIO = flag('audio') ? path.resolve(flag('audio')) : path.join(ROOT, 'production/renders/audio');
const POSTER_AT = Number(flag('poster-at') ?? 25.5); // the line-up
const SUPERS = !argv.includes('--no-supers');

const W = 1920;
const H = 1080;
const FPS = film.fps;
const frames = (seconds) => Math.round(seconds * FPS);

/** Where each cut starts inside its (longer) take. Tuned by eye after the first render. */
const DEFAULT_IN = { S01: 1.8, S02: 0.8, S03: 1.0, S04: 0.8, S05: 1.0, S06: 0.6, S07: 1.2, S08: 0.5 };
const cutsFile = path.join(ROOT, 'production/edit/cuts.json');
const cuts = fs.existsSync(cutsFile) ? JSON.parse(fs.readFileSync(cutsFile, 'utf8')) : {};

/* ───────────── process helpers ───────────── */
function exec(bin, args) {
  return new Promise((resolve, reject) => {
    const c = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let o = '';
    let e = '';
    c.stdout.on('data', (d) => (o += d));
    c.stderr.on('data', (d) => (e += d));
    c.on('error', (err) => reject(new Error(`could not start ${bin}: ${err.message}`)));
    c.on('close', (code) =>
      code === 0 ? resolve({ out: o, err: e }) : reject(new Error(`${bin} failed (${code}):\n${e.trim().split('\n').slice(-12).join('\n')}`)),
    );
  });
}
const ffmpeg = (args) => exec('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
const duration = async (file) =>
  Number((await exec('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file])).out.trim());
const ENC = ['-c:v', 'libx264', '-preset', 'fast', '-crf', '12', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-an'];
const CONFORM = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},format=yuv420p,setsar=1`;

/* ───────────── 1. the cut list, and the missing-takes gate ───────────── */
const segments = [];
for (const shot of shots) {
  const len = shot.t[1] - shot.t[0];
  if (!shot.video) {
    segments.push({ key: shot.id, shot, len, endcard: true });
    continue;
  }
  const jobs = jobsForShot(shot);
  for (const job of jobs) {
    segments.push({
      key: job.key,
      shot,
      cut: job.cut,
      len: len / jobs.length,
      in: cuts[job.key]?.in ?? cuts[shot.id]?.in ?? DEFAULT_IN[shot.id] ?? 0.5,
      file: path.join(CLIPS, `${job.key}.mp4`),
    });
  }
}
const missing = segments.filter((s) => !s.endcard && !fs.existsSync(s.file));
if (missing.length) {
  console.error(`Cannot assemble the film: ${missing.length} of ${segments.filter((s) => !s.endcard).length} takes are missing from ${path.relative(ROOT, CLIPS) || CLIPS}:\n`);
  for (const m of missing) console.error(`  ${m.key}.mp4   (${m.shot.id} "${m.shot.name}"${m.cut ? `, ${m.cut}` : ''})`);
  console.error('\nRender them first:  node production/scripts/render-film.mjs all --go');
  console.error('Nothing was written.');
  process.exit(1);
}
const total = segments.reduce((a, s) => a + frames(s.len), 0) / FPS;
fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(path.dirname(OUT), { recursive: true });

/* ───────────── type as outlines (no installed fonts needed) ───────────── */
const FS_DIR = path.join(ROOT, 'node_modules/@fontsource');
const FSV_DIR = path.join(ROOT, 'node_modules/@fontsource-variable');
const ab = (b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
let opentype = null;
try {
  opentype = (await import('opentype.js')).default;
} catch {
  console.log('note: opentype.js is not installed — the end card will carry the wordmark only, and the S07 sound words are skipped.');
}
const loadFont = (file) => opentype.parse(ab(fs.readFileSync(file)));

/** Serialise an opentype.js path ourselves: its own toPathData can emit NaN on repeated points. */
function pd(p) {
  const r = (n) => Math.round(n * 100) / 100;
  let out = '';
  let px = null;
  let py = null;
  for (const c of p.commands) {
    if (c.type === 'M') out += `M${r(c.x)} ${r(c.y)}`;
    else if (c.type === 'L') {
      if (c.x === px && c.y === py) continue;
      out += `L${r(c.x)} ${r(c.y)}`;
    } else if (c.type === 'Q') out += `Q${r(c.x1)} ${r(c.y1)} ${r(c.x)} ${r(c.y)}`;
    else if (c.type === 'C') out += `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${r(c.x)} ${r(c.y)}`;
    else if (c.type === 'Z') out += 'Z';
    if (c.x !== undefined) {
      px = c.x;
      py = c.y;
    }
  }
  return out;
}

/** Outline a line of text; returns an SVG path translated so its ink box is centred on (cx, baselineY). */
function line(font, text, size, cx, y, fill, tracking = 0) {
  let x = 0;
  const parts = [];
  let x1 = Infinity;
  let x2 = -Infinity;
  for (const ch of [...text]) {
    const g = font.charToGlyph(ch);
    const p = g.getPath(x, 0, size);
    if (p.commands.length) {
      const b = p.getBoundingBox();
      x1 = Math.min(x1, b.x1);
      x2 = Math.max(x2, b.x2);
      parts.push(pd(p));
    }
    x += (g.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  return `<path fill="${fill}" transform="translate(${(cx - (x1 + x2) / 2).toFixed(2)} ${y})" d="${parts.join('')}"/>`;
}

/* ───────────── 3. end card stills ───────────── */
async function endCard() {
  const src = fs.readFileSync(path.join(ROOT, 'src/assets/brand/rica-wordmark.svg'), 'utf8');
  const [, vbW, vbH] = src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
  const inner = src.replace(/<\/?svg[^>]*>/g, '');
  const whole = src.match(/<path transform="[^"]+" d="[^"]+"\/>/)?.[0]; // the unbroken outline
  if (!whole) throw new Error('could not find the wordmark outline in rica-wordmark.svg');

  const MARK_W = 760;
  const k = MARK_W / vbW;
  const mx = (W - MARK_W) / 2;
  const my = 392 - (vbH * k) / 2;

  let tagline = '';
  if (opentype) {
    // "Every cut has a sound." in Bodoni Moda Italic (pinned from the variable font), else Shippori Mincho.
    try {
      const subsetFont = (await import('subset-font')).default;
      const ttf = await subsetFont(fs.readFileSync(path.join(FSV_DIR, 'bodoni-moda/files/bodoni-moda-latin-opsz-italic.woff2')), film.line, {
        targetFormat: 'sfnt',
        variationAxes: { wght: 500, opsz: 96 },
      });
      tagline += line(opentype.parse(ab(Buffer.from(ttf))), film.line, 62, W / 2, 640, palette.bone);
    } catch {
      try {
        tagline += line(loadFont(path.join(FS_DIR, 'shippori-mincho/files/shippori-mincho-latin-500-normal.woff')), film.line, 56, W / 2, 640, palette.bone);
        console.log('note: Bodoni Moda could not be outlined; the end-card line is set in Shippori Mincho.');
      } catch {
        console.log('note: no font could be outlined for the end-card line; it is omitted. Add it in an editor.');
      }
    }
    try {
      tagline += line(loadFont(path.join(FS_DIR, 'shippori-mincho/files/shippori-mincho-japanese-500-normal.woff')), film.lineJa, 30, W / 2, 706, palette.bone, 6);
    } catch {
      console.log('note: the Japanese end-card line could not be outlined; it is omitted.');
    }
  }

  const card = (mark, extra = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <rect width="${W}" height="${H}" fill="${palette.sumi}"/>
      <g transform="translate(${mx} ${my}) scale(${k})" fill="${palette.bone}">${mark}</g>
      ${extra}
    </svg>`;
  const files = {
    whole: path.join(WORK, 'endcard_1_whole.png'),
    snap: path.join(WORK, 'endcard_2_snap.png'),
    final: path.join(WORK, 'endcard_3_line.png'),
  };
  await sharp(Buffer.from(card(whole))).png().toFile(files.whole);
  await sharp(Buffer.from(card(inner))).png().toFile(files.snap);
  await sharp(Buffer.from(card(inner, tagline))).png().toFile(files.final);
  return files;
}

/* ───────────── S07 sound words: big vertical katakana, laid over each snap ───────────── */
async function superFor(cut) {
  if (!SUPERS || !opentype) return null;
  const p = products.find((x) => x.id === cut);
  if (!p) return null;
  try {
    const font = loadFont(path.join(FS_DIR, 'dela-gothic-one/files/dela-gothic-one-japanese-400-normal.woff'));
    const SIZE = 300;
    const cells = [...p.kana].map((ch) => {
      const path_ = font.charToGlyph(ch).getPath(0, 0, SIZE);
      const b = path_.getBoundingBox();
      return { d: pd(path_), b, w: b.x2 - b.x1, h: b.y2 - b.y1, small: 'ッャュョァィゥェォ'.includes(ch) };
    });
    const gap = 18;
    const totalH = cells.reduce((a, c) => a + c.h, 0) + gap * (cells.length - 1);
    const k = Math.min(1, (H - 160) / totalH);
    const widest = Math.max(...cells.filter((c) => !c.small).map((c) => c.w)) * k;
    const colX = 150 + widest / 2; // a column down the left edge, clear of the crisp in the centre
    let y = (H - totalH * k) / 2;
    const paths = cells
      .map((c) => {
        const x = c.small ? colX + widest / 2 - c.w * k : colX - (c.w * k) / 2;
        const t = `translate(${(x - c.b.x1 * k).toFixed(2)} ${(y - c.b.y1 * k).toFixed(2)}) scale(${k.toFixed(4)})`;
        y += c.h * k + gap;
        return `<path transform="${t}" d="${c.d}"/>`;
      })
      .join('');
    const file = path.join(WORK, `super_${cut}.png`);
    await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g fill="${p.ink}">${paths}</g></svg>`)).png().toFile(file);
    return file;
  } catch (e) {
    console.log(`note: sound word for ${cut} skipped (${e.message})`);
    return null;
  }
}

/* ───────────── 2 + 3. conform every segment ───────────── */
console.log(`Assembling "${film.title}" — ${segments.length} segments, ${total.toFixed(2)} s at ${FPS} fps`);
const list = [];
let n = 0;
for (const s of segments) {
  const tag = String(++n).padStart(2, '0');
  if (s.endcard) {
    const stills = await endCard();
    // whole → snap → snap + line. Hard changes, no dissolves.
    const beats = [
      [stills.whole, 0.9],
      [stills.snap, 0.3],
      [stills.final, s.len - 1.2],
    ];
    for (const [i, [png, secs]] of beats.entries()) {
      const out = path.join(WORK, `seg_${tag}_${s.key}_${i + 1}.mp4`);
      await ffmpeg(['-loop', '1', '-framerate', String(FPS), '-i', png, '-frames:v', String(frames(secs)), '-vf', `format=yuv420p,setsar=1`, ...ENC, out]);
      list.push(out);
    }
    s.snapAt = segments.slice(0, n - 1).reduce((a, x) => a + frames(x.len), 0) / FPS + 0.9;
    continue;
  }
  const have = await duration(s.file);
  if (!(have >= s.len)) throw new Error(`${s.key}.mp4 is ${have.toFixed(2)} s long but the cut needs ${s.len} s. Re-render it longer.`);
  const start = Math.max(0, Math.min(s.in, have - s.len - 0.04));
  const out = path.join(WORK, `seg_${tag}_${s.key}.mp4`);
  const png = s.cut ? await superFor(s.cut) : null;
  if (png) {
    await ffmpeg([
      '-ss', start.toFixed(3), '-i', s.file, '-loop', '1', '-framerate', String(FPS), '-i', png,
      '-filter_complex', `[0:v]${CONFORM}[v];[v][1:v]overlay=0:0:enable='gte(t,0.12)',format=yuv420p[o]`,
      '-map', '[o]', '-frames:v', String(frames(s.len)), ...ENC, out,
    ]);
  } else {
    await ffmpeg(['-ss', start.toFixed(3), '-i', s.file, '-vf', CONFORM, '-frames:v', String(frames(s.len)), ...ENC, out]);
  }
  list.push(out);
  console.log(`  ${s.key.padEnd(14)} in ${start.toFixed(2)} s, ${s.len.toFixed(2)} s${png ? '  + sound word' : ''}`);
}

/* ───────────── 4. picture ───────────── */
const listFile = path.join(WORK, 'concat.txt');
fs.writeFileSync(listFile, list.map((f) => `file '${f.replaceAll('\\', '/').replaceAll("'", "'\\''")}'`).join('\n'));
const picture = path.join(WORK, 'picture.mp4');
await ffmpeg(['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', picture]);

/* ───────────── 5. sound ───────────── */
const musicFile = ['music.mp3', 'music.wav', 'music.m4a'].map((f) => path.join(AUDIO, f)).find((f) => fs.existsSync(f));
const sfxDir = path.join(AUDIO, 'sfx');
// production/edit/sound.json tunes the mix without touching the files:
//   { "music": { "gain": -6 },
//     "snap":  { "start": 0.5, "dur": 0.9, "peak": -4, "at": 17.1 },      ← trim, level (dBFS peak), move
//     "clink": { "file": "pour", "start": 4.6, "dur": 0.7, "peak": -10, "at": 15.3 } }   ← reuse part of another file
const soundFile = path.join(ROOT, 'production/edit/sound.json');
const soundCfg = fs.existsSync(soundFile) ? JSON.parse(fs.readFileSync(soundFile, 'utf8')) : {};
const sfxFiles = fs.existsSync(sfxDir)
  ? fs
      .readdirSync(sfxDir)
      .map((f) => ({ f, m: f.match(/^(\d+(?:\.\d+)?)_(.+)\.(mp3|wav|m4a)$/i) }))
      .filter((x) => x.m)
      .map((x) => ({ file: path.join(sfxDir, x.f), at: Number(x.m[1]), key: x.m[2], name: x.f }))
  : [];
const sfx = [];
for (const x of sfxFiles) {
  const c = soundCfg[x.key] || {};
  if (c.mute) continue;
  sfx.push({ ...x, ...c, at: c.at ?? x.at });
}
for (const [key, c] of Object.entries(soundCfg)) {
  if (!c.file) continue;
  const src = sfxFiles.find((x) => x.key === c.file);
  if (src) sfx.push({ ...c, file: src.file, name: `${key} (from ${src.name})`, key, at: c.at ?? src.at });
}
/** Peak level of a file (or of a trimmed part of it), in dBFS. */
async function peakDb(file, start, dur) {
  const args = ['-hide_banner', '-nostats'];
  if (start != null) args.push('-ss', String(start));
  if (dur != null) args.push('-t', String(dur));
  const r = await exec('ffmpeg', [...args, '-i', file, '-af', 'volumedetect', '-f', 'null', '-']);
  const m = r.err.match(/max_volume:\s*(-?[\d.]+) dB/);
  return m ? Number(m[1]) : 0;
}
const musicIn = shots.find((s) => s.id === 'S05').t[0]; // 12.5 s: the needle drop
const musicOut = shots.find((s) => s.id === 'S09').t[0]; // 27.5 s: stops dead
const snapAt = segments.find((s) => s.endcard)?.snapAt ?? total - 1.6;
const ownEndSnap = sfx.some((x) => /endcard/i.test(x.name));

const inputs = ['-f', 'lavfi', '-t', total.toFixed(3), '-i', 'anullsrc=r=48000:cl=stereo'];
const chains = ['[0:a]anull[a0]'];
const mixIn = ['[a0]'];
let ai = 1;
if (musicFile) {
  const len = musicOut - musicIn;
  inputs.push('-i', musicFile);
  chains.push(
    `[${ai}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${len},volume=${soundCfg.music?.gain ?? 0}dB,afade=t=in:st=0:d=0.04,afade=t=out:st=${(len - 0.04).toFixed(2)}:d=0.04,adelay=${Math.round(musicIn * 1000)}:all=1[a${ai}]`,
  );
  mixIn.push(`[a${ai}]`);
  ai++;
}
for (const x of sfx) {
  const trim = x.start != null || x.dur != null;
  const gain = x.peak != null ? x.peak - (await peakDb(x.file, x.start, x.dur)) : (x.gain ?? 0);
  if (trim) inputs.push('-ss', String(x.start ?? 0), ...(x.dur != null ? ['-t', String(x.dur)] : []));
  inputs.push('-i', x.file);
  const fade = x.dur != null ? `,afade=t=out:st=${Math.max(0, x.dur - 0.08).toFixed(2)}:d=0.08` : '';
  chains.push(`[${ai}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${gain.toFixed(1)}dB${fade},adelay=${Math.round(x.at * 1000)}:all=1[a${ai}]`);
  mixIn.push(`[a${ai}]`);
  ai++;
}
if (!ownEndSnap) {
  // Stand-in for the final snap: a 110 ms burst of bright noise. Replace with a recorded one when there is one.
  inputs.push('-f', 'lavfi', '-t', '0.12', '-i', 'anoisesrc=r=48000:c=white:a=0.7');
  chains.push(`[${ai}:a]aformat=channel_layouts=stereo,highpass=f=2400,afade=t=out:st=0.004:d=0.11,adelay=${Math.round(snapAt * 1000)}:all=1[a${ai}]`);
  mixIn.push(`[a${ai}]`);
  ai++;
}
const mix = path.join(WORK, 'mix.wav');
await ffmpeg([
  ...inputs,
  '-filter_complex', `${chains.join(';')};${mixIn.join('')}amix=inputs=${mixIn.length}:normalize=0:duration=longest,atrim=0:${total.toFixed(3)}[m]`,
  '-map', '[m]', '-ar', '48000', '-ac', '2', mix,
]);

let sound = mix;
if (musicFile) {
  // Two-pass EBU R128: measure, then apply linearly so the dynamics are not pumped.
  const target = 'I=-14:TP=-2.5:LRA=11'; // 1.5 dB of headroom: the AAC encode overshoots, and the master must stay under −1 dBTP
  const pass1 = await exec('ffmpeg', ['-hide_banner', '-i', mix, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-']);
  const from = pass1.err.lastIndexOf('{');
  const m = JSON.parse(pass1.err.slice(from, pass1.err.indexOf('}', from) + 1));
  sound = path.join(WORK, 'mix_norm.wav');
  await ffmpeg([
    '-i', mix,
    '-af', `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
    '-ar', '48000', sound,
  ]);
  console.log(`  sound: music ${musicIn}–${musicOut} s, ${sfx.length} effect(s)${ownEndSnap ? '' : ', synthesised final snap'}; ${m.input_i} → −14 LUFS`);
} else {
  console.log(
    `  sound: no music.mp3 in ${path.relative(ROOT, AUDIO).split(path.sep).join('/')} — the film is written without music${sfx.length ? ` (${sfx.length} effect(s) laid in)` : ''}, and loudness is not normalised.`,
  );
}

/* ───────────── 6. master + poster ───────────── */
// Two files: the master (near-lossless, for delivery and re-cuts) and the web encode the site plays.
const MASTER = flag('out')
  ? OUT.replace(/\.mp4$/i, '-master.mp4')
  : path.join(ROOT, `production/final/rica_${film.title.toLowerCase()}_${film.aspect.replace(':', 'x')}_${Math.round(total)}s.mp4`);
fs.mkdirSync(path.dirname(MASTER), { recursive: true });
const mux = (crf, audioRate, out) =>
  ffmpeg([
    '-i', picture, '-i', sound,
    '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-r', String(FPS), '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', audioRate, '-ar', '48000',
    '-movflags', '+faststart', '-shortest', out,
  ]);
await mux(17, '256k', MASTER);
await mux(24, '160k', OUT);
const poster = OUT.replace(/\.mp4$/i, '-poster.jpg');
await ffmpeg(['-ss', String(Math.min(POSTER_AT, total - 0.1)), '-i', MASTER, '-frames:v', '1', '-q:v', '2', poster]);

const rel = (f) => path.relative(ROOT, f).replaceAll('\\', '/');
const mb = (f) => (fs.statSync(f).size / 1e6).toFixed(1);
console.log(`\nMaster:  ${rel(MASTER)}  (${(await duration(MASTER)).toFixed(2)} s, ${mb(MASTER)} MB)`);
console.log(`Web:     ${rel(OUT)}  (${mb(OUT)} MB) — the site plays this one`);
console.log(`Poster:  ${rel(poster)}  (frame at ${POSTER_AT} s)`);
console.log('Watch it once with sound, then adjust in-points in production/edit/cuts.json and run again.');
