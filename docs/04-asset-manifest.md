# Asset manifest

Rica Beef · every asset the site and the film use, with its status and, how to remake it.

Built from `production/film.mjs`, `production/stills.mjs` and `production/look.mjs` by `npm run docs`. Do not edit by hand: change the data and rebuild.

Status: 26 of 26 stills generated · 11 of 11 film start frames ready · 11 of 11 film takes rendered. Spent on this project: 1020.43 credits, read from the account's transaction log on 2026-11-13 (Seedance 2.5 video 992 for 13 takes (the 11 film takes, one re-roll of S06, the 6 s hero loop); GPT Image 2.6 stills 18.5; Soul Cinematic stills 2.28; sound effects 6.4; music 1.25). Every still, every film take and the sound are generated, and the film is assembled.

On the site, a missing image is never a broken image. The `<Media id="…">` component shows an art-directed "asset pending" panel in the brand's colours, carrying the asset id, until `src/assets/images/<id>-*.webp` exists. Generate the still, run `npm run images`, and the panel is replaced with no code change. The video slots work the same way: `vite.config.js` checks `public/videos/` at build time and switches each one on when its file is there.

## Summary

| Asset | Type | Used in | Source file | Status |
|---|---|---|---|---|
| `hero` | Still, 16:9 | 01 Hero · film S08 (alt) | `production/renders/stills/hero.png` | Done, on site |
| `hero-mobile` | Still, 9:16 | 01 Hero (mobile) | `production/renders/stills/hero-mobile.png` | Done, on site |
| `story-slice` | Still, 3:4 | 02 Story — Slice | `production/renders/stills/story-slice.png` | Done, on site |
| `story-salt` | Still, 3:4 | 02 Story — Salt | `production/renders/stills/story-salt.png` | Done, on site |
| `story-dry` | Still, 16:9 | 02 Story — Sound · film S03 | `production/renders/stills/story-dry.png` | Done, on site |
| `pack-lineup` | Still, 16:9 | 03 Collection · film S08 | `production/renders/stills/pack-lineup.png` | Done, on site |
| `cut-ribeye` | Still, 4:5 | 03 Collection | `production/renders/stills/cut-ribeye.png` | Done, on site |
| `cut-brisket` | Still, 4:5 | 03 Collection | `production/renders/stills/cut-brisket.png` | Done, on site |
| `cut-sirloin` | Still, 4:5 | 03 Collection | `production/renders/stills/cut-sirloin.png` | Done, on site |
| `cut-shortrib` | Still, 4:5 | 03 Collection | `production/renders/stills/cut-shortrib.png` | Done, on site |
| `cut-jerky` | Still, 4:5 | 03 Collection | `production/renders/stills/cut-jerky.png` | Done, on site |
| `life-listening-bar` | Still, 16:9 | 04 Lifestyle | `production/renders/stills/life-listening-bar.png` | Done, on site |
| `life-bite` | Still, 3:4 | 04 Lifestyle | `production/renders/stills/life-bite.png` | Done, on site |
| `life-train` | Still, 3:4 | 04 Lifestyle | `production/renders/stills/life-train.png` | Done, on site |
| `life-highball` | Still, 16:9 | 04 Lifestyle · film S05 | `production/renders/stills/life-highball.png` | Done, on site |
| `campaign-key` | Still, 16:9 | 05 Campaign | `production/renders/stills/campaign-key.png` | Done, on site |
| `texture-macro` | Still, 21:9 | 06 Why Rica | `production/renders/stills/texture-macro.png` | Done, on site |
| `closing-gone` | Still, 16:9 | 07 Final moment | `production/renders/stills/closing-gone.png` | Done, on site |
| `kf-salt-crystal` | Still, 16:9 | film S01 | `production/renders/stills/kf-salt-crystal.png` | Done |
| `kf-slice` | Still, 16:9 | film S02 | `production/renders/stills/kf-slice.png` | Done |
| `kf-salt-rain` | Still, 16:9 | film S04 | `production/renders/stills/kf-salt-rain.png` | Done |
| `kf-bite` | Still, 16:9 | film S06 | `production/renders/stills/kf-bite.png` | Done |
| `kf-snap-ribeye` | Still, 16:9 | film S07 | `production/renders/stills/kf-snap-ribeye.png` | Done |
| `kf-snap-brisket` | Still, 16:9 | film S07 | `production/renders/stills/kf-snap-brisket.png` | Done |
| `kf-snap-sirloin` | Still, 16:9 | film S07 | `production/renders/stills/kf-snap-sirloin.png` | Done |
| `kf-snap-shortrib` | Still, 16:9 | film S07 | `production/renders/stills/kf-snap-shortrib.png` | Done |
| Hero loop | Video, 16:9, silent | 01 Hero background | `public/videos/hero-loop.mp4` | Done |
| Campaign film "OTO" | Video, 16:9, 30 s | 05 Campaign player | `public/videos/rica-oto-film.mp4` | Done |
| Film poster | Still from the film | 05 Campaign player poster | `public/videos/rica-oto-film-poster.jpg` | Done |
| Teaser | Video, optional stand-in | 05 Campaign | `public/videos/rica-oto-teaser.mp4` | Not present |
| Music | Audio, 20 s | Film, 12.5–27.5 s | `production/renders/audio/music.*` | Done |
| Sound effects (12) | Audio | Film | `production/renders/audio/sfx/` | Folder present |
| Film take S01 | Video, 5 s | Film S01 | `production/renders/video/S01.mp4` | Done |
| Film take S02 | Video, 5 s | Film S02 | `production/renders/video/S02.mp4` | Done |
| Film take S03 | Video, 5 s | Film S03 | `production/renders/video/S03.mp4` | Done |
| Film take S04 | Video, 5 s | Film S04 | `production/renders/video/S04.mp4` | Done |
| Film take S05 | Video, 5 s | Film S05 | `production/renders/video/S05.mp4` | Done |
| Film take S06 | Video, 5 s | Film S06 | `production/renders/video/S06.mp4` | Done |
| Film take S07_ribeye | Video, 4 s | Film S07 | `production/renders/video/S07_ribeye.mp4` | Done |
| Film take S07_brisket | Video, 4 s | Film S07 | `production/renders/video/S07_brisket.mp4` | Done |
| Film take S07_sirloin | Video, 4 s | Film S07 | `production/renders/video/S07_sirloin.mp4` | Done |
| Film take S07_shortrib | Video, 4 s | Film S07 | `production/renders/video/S07_shortrib.mp4` | Done |
| Film take S08 | Video, 5 s | Film S08 | `production/renders/video/S08.mp4` | Done |
| Wordmark (the Snap) | Vector | Brand | `src/assets/brand/rica-wordmark.svg` | Done |
| Lockup | Vector | Brand | `src/assets/brand/rica-lockup.svg` | Done |
| Seal | Vector | Brand | `src/assets/brand/rica-seal.svg` | Done |
| Pack front — Ribeye | Vector | Brand | `src/assets/brand/packs/pack-ribeye.svg` | Done |
| Pack front — Brisket | Vector | Brand | `src/assets/brand/packs/pack-brisket.svg` | Done |
| Pack front — Sirloin | Vector | Brand | `src/assets/brand/packs/pack-sirloin.svg` | Done |
| Pack front — Short Rib | Vector | Brand | `src/assets/brand/packs/pack-shortrib.svg` | Done |
| Pack front — Jerky | Vector | Brand | `src/assets/brand/packs/pack-jerky.svg` | Done |
| Pack reference sheet (for image generation) | Vector → PNG | Brand | `production/refs/pack-sheet.png` | Done |
| Favicon | Vector | Brand | `public/favicon.svg` | Done |

## Stills

Every still has been generated. The prompt, model and reference images for each are in [03-website-image-storyboard.md](03-website-image-storyboard.md) and, for the film start frames, in [02-film-storyboard.md](02-film-storyboard.md).

To re-roll one: `node production/scripts/generate.mjs <id> --force`, then `npm run images`. The previous version is kept beside it as `<id>_v1.png`.

## Video

**Hero loop — `public/videos/hero-loop.mp4`** (done)

- What it is: the hero still brought to life. Extreme slow motion: the crisps hang and turn, the salt drifts and sparkles, nothing else moves. Subject on the right, left third black, so the headline stays readable over it. The tail of the take is folded into its head, so the loop has no seam. Silent, 1920×1080, under 1 MB.
- Start frame: `production/renders/stills/hero.png` (generated), trimmed of its frame-line artefacts by the script.
- Make it (96 credits on Seedance 2.5 at 1080p for the 6 s take; rebuilding the loop from an existing take is free):

```bash
node production/scripts/render-hero-loop.mjs          # dry run: the call and the cost, nothing sent
node production/scripts/render-hero-loop.mjs --go     # render the take, then build the loop
node production/scripts/render-hero-loop.mjs --loop   # rebuild the loop from the take already on disk
```

**Campaign film — `public/videos/rica-oto-film.mp4`** (done)

- What it is: "OTO", the 30-second film in [02-film-storyboard.md](02-film-storyboard.md): salt, blade, the drying room, the pour, the snap, four snaps on four colours, the five packs, the wordmark breaking.
- Files: the master is `production/final/rica_oto_16x9_30s.mp4`; `public/videos/rica-oto-film.mp4` is the lighter encode the site plays.
- Takes: 11 of 11 rendered.
- Make it from nothing (816 credits for the takes on the Reference route, 1,061 with re-rolls; 215 on the Smart route):

```bash
node production/scripts/render-film.mjs all          # dry run first: commands and estimate, nothing sent
node production/scripts/render-film.mjs all --go
node production/scripts/inspect-takes.mjs            # where the action is in each take; frame sheets for review
node production/scripts/edit-film.mjs                # trims, sound words, end card, mix; writes the master and the web encode
```

- Re-cut without generating anything: change the in-points in `production/edit/cuts.json` or the sound timings and levels in `production/edit/sound.json`, then run `edit-film.mjs` again.
- If a render is interrupted, `node production/scripts/recover-takes.mjs` fetches the takes that were already paid for.

## Sound

**Music — `production/renders/audio/music.*`** (done)

- What it is: Sparse late-night jazz trio heard as if from a record in a listening bar: upright bass and brushed snare, one muted trumpet phrase, 92 bpm, warm vinyl crackle, dry and close. Enters at 12.5 s on a needle drop, lifts at 19.5 s, stops dead at 27.5 s for the final snap. Instrumental, no vocals.
- Make it (1.25 credits): `node production/scripts/generate-audio.mjs music`

**Sound effects — `production/renders/audio/sfx/`** (12 files present)

- The 12 effects, their names and their prompts are listed in section 5 of [02-film-storyboard.md](02-film-storyboard.md). Make them with `node production/scripts/generate-audio.mjs sfx`.
- They are generated, not recorded. Real recordings of the product breaking will beat them; drop a recording into the folder under the same name and it is used instead.
- Each effect is trimmed, levelled and timed in `production/edit/sound.json`, not in the file.

## What was verified, and what was not

- Verified: every still was generated and reviewed on contact sheets, and 8 of them are the film's start frames; all 11 takes were rendered and reviewed on frame sheets; the film assembles to exactly 30 s at 1920×1080, 24 fps, with the sound words over the four snaps and the end card in place; the master's loudness and true peak were measured after the mix.
- Not verified: nobody has listened to the film. The mix was set from waveform and loudness measurements, not by ear, so the balance between music and effects should be checked with sound on. The small type on the packs softens in motion (S05 and S08): it reads at normal speed and is garbled on a freeze-frame. Prices are quotes from 2026-11-13 and can change.
