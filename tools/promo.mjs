// Renders assets/promo.mp4: 50 clips, 10 from each variant, one per beat.
//
//   node tools/promo.mjs <song.mp3>
//
// Environment:
//   BPM        tempo of the song (default 74.9)
//   FIRST_BEAT time of the first beat in seconds (default 0.795)
//   URL        text on the outro card
//
// Run tools/capture.sh and tools/assets.mjs first. Needs `chromium` and `ffmpeg`.

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { themes, VARIANTS } from './palettes.mjs';
import { launch, logoPaths } from './cdp.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SONG = process.argv[2];
if (!SONG) { console.error('Usage: node tools/promo.mjs <song.mp3>'); process.exit(1); }

const FPS = 30;
const BEAT = 60 / Number(process.env.BPM || 74.9);
const FIRST_BEAT = Number(process.env.FIRST_BEAT || 0.795);
const INTRO_BEATS = 4, OUTRO_BEATS = 7, PER_VARIANT = 10;
const URL_TEXT = process.env.URL || 'bjarneo.github.io/100-themes';
const OUT = join(ROOT, 'assets', 'promo.mp4');
const WALL = join(ROOT, 'assets', 'mosaic.jpg');
mkdirSync(join(ROOT, 'assets'), { recursive: true });

const frameAt = beat => Math.round((FIRST_BEAT + beat * BEAT) * FPS);

// Take themes round-robin across the motifs, so each section looks different.
const byMotif = new Map();
for (const t of themes) { if (!byMotif.has(t.motif)) byMotif.set(t.motif, []); byMotif.get(t.motif).push(t); }
const spread = [];
while (spread.length < themes.length) for (const list of byMotif.values()) if (list.length) spread.push(list.shift());

const clips = [];
const segments = [{ kind: 'intro', from: 0, to: frameAt(INTRO_BEATS) }];
let beat = INTRO_BEATS;
VARIANTS.forEach((v, vi) => {
  const picks = spread.slice(vi * PER_VARIANT, (vi + 1) * PER_VARIANT);
  const first = picks[0].variants[v.key];
  segments.push({ kind: 'section', label: v.label, part: vi + 1, theme: { colors: first.colors, ansi: first.ansi }, from: frameAt(beat), to: frameAt(beat + 1) });
  beat++;
  for (const t of picks) {
    const tv = t.variants[v.key];
    const raw = join(ROOT, '.capture', t.slug, `${v.key}.png`);
    const shot = pathToFileURL(existsSync(raw) ? raw : join(ROOT, t.slug, v.key, 'preview.png')).href;
    clips.push({ name: t.name, label: v.label, n: clips.length + 1, colors: tv.colors, ansi: tv.ansi, shot });
    segments.push({ kind: 'clip', index: clips.length - 1, from: frameAt(beat), to: frameAt(beat + 1) });
    beat++;
  }
});
segments.push({ kind: 'outro', from: frameAt(beat), to: frameAt(beat + OUTRO_BEATS) });
const total = segments[segments.length - 1].to;
const seconds = total / FPS;

const browser = await launch();
const page = await browser.open(pathToFileURL(join(ROOT, 'tools/promo.html')).href);
const intro = themes.find(t => t.slug === 'neon-wave').variants.dark;
await page.evaluate(`setup(${JSON.stringify({
  logo: logoPaths(readFileSync('/usr/share/omarchy/logo.svg', 'utf8')),
  wall: pathToFileURL(WALL).href,
  url: URL_TEXT,
  intro: { colors: intro.colors, ansi: intro.ansi },
  clips,
})})`);

const ffmpeg = spawn('ffmpeg', [
  '-v', 'error', '-y',
  '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-i', SONG,
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '160k', '-af', `afade=t=out:st=${(seconds - 3).toFixed(2)}:d=3`,
  '-t', seconds.toFixed(3), '-movflags', '+faststart', OUT,
], { stdio: ['pipe', 'inherit', 'inherit'] });

let written = 0;
for (const seg of segments) {
  if (seg.kind === 'clip') await page.evaluate(`prepare(${seg.index})`);
  const n = seg.to - seg.from;
  for (let f = 0; f < n; f++) {
    const url = await page.evaluate(`frame(${JSON.stringify(seg)}, ${f}, ${n})`);
    const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
    if (!ffmpeg.stdin.write(buf)) await new Promise(r => ffmpeg.stdin.once('drain', r));
    written++;
  }
  process.stdout.write(`\r${written}/${total} frames`);
}
ffmpeg.stdin.end();
await new Promise(r => ffmpeg.on('close', r));
process.stdout.write(`\nwrote ${OUT} (${seconds.toFixed(1)}s)\n`);
page.close();
await browser.close();
