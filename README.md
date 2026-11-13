# Rica Beef

Every cut has a sound. 部位ごとに、音がある。

The brand experience for Rica Beef: paper-thin dried beef crisps from Japan, sold cut by cut, each named after the sound it makes. This repository holds the identity, the website, and the production kit for the campaign film and photography.

| What | Where |
|---|---|
| Brand book: story, voice, logo, colour, type, packaging, art direction | [docs/01-brand-book.md](docs/01-brand-book.md) |
| Film storyboard "OTO", nine frames with image and video prompts, budget | [docs/02-film-storyboard.md](docs/02-film-storyboard.md) |
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
  components/      reusable pieces: Nav, Hero, Story, Collection, Pack3D, Waveform, Media, …
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
  videos/          hero-loop.mp4, rica-oto-film.mp4 — switched on automatically when present
  favicon.svg
scripts/           build-brand-assets, build-fonts, optimize-images
production/        the film and photography kit
  look.mjs         the look bible: the strings pasted into every prompt
  stills.mjs       every still image as data: model, aspect, prompt, references, purpose
  film.mjs         the film as data: nine shots, timings, video prompts
  prices.mjs       credit prices as quoted on the day they were measured
  refs/            flat pack artwork passed to the image model as reference
  renders/         generated stills, video takes and audio (the originals)
  manifest.json    what has been generated, with job ids and source URLs
  scripts/         generate, render-film, edit-film, build-docs
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

Everything is generated: 26 stills (18 on the site, 8 film start frames), the 11 film takes, the music and 12 sound effects, the assembled film and the hero background loop. Status of every asset is in [docs/04-asset-manifest.md](docs/04-asset-manifest.md).

| File | What it is |
|---|---|
| `production/final/rica_oto_16x9_30s.mp4` | The film master: 1920×1080, 24 fps, H.264 CRF 17, about −15 LUFS |
| `public/videos/rica-oto-film.mp4` | The web encode of the film that the site plays (about 7 MB) |
| `public/videos/hero-loop.mp4` | The seamless hero background loop (silent, under 1 MB) |
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
| `production/scripts/render-hero-loop.mjs [--go\|--loop]` | The hero background: one take from the hero still, folded into a seamless loop | With `--go` |
| `npm run docs` | Rebuilds the storyboards and the asset manifest from the data and the manifest | No |

To re-cut the film without generating anything, edit the two small files in `production/edit/` and run `edit-film.mjs` again:

- `cuts.json` sets where each cut starts inside its take.
- `sound.json` trims, levels and times every sound effect, and sets the music level.

`--force` re-rolls a still or a take and keeps the previous one as `_v1`. To raise the pack shots to the top tier: `generate.mjs all --force --quality xhigh --resolution 4k`.

What a full re-render costs is worked through in [docs/02-film-storyboard.md](docs/02-film-storyboard.md): the film is 11 takes and 51 seconds of generated footage, 816 credits on Seedance 2.5 at 1080p before re-rolls.

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
