/**
 * RICA BEEF — the film's sound, as data. Second cut.
 * Read by production/scripts/generate-audio.mjs (generation) and build-docs.mjs (the storyboard).
 * edit-film.mjs picks the files up by name from production/renders/audio/ and lays each one in at
 * the time, trim and level given in production/edit/sound.json.
 */

/**
 * Two cues, both heard as if from the record playing in the bar (film.musicCues says where each sits).
 * `seconds` is what is generated; the cut uses less.
 */
export const MUSIC = [
  {
    key: 'music-a',
    seconds: 14,
    prompt:
      'A slow, hushed late-night jazz ballad heard from a vinyl record in a small listening bar: soft upright bass, brushed snare, a few sparse piano notes, 70 bpm, ' +
      'warm vinyl crackle, intimate, quiet and unhurried. It starts immediately with no intro and stays calm throughout. Instrumental, no vocals.',
  },
  {
    key: 'music-b',
    seconds: 24,
    prompt:
      'An up-tempo swinging jazz trio at exactly 120 bpm heard from a vinyl record: walking upright bass, a crisp ride cymbal, sharp rimshots on beats two and four, ' +
      'playful piano stabs; joyful, tight and danceable, with vinyl warmth. It starts immediately on the downbeat with no intro and keeps one steady groove with no breaks. Instrumental, no vocals.',
  },
];

/**
 * [time in the film (s), name, prompt]. Saved as "<time>_<name>.wav" in production/renders/audio/sfx/.
 * The times here are only a first guess for the file name: the cut's real timings live in
 * production/edit/sound.json. Recordings of the real product breaking will beat every one of
 * these; drop a recording into the folder under the same name and it is used instead.
 */
export const SFX = [
  [3.6, 'cloth', 'A soft cotton cloth polishing a wine glass in slow circles, a faint squeak. Close mic, dry, quiet room.'],
  [10.3, 'snap', 'One loud, clean snap of a very thin, brittle crisp breaking. Close mic, dry, no reverb.'],
  [10.3, 'room', 'A low, warm room hum with one faint tick of metal expanding. Three seconds.'], // looped under the silence after the snap
  [12.4, 'stool','One wooden bar stool creaking once in a silent room. Close mic, dry.'],
  [15.9, 'glass-down', 'A glass set down gently on a wooden counter: one soft knock. Close mic, dry.'],
  [17.6, 'slide', 'A small ceramic dish sliding a short way across a wooden counter. Close mic, dry.'],
  [20.2, 'snap2', 'One clean, slightly deeper snap of a thin brittle crisp breaking, then a single quiet crunch. Close mic, dry, no reverb.'],
  [21.6, 'pari', 'A high, glassy snap of a paper-thin crisp. One transient, fast decay.'],
  [22.6, 'zaku', 'A deep, layered crunch: several coarse cracks in quick succession.'],
  [23.6, 'saku', 'A light, airy crisp bite, soft and short.'],
  [24.6, 'kari', 'A hard double crackle, two sharp cracks close together.'],
  [25.6, 'crowd', 'A small group of six people in a bar laughing warmly and crunching crisps, lively and happy, no words. Four seconds.'],
  [29.0, 'blade', 'One long, soft stroke of a very sharp knife slicing through meat. Close mic, dry.'],
  [31.0, 'salt', 'A dry hiss of coarse salt grains falling, then a light patter as they land on a hard surface.'],
  [33.4, 'snap3', 'One crisp, clean snap of a thin brittle cracker, then a short low chuckle from an older man. Close mic, dry.'],
  [35.2, 'pour', 'Soda poured over ice in a tall glass: fizz, ice shifting, one glassy clink at the end.'],
  [42.9, 'endcard-snap', 'One final clean snap of a brittle crisp in total silence. Close mic, dry.'],
];
