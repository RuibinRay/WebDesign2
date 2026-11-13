# Rica Beef

Every cut has a sound. 部位ごとに、音がある。

The brand experience for Rica Beef: paper-thin dried beef crisps from Japan, sold cut by cut, each named after the sound it makes. This repository holds the identity, the website, and the production kit for the campaign film and photography.

| What | Where |
|---|---|
| Brand book: story, voice, logo, colour, type, packaging, art direction | [docs/01-brand-book.md](docs/01-brand-book.md) |
| Film storyboard "OTO", fifteen frames with image and video prompts, sound, budget | [docs/02-film-storyboard.md](docs/02-film-storyboard.md) |
| Website image storyboard, eighteen images with prompts | [docs/03-website-image-storyboard.md](docs/03-website-image-storyboard.md) |
| Asset manifest: what exists, what is pending, what replaces each placeholder | [docs/04-asset-manifest.md](docs/04-asset-manifest.md) |

## Run it

Node 22 or newer (developed on Node 26).

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

`npm run build` writes a static site to `dist/`. `npm run preview` serves that build locally.

## Folder map

```
src/
  components/      reusable pieces: Nav, HeroScroll, Story, Collection, Film, Pack3D, Waveform, Media, …
  pages/           page compositions
  styles/          tokens.css (colour, type, spacing), base.css, fonts.css, sections/
  data/            products.js — the range: cuts, sound words, colours, copy, waveforms
                   site.js — section copy, nav, shop and social links
                   media.js — the image catalogue: alt text and what each placeholder stands for
  hooks/
  assets/
    images/        optimised site images, <id>-<width>.webp (written by `npm run images`)
    fonts/         self-hosted, subsetted woff2 (written by `npm run fonts`)
    brand/         wordmark, lockup, seal, pack fronts as vector outlines (written by `npm run brand`)
public/
  videos/          scroll-hero-*.mp4, rica-oto-film.mp4, hero-loop.mp4 — switched on automatically when present
  favicon.svg
scripts/           build-brand-assets, build-fonts, optimize-images
production/        the film and photography kit
  look.mjs         the look bible: the strings pasted into every prompt
  stills.mjs       every still image as data: model, aspect, prompt, references, purpose
  film.mjs         the film as data: fifteen shots, timings, video prompts
  sound.mjs        the film's two music cues and its sound effects as data
  edit/            cuts.json and sound.json: the edit, as two small files
  prices.mjs       credit prices as quoted on the day they were measured
  refs/            flat pack artwork passed to the image model as reference
  renders/         generated stills, video takes and audio (the originals)
  manifest.json    what has been generated, with job ids and source URLs
  scripts/         generate, render-film, render-scroll-hero, generate-audio, edit-film, build-docs
docs/              the four documents above
```

## Edit the content

- **Products, sound words, colours, product copy, waveforms:** `src/data/products.js`. It is the single source for the website, the pack artwork and the image prompts. After changing it run `npm run brand` to redraw the packs.
- **Section copy, navigation, shop link and social links:** `src/data/site.js`. The shop link (`shopUrl`) and the three social links are placeholders until you set them; unset social links render as plain text, never as dead links.
- **Image alt text and placeholder briefs:** `src/data/media.js`.
- **Colour and type tokens:** `src/styles/tokens.css`.
- **The look of generated imagery:** `production/look.mjs`. Individual images: `production/stills.mjs`. The film: `production/film.mjs`. Run `npm run docs` afterwards so the storyboards match.

Several product facts are proposals, not confirmed: net weights, the sirloin and short-rib cuts, tasting language. The full list is at the end of the brand book.

## What exists

Everything is generated: 40 stills (18 on the site; the rest are film start frames, the three cast portraits and the two ends of the hero shot), the 19 film takes, two music cues and 17 sound effects, the assembled film, the 4K hero shot and the hero background loop. Status of every asset is in [docs/04-asset-manifest.md](docs/04-asset-manifest.md).

| File | What it is |
|---|---|
| `production/final/rica_oto_16x9_45s.mp4` | The film master, second cut: 45 s, 1920×1080, 24 fps, H.264 CRF 17, −14 LUFS |
| `public/videos/rica-oto-film.mp4` | The web encode of the film that the site plays (about 13 MB) |
| `public/videos/scroll-hero-2160.mp4`, `-1080.mp4`, `-m.mp4` | The hero: one 10 s shot in 4K that the visitor plays by scrolling, encoded for large screens, ordinary screens and phones |
| `public/videos/hero-loop.mp4` | The still hero's background loop, shown to visitors who ask for reduced motion (silent, under 1 MB) |
| `production/renders/` | The originals: stills, takes, audio |

The site finds assets by name. If an image is ever missing, the `<Media id="…">` component shows an art-directed "frame pending" panel with the asset id instead of a broken image, until `src/assets/images/<id>-*.webp` exists. The video slots work the same way from `public/videos/` (restart the dev server or rebuild after adding a video).

## Regenerate or change an asset

Generation uses the [Higgsfield](https://higgsfield.ai) CLI and spends credits. Log in once with `higgsfield auth login`. If the binary is not on your PATH, point `HF_BIN` at it. Every script reads its content from the data files in `production/` and records what it made in `production/manifest.json`.

| Script | Does | Spends credits |
|---|---|---|
| `production/scripts/generate.mjs <id …\|all> [--force]` | Stills from `stills.mjs` | Yes |
| `npm run images` | Converts the stills into the responsive WebP set the site loads | No |
| `production/scripts/render-film.mjs <shot …\|all> [--go] [--force]` | Film takes from `film.mjs`. A dry run unless `--go` is passed | With `--go` |
| `production/scripts/recover-takes.mjs` | Downloads takes that were submitted but never fetched (an interrupted run) | No |
| `production/scripts/inspect-takes.mjs` | Prints where the action is in each take and writes frame sheets | No |
| `production/scripts/generate-audio.mjs <all\|music\|sfx\|name …>` | Music and sound effects from `sound.mjs` | Yes |
| `production/scripts/edit-film.mjs` | Cuts the film: trims, sound words, end card, mix, master and web encode | No |
| `production/scripts/render-scroll-hero.mjs [--go\|--fetch\|--encode]` | The scroll hero: one 4K shot between two approved frames, then the three encodes the page scrubs | With `--go` |
| `production/scripts/render-hero-loop.mjs [--go\|--loop]` | The reduced-motion hero background: one take from the hero still, folded into a seamless loop | With `--go` |
| `production/scripts/migrate-takes.mjs` | Copies the first cut's product takes to the names the second cut uses | No |
| `npm run docs` | Rebuilds the storyboards and the asset manifest from the data and the manifest | No |

To re-cut the film without generating anything, edit the two small files in `production/edit/` and run `edit-film.mjs` again:

- `cuts.json` sets where each cut starts inside its take.
- `sound.json` trims, levels and times every sound effect, and sets where each music cue starts, stops and how loud it is.

`--force` re-rolls a still or a take and keeps the previous one as `_v1`. To raise the pack shots to the top tier: `generate.mjs all --force --quality xhigh --resolution 4k`.

What a full re-render costs is worked through in [docs/02-film-storyboard.md](docs/02-film-storyboard.md): the film is 19 takes and 91 seconds of generated footage, 1,456 credits on Seedance 2.5 at 1080p before re-rolls, and the hero shot is 220 on Seedance 2.0 at 4K.

## Deploy to GitHub Pages

The build uses a relative base (`base: './'` in `vite.config.js`), so it works at `https://<user>.github.io/<repo>/` and on a custom domain without changes.

1. Create an empty repository on GitHub (no README, no licence, no .gitignore). On a free account, Pages needs the repository to be public.
2. Point this folder at it and push the `main` branch:

```bash
git remote add origin https://github.com/<user>/<repo>.git
```

```bash
git push -u origin main
```

3. In the repository: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` builds the site and publishes `dist/` on every push to `main`. The first run appears under the Actions tab; the site URL is shown on the Pages settings page when it finishes. If the first run fails because Pages was not yet switched on, re-run it from the Actions tab after step 3.

### What is and is not in the repository

Everything the site needs to build is committed: the source, the optimised images in `src/assets/images/`, the fonts, and the two videos in `public/videos/`. So are the documents (with their thumbnails in `docs/img/`) and the whole production kit: prompts, data, scripts, the edit settings and the manifest.

The generated originals are not. `.gitignore` leaves out `production/renders/` (stills, takes and audio, about 150 MB), `production/final/` (the film master) and the edit's working files. The build does not need them, and a public Pages repository is the wrong place for them. They exist only on the machine that generated them, so back them up somewhere of your own; Git LFS or a private repository would also do.

The manifest records job ids but never the provider's download links, which carry an account identifier.

## Credits

Type: Dela Gothic One, Bodoni Moda, Instrument Sans, DM Mono, Shippori Mincho, all under the SIL Open Font License. Imagery generated with Higgsfield (Soul Cinematic, GPT Image 2.6); every person shown is fictional.
