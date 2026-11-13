import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const has = (rel) => fs.existsSync(fileURLToPath(new URL(rel, import.meta.url)));

/**
 * Dev server only (never in a build). A browser that is not on screen stops firing
 * requestAnimationFrame, which freezes every scroll-driven effect and makes the page
 * impossible to test headlessly. Opening the dev site with ?rafshim swaps in a timer.
 */
const rafShimForHeadlessTesting = {
  name: 'rica-raf-shim',
  apply: 'serve',
  transformIndexHtml: () => [
    {
      tag: 'script',
      injectTo: 'head-prepend',
      children:
        "if (location.search.includes('rafshim')) {" +
        ' window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);' +
        ' window.cancelAnimationFrame = (id) => clearTimeout(id); }',
    },
  ],
};

// Relative base: the build works at https://<user>.github.io/<any-repo>/ and at a custom domain alike.
export default defineConfig({
  base: './',
  plugins: [react(), rafShimForHeadlessTesting],
  define: {
    // Video slots light up automatically when the files exist in public/videos/.
    __RICA_VIDEO__: JSON.stringify({
      heroLoop: has('./public/videos/hero-loop.mp4'),
      film: has('./public/videos/rica-oto-film.mp4'),
      teaser: has('./public/videos/rica-oto-teaser.mp4'),
      filmPoster: has('./public/videos/rica-oto-film-poster.jpg'),
      scrollHero: has('./public/videos/scroll-hero-1080.mp4') && has('./public/videos/scroll-hero-m.mp4'),
    }),
  },
  build: { target: 'es2020', assetsInlineLimit: 2048, cssCodeSplit: false },
});
