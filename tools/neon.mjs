// Renders an animated neon sign wallpaper for each theme variant:
// <theme>/<variant>/backgrounds/2-neon-sign.mp4, 3840x2160, a 20 second loop.
//
//   node tools/neon.mjs                          render all themes and variants
//   node tools/neon.mjs synthwave hacker         render the named themes
//   VARIANTS=day,oled node tools/neon.mjs        render only these variants
//   SKIP_EXISTING=1 node tools/neon.mjs          keep videos that exist
//
// The page draws 4 stills per theme (on, off, half, part). ffmpeg builds the
// video from a frame timeline, so only 4 frames per theme are drawn.
// Needs `chromium` and `ffmpeg`.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { themes, VARIANTS } from './palettes.mjs';
import { launch, logoPaths } from './cdp.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30;

// The loop: dark, flicker on, a long hold, a letter glitch, a long hold,
// a double blink, a short hold, then dark again. 600 frames, 20 seconds.
const TIMELINE = [
  ['off', 12],
  ['on', 2], ['off', 3], ['on', 1], ['off', 6], ['half', 3], ['off', 2],
  ['on', 230],
  ['part', 2], ['on', 1], ['part', 3],
  ['on', 220],
  ['off', 2], ['on', 3], ['off', 4],
  ['on', 60],
  ['half', 3],
  ['off', 43],
];

const wanted = process.argv.slice(2);
const ONLY = process.env.VARIANTS ? process.env.VARIANTS.split(',') : VARIANTS.map(v => v.key);
const jobs = [];
for (const t of wanted.length ? themes.filter(x => wanted.includes(x.slug)) : themes) {
  for (const { key } of VARIANTS.filter(v => ONLY.includes(v.key))) {
    const out = join(ROOT, t.slug, key, 'backgrounds', '2-neon-sign.mp4');
    if (process.env.SKIP_EXISTING && existsSync(out)) continue;
    jobs.push({ t, key, out });
  }
}
const logo = logoPaths(readFileSync('/usr/share/omarchy/logo.svg', 'utf8'));
const scratch = mkdtempSync(join(tmpdir(), 'theme-neon-'));
const browser = await launch();
const page = await browser.open(pathToFileURL(join(ROOT, 'tools/neon.html')).href);
await page.evaluate(`setLogo(${JSON.stringify(logo)})`);

const started = Date.now();
let done = 0;
for (const { t, key, out } of jobs) {
  const v = t.variants[key];
  const theme = { index: t.index, colors: v.colors, ansi: v.ansi };
  const dir = join(scratch, `${t.slug}-${key}`);
  mkdirSync(dir, { recursive: true });
  for (const state of ['on', 'off', 'half', 'part']) {
    const url = await page.evaluate(`renderNeon(${JSON.stringify(theme)}, '${state}')`);
    writeFileSync(join(dir, `${state}.png`), Buffer.from(url.split(',')[1], 'base64'));
  }
  // The concat demuxer needs the last file twice, or it drops its duration.
  // -frames:v then cuts the video at exactly 20 seconds.
  const lines = TIMELINE.flatMap(([state, frames]) => [`file '${state}.png'`, `duration ${(frames / FPS).toFixed(6)}`]);
  lines.push(`file '${TIMELINE[TIMELINE.length - 1][0]}.png'`);
  const total = TIMELINE.reduce((a, [, n]) => a + n, 0);
  writeFileSync(join(dir, 'list.txt'), lines.join('\n') + '\n');

  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'),
    '-vf', `fps=${FPS},format=yuv420p`, '-frames:v', String(total), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26',
    '-tune', 'stillimage', '-g', '600', '-an', '-movflags', '+faststart', out,
  ]);
  rmSync(dir, { recursive: true, force: true });
  done++;
  process.stdout.write(`\r${done}/${jobs.length} videos, ${((Date.now() - started) / 1000).toFixed(0)}s   `);
}
process.stdout.write('\n');
page.close();
await browser.close();
rmSync(scratch, { recursive: true, force: true });
