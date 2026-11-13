import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const has = (rel) => fs.existsSync(fileURLToPath(new URL(rel, import.meta.url)));

// Relative base: the build works at https://<user>.github.io/<any-repo>/ and at a custom domain alike.
export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    // Video slots light up automatically when the files exist in public/videos/.
    __RICA_VIDEO__: JSON.stringify({
      heroLoop: has('./public/videos/hero-loop.mp4'),
      film: has('./public/videos/rica-oto-film.mp4'),
      teaser: has('./public/videos/rica-oto-teaser.mp4'),
    }),
  },
  build: { target: 'es2020', assetsInlineLimit: 2048, cssCodeSplit: false },
});
