# Asset manifest

Rica Beef · every asset the site and the film use, with its status and, how to remake it.

Built from `production/film.mjs`, `production/stills.mjs` and `production/look.mjs` by `npm run docs`. Do not edit by hand: change the data and rebuild.

Status: 40 of 40 stills generated · 18 of 18 film start frames ready · 19 of 19 film takes rendered. Spent on this project: 2095.86 credits, read from the account's transaction log on 2026-11-13 (first cut of the film, stills and hero loop 1,020.43; second cut and scroll hero 1,075.43 — Seedance 2.5 video 800 for the ten new film takes and 12 for a test, Seedance 2.0 4K 220 for the scroll hero shot, GPT Image 2.6 stills 36.25, sound effects 4.8, music 2.38). Every still, every film take and the sound are generated, and the film is assembled.

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
| `scroll-start` | Still, 16:9 |  | `production/renders/stills/scroll-start.png` | Done |
| `scroll-end` | Still, 16:9 |  | `production/renders/stills/scroll-end.png` | Done |
| `cast-heroine` | Still, 3:4 |  | `production/renders/stills/cast-heroine.png` | Done |
| `cast-man` | Still, 3:4 |  | `production/renders/stills/cast-man.png` | Done |
| `cast-bartender` | Still, 3:4 |  | `production/renders/stills/cast-bartender.png` | Done |
| `f-hush` | Still, 16:9 | film A01 | `production/renders/stills/f-hush.png` | Done |
| `f-bartender` | Still, 16:9 | film A02 · A06 | `production/renders/stills/f-bartender.png` | Done |
| `f-open` | Still, 16:9 | film A03 | `production/renders/stills/f-open.png` | Done |
| `f-snap` | Still, 16:9 | film A04 | `production/renders/stills/f-snap.png` | Done |
| `f-heads` | Still, 16:9 | film A05 | `production/renders/stills/f-heads.png` | Done |
| `f-offer` | Still, 16:9 | film A07 | `production/renders/stills/f-offer.png` | Done |
| `f-second` | Still, 16:9 | film A08 | `production/renders/stills/f-second.png` | Done |
| `f-everyone` | Still, 16:9 | film A10 | `production/renders/stills/f-everyone.png` | Done |
| `f-bartender-bite` | Still, 16:9 | film A12 | `production/renders/stills/f-bartender-bite.png` | Done |
| Scroll hero | Video, one 4K shot in three encodes, silent | 01 Hero, played by scrolling | `public/videos/scroll-hero-*.mp4` | Done |
| Hero loop | Video, 16:9, silent | 01 Hero, when the visitor prefers reduced motion or the scroll hero is absent | `public/videos/hero-loop.mp4` | Done |
| Campaign film "OTO" | Video, 16:9, 45 s | 05 Campaign player | `public/videos/rica-oto-film.mp4` | Done |
| Film poster | Still from the film | 05 Campaign player poster | `public/videos/rica-oto-film-poster.jpg` | Done |
| Teaser | Video, optional stand-in | 05 Campaign | `public/videos/rica-oto-teaser.mp4` | Not present |
| Music `music-a` | Audio, 14 s | Film, 0–10.3 s | `production/renders/audio/music-a.*` | Done |
| Music `music-b` | Audio, 24 s | Film, 21.5–42 s | `production/renders/audio/music-b.*` | Done |
| Sound effects (17) | Audio | Film | `production/renders/audio/sfx/` | Done (17 of 17) |
| Film take A01 | Video, 5 s | Film A01 | `production/renders/video/A01.mp4` | Done |
| Film take A02 | Video, 5 s | Film A02 | `production/renders/video/A02.mp4` | Done |
| Film take A03 | Video, 5 s | Film A03 | `production/renders/video/A03.mp4` | Done |
| Film take A04 | Video, 5 s | Film A04 | `production/renders/video/A04.mp4` | Done |
| Film take A05 | Video, 5 s | Film A05 | `production/renders/video/A05.mp4` | Done |
| Film take A06 | Video, 5 s | Film A06 | `production/renders/video/A06.mp4` | Done |
| Film take A07 | Video, 5 s | Film A07 | `production/renders/video/A07.mp4` | Done |
| Film take A08 | Video, 5 s | Film A08 | `production/renders/video/A08.mp4` | Done |
| Film take A09_ribeye | Video, 4 s | Film A09 | `production/renders/video/A09_ribeye.mp4` | Done |
| Film take A09_brisket | Video, 4 s | Film A09 | `production/renders/video/A09_brisket.mp4` | Done |
| Film take A09_sirloin | Video, 4 s | Film A09 | `production/renders/video/A09_sirloin.mp4` | Done |
| Film take A09_shortrib | Video, 4 s | Film A09 | `production/renders/video/A09_shortrib.mp4` | Done |
| Film take A10 | Video, 5 s | Film A10 | `production/renders/video/A10.mp4` | Done |
| Film take A11_kf-slice | Video, 5 s | Film A11 | `production/renders/video/A11_kf-slice.mp4` | Done |
| Film take A11_story-dry | Video, 5 s | Film A11 | `production/renders/video/A11_story-dry.mp4` | Done |
| Film take A11_kf-salt-rain | Video, 5 s | Film A11 | `production/renders/video/A11_kf-salt-rain.mp4` | Done |
| Film take A12 | Video, 5 s | Film A12 | `production/renders/video/A12.mp4` | Done |
| Film take A13 | Video, 5 s | Film A13 | `production/renders/video/A13.mp4` | Done |
| Film take A14 | Video, 5 s | Film A14 | `production/renders/video/A14.mp4` | Done |
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

**Scroll hero — `public/videos/scroll-hero-*.mp4`** (done)

- What it is: one continuous 10-second shot in 4K that the visitor plays by scrolling. A whole crisp hangs in warm light; it cracks down the middle; the halves part and the camera pushes through the gap to the Ribeye pack. The headline sits on the whole crisp, the sound word パリッ lands on the crack, and the closing line and buttons arrive with the pack.
- Start and end frames: `production/renders/stills/scroll-start.png` and `production/renders/stills/scroll-end.png` (GPT Image 2.6, 4K; the end frame takes the pack artwork as a reference). The video model is given both, so the shot is steered to end exactly on the pack.
- Model: Seedance 2.0 at 4K, 10 s — 220 credits. Seedance 2.5 quotes a 4K tier but refused the job on 2026-11-13, which is why this one shot uses 2.0.
- Encodes, all from the one take (`production/renders/video/scroll-hero_take.mp4`): `scroll-hero-2160.mp4` for very large screens, `scroll-hero-1080.mp4` for everything else on desktop, `scroll-hero-m.mp4` (900×1280, a portrait crop of the centre) for phones, and a poster for each shape. Every encode has a keyframe at least every 8 frames, because scrubbing a video is only smooth when the browser never has far to decode.
- If the shot is ever re-rendered, the moment of the crack moves. Find it with `node production/scripts/inspect-takes.mjs scroll-hero` and set `SNAP` at the top of `src/components/HeroScroll.jsx`.

```bash
node production/scripts/render-scroll-hero.mjs            # dry run: the call and the cost, nothing sent
node production/scripts/render-scroll-hero.mjs --go       # submit the 4K shot
node production/scripts/render-scroll-hero.mjs --fetch    # download it when it is ready, then encode
node production/scripts/render-scroll-hero.mjs --encode   # re-encode from the take on disk (free)
```

**Hero loop — `public/videos/hero-loop.mp4`** (done)

- When it is used: the still hero, shown instead of the scroll hero to visitors who ask their device for reduced motion.
- What it is: the hero still brought to life. Extreme slow motion: the crisps hang and turn, the salt drifts and sparkles, nothing else moves. Subject on the right, left third black, so the headline stays readable over it. The tail of the take is folded into its head, so the loop has no seam. Silent, 1920×1080, under 1 MB.
- Start frame: `production/renders/stills/hero.png` (generated), trimmed of its frame-line artefacts by the script.
- Make it (96 credits on Seedance 2.5 at 1080p for the 6 s take; rebuilding the loop from an existing take is free):

```bash
node production/scripts/render-hero-loop.mjs          # dry run: the call and the cost, nothing sent
node production/scripts/render-hero-loop.mjs --go     # render the take, then build the loop
node production/scripts/render-hero-loop.mjs --loop   # rebuild the loop from the take already on disk
```

**Campaign film — `public/videos/rica-oto-film.mp4`** (done)

- What it is: "OTO", the 45-second film in [02-film-storyboard.md](02-film-storyboard.md): a hushed listening bar, one very loud bite, the counter turning to look, the others joining in, four snaps on four colours, the bartender giving in, the five packs, the wordmark breaking.
- Files: the master is `production/final/rica_oto_16x9_45s.mp4`; `public/videos/rica-oto-film.mp4` is the lighter encode the site plays.
- Takes: 19 of 19 rendered.
- Make it from nothing (1,456 credits for the takes on the Reference route, 1,893 with re-rolls; 384 on the Smart route):

```bash
node production/scripts/render-film.mjs all          # dry run first: commands and estimate, nothing sent
node production/scripts/render-film.mjs all --go
node production/scripts/inspect-takes.mjs            # where the action is in each take; frame sheets for review
node production/scripts/edit-film.mjs                # trims, sound words, end card, mix; writes the master and the web encode
```

- Re-cut without generating anything: change the in-points in `production/edit/cuts.json` or the sound timings and levels in `production/edit/sound.json`, then run `edit-film.mjs` again.
- If a render is interrupted, `node production/scripts/recover-takes.mjs` fetches the takes that were already paid for.

## Sound

**Music — `production/renders/audio/music-a.*`, `production/renders/audio/music-b.*`** (done)

- What it is: Two cues, both heard as if from the record in the bar. First a hushed, slow jazz ballad that plays from the first frame and stops dead on the snap. Then silence. Then, as the others join in, an up-tempo swinging trio at 120 bpm whose backbeat the four snaps land on; it stops dead for the final snap.
- Make it (2.38 credits for both cues): `node production/scripts/generate-audio.mjs music`

**Sound effects — `production/renders/audio/sfx/`** (17 of 17 generated)

- The 17 effects, their names and their prompts are listed in section 5 of [02-film-storyboard.md](02-film-storyboard.md). Make them with `node production/scripts/generate-audio.mjs sfx`.
- They are generated, not recorded. Real recordings of the product breaking will beat them; drop a recording into the folder under the same name and it is used instead.
- Each effect is trimmed, levelled and timed in `production/edit/sound.json`, not in the file.

## What was verified, and what was not

- Verified: every still was generated and reviewed on contact sheets, and 22 of them are the film's start frames; all 19 takes were rendered and reviewed on frame sheets; the film assembles to exactly 45 s at 1920×1080, 24 fps, with the sound words over the four snaps and the end card in place; the master's brightness was read second by second, its loudness and true peak were measured after the mix, and each snap in the soundtrack was checked against the frame it belongs to. The scroll hero was checked in a browser at desktop, tablet and phone sizes by scrolling to fixed positions and reading back the film's time, the text on screen and the layout.
- Not verified: nobody has listened to the film. The mix was set from waveform and loudness measurements, not by ear, so the balance between music and effects should be checked with sound on. Nobody has watched the scroll hero or the page's animations in real time on a real phone; they were checked frame by frame, not for smoothness. The small type on the packs softens in motion (A13 and A14): it reads at normal speed and is garbled on a freeze-frame. Prices are quotes from 2026-11-13 and can change.
