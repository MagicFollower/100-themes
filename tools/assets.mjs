// Writes the derived files that the site, the README and the Aether links use:
//
//   assets/aether/<theme>/<variant>/*.jpg   3840x2160 copies for Aether links
//   assets/bg/<theme>/<variant>/*.webp      1440x810 previews for the gallery
//   assets/shots/<theme>/variants.webp      the 5 variant screenshots in a row
//   assets/mosaic.jpg                       all 500 screenshots in one image
//
//   node tools/assets.mjs
//
// Aether stops a download after 60 seconds, so its links use the smaller
// copies. The script skips files that are newer than their source.
// Needs `magick` on PATH. Run it after tools/render.mjs and tools/capture.sh.

import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { cpus } from 'node:os';
import { themes, VARIANTS } from './palettes.mjs';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fresh = (dest, srcs) => existsSync(dest) && srcs.every(s => statSync(s).mtimeMs <= statSync(dest).mtimeMs);

// The screenshot of a variant, or its native background preview when
// tools/capture.sh has not captured that variant yet.
function shotOrBackground(t, key) {
  const shot = join(ROOT, 'assets', 'shots', t.slug, `${key}.webp`);
  return existsSync(shot) ? shot : join(ROOT, 'assets', 'bg', t.slug, key, `1-${t.motif}.webp`);
}

const jobs = [];
for (const t of themes) {
  for (const { key } of VARIANTS) {
    const src = join(ROOT, t.slug, key, 'backgrounds');
    if (!existsSync(src)) continue;
    for (const f of readdirSync(src).filter(f => f.endsWith('.jpg'))) {
      const aether = join(ROOT, 'assets', 'aether', t.slug, key, f);
      const thumb = join(ROOT, 'assets', 'bg', t.slug, key, f.replace(/\.jpg$/, '.webp'));
      if (!fresh(aether, [join(src, f)])) jobs.push(['magick', [join(src, f), '-resize', '3840x2160', '-sampling-factor', '4:2:0', '-quality', '82', '-interlace', 'Plane', '-strip', aether]]);
      if (!fresh(thumb, [join(src, f)])) jobs.push(['magick', [join(src, f), '-resize', '1440x810', '-quality', '80', '-strip', thumb]]);
    }
  }
  const shots = VARIANTS.map(({ key }) => shotOrBackground(t, key));
  const strip = join(ROOT, 'assets', 'shots', t.slug, 'variants.webp');
  if (shots.every(existsSync) && !fresh(strip, shots)) {
    jobs.push(['magick', ['montage', ...shots, '-tile', `${shots.length}x1`, '-geometry', '360x225+4+0', '-background', '#07070d', '-quality', '82', strip]]);
  }
}

let done = 0;
await Promise.all(Array.from({ length: Math.max(1, cpus().length - 2) }, async () => {
  while (jobs.length) {
    const [cmd, args] = jobs.shift();
    mkdirSync(dirname(args[args.length - 1]), { recursive: true });
    await run(cmd, args);
    process.stdout.write(`\r${++done} files`);
  }
}));
process.stdout.write('\n');

// The wall: 25 columns, so each row shows 5 themes with their 5 variants.
// The variant order shifts by one on each row, so light tiles form diagonals.
const all = [];
for (let row = 0; row < themes.length / 5; row++) {
  for (let col = 0; col < 25; col++) {
    const t = themes[row * 5 + Math.floor(col / 5)];
    all.push(shotOrBackground(t, VARIANTS[(col + row) % VARIANTS.length].key));
  }
}
const missing = all.filter(f => !existsSync(f)).length;
if (missing) {
  console.log(`skipped assets/mosaic.jpg: ${missing} images are missing`);
} else {
  await run('magick', ['montage', ...all, '-tile', '25x20', '-geometry', '76x48+0+0', '-background', '#000', '-quality', '88', join(ROOT, 'assets', 'mosaic.jpg')]);
  console.log('wrote assets/mosaic.jpg');
}
