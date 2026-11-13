/**
 * RICA BEEF — LOOK BIBLE (machine-readable).
 * These strings are pasted byte-identical into every image prompt. Consistency
 * comes from reuse, not hope: change a word here and every prompt changes with it.
 */

/** The night world: hero, story, lifestyle, campaign, film. */
export const NIGHT =
  'Photoreal premium food commercial cinematography, shot on ARRI Alexa 35, fine 35mm film grain, shallow depth of field. ' +
  'Low-key lighting: one warm tungsten key light from camera-left at 45 degrees with soft falloff, deep neutral-black shadows, ' +
  'a faint vermilion-red glow in the far background. ' +
  'Palette: ink black #0F0E0D, warm bone white #F2ECE1, vermilion #E4381C, amber #D58A2A. ' +
  'Rich, natural, appetising colour. No bloom, no haze, no lens flare.';

/** The colour-block studio world: individual cuts, the snaps, the closing frame. */
export const STUDIO =
  'Photoreal premium product photography, medium-format camera, 90mm lens, f/8, crisp focus, fine film grain. ' +
  'One hard key light from camera-left at 45 degrees casting a single clean, defined shadow to the right. ' +
  'Seamless matte paper backdrop and floor in one flat colour. ' +
  'Brand palette: ink black #0F0E0D, warm bone white #F2ECE1, vermilion #E4381C. Rich, natural, appetising colour.';

/** The product, described the same way every time. */
export const CRISP =
  'RICA beef crisps are paper-thin, irregular palm-sized shards of dried beef: deep mahogany-red with a lighter translucent amber lace ' +
  'where the marbling was, brittle and glassy like a very thin cracker, dusted with coarse white salt flakes and tiny dark specks of toasted spice.';

/** The pack, described the same way every time (used alongside the artwork reference image). */
export const PACK =
  'a slim upright rectangular carton in matte uncoated paperboard (about 10 cm wide, 15 cm tall, 3 cm deep) whose front panel ' +
  'reproduces the flat artwork in the reference image exactly — same flat colour, the RICA wordmark top-left, one huge katakana sound word ' +
  'set vertically down the centre, the cut name bottom-left and a small row of waveform bars bottom-right. Do not redesign, restyle or add to the artwork.';

export const NEG_CLEAN = 'No text, no lettering, no logos, no packaging, no watermark.';
export const NEG_PACK = 'No extra text beyond the pack artwork, no other brands, no watermark.';

/** Per-cut look of the beef itself + the backdrop tone for studio frames. */
export const CUTS = {
  ribeye: {
    crisp: 'paper-thin ribeye crisps: mahogany-red with a generous translucent amber lace of rendered marbling, glassy and brittle, dusted with coarse white salt flakes',
    backdrop: 'deep vermilion red (#C92F16)',
  },
  brisket: {
    crisp: 'paper-thin brisket crisps: darker brown-red with long visible grain lines running the length of each shard, a little more rugged, dusted with coarse white salt flakes',
    backdrop: 'warm mustard yellow (#D2931A)',
  },
  sirloin: {
    crisp: 'paper-thin sirloin crisps: lean, even rosy-brown, very fine and airy, almost translucent at the edges, dusted with coarse white salt flakes',
    backdrop: 'warm off-white bone (#EDE6D8)',
  },
  shortrib: {
    crisp: 'paper-thin short-rib crisps: deep dark caramel-brown with glossy caramelised edges and fine striped marbling, dusted with coarse white salt flakes',
    backdrop: 'charcoal black (#171614)',
  },
  jerky: {
    crisp: 'thick-cut strips of beef jerky: dense, dark mahogany, matte, with visible long fibres, dusted with coarse white salt flakes',
    backdrop: 'deep indigo blue (#172A47)',
  },
};
