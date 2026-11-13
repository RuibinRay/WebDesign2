/**
 * Higgsfield credit prices as quoted by `higgsfield generate cost` on 2026-11-13.
 * Quotes, not a contract: re-check with `higgsfield generate cost <model> …` before a large run.
 * Used by render-film.mjs (dry-run estimate) and build-docs.mjs (budget tables).
 */
export const PRICES_MEASURED = '2026-11-13';

/** Credits per image. */
export const IMAGE = {
  soul_cinematic: () => 0.12,
  gpt_image_2_6: ({ resolution = '2k', quality = 'medium' } = {}) =>
    ({
      '2k': { low: 0.5, medium: 1, high: 2.75, xhigh: 4.5, max: 9 },
      '4k': { low: 0.75, medium: 1.25, high: 4.25, xhigh: 7, max: 15 },
    })[resolution]?.[quality] ?? null,
};

/** Credits per second of generated video. */
export const VIDEO_PER_SECOND = {
  seedance_2_5: { '480p': 3, '720p': 7, '1080p': 16, '4k': 28 },
  seedance_2_0: { '1080p': 12, '4k': 22 },
  kling4_0: { '720p': 2.25, '1080p': 3.25 },
};

/** Accepted clip lengths in whole seconds, as far as they were verified. */
export const VIDEO_DURATION = {
  seedance_2_5: { min: 4, max: 30 },
  seedance_2_0: { min: 4, max: 15 },
  kling4_0: { min: 3, max: 15 },
};

export const AUDIO = {
  sonilo_music: (seconds) => Math.round((1.88 / 30) * seconds * 100) / 100,
  seed_audio: () => 0.1,
};

export const stillPrice = (job, override = {}) => {
  const fn = IMAGE[job.model];
  return fn ? fn({ ...job.params, ...override }) : null;
};

export const videoPrice = (model, resolution, seconds) => {
  const rate = VIDEO_PER_SECOND[model]?.[resolution];
  return rate == null ? null : rate * seconds;
};

/** Re-roll allowance used in every budget: one take in three gets redone. */
export const REROLL = 1.3;
