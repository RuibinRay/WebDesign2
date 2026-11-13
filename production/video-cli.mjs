/**
 * How a film shot becomes a Higgsfield CLI call. Shared by render-film.mjs (which runs it)
 * and build-docs.mjs (which prints it), so the storyboard always shows the command that
 * would actually be sent.
 *
 * Parameter names were read from `higgsfield model get <id> --json` on 2026-11-13.
 */
import fs from 'node:fs';
import path from 'node:path';
import { film, VIDEO_RULES } from './film.mjs';
import { VIDEO_DURATION } from './prices.mjs';

export const VIDEO_MODELS = {
  // Default. Start frame goes in as a reference, so the mode must be omni_reference.
  // Native audio is off: the film's sound is built in the edit.
  seedance_2_5: {
    label: 'Seedance 2.5',
    defaultResolution: '1080p',
    resolutions: ['480p', '720p', '1080p', '4k'],
    extra: (res) => ['--mode', 'omni_reference', '--resolution', res, '--bitrate_mode', 'high', '--generate_audio', 'false'],
  },
  // 4K master. `std` is the only mode that allows 1080p / 4k.
  seedance_2_0: {
    label: 'Seedance 2.0',
    defaultResolution: '4k',
    resolutions: ['480p', '720p', '1080p', '4k'],
    extra: (res) => ['--mode', 'std', '--resolution', res, '--generate_audio', 'false'],
  },
  // Economy route. Image-to-video takes the start frame; no audio parameter exists.
  kling4_0: {
    label: 'Kling 4.0',
    defaultResolution: '1080p',
    resolutions: ['720p', '1080p'],
    extra: (res) => ['--mode', 'image-to-video', '--resolution', res],
  },
};

export const videoPrompt = (shot, start) =>
  `${shot.video && typeof shot.video === 'object' ? shot.video[start] : shot.video} ${VIDEO_RULES}`;

const clamp = (model, seconds) => {
  const d = VIDEO_DURATION[model];
  return d ? Math.min(d.max, Math.max(d.min, Math.round(seconds))) : Math.round(seconds);
};

/**
 * One shot → one or more generation jobs. S07 has four start frames, so it becomes
 * four takes (S07_ribeye, S07_brisket, …) that share the shot's generated seconds.
 */
export function jobsForShot(shot, model = film.model) {
  if (!shot.video || !shot.start) return [];
  const starts = Array.isArray(shot.start) ? shot.start : [shot.start];
  const each = shot.gen / starts.length;
  return starts.map((start) => {
    const cut = starts.length > 1 ? start.replace(/^kf-snap-/, '') : null;
    return {
      key: cut ? `${shot.id}_${cut}` : shot.id,
      shot: shot.id,
      cut,
      start,
      duration: clamp(model, each),
      prompt: videoPrompt(shot, start),
    };
  });
}

/** Path of a generated still, or null if it has not been made yet. */
export function stillFile(root, id) {
  for (const ext of ['png', 'jpg', 'webp']) {
    const f = path.join(root, 'production/renders/stills', `${id}.${ext}`);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

/** The argv for `higgsfield …` — an array, never a shell string. */
export function videoArgs({ model = film.model, resolution, prompt, startImage, duration, aspect = film.aspect }) {
  const m = VIDEO_MODELS[model];
  if (!m) throw new Error(`no CLI mapping for video model "${model}" (known: ${Object.keys(VIDEO_MODELS).join(', ')})`);
  const res = resolution || m.defaultResolution;
  if (!m.resolutions.includes(res)) throw new Error(`${model} does not offer ${res} (allowed: ${m.resolutions.join(', ')})`);
  return [
    'generate', 'create', model,
    '--prompt', prompt,
    '--start-image', startImage,
    '--duration', String(duration),
    '--aspect_ratio', aspect,
    ...m.extra(res),
    '--wait', '--wait-timeout', '20m', '--json',
  ];
}

/** For printing only: a copy-pasteable bash line. */
export const shellLine = (bin, args) =>
  [bin, ...args].map((a) => (/^[\w@%+=:,./-]+$/.test(a) ? a : `'${String(a).replaceAll("'", `'\\''`)}'`)).join(' ');
