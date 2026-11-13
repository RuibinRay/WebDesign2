/**
 * RICA BEEF — the film's sound, as data.
 * Read by production/scripts/generate-audio.mjs (generation) and build-docs.mjs (the storyboard).
 * edit-film.mjs picks the files up by name from production/renders/audio/.
 */
import { film } from './film.mjs';

/** 15 s in the cut (12.5 → 27.5 s), plus handles. */
export const MUSIC_SECONDS = 20;

// film.music describes the track inside the film (film timecodes). The generator needs the
// same track described from its own zero: it enters at 12.5 s and lifts at 19.5 s in the
// film, so the lift is 7 s into the track and the hard stop is at 15 s.
export const MUSIC_PROMPT =
  `${film.music.split(' Enters at')[0]} Starts straight away on a soft needle-drop thump with no intro, ` +
  `lifts at 7 seconds, and ends on a clean, hard stop at 15 seconds. Instrumental, no vocals.`;

/**
 * [time in the film (s), name, prompt]. The file is saved as "<time>_<name>.wav" in
 * production/renders/audio/sfx/ and laid in at that time. Move the times to the picture
 * by renaming the files.
 */
export const SFX = [
  [2.8, 'tick', 'One single dry tick of a salt crystal landing on a brittle surface. Close mic, no reverb.'],
  [3.0, 'blade', 'One long, soft stroke of a very sharp knife slicing through meat. Close mic, dry.'],
  [6.0, 'room', 'A low, warm room hum with one faint tick of metal expanding. Three seconds.'],
  [9.2, 'salt', 'A dry hiss of coarse salt grains falling, then a light patter as they land on a hard surface.'],
  [12.5, 'needle', 'A turntable needle dropping onto a record: a soft thump, then warm vinyl crackle.'],
  [12.8, 'pour', 'Soda poured over ice in a tall glass: fizz, ice shifting, one glassy clink at the end.'],
  [16.6, 'snap', 'One loud, clean snap of a very thin, brittle crisp breaking. Close mic, dry, no reverb.'],
  [19.6, 'pari', 'A high, glassy snap of a paper-thin crisp. One transient, fast decay.'],
  [20.6, 'zaku', 'A deep, layered crunch: several coarse cracks in quick succession.'],
  [21.6, 'saku', 'A light, airy crisp bite, soft and short.'],
  [22.6, 'kari', 'A hard double crackle, two sharp cracks close together.'],
  [28.4, 'endcard-snap', 'One final clean snap of a brittle crisp in total silence. Close mic, dry.'],
];
