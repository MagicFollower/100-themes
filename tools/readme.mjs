// Writes README.md from the theme data.
//
//   node tools/readme.mjs

import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { themes, hexOklch } from './palettes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'https://github.com/bjarneo/100-themes';
const SITE = 'https://bjarneo.github.io/100-themes';

const MOTIF = {
  'sunset-grid': ['sunset grid', 'a neon sun over a perspective grid'],
  'code-rain': ['code rain', 'columns of falling code glyphs'],
  nebula: ['nebula', 'a nebula in a star field'],
  aurora: ['aurora', 'an aurora over a mountain lake'],
  skyline: ['skyline', 'a city skyline at night in the rain'],
  equalizer: ['equalizer', 'an LED spectrum analyzer'],
  waveform: ['waveform', 'layered sound wave ribbons'],
  blobs: ['light spots', 'soft light spots with bokeh'],
  depths: ['deep water', 'light rays in deep water'],
  embers: ['embers', 'embers that rise over dunes'],
  pixels: ['pixel art', 'a pixel art landscape at night'],
  scanlines: ['VHS', 'a VHS screen with tracking noise'],
  contours: ['contours', 'a topographic contour map'],
  tubes: ['neon tubes', 'neon tube shapes on a brick wall'],
  planet: ['planet', 'a planet in space'],
};

// Color names by OKLCH hue.
const HUES = [
  [15, 'pink'], [45, 'red'], [80, 'orange'], [115, 'yellow'], [135, 'lime'], [160, 'green'],
  [190, 'teal'], [220, 'cyan'], [270, 'blue'], [292, 'indigo'], [318, 'violet'], [345, 'magenta'], [361, 'pink'],
];
// Dark tints of some hues have their own names.
const DARK = { orange: 'brown', yellow: 'olive', lime: 'olive green', pink: 'plum' };
function hueName(hex, dark = false) {
  const { C, h } = hexOklch(hex);
  if (C < .012) return 'neutral';
  const name = HUES.find(([max]) => h < max)[1];
  return dark ? DARK[name] || name : name;
}

function hueSpread(t) {
  const hs = t.ansi.slice(1, 7).map(h => hexOklch(h).h);
  let max = 0;
  for (const a of hs) for (const b of hs) { const d = Math.abs(a - b); max = Math.max(max, Math.min(d, 360 - d)); }
  return max;
}

function character(t) {
  const { c, set } = t.row;
  const spread = hueSpread(t);
  if (spread < 60) return `The 6 ANSI hues stay close to ${hueName(t.ansi[2])}, so the palette reads as one color.`;
  if (set === 'p') return 'The ANSI colors are light pastels with high lightness and low chroma.';
  if (c >= .27) return 'The ANSI colors use very high chroma for a strong neon look.';
  if (c >= .2) return 'The ANSI colors are saturated and bright.';
  if (c >= .14) return 'The ANSI colors use medium chroma for a calmer look.';
  return 'The ANSI colors use low chroma for a soft, muted look.';
}

function describe(t) {
  const c = t.colors;
  const bg = hueName(c.background, true), acc = hueName(c.accent);
  const bgText = bg === 'neutral' ? 'a neutral black background' : `a dark ${bg} background`;
  const motifText = t.slug === 'black-hole' ? 'a black hole with an accretion disk' : MOTIF[t.motif][1];
  return [
    `${t.name} has ${bgText} and a ${acc} accent.`,
    character(t),
    `The native background shows ${motifText}.`,
  ].join(' ');
}

// The anchor that GitHub makes from a heading.
const anchor = s => s.toLowerCase().replace(/[^\p{L}\p{N}\- ]/gu, '').replace(/ /g, '-');
const pad = n => String(n).padStart(3, '0');

// Size of the published files, rounded to 10 MB.
const sizeMb = Math.round(Number(execFileSync('du', ['-sm', '--exclude=.git', '--exclude=.capture', '--exclude=promo.mp4', ROOT]).toString().split('\t')[0]) / 10) * 10;

const toc = [];
for (let i = 0; i < themes.length; i += 5) {
  toc.push('| ' + themes.slice(i, i + 5).map(t => `${pad(t.index)} [${t.name}](#${anchor(t.name)})`).join(' | ') + ' |');
}

const sections = themes.map(t => {
  const c = t.colors;
  const native = `1-${t.motif}.jpg`;
  return `### ${t.name}

[![${t.name} applied to workspace 7](assets/shots/${t.slug}.webp)](${t.slug}/preview.png)

\`${pad(t.index)}\` · Folder: [\`${t.slug}/\`](${t.slug}/) · [Open in the gallery](${SITE}/#${t.slug})

${describe(t)}

| Key | Value |
| --- | --- |
| \`background\` | \`${c.background}\` |
| \`foreground\` | \`${c.foreground}\` |
| \`accent\` | \`${c.accent}\` |
| \`selection\` | \`${c.selection}\` |
| Icon theme | \`${t.icons}\` |
| Backgrounds | [\`0-omarchy-wordmark.jpg\`](${t.slug}/backgrounds/0-omarchy-wordmark.jpg), [\`${native}\`](${t.slug}/backgrounds/${native}) |

<details>
<summary>All 16 ANSI colors</summary>

| # | Normal | # | Bright |
| --- | --- | --- | --- |
${['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'].map((n, k) => `| ${k} ${n} | \`${t.ansi[k]}\` | ${k + 8} bright ${n} | \`${t.ansi[k + 8]}\` |`).join('\n')}

</details>

\`\`\`bash
curl -fsSL ${SITE}/install.sh | bash -s -- ${t.slug} --set
\`\`\`
`;
});

const motifTable = Object.entries(MOTIF).map(([k, [label]]) => {
  const list = themes.filter(t => t.motif === k).map(t => `[${t.name}](#${anchor(t.name)})`).join(', ');
  return `| ${label} | ${list} |`;
}).join('\n');

const readme = `# 100 Omarchy themes

[![All 100 themes](assets/mosaic.jpg)](${SITE})

This repo has 100 dark themes for [Omarchy](https://omarchy.org). Each theme has a 16-color ANSI palette, a background with the Omarchy wordmark, and a background drawn for its colors.

- Gallery: [${SITE.replace('https://', '')}](${SITE})
- Themes: 100 folders at the root of this repo, one folder for each theme.

## Install

\`install.sh\` copies themes into \`~/.config/omarchy/themes\`. Each theme becomes a normal Omarchy theme folder.

### Install one theme without a clone

The script downloads only the themes that you name:

\`\`\`bash
curl -fsSL ${SITE}/install.sh | bash -s -- synthwave --set
\`\`\`

\`--set\` applies the theme after the install. Name more than one theme to install more than one:

\`\`\`bash
curl -fsSL ${SITE}/install.sh | bash -s -- synthwave hacker neon-tokyo
\`\`\`

### Install from a clone

\`\`\`bash
git clone --depth 1 ${REPO} ~/.local/share/100-themes
cd ~/.local/share/100-themes
./install.sh --all
omarchy theme set synthwave
\`\`\`

The full repo is about ${sizeMb} MB because it has 200 backgrounds at 3840×2160.

### Options

| Command | Result |
| --- | --- |
| \`install.sh synthwave hacker\` | Installs the named themes |
| \`install.sh --all\` | Installs all 100 themes |
| \`install.sh --list\` | Lists the theme names |
| \`install.sh synthwave --set\` | Installs the theme, then applies it |
| \`install.sh --update\` | Installs again every theme that the script installed |
| \`install.sh --remove synthwave\` | Removes a theme that the script installed |
| \`install.sh --link synthwave\` | Links to the clone instead of copying. Run \`git pull\` in the clone to update. |
| \`install.sh --force sakura\` | Replaces a theme with the same name that the script did not install |

The script writes a \`.100-themes\` marker file in each theme that it copies. \`--update\` and \`--remove\` use this file, so they never change a theme that you made.

### Name conflicts

The script does not replace a theme that it did not install. If \`~/.config/omarchy/themes/sakura\` exists, the script skips \`sakura\` and tells you. Rename your theme, or use \`--force\` to replace it.

\`omarchy theme install <url>\` does not work with this repo. That command expects one theme at the root of a repo.

## Switch themes and backgrounds

\`\`\`bash
omarchy theme set neon-tokyo   # apply a theme
omarchy theme bg next          # show the next background of the current theme
omarchy theme current          # show the name of the current theme
\`\`\`

Omarchy starts with the first background in alphabetical order. That is \`0-omarchy-wordmark.jpg\`. Run \`omarchy theme bg next\` to show the native background. Omarchy remembers the last background for each theme.

## What is in a theme folder

The folders use the same layout as other Omarchy Quattro themes:

\`\`\`text
synthwave/
├── colors.toml                     # the palette that Omarchy reads
├── icons.theme                     # the Yaru icon theme for the accent color
├── preview.png                     # a screenshot of workspace 7 with the theme applied
└── backgrounds/
    ├── 0-omarchy-wordmark.jpg      # the Omarchy wordmark in the theme colors
    └── 1-sunset-grid.jpg           # the native background for the theme colors
\`\`\`

Omarchy generates the configs for Hyprland, the terminals, Neovim, btop, VS Code and other apps from \`colors.toml\`. The themes do not ship app configs.

### \`colors.toml\`

Every theme sets all keys that Omarchy reads, so no key falls back to a derived value.

| Key | Source |
| --- | --- |
| \`background\`, \`foreground\` | The background and foreground of the palette |
| \`red\`, \`green\`, \`yellow\`, \`blue\`, \`magenta\`, \`cyan\` | ANSI colors 1 to 6 |
| \`bright_red\` to \`bright_magenta\` | ANSI colors 9 to 14 |
| \`lighter_background\` | ANSI color 0 |
| \`muted\` | ANSI color 8. Terminals use it as bright black. |
| \`light_foreground\` | ANSI color 7 |
| \`bright_foreground\` | ANSI color 15 |
| \`accent\` | ANSI color 5. The design uses this color for the title glow. |
| \`selection\` | The background mixed with 28% of the accent |
| \`dark_background\`, \`darker_background\` | The background mixed with 25% and 50% black |
| \`dark_foreground\` | The foreground mixed with 35% of the background |
| \`orange\` | The OKLCH midpoint between red and yellow |
| \`brown\` | Orange mixed with 50% black |
| \`hyprland_active_border\` | A 45° gradient from cyan to magenta |
| \`hyprland_inactive_border\` | \`muted\` at 67% opacity |

Terminals map the normal black slot to \`background\` and the normal white slot to \`foreground\`. That is how Omarchy builds every terminal theme.

## How the palettes work

The palettes come from the Neon ANSI Palette design. The design builds each palette in the OKLCH color space from 5 values:

- The hue, lightness and chroma of the background.
- 6 hues for red, green, yellow, blue, magenta and cyan.
- 1 chroma value for the 6 colors.
- 1 of 4 lightness sets: neon, pastel, mono or soft.

The bright colors use the same hues with 0.1 more lightness and less chroma. A seeded random offset of up to 4° moves each hue, so two palettes with the same hues are not identical. Colors outside sRGB lose chroma until they fit.

\`tools/palettes.mjs\` has the same table and the same math as the design. Neon Wave is the one palette with fixed hex values.

## Backgrounds

Each theme has 2 backgrounds at 3840×2160. The important content stays near the center, so the images also fill 16:10 and 21:9 screens.

- \`0-omarchy-wordmark.jpg\` shows the Omarchy wordmark with a cyan to magenta gradient from the palette. The 6 normal and 6 bright ANSI colors are below it.
- \`1-<motif>.jpg\` is drawn only with colors from the palette. The motif fits the theme name.

| Motif | Themes |
| --- | --- |
${motifTable}

## Regenerate the themes

The \`tools/\` folder has every script that made this repo. You need Node.js 22 or later, \`chromium\`, \`magick\` and \`ffmpeg\`.

| Command | Result |
| --- | --- |
| \`node tools/build.mjs\` | Writes \`colors.toml\`, \`icons.theme\` and \`assets/themes.js\` |
| \`node tools/render.mjs [theme...]\` | Renders the backgrounds with headless Chromium |
| \`tools/capture.sh [theme...]\` | Applies each theme, takes a screenshot of workspace 7, and writes \`preview.png\` |
| \`node tools/promo.mjs <song.mp3>\` | Renders a promo video to \`assets/promo.mp4\` with one theme per beat. Git ignores this file. |
| \`node tools/readme.mjs\` | Writes this README |

\`tools/capture.sh\` changes your desktop while it runs. It switches to workspace 7 and applies each theme. When it stops, it applies your original theme again and removes the links that it added. If another workspace becomes active, the script stops before it takes a screenshot.

To change a palette, edit the table in \`tools/palettes.mjs\`. Then run the commands in the order of the table.

## All themes

| | | | | |
| --- | --- | --- | --- | --- |
${toc.join('\n')}

${sections.join('\n')}`;

writeFileSync(join(ROOT, 'README.md'), readme);
console.log(`wrote README.md (${readme.split('\n').length} lines)`);
