/**
 * Builds the production documents from the same data the generators use, so the
 * storyboards can never drift from what is actually sent to Higgsfield:
 *
 *   docs/02-film-storyboard.md            ← production/film.mjs + stills.mjs + look.mjs
 *   docs/03-website-image-storyboard.md   ← production/stills.mjs (entries with a `web` field)
 *   docs/04-asset-manifest.md             ← everything, with live status from production/manifest.json
 *
 * Run: npm run docs      (re-run after every generation pass; status and thumbnails update)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { film, shots, VIDEO_RULES } from '../film.mjs';
import { stills, stillById } from '../stills.mjs';
import { NIGHT, STUDIO, BAR, CAST, CRISP, PACK, NEG_CLEAN, NEG_PACK, CUTS } from '../look.mjs';
import { products } from '../../src/data/products.js';
import { VIDEO_MODELS, jobsForShot, videoArgs, videoPrompt, shellLine } from '../video-cli.mjs';
import { stillPrice, videoPrice, VIDEO_PER_SECOND, AUDIO, REROLL, PRICES_MEASURED } from '../prices.mjs';
import { MUSIC, SFX } from '../sound.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST = path.join(ROOT, 'production/manifest.json');
const manifest = { stills: {}, video: {}, audio: {}, ...(fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {}) };

/* ───────────── helpers ───────────── */
const write = (rel, text) => {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, text.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
  console.log(`wrote ${rel}  (${text.split('\n').length} lines)`);
};
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const fence = (text, lang = 'text') => '```' + lang + '\n' + text + '\n```';
const cr = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, '').replace(/\.0$/, ''));
const credits = (n) => `${Math.round(n).toLocaleString('en-US')}`;
const tc = (s) => `${s.toFixed(1)} s`;
const pad2 = (n) => String(n).padStart(2, '0');

// Thumbnails are written to docs/img/ and committed, so the documents read correctly in a clone that
// does not carry production/renders/ (the originals are large and stay out of the repository).
const thumbRel = (id) => `docs/img/${id}.jpg`;
for (const [id, s] of Object.entries(manifest.stills)) {
  if (s?.status !== 'done' || !exists(s.local_path)) continue;
  const src = path.join(ROOT, s.local_path);
  const out = path.join(ROOT, thumbRel(id));
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) continue;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(src).resize({ width: 960, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
}
const done = (id) => manifest.stills[id]?.status === 'done' && (exists(manifest.stills[id].local_path) || exists(thumbRel(id)));
const stillPath = (id) => (manifest.stills[id]?.local_path ? manifest.stills[id].local_path : `production/renders/stills/${id}.png`);
const thumb = (id, alt) => (exists(thumbRel(id)) ? `![${alt || id}](img/${id}.jpg)` : `![${alt || id}](../${stillPath(id)})`);
const siteFiles = (id) => {
  const dir = path.join(ROOT, 'src/assets/images');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => new RegExp(`^${id}-\\d+\\.webp$`).test(f))
    .sort((a, b) => parseInt(a.match(/-(\d+)\.webp$/)[1]) - parseInt(b.match(/-(\d+)\.webp$/)[1]));
};
const paramsLine = (job) => Object.entries(job.params || {}).map(([k, v]) => `${k} ${v}`).join(', ') || 'defaults';
const refsLine = (job) => (job.refs?.length ? job.refs.map((r) => `[\`${path.basename(r)}\`](../${r})`).join(', ') : 'none');
const MODEL_NAME = { soul_cinematic: 'Soul Cinematic', gpt_image_2_6: 'GPT Image 2.6' };
const modelLine = (job) => `${MODEL_NAME[job.model] || job.model} (\`${job.model}\`)`;
const genCmd = (...ids) => `node production/scripts/generate.mjs ${ids.join(' ')}`;

/** One or two sentences: what the picture is. Used wherever a placeholder has to be explained. */
const cutOf = (id) => products.find((p) => id.endsWith(p.id));
const BRIEF = {
  hero: 'Paper-thin beef crisps tumbling through black space, one snapping in half, salt crystals hanging in warm light. The subject sits on the right; the left third is empty black.',
  'hero-mobile': 'The hero moment composed upright: crisps and salt burst in the upper half of the frame, and the lower half is empty black for the headline.',
  'story-slice': 'Hands, no face, drawing a long knife through marbled ribeye. The slice lifting away is thin enough for the backlight to glow through it.',
  'story-salt': 'Fingers releasing the house salt blend: a sparkling stream of white flakes and dark specks frozen in mid-air above a small mound on black stone.',
  'story-dry': 'Rows of beef sheets on steel drying racks receding into the dark, backlit amber so that each sheet glows like stained glass.',
  'texture-macro': 'An edge-to-edge extreme macro of one crisp held to the light: translucent red, an amber lace of marbling, a broken edge, salt crystals.',
  'life-listening-bar': 'A dim Tokyo listening bar: a highball and a small dish of crisps on the counter, a hand reaching in, turntable and amplifier glowing out of focus.',
  'life-bite': 'A close portrait of a woman at the bar, caught mid-laugh as she snaps a crisp between her teeth; shards and salt in the warm light.',
  'life-train': 'A nearly empty last train: a man in a dark coat, eyes closed in bliss, biting a crisp, while one other passenger glances over from the background.',
  'life-highball': 'Whisky soda being poured over clear block ice at the bar, with the red Ribeye pack standing beside the glass and a few crisps on a dish.',
  'pack-lineup': 'All five cartons in a row on black stone — red, mustard, white, black, indigo — with crisps and salt scattered at their feet.',
  'campaign-key': 'One large ribeye crisp snapping in half in mid-air with a burst of shards and salt; the Ribeye pack stands below it, slightly soft. The left 40% of the frame is black.',
  'closing-gone': 'Seen from above: an empty black dish with only crumbs and salt left in it, on a flat vermilion surface. The dish sits lower-right; the rest is empty red.',
  'kf-salt-crystal': 'A single flake of salt falling through a narrow shaft of warm light in black space, with the surface of a crisp out of focus below.',
  'kf-slice': 'The slicing moment recomposed for 16:9: the knife travelling right to left through marbled ribeye, the slice glowing in the backlight.',
  'kf-salt-rain': 'Fingers releasing a wide curtain of the salt blend over crisps lying on black stone, every grain frozen in the light.',
  'kf-bite': 'The woman at the bar holding a crisp up to the light so that it glows, smiling, about to bite; two friends soft beside her.',
};
const brief = (id) => {
  if (BRIEF[id]) return BRIEF[id];
  const p = cutOf(id);
  if (p && id.startsWith('cut-'))
    return `The ${p.cut} carton (${p.kana}) standing on a seamless ${CUTS[p.id].backdrop.replace(/\s*\(.*\)/, '')} backdrop, with a loose stack of the ${p.id === 'jerky' ? 'jerky' : 'crisps'} in front and scattered salt. Hard light from the left, one clean shadow.`;
  if (p && id.startsWith('kf-snap-'))
    return `A single ${p.cut.toLowerCase()} crisp breaking in half in mid-air on a flat ${CUTS[p.id].backdrop.replace(/\s*\(.*\)/, '')} background, shards and salt bursting from the break.`;
  const s = stillById[id];
  return s?.web?.purpose || s?.prompt.split('. ').slice(2, 4).join('. ') + '.';
};

/** Where the subject sits and where the type goes. */
const COMPOSITION = {
  hero: 'Subject low in the right two-thirds. The left third is pure black: headline, navigation and the ghosted sound word live there. The first take has a faint light edge and a soft red shape top-left; trim about 2% from every side on export.',
  'hero-mobile': 'Subject in the upper half. The lower half is pure black for the stacked headline and the call to action.',
  'story-slice': 'Portrait. The action sits in the lower half; the top third is dark and empty, so the chapter numeral can overlap the picture.',
  'story-salt': 'Portrait. The hand enters from the top edge, the stream falls down the centre line and lands at the bottom; black on both sides.',
  'story-dry': 'Wide and calm, one-point perspective along the racks. There is no single focal subject, so it can run full-bleed behind one short line of type.',
  'texture-macro': 'A 21:9 band with no negative space, on purpose: it is a texture, not a scene. Type never sits on it.',
  'life-listening-bar': 'Glass and dish in the lower centre. The top-left stays dark and uncluttered for a caption.',
  'life-bite': 'Portrait, face centre-right. The frame is dark around the head so the image dissolves into the night background of the section.',
  'life-train': 'Portrait. Subject in the lower two-thirds, the carriage leading away behind him; the ceiling area is quiet for a caption.',
  'life-highball': 'Glass centre-left, pack right of centre, both inside the central third so the frame also crops cleanly to portrait.',
  'pack-lineup': 'All five fronts readable. The row sits in the upper two-thirds; the lower third is darker and emptier for a heading.',
  'campaign-key': 'The snap centre-right with the pack beneath it. The left 40% is clean black for the film title and the play control.',
  'closing-gone': 'Dish in the lower-right third. Everything else is flat vermilion for the closing statement and the call to action.',
};
const composition = (id) =>
  COMPOSITION[id] ||
  (id.startsWith('cut-')
    ? 'Pack right of centre, beef front-left, top quarter empty backdrop. The backdrop is a shade deeper than the carton so the pack reads against it.'
    : stillById[id]?.web?.purpose.split('. ').slice(1).join('. ') || '—');

/* ───────────── numbers ───────────── */
const webStills = stills.filter((s) => s.web).sort((a, b) => parseInt(a.web.section) - parseInt(b.web.section));
const filmOnly = stills.filter((s) => !s.web);
const pending = stills.filter((s) => !done(s.id));
const spent = stills.filter((s) => done(s.id)).reduce((a, s) => a + (stillPrice({ ...s, params: manifest.stills[s.id].params || s.params }) ?? 0), 0);
const pendingStillCost = pending.reduce((a, s) => a + (stillPrice(s) ?? 0), 0);
const gptPending = pending.filter((s) => s.model === 'gpt_image_2_6');
const gptAll = stills.filter((s) => s.model === 'gpt_image_2_6');

const allJobs = (model) => shots.flatMap((s) => jobsForShot(s, model));
const genSeconds = (model) => allJobs(model).reduce((a, j) => a + j.duration, 0);
const takes = allJobs(film.model);
const takesDone = takes.filter((j) => manifest.video[j.key]?.status === 'done');
const startIds = [...new Set(takes.map((j) => j.start))];
const startsDone = startIds.filter(done);

// The music prompts and the effects list live in production/sound.mjs (shared with generate-audio.mjs).
const musicCost = MUSIC.reduce((a, m) => a + AUDIO.sonilo_music(m.seconds), 0);
const audioCost = musicCost + SFX.length * AUDIO.seed_audio();
const cueOf = (key) => film.musicCues.find((c) => c.key === key);
// Sound is checked on disk, by name: the files are the truth, whatever the manifest remembers.
const audioDir = path.join(ROOT, 'production/renders/audio');
const audioFile = (dir, re) => (fs.existsSync(dir) ? fs.readdirSync(dir).find((f) => re.test(f)) : null);
const cueDone = (key) => !!audioFile(audioDir, new RegExp(`^${key}\\.(mp3|wav|m4a)$`, 'i'));
const sfxDone = SFX.filter(([, name]) => audioFile(path.join(audioDir, 'sfx'), new RegExp(`^\\d+(?:\\.\\d+)?_${name}\\.(mp3|wav|m4a)$`, 'i'))).length;
const musicDone = MUSIC.every((m) => cueDone(m.key));
const fiveSecondTakes = () => takes.filter((j) => j.duration === 5).length;

const ROUTES = [
  { name: 'Reference', model: 'seedance_2_5', res: '1080p', note: 'The route this storyboard is written for: strongest motion and the best hold on a start frame.' },
  { name: 'Smart', model: 'kling4_0', res: '1080p', note: 'About a fifth of the price. Right for a first full cut; keep it as the final if the faces and the pack artwork hold.' },
  { name: '4K master', model: 'seedance_2_0', res: '4k', note: 'Only if a 4K deliverable is required (cinema, retail screens). Same start frames.' },
].map((r) => {
  const seconds = genSeconds(r.model);
  const video = videoPrice(r.model, r.res, seconds);
  return { ...r, seconds, rate: VIDEO_PER_SECOND[r.model][r.res], video, videoRe: video * REROLL, total: video * REROLL + pendingStillCost * REROLL + audioCost };
});

const statusLine = `${stills.length - pending.length} of ${stills.length} stills generated · ${startsDone.length} of ${startIds.length} film start frames ready · ${takesDone.length} of ${takes.length} film takes rendered`;

// What was actually spent, when someone has recorded it from the account's transaction log
// (production/spend.json: { "date": "...", "credits": n, "note": "..." }); otherwise an estimate for stills.
const spendFile = path.join(ROOT, 'production/spend.json');
const spendRec = fs.existsSync(spendFile) ? JSON.parse(fs.readFileSync(spendFile, 'utf8')) : null;
const spendNote = spendRec
  ? `Spent on this project: ${cr(spendRec.credits)} credits, read from the account's transaction log on ${spendRec.date} (${spendRec.note}).`
  : `Spent on stills so far: about ${cr(Math.round(spent * 100) / 100)} credits (an estimate from list prices, not from the account).`;
const everythingDone = !pending.length && takesDone.length === takes.length;
const stateNote = everythingDone
  ? 'Every still, every film take and the sound are generated, and the film is assembled.'
  : 'What is still pending is listed below; nothing is blocked by anything except credits.';
const stamp = `Built from \`production/film.mjs\`, \`production/stills.mjs\` and \`production/look.mjs\` by \`npm run docs\`. Do not edit by hand: change the data and rebuild.`;

/* ═════════════════════════ 02 — FILM STORYBOARD ═════════════════════════ */
function stillBlock(id, { heading = true } = {}) {
  const s = stillById[id];
  if (!s) return `Start frame \`${id}\` is not defined in stills.mjs.`;
  const head = heading ? `**AI image-generation prompt — start frame \`${id}\`**\n\n` : '';
  const state = done(id)
    ? `Generated. ${thumb(id, `Start frame ${id}`)}`
    : `Start frame pending — not generated yet. It will be: ${brief(id)}`;
  return `${head}${state}

- Model: ${modelLine(s)} · aspect ${s.aspect} · ${paramsLine(s)}
- Reference images: ${refsLine(s)}

${fence(s.prompt)}

${fence(genCmd(id), 'bash')}`;
}

function shotSection(shot) {
  const len = shot.t[1] - shot.t[0];
  const jobs = jobsForShot(shot);
  const starts = jobs.map((j) => j.start);
  const head = `### Frame ${pad2(shot.frame)} — ${shot.id} "${shot.name}"

${tc(shot.t[0])} to ${tc(shot.t[1])}`;

  const table = (duration) => `| | |
|---|---|
| Frame number | ${pad2(shot.frame)} of ${pad2(shots.length)} (${shot.id}) |
| Visual description | ${shot.visual} |
| Camera angle and movement | ${shot.camera} |
| Lighting and atmosphere | ${shot.light} |
| Product placement | ${shot.product} |
| Sound | ${shot.sound} |
| Transition to the next shot | ${shot.transition} |
| Suggested duration | ${duration} |`;

  if (!shot.video) {
    return `${head}

${table(`${tc(len)} in the cut. Nothing is generated.`)}

**How this frame is made.** The end card is not generated by a model. \`production/scripts/edit-film.mjs\` renders it in code from the vector logo (\`src/assets/brand/rica-wordmark.svg\`), bone on ink black: the wordmark appears whole for 0.9 s, breaks along its crack on the final snap, and 0.3 s later the lines "${film.line}", "${film.line2}" and ${film.lineJa} appear beneath it. The type is outlined from the brand fonts, so the film's last frame is identical to the logo everywhere else. There is no image prompt and no video prompt for this frame, by design: generated video cannot be trusted with a logo.`;
  }

  const duration =
    jobs.length > 1
      ? `${tc(len)} in the cut: ${jobs.length} takes of ${tc(len / jobs.length)} each. Generate ${jobs[0].duration} s per take (${shot.gen} s in total) and cut each one on its action.`
      : `${tc(len)} in the cut. Generate ${jobs[0].duration} s, so the edit has handles either side.`;

  const startLabel = (j) => (cutOf(j.start) ? ` (${cutOf(j.start).cut}, ${cutOf(j.start).kana})` : '');
  const images =
    jobs.length > 1
      ? `**AI image-generation prompts — ${jobs.length} start frames**\n\n` +
        jobs.map((j) => `Start frame \`${j.start}\`${startLabel(j)}\n\n${stillBlock(j.start, { heading: false })}`).join('\n\n')
      : stillBlock(starts[0]);

  const cmds = jobs
    .map((j) => shellLine('higgsfield', videoArgs({ prompt: j.prompt, startImage: stillPath(j.start), duration: j.duration })))
    .join('\n\n');

  // one prompt for the whole shot, or one per start frame when the takes show different things
  const ownPrompts = typeof shot.video === 'object';
  const prompts = ownPrompts ? jobs.map((j) => `For \`${j.start}\`:\n\n${fence(j.prompt)}`).join('\n\n') : fence(videoPrompt(shot, starts[0]));
  const reused = shot.reuse
    ? `\n\nThis cut reuses the take${jobs.length > 1 ? 's' : ''} rendered for the first cut (${(typeof shot.reuse === 'string' ? [shot.reuse] : Object.values(shot.reuse)).map((r) => `\`${r}\``).join(', ')}); \`migrate-takes.mjs\` copies ${jobs.length > 1 ? 'them' : 'it'} to the new name${jobs.length > 1 ? 's' : ''}. Rendering from nothing produces the same shot from the prompt above.`
    : '';
  const graded = shot.grade ? `\n\nIn the edit this shot is lifted with \`${shot.grade}\`, so it sits with the brighter scenes around it.` : '';

  return `${head}

${table(duration)}

${images}

**Higgsfield video-generation prompt**

- Model: ${VIDEO_MODELS[film.model].label} (\`${film.model}\`) · mode \`${film.modelParams.mode}\` · ${film.modelParams.resolution} · ${film.aspect} · native audio off (sound is built in the edit)
- Start frame${jobs.length > 1 ? 's' : ''}: ${starts.map((s) => `\`${s}\``).join(', ')}${jobs.length > 1 ? (ownPrompts ? ' — each with its own prompt' : ' — the same prompt is run once per start frame') : ''}

${prompts}

${fence(cmds, 'bash')}

Or through the project script, which also downloads the take and records it: \`node production/scripts/render-film.mjs ${shot.id} --go\`${reused}${graded}`;
}

const film02 = `# ${film.title} (${film.titleJa}) — campaign film storyboard

Rica Beef · ${film.duration} s · ${film.aspect} master · ${film.fps} fps · ${VIDEO_MODELS[film.model].label} at ${film.modelParams.resolution}, image-to-video from approved start frames

${stamp}

Status: ${statusLine}.

## 1. The film

**Title.** ${film.title} (${film.titleJa}, "sound").

**Line.** ${film.line} ${film.line2} / ${film.lineJa}

**Idea.** ${film.idea}

**Structure.** ${film.structure}

**Music.** ${film.music}

**How it is made.**

1. Every shot starts as a still. The start frame is generated and approved first, because a still is where packaging, palette and light can be controlled, and it costs a fraction of a video take.
2. Each start frame is then animated image-to-video. The video prompt only describes change over time: one camera move, one action.
3. One video model for the whole film. Mixing models shows as a change of grain and motion between cuts.
4. No type is ever generated. The sound words over the four snaps and the end card are added in the edit from the vector artwork.
5. The pack is never asked to move. Wherever it appears it is told to stay still and sharp, which is what keeps the artwork from morphing.
6. The cast is locked the way the pack is. Three portraits (\`cast-heroine\`, \`cast-man\`, \`cast-bartender\`) were generated first and are passed as reference images to every bar frame, and each person is described in the same words every time. Nobody in the film is a real person.
7. The film is lit to be seen. The first cut (30 s, in the Git history) was made of dark macro shots and could not be read on an ordinary screen; every scene with people in it now uses the bright bar look below, and the master is checked with a brightness readout after each edit.

## 2. Look bible

These strings are pasted byte-identical into every image prompt. Consistency comes from reuse: change a word in \`production/look.mjs\` and every prompt changes with it.

**The bar** — every scene with people in it. Written to be bright.

${fence(BAR)}

**The cast** — the same words in every frame a person appears in.

${fence(Object.entries(CAST).map(([who, desc]) => `${who}: ${desc}`).join('\n'))}

**The night world** — the website's hero, story and lifestyle pictures, and the three making-of takes in the film (A11).

${fence(NIGHT)}

**The studio world** — individual cuts, the four snaps, the closing frame.

${fence(STUDIO)}

**The product**, described the same way every time.

${fence(CRISP)}

**The pack**, always used together with the flat artwork as a reference image (\`production/refs/pack-<cut>.png\`).

${fence(PACK)}

**Negatives.**

${fence(`${NEG_CLEAN}\n${NEG_PACK}`)}

**Appended to every video prompt.**

${fence(VIDEO_RULES)}

What must hold across all ${shots.length} frames:

- The key light always comes from camera-left at about 45 degrees. In the bar it is warm light from the pendant lamps, bright enough that every face reads; in the night world it is warm tungsten; in the studio world it is hard and casts one clean shadow to the right.
- Brightness is a rule, not a taste. The bar scenes average 65 to 85 on a 0–255 scale; the first cut opened at 24. Nothing with a face in it may fall under 60.
- Four colours carry everything: ink black #0F0E0D, bone #F2ECE1, vermilion #E4381C, amber #D58A2A. The cut colours appear only as flat fields in A09 and on the packs.
- Lenses: 100mm macro for salt and snaps, 85mm for hands and faces, 50mm for the bar and the line-up, 35mm for the one wide.
- Fine 35mm grain, no bloom, no haze, no lens flare.
- The pack artwork is the vector file, passed as a reference. It is never described from memory and never redrawn.

## 3. Beat sheet

| Time | Shot | Picture | Sound |
|---|---|---|---|
${shots.map((s) => `| ${s.t[0].toFixed(1)}–${s.t[1].toFixed(1)} | ${s.id} ${s.name} | ${s.visual} | ${s.sound} |`).join('\n')}

Shot-size rhythm: the room, a face, a face, a mouth, the room, a face, two people, a face, four extreme close-ups on colour, the room, three macros, a face, the product, the range, the title. The film keeps cutting between the room and one face, so every action is followed by a reaction.

## 4. Shot by shot

${shots.map(shotSection).join('\n\n')}

## 5. Sound

The film is cut to sound, so the sound is planned like the picture.

**Music** — ${film.music} Generate both cues with \`node production/scripts/generate-audio.mjs music\`; they are saved as \`production/renders/audio/<cue>.*\`.

${MUSIC.map((m) => `\`${m.key}\` — ${m.seconds} s generated; in the film from ${cueOf(m.key)?.in} s to ${cueOf(m.key)?.out} s.\n\n${fence(m.prompt)}\n\n${fence(shellLine('higgsfield', ['generate', 'create', 'sonilo_music', '--prompt', m.prompt, '--duration', String(m.seconds), '--wait']), 'bash')}`).join('\n\n')}

**Effects** — one short file each, generated with \`seed_audio\` (${cr(AUDIO.seed_audio())} credits each) or recorded for real, which will always sound better for the snaps. They are saved in \`production/renders/audio/sfx/\` as \`<time>_<name>.wav\`. The edit finds each file by its name; the time below is the plan, and the final time, trim and level of every effect are in \`production/edit/sound.json\`.

| Effect | Planned at | Prompt |
|---|---|---|
${SFX.map(([t, name, p]) => `| \`${name}\` | ${t.toFixed(1)} s | ${p} |`).join('\n')}

Mix: the first record stops dead on the first snap (10.2 s). The eleven seconds after it are the joke, so they carry only room tone, a stool, a glass and a dish. The second record comes in at ${cueOf('music-b')?.in} s with the four snaps on its backbeat and stops dead at ${cueOf('music-b')?.out} s for the last snap. The edit script measures the mix, applies one fixed gain to reach −14 LUFS integrated and limits peaks at −2.5 dBFS. It does not compress: a quiet passage stays quiet.

## 6. Budget

Prices are the quotes returned by \`higgsfield generate cost\` on ${PRICES_MEASURED}. The film needs ${takes.length} takes and ${genSeconds(film.model)} s of generated footage for a ${film.duration} s cut. Every route allows ×${REROLL} for re-rolls: roughly one take in three gets redone.

| Route | Model | Rate | Footage | Takes | With re-rolls | Stills still to buy | Sound | Total |
|---|---|---|---|---|---|---|---|---|
${ROUTES.map((r) => `| ${r.name} | ${VIDEO_MODELS[r.model].label}, ${r.res} | ${cr(r.rate)} cr/s | ${r.seconds} s | ${credits(r.video)} | ${credits(r.videoRe)} | ${cr(Math.round(pendingStillCost * REROLL * 100) / 100)} | ${cr(Math.round(audioCost * 100) / 100)} | **${credits(r.total)} credits** |`).join('\n')}

${ROUTES.map((r) => `- **${r.name}.** ${r.note}`).join('\n')}
- Seedance 2.5 also quotes a 4K tier at ${cr(VIDEO_PER_SECOND.seedance_2_5['4k'])} cr/s (${credits(genSeconds('seedance_2_5') * VIDEO_PER_SECOND.seedance_2_5['4k'])} credits, ${credits(genSeconds('seedance_2_5') * VIDEO_PER_SECOND.seedance_2_5['4k'] * REROLL)} with re-rolls). It is dearer than the Seedance 2.0 4K route above and is listed only so the option is known.

What is in the other columns:

- Stills still to buy: ${pending.length} images — ${pending.filter((s) => s.model === 'soul_cinematic').length} on Soul Cinematic at ${cr(stillPrice({ model: 'soul_cinematic' }))} each and ${gptPending.length} on GPT Image 2.6 (pack shots) at ${[...new Set(gptPending.map((s) => `${s.params.quality} ${cr(stillPrice(s))}`))].join(' / ')} — ${cr(Math.round(pendingStillCost * 100) / 100)} credits, or ${cr(Math.round(pendingStillCost * REROLL * 100) / 100)} with re-rolls. ${startIds.length - startsDone.length} of them are film start frames; the rest are for the website.
- Optional quality pass on the ${gptAll.length} pack images: all at high / 2k is ${cr(gptAll.length * stillPrice({ model: 'gpt_image_2_6', params: { resolution: '2k', quality: 'high' } }))} credits; all at xhigh / 4k is ${cr(gptAll.length * stillPrice({ model: 'gpt_image_2_6', params: { resolution: '4k', quality: 'xhigh' } }))}.
- Sound: ${MUSIC.length} music cues, ${MUSIC.map((m) => `${m.seconds} s`).join(' and ')} (${cr(musicCost)}), and ${SFX.length} effects (${cr(SFX.length * AUDIO.seed_audio())}).
- ${spendNote} ${stateNote}

Ways to bring the Reference route down without changing the film:

- Generate 4 s takes instead of 5 s (the Seedance minimum). That is ${genSeconds(film.model) - fiveSecondTakes()} s of footage: ${credits((genSeconds(film.model) - fiveSecondTakes()) * VIDEO_PER_SECOND.seedance_2_5['1080p'])} credits, ${credits((genSeconds(film.model) - fiveSecondTakes()) * VIDEO_PER_SECOND.seedance_2_5['1080p'] * REROLL)} with re-rolls. The handles get tight, so approve start frames carefully.
- Cut the whole film on the Smart route first (${credits(ROUTES[1].videoRe)} credits), lock the edit, then re-render on the Reference route only the takes that carry a face in close-up or the pack: A03, A04, A08, A12, A13 and A14.
- Seedance 2.5 at 720p is ${cr(VIDEO_PER_SECOND.seedance_2_5['720p'])} cr/s: ${credits(genSeconds(film.model) * VIDEO_PER_SECOND.seedance_2_5['720p'])} credits, ${credits(genSeconds(film.model) * VIDEO_PER_SECOND.seedance_2_5['720p'] * REROLL)} with re-rolls. Acceptable for a social-only master, not for the website's full-width player.

Run order once there are credits:

${fence(
  `${genCmd('all')}                       # the remaining stills, start frames included
node production/scripts/render-film.mjs all                       # dry run: prints every command and the estimate
node production/scripts/render-film.mjs all --go                  # render (add --model kling4_0 for the Smart route)
node production/scripts/edit-film.mjs                             # assemble → public/videos/rica-oto-film.mp4
npm run docs                                                      # refresh these documents`,
  'bash',
)}

## 7. Cut-downs: 9:16 and 1:1

The 16:9 film is the master. The vertical and square versions are re-edits, hook first, not crops of the whole thing.

**9:16, 15 s — Reels, TikTok, Shorts.** Open on the snap; the product is on screen inside the first second.

| Time | Shot | Note |
|---|---|---|
| 0.0–2.5 | A04 The snap | Start with the crisp at her lips; the snap lands inside the first second. The first frame must work as a still with the sound off. |
| 2.5–4.5 | A05 Everyone looks | The whole counter turns. Silence. |
| 4.5–8.5 | A09 Four sounds | One second each, sound word large and centred in the upper third. |
| 8.5–10.5 | A12 He gives in | The bartender bites. |
| 10.5–13.0 | A14 The range | Stack the five packs as two rows if the row does not fit. |
| 13.0–15.0 | A15 The name | Wordmark, lines, and the call to action inside the platform safe zone. |

**1:1, 15 s — feed.** Same order as the vertical cut.

**6 s bumper.** A04 snap (2 s), two snaps from A09 (2 s), end card (2 s).

How each shot gets to the new shape:

| Shot | 9:16 | 1:1 |
|---|---|---|
| A01–A03, A06–A08, A10, A11, A13 | Not in the cut-downs | Not in the cut-downs |
| A04 The snap | Re-render from a 9:16 start frame, face centred, same cast reference | Centre crop on the face |
| A05 Everyone looks | Re-render from a 9:16 start frame: the counter seen along its length, the heroine nearest the camera | Centre crop keeps her and the two nearest heads |
| A09 Four sounds | Re-render from 9:16 start frames; the composition is a centred object on flat colour, so only the aspect changes | Centre crop of the master |
| A12 He gives in | Re-render from a 9:16 start frame | Centre crop on the face |
| A14 The range | Re-render from a 9:16 start frame with the packs in two rows | Centre crop loses the outer packs: re-render or pan across the row |
| A15 The name | Re-run the end card at 1080×1920 | Re-run at 1080×1080 |

A centre crop of the 1080p master is only 608 px wide at 9:16, which is a draft, not a deliverable. For delivery, change \`aspect\` to \`9:16\` on the start frames in \`production/stills.mjs\`, regenerate them and re-render those takes: 5 shots, ${5 * 4 + 16} s of footage, ${credits((5 * 4 + 16) * VIDEO_PER_SECOND.seedance_2_5['1080p'] * REROLL)} credits on the Reference route with re-rolls, or ${credits((5 * 4 + 16) * VIDEO_PER_SECOND.kling4_0['1080p'] * REROLL)} on the Smart route. Burn in captions for the vertical cut: at most two lines, 32 characters per line, inside the platform safe zones.

## 8. QA checklist

Run through this on a contact sheet and then on the full cut, with sound.

- [ ] The first frame works as a still, and the first sound lands inside 3 s.
- [ ] It can be seen. Read the average brightness of the master second by second: the bar scenes sit between 65 and 85 on a 0–255 scale, and nothing with a face in it falls under 60.
- [ ] Pack artwork matches the reference exactly wherever a pack is in frame (the counter in the bar, A13, A14): wordmark with its crack, every stroke of the katakana including the small ッ, cut name, waveform bars. If a label drifts, slow the camera move or composite the approved still over the take.
- [ ] Light comes from camera-left in every shot; the vermilion glow stays in the background, never on the product.
- [ ] Beef looks like beef in every frame: mahogany red, amber lace, white salt. No plastic sheen, no grey.
- [ ] The same three people in every bar shot: her chin-length bob and black knit, his round glasses and grey sweater, the bartender's grey hair and waistcoat. Five fingers, natural eyes.
- [ ] No generated text anywhere. The only type is the pack artwork, the four sound words and the end card.
- [ ] Every cut is motivated; nothing is shorter than a second.
- [ ] The first record stops dead on the first snap. The room stays quiet until ${cueOf('music-b')?.in} s. The second record stops dead at ${cueOf('music-b')?.out} s.
- [ ] Loudness −14 LUFS integrated, true peak under −1 dB, no clipping, no silent gap that is not intended.
- [ ] End card holds for at least 2 s; wordmark and line are legible on a phone.
- [ ] Exactly ${film.duration}.00 s, 1920×1080, ${film.fps} fps, H.264, plays from the first byte (\`+faststart\`).
- [ ] No claim appears in picture or sound beyond the line itself.

Fix the weakest shot first and check again. Do not re-roll the whole film.
`;

/* ═════════════════════════ 03 — WEBSITE IMAGE STORYBOARD ═════════════════════════ */
function webSection(s, i) {
  const files = siteFiles(s.id);
  const status = done(s.id)
    ? `Generated${files.length ? ' and on the site' : ', not yet optimised for the site (run `npm run images`)'}.\n\n${thumb(s.id, `${s.id} — ${s.web.section}`)}`
    : `Pending. Until it exists the site shows the art-directed "asset pending" panel in this slot.`;
  return `### ${pad2(i + 1)} · \`${s.id}\` — ${s.web.section}

${status}

| | |
|---|---|
| Purpose | ${s.web.purpose} |
| What the picture is | ${brief(s.id)} |
| Composition and negative space | ${composition(s.id)} |
| Aspect ratio | ${s.aspect} |
| Model and settings | ${modelLine(s)} · ${paramsLine(s)} |
| Reference images | ${refsLine(s)} |
| Source file | \`${stillPath(s.id)}\` |
| On the site | ${files.length ? files.map((f) => `\`src/assets/images/${f}\``).join(', ') : `\`src/assets/images/${s.id}-<width>.webp\` (written by \`npm run images\`)`} |${s.film ? `\n| Also the film start frame for | ${s.film} |` : ''}

${fence(s.prompt)}

${fence(genCmd(s.id) + (done(s.id) ? ' --force   # re-roll; the current take is kept as _v1' : ''), 'bash')}`;
}

const web03 = `# Website image storyboard

Rica Beef · ${webStills.length} images for the homepage, each with one job · ${webStills.filter((s) => done(s.id)).length} generated, ${webStills.filter((s) => !done(s.id)).length} pending

${stamp}

Every image on the site is planned before it is generated: which section it sits in, what it has to do there, where the type goes, and therefore where the subject may not go. The prompts below are the exact text sent to the model.

## Shared look

All ${webStills.length} frames belong to one of two worlds, and the two worlds share a light.

**Night** — hero, story, texture, lifestyle, campaign.

${fence(NIGHT)}

**Studio** — the individual cuts and the closing frame.

${fence(STUDIO)}

The rules that make them one set:

- Light direction. The key is always camera-left at about 45 degrees: warm and soft at night, hard in the studio with a single clean shadow falling right.
- Colour. Ink black #0F0E0D, bone #F2ECE1, vermilion #E4381C, amber #D58A2A. The cut colours only ever appear as flat fields.
- Lens and grain. Macro or short telephoto, shallow depth of field at night, f/8 in the studio, fine 35mm grain in both. No bloom, haze or flare.
- The product is described in the same words every time:

${fence(CRISP)}

- The pack is never described from memory. The flat vector artwork is passed as a reference image and this text goes with it:

${fence(PACK)}

- Negative space is written into each prompt. The slot decides the composition, not the other way round.
- People are original, fictional and adult. No real person's likeness is used.

## Sequence

| # | Image | Section | Aspect | Model | Status |
|---|---|---|---|---|---|
${webStills.map((s, i) => `| ${pad2(i + 1)} | \`${s.id}\` | ${s.web.section} | ${s.aspect} | ${MODEL_NAME[s.model] || s.model} | ${done(s.id) ? 'Generated' : 'Pending'} |`).join('\n')}

Required imagery, and where it is covered: homepage hero (\`hero\`, \`hero-mobile\`) · brand lifestyle (\`life-listening-bar\`, \`life-bite\`, \`life-train\`, \`life-highball\`) · product collection (\`pack-lineup\`) · individual flavours (\`cut-ribeye\`, \`cut-brisket\`, \`cut-sirloin\`, \`cut-shortrib\`, \`cut-jerky\`) · ingredients and texture (\`story-slice\`, \`story-salt\`, \`story-dry\`, \`texture-macro\`) · campaign photography (\`campaign-key\`) · final closing image (\`closing-gone\`).

## Frames

${webStills.map(webSection).join('\n\n')}

## Film-only start frames

${filmOnly.length} further stills exist only to start film shots. They follow the same look and are documented, with their prompts, in [02-film-storyboard.md](02-film-storyboard.md).

| Image | Film shot | Aspect | Status |
|---|---|---|---|
${filmOnly.map((s) => `| \`${s.id}\` | ${s.film} | ${s.aspect} | ${done(s.id) ? 'Generated' : 'Pending'} |`).join('\n')}

## Generate the rest

${pending.length} stills are pending (${webStills.filter((s) => !done(s.id)).length} for the website, ${filmOnly.filter((s) => !done(s.id)).length} film-only). At the settings in \`production/stills.mjs\` they cost ${cr(Math.round(pendingStillCost * 100) / 100)} credits; allow ${cr(Math.round(pendingStillCost * REROLL * 100) / 100)} with re-rolls.

${fence(
  `${genCmd('all')}     # generates every still that is not done yet, records it in production/manifest.json
npm run images                                  # optimises to src/assets/images/<id>-<width>.webp; the site picks them up
npm run docs                                    # refreshes status and thumbnails in these documents`,
  'bash',
)}

To generate only the website images: \`${genCmd(...webStills.filter((s) => !done(s.id)).map((s) => s.id))}\`

To re-roll one: \`${genCmd('<id>')} --force\`. To raise the ${gptAll.length} pack shots to the top tier (${cr(gptAll.length * stillPrice({ model: 'gpt_image_2_6', params: { resolution: '4k', quality: 'xhigh' } }))} credits): \`${genCmd(...gptAll.map((g) => g.id))} --force --quality xhigh --resolution 4k\`. The quality and resolution flags only apply to GPT Image 2.6 jobs.

If the Higgsfield CLI is not on the PATH, set \`HF_BIN\` to its location first.
`;

/* ═════════════════════════ 04 — ASSET MANIFEST ═════════════════════════ */
const HERO_LOOP_PROMPT = `Extreme slow motion. The beef crisps tumble and drift slowly through the air; the salt crystals hang, sparkle and fall very slowly. The camera is locked off. The left third of the frame stays empty black. ${VIDEO_RULES}`;
const heroLoopCmd = shellLine('higgsfield', videoArgs({ prompt: HERO_LOOP_PROMPT, startImage: stillPath('hero'), duration: 5 })).replace(' --json', '');
const heroLoopDone = exists('public/videos/hero-loop.mp4');
const filmDone = exists('public/videos/rica-oto-film.mp4');
const scrollFiles = ['scroll-hero-2160.mp4', 'scroll-hero-1080.mp4', 'scroll-hero-m.mp4', 'scroll-hero-poster.webp', 'scroll-hero-poster-m.webp'];
const scrollDone = scrollFiles.every((f) => exists(`public/videos/${f}`));
const brandFiles = [
  ['Wordmark (the Snap)', 'src/assets/brand/rica-wordmark.svg'],
  ['Lockup', 'src/assets/brand/rica-lockup.svg'],
  ['Seal', 'src/assets/brand/rica-seal.svg'],
  ...products.map((p) => [`Pack front — ${p.cut}`, `src/assets/brand/packs/pack-${p.id}.svg`]),
  ['Pack reference sheet (for image generation)', 'production/refs/pack-sheet.png'],
  ['Favicon', 'public/favicon.svg'],
];
const stillRow = (s) => {
  const files = siteFiles(s.id);
  const where = [s.web ? s.web.section : null, s.film ? `film ${s.film}` : null].filter(Boolean).join(' · ');
  const state = done(s.id) ? (s.web ? (files.length ? 'Done, on site' : 'Generated, run `npm run images`') : 'Done') : 'Pending';
  return `| \`${s.id}\` | Still, ${s.aspect} | ${where} | \`${stillPath(s.id)}\` | ${state} |`;
};
const pendingEntry = (s) => `**\`${s.id}\`** — ${[s.web ? s.web.section : null, s.film ? `film ${s.film}` : null].filter(Boolean).join(' · ')} · ${s.aspect}

- Replace the placeholder with: ${brief(s.id)}${s.web ? `\n- Composition: ${composition(s.id)}` : ''}
- Make it: \`${genCmd(s.id)}\`${s.web ? ' then `npm run images`' : ''} (${cr(stillPrice(s) ?? 0)} credits, ${MODEL_NAME[s.model] || s.model}${s.refs?.length ? `, with ${s.refs.map((r) => path.basename(r)).join(', ')} as reference` : ''})
- Lands at: \`production/renders/stills/${s.id}.png\`${s.web ? ` → \`src/assets/images/${s.id}-<width>.webp\`` : ''}`;

const manifest04 = `# Asset manifest

Rica Beef · every asset the site and the film use, with its status and, how to remake it.

${stamp}

Status: ${statusLine}. ${spendNote} ${stateNote}

On the site, a missing image is never a broken image. The \`<Media id="…">\` component shows an art-directed "asset pending" panel in the brand's colours, carrying the asset id, until \`src/assets/images/<id>-*.webp\` exists. Generate the still, run \`npm run images\`, and the panel is replaced with no code change. The video slots work the same way: \`vite.config.js\` checks \`public/videos/\` at build time and switches each one on when its file is there.

## Summary

| Asset | Type | Used in | Source file | Status |
|---|---|---|---|---|
${webStills.map(stillRow).join('\n')}
${filmOnly.map(stillRow).join('\n')}
| Scroll hero | Video, one 4K shot in three encodes, silent | 01 Hero, played by scrolling | \`public/videos/scroll-hero-*.mp4\` | ${scrollDone ? 'Done' : 'Pending'} |
| Hero loop | Video, 16:9, silent | 01 Hero, when the visitor prefers reduced motion or the scroll hero is absent | \`public/videos/hero-loop.mp4\` | ${heroLoopDone ? 'Done' : 'Pending'} |
| Campaign film "${film.title}" | Video, 16:9, ${film.duration} s | 05 Campaign player | \`public/videos/rica-oto-film.mp4\` | ${filmDone ? 'Done' : 'Pending'} |
| Film poster | Still from the film | 05 Campaign player poster | \`public/videos/rica-oto-film-poster.jpg\` | ${exists('public/videos/rica-oto-film-poster.jpg') ? 'Done' : 'Pending (written with the film)'} |
| Teaser | Video, optional stand-in | 05 Campaign | \`public/videos/rica-oto-teaser.mp4\` | ${exists('public/videos/rica-oto-teaser.mp4') ? 'Present' : 'Not present'} |
${MUSIC.map((m) => `| Music \`${m.key}\` | Audio, ${m.seconds} s | Film, ${cueOf(m.key)?.in}–${cueOf(m.key)?.out} s | \`production/renders/audio/${m.key}.*\` | ${cueDone(m.key) ? 'Done' : 'Pending'} |`).join('\n')}
| Sound effects (${SFX.length}) | Audio | Film | \`production/renders/audio/sfx/\` | ${sfxDone ? `Done (${sfxDone} of ${SFX.length})` : 'Pending (optional: the film assembles without them)'} |
${takes.map((j) => `| Film take ${j.key} | Video, ${j.duration} s | Film ${j.shot} | \`production/renders/video/${j.key}.mp4\` | ${manifest.video[j.key]?.status === 'done' ? 'Done' : done(j.start) ? 'Pending (start frame ready)' : `Pending (needs \`${j.start}\`)`} |`).join('\n')}
${brandFiles.map(([name, f]) => `| ${name} | Vector${f.endsWith('.png') ? ' → PNG' : ''} | Brand | \`${f}\` | ${exists(f) ? 'Done' : 'Missing — run `npm run brand`'} |`).join('\n')}

## Stills

${pending.length ? pending.map(pendingEntry).join('\n\n') : 'Every still has been generated. The prompt, model and reference images for each are in [03-website-image-storyboard.md](03-website-image-storyboard.md) and, for the film start frames, in [02-film-storyboard.md](02-film-storyboard.md).'}

${
  pending.length
    ? `All pending stills at once: \`${genCmd('all')}\` then \`npm run images\` — ${cr(Math.round(pendingStillCost * 100) / 100)} credits at the settings in \`production/stills.mjs\`.`
    : 'To re-roll one: `node production/scripts/generate.mjs <id> --force`, then `npm run images`. The previous version is kept beside it as `<id>_v1.png`.'
}

## Video

**Scroll hero — \`public/videos/scroll-hero-*.mp4\`** (${scrollDone ? 'done' : 'pending'})

- What it is: one continuous 10-second shot in 4K that the visitor plays by scrolling. A whole crisp hangs in warm light; it cracks down the middle; the halves part and the camera pushes through the gap to the Ribeye pack. The headline sits on the whole crisp, the sound word パリッ lands on the crack, and the closing line and buttons arrive with the pack.
- Start and end frames: \`${stillPath('scroll-start')}\` and \`${stillPath('scroll-end')}\` (GPT Image 2.6, 4K; the end frame takes the pack artwork as a reference). The video model is given both, so the shot is steered to end exactly on the pack.
- Model: Seedance 2.0 at 4K, 10 s — ${cr(videoPrice('seedance_2_0', '4k', 10))} credits. Seedance 2.5 quotes a 4K tier but refused the job on ${PRICES_MEASURED}, which is why this one shot uses 2.0.
- Encodes, all from the one take (\`production/renders/video/scroll-hero_take.mp4\`): \`scroll-hero-2160.mp4\` for very large screens, \`scroll-hero-1080.mp4\` for everything else on desktop, \`scroll-hero-m.mp4\` (900×1280, a portrait crop of the centre) for phones, and a poster for each shape. Every encode has a keyframe at least every 8 frames, because scrubbing a video is only smooth when the browser never has far to decode.
- If the shot is ever re-rendered, the moment of the crack moves. Find it with \`node production/scripts/inspect-takes.mjs scroll-hero\` and set \`SNAP\` at the top of \`src/components/HeroScroll.jsx\`.

${fence(
  `node production/scripts/render-scroll-hero.mjs            # dry run: the call and the cost, nothing sent
node production/scripts/render-scroll-hero.mjs --go       # submit the 4K shot
node production/scripts/render-scroll-hero.mjs --fetch    # download it when it is ready, then encode
node production/scripts/render-scroll-hero.mjs --encode   # re-encode from the take on disk (free)`,
  'bash',
)}

**Hero loop — \`public/videos/hero-loop.mp4\`** (${heroLoopDone ? 'done' : 'pending'})

- When it is used: the still hero, shown instead of the scroll hero to visitors who ask their device for reduced motion.
- What it is: the hero still brought to life. Extreme slow motion: the crisps hang and turn, the salt drifts and sparkles, nothing else moves. Subject on the right, left third black, so the headline stays readable over it. The tail of the take is folded into its head, so the loop has no seam. Silent, 1920×1080, under 1 MB.
- Start frame: \`${stillPath('hero')}\` (${done('hero') ? 'generated' : 'pending'}), trimmed of its frame-line artefacts by the script.
- Make it (${cr(videoPrice('seedance_2_5', '1080p', 6))} credits on Seedance 2.5 at 1080p for the 6 s take; rebuilding the loop from an existing take is free):

${fence(
  `node production/scripts/render-hero-loop.mjs          # dry run: the call and the cost, nothing sent
node production/scripts/render-hero-loop.mjs --go     # render the take, then build the loop
node production/scripts/render-hero-loop.mjs --loop   # rebuild the loop from the take already on disk`,
  'bash',
)}

**Campaign film — \`public/videos/rica-oto-film.mp4\`** (${filmDone ? 'done' : 'pending'})

- What it is: "${film.title}", the ${film.duration}-second film in [02-film-storyboard.md](02-film-storyboard.md): a hushed listening bar, one very loud bite, the counter turning to look, the others joining in, four snaps on four colours, the bartender giving in, the five packs, the wordmark breaking.
- Files: the master is \`production/final/rica_${film.title.toLowerCase()}_${film.aspect.replace(':', 'x')}_${film.duration}s.mp4\`; \`public/videos/rica-oto-film.mp4\` is the lighter encode the site plays.
- Takes: ${takesDone.length} of ${takes.length} rendered${startIds.length - startsDone.length ? `; ${startIds.length - startsDone.length} start frames still to generate (${startIds.filter((id) => !done(id)).map((id) => `\`${id}\``).join(', ')})` : ''}.
- Make it from nothing (${credits(ROUTES[0].video)} credits for the takes on the Reference route, ${credits(ROUTES[0].videoRe)} with re-rolls; ${credits(ROUTES[1].videoRe)} on the Smart route):

${fence(
  `${startIds.filter((id) => !done(id)).length ? genCmd(...startIds.filter((id) => !done(id))) + '\n' : ''}node production/scripts/render-film.mjs all          # dry run first: commands and estimate, nothing sent
node production/scripts/render-film.mjs all --go
node production/scripts/inspect-takes.mjs            # where the action is in each take; frame sheets for review
node production/scripts/edit-film.mjs                # trims, sound words, end card, mix; writes the master and the web encode`,
  'bash',
)}

- Re-cut without generating anything: change the in-points in \`production/edit/cuts.json\` or the sound timings and levels in \`production/edit/sound.json\`, then run \`edit-film.mjs\` again.
- If a render is interrupted, \`node production/scripts/recover-takes.mjs\` fetches the takes that were already paid for.

## Sound

**Music — ${MUSIC.map((m) => `\`production/renders/audio/${m.key}.*\``).join(', ')}** (${musicDone ? 'done' : 'pending'})

- What it is: ${film.music}
- Make it (${cr(musicCost)} credits for both cues): \`node production/scripts/generate-audio.mjs music\`

**Sound effects — \`production/renders/audio/sfx/\`** (${sfxDone} of ${SFX.length} generated)

- The ${SFX.length} effects, their names and their prompts are listed in section 5 of [02-film-storyboard.md](02-film-storyboard.md). Make them with \`node production/scripts/generate-audio.mjs sfx\`.
- They are generated, not recorded. Real recordings of the product breaking will beat them; drop a recording into the folder under the same name and it is used instead.
- Each effect is trimmed, levelled and timed in \`production/edit/sound.json\`, not in the file.

## What was verified, and what was not

${
  everythingDone && filmDone
    ? `- Verified: every still was generated and reviewed on contact sheets, and ${stills.length - webStills.length} of them are the film's start frames; all ${takes.length} takes were rendered and reviewed on frame sheets; the film assembles to exactly ${film.duration} s at 1920×1080, ${film.fps} fps, with the sound words over the four snaps and the end card in place; the master's brightness was read second by second, its loudness and true peak were measured after the mix, and each snap in the soundtrack was checked against the frame it belongs to. The scroll hero was checked in a browser at desktop, tablet and phone sizes by scrolling to fixed positions and reading back the film's time, the text on screen and the layout.
- Not verified: nobody has listened to the film. The mix was set from waveform and loudness measurements, not by ear, so the balance between music and effects should be checked with sound on. Nobody has watched the scroll hero or the page's animations in real time on a real phone; they were checked frame by frame, not for smoothness. The small type on the packs softens in motion (A13 and A14): it reads at normal speed and is garbled on a freeze-frame. Prices are quotes from ${PRICES_MEASURED} and can change.`
    : `- Verified: the ${stills.length - pending.length} generated stills exist on disk; the vector brand assets build from \`npm run brand\`; \`render-film.mjs\` and \`edit-film.mjs\` fail cleanly, listing what is missing, when takes are absent.
- Not verified: ${takes.length - takesDone.length} film takes have not been rendered, so their prompts, the in-points in the edit and the pack's stability in motion are untested for those shots. Prices are quotes from ${PRICES_MEASURED} and can change.`
}
`;

write('docs/02-film-storyboard.md', film02);
write('docs/03-website-image-storyboard.md', web03);
write('docs/04-asset-manifest.md', manifest04);
console.log(
  `routes: ${ROUTES.map((r) => `${r.name} ${credits(r.total)} (video ${credits(r.video)}, ×${REROLL} ${credits(r.videoRe)})`).join(' · ')} · pending stills ${cr(Math.round(pendingStillCost * 100) / 100)} · sound ${cr(Math.round(audioCost * 100) / 100)} · spent ${cr(Math.round(spent * 100) / 100)}`,
);
