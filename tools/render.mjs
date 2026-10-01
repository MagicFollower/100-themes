// Renders the two backgrounds of each theme variant with headless Chromium.
// tools/render-night.html draws the dark variants on a dark background.
// tools/render-day.html draws the light variants.
//
//   node tools/render.mjs                         render all themes and variants
//   node tools/render.mjs synthwave hacker        render the named themes
//   VARIANTS=oled,high-contrast node tools/render.mjs
//                                                 render only these variants
//   KINDS=wordmark node tools/render.mjs          render only one background kind
//   PREVIEW=1 OUT=/tmp/x node tools/render.mjs synthwave
//                                                 write small JPEGs to $OUT
//   SIZE=3840x2160 node tools/render.mjs          render at another 16:9 size
//
// Needs `chromium` and `magick` on PATH.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { themes, VARIANTS } from './palettes.mjs';
import { launch, logoPaths } from './cdp.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PREVIEW = !!process.env.PREVIEW;
const OUT = process.env.OUT || ROOT;
const WORKERS = Number(process.env.WORKERS || 4);
const LOGO_SVG = process.env.LOGO_SVG || '/usr/share/omarchy/logo.svg';
// Output size of the backgrounds. 6144x3456 is 6K at 16:9.
const SIZE = (process.env.SIZE || '6144x3456').split('x').map(Number);
const ONLY = process.env.VARIANTS ? process.env.VARIANTS.split(',') : VARIANTS.map(v => v.key);
const KINDS = process.env.KINDS ? process.env.KINDS.split(',') : ['wordmark', 'native'];

const wanted = process.argv.slice(2);
const list = wanted.length ? themes.filter(t => wanted.includes(t.slug)) : themes;
const logo = logoPaths(readFileSync(LOGO_SVG, 'utf8'));
const scratch = mkdtempSync(join(tmpdir(), 'theme-render-'));
const browser = await launch();

// The object that the renderer pages draw from.
function renderTheme(t, v) {
  return { index: t.index, name: t.name, base: t.name, slug: v.install, motif: t.motif, colors: v.colors, ansi: v.ansi };
}

function backgroundPath(t, key, kind) {
  const dir = PREVIEW ? OUT : join(OUT, t.slug, key, 'backgrounds');
  mkdirSync(dir, { recursive: true });
  const name = kind === 'wordmark' ? 'omarchy-wordmark' : t.motif;
  return PREVIEW ? join(dir, `${t.slug}-${key}-${name}.jpg`) : join(dir, `${kind === 'wordmark' ? 0 : 1}-${name}.jpg`);
}

async function renderOne(page, theme, kind, file) {
  const [w, h] = PREVIEW ? [960, 540] : SIZE;
  const url = await page.evaluate(`renderImage(${JSON.stringify(theme)}, ${JSON.stringify(kind)}, ${w}, ${h})`);
  const png = join(scratch, `${theme.slug}-${kind}.png`);
  writeFileSync(png, Buffer.from(url.split(',')[1], 'base64'));
  execFileSync('magick', [png, '-sampling-factor', '4:4:4', '-quality', PREVIEW ? '85' : '90', '-strip', file]);
  rmSync(png);
}

const queue = [];
for (const kind of KINDS) {
  for (const t of list) {
    for (const { key, renderer } of VARIANTS.filter(v => ONLY.includes(v.key))) {
      queue.push([renderer, renderTheme(t, t.variants[key]), kind, backgroundPath(t, key, kind)]);
    }
  }
}

let done = 0;
const total = queue.length, started = Date.now();
await Promise.all(Array.from({ length: Math.min(WORKERS, queue.length) }, async () => {
  const pages = {};
  for (const r of ['night', 'day']) {
    pages[r] = await browser.open(pathToFileURL(join(ROOT, `tools/render-${r}.html`)).href);
    await pages[r].evaluate(`setLogo(${JSON.stringify(logo)})`);
  }
  while (queue.length) {
    const [renderer, theme, kind, file] = queue.shift();
    await renderOne(pages[renderer], theme, kind, file);
    done++;
    process.stdout.write(`\r${done}/${total} images, ${((Date.now() - started) / 1000).toFixed(0)}s   `);
  }
  Object.values(pages).forEach(p => p.close());
}));
process.stdout.write('\n');
await browser.close();
rmSync(scratch, { recursive: true, force: true });
