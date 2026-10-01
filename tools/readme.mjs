// Writes README.md from the theme data.
//
//   node tools/readme.mjs

import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { themes, VARIANTS, hexOklch, contrast } from './palettes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'https://github.com/bjarneo/100-themes';
const SITE = 'https://bjarneo.github.io/100-themes';

const MOTIF = {
  'sunset-grid': ['sunset grid', 'a neon sun over a perspective grid'],
  'code-rain': ['code rain', 'columns of falling code glyphs'],
  nebula: ['nebula', 'a nebula in a star field'],
  aurora: ['aurora', 'an aurora over a mountain lake'],
  skyline: ['skyline', 'a city skyline'],
  equalizer: ['equalizer', 'an LED spectrum analyzer'],
  waveform: ['waveform', 'layered sound wave ribbons'],
  blobs: ['light spots', 'soft light spots with bokeh'],
  depths: ['deep water', 'light rays in water'],
  embers: ['embers', 'embers or dust over dunes'],
  pixels: ['pixel art', 'a pixel art landscape'],
  scanlines: ['VHS', 'a VHS screen with tracking noise'],
  contours: ['contours', 'a topographic contour map'],
  tubes: ['neon tubes', 'neon tube shapes on a wall'],
  planet: ['planet', 'a planet in the sky'],
};

// Color names by OKLCH hue.
const HUES = [
  [15, 'pink'], [45, 'red'], [80, 'orange'], [115, 'yellow'], [135, 'lime'], [160, 'green'],
  [190, 'teal'], [220, 'cyan'], [270, 'blue'], [292, 'indigo'], [318, 'violet'], [345, 'magenta'], [361, 'pink'],
];
const DARK = { orange: 'brown', yellow: 'olive', lime: 'olive green', pink: 'plum' };
function hueName(hex, dark = false) {
  const { C, h } = hexOklch(hex);
  if (C < .012) return 'neutral';
  const name = HUES.find(([max]) => h < max)[1];
  return dark ? DARK[name] || name : name;
}

function hueSpread(ansi) {
  const hs = ansi.slice(1, 7).map(h => hexOklch(h).h);
  let max = 0;
  for (const a of hs) for (const b of hs) { const d = Math.abs(a - b); max = Math.max(max, Math.min(d, 360 - d)); }
  return max;
}

function describe(t) {
  const v = t.variants.dark, c = v.colors, { c: chroma, set } = t.row;
  const bg = hueName(c.background, true), acc = hueName(c.accent);
  const bgText = bg === 'neutral' ? 'a neutral black background' : `a dark ${bg} background`;
  let character;
  if (hueSpread(v.ansi) < 60) character = `The 6 ANSI hues stay close to ${hueName(v.ansi[2])}, so the palette reads as one color.`;
  else if (set === 'p') character = 'The ANSI colors are light pastels.';
  else if (chroma >= .27) character = 'The ANSI colors use very high chroma for a strong neon look.';
  else if (chroma >= .2) character = 'The ANSI colors are saturated and bright.';
  else if (chroma >= .14) character = 'The ANSI colors use medium chroma for a calmer look.';
  else character = 'The ANSI colors use low chroma for a soft, muted look.';
  const motifText = t.slug === 'black-hole' ? 'a black hole, or an eclipse in the day variants' : MOTIF[t.motif][1];
  return `${t.name} has ${bgText} and a ${acc} accent in its dark variant. ${character} The native background shows ${motifText}.`;
}

// Lowest contrast of the 6 normal ANSI colors and the text, per variant.
function stats(key) {
  let normal = 99, text = 99;
  for (const t of themes) {
    const v = t.variants[key], bg = v.colors.background;
    v.ansi.slice(1, 7).forEach(h => normal = Math.min(normal, contrast(h, bg)));
    text = Math.min(text, contrast(v.colors.foreground, bg));
  }
  return { normal: normal.toFixed(1), text: text.toFixed(1) };
}

const anchor = s => s.toLowerCase().replace(/[^\p{L}\p{N}\- ]/gu, '').replace(/ /g, '-');
const pad = n => String(n).padStart(3, '0');
const sizeMb = Math.round(Number(execFileSync('du', ['-sm', '--exclude=.git', '--exclude=.capture', ROOT]).toString().split('\t')[0]) / 10) * 10;

const USE = {
  dark: 'The design palette. A dark background with neon colors.',
  day: 'A light background with the same hues. For bright rooms and daylight.',
  'high-contrast': 'A near-black background. Every ANSI color reaches 7:1, the WCAG AAA level.',
  'day-high-contrast': 'A near-white background. Every ANSI color reaches 7:1, the WCAG AAA level.',
  oled: 'The design colors on pure black. Panels stay black, so most pixels on an OLED screen stay off.',
};

const variantTable = VARIANTS.map(v => {
  const s = stats(v.key);
  return `| ${v.label} | \`synthwave${v.suffix}\` | ${USE[v.key]} | ${s.normal}:1 | ${s.text}:1 |`;
}).join('\n');

const toc = [];
for (let i = 0; i < themes.length; i += 5) {
  toc.push('| ' + themes.slice(i, i + 5).map(t => `${pad(t.index)} [${t.name}](#${anchor(t.name)})`).join(' | ') + ' |');
}

const sections = themes.map(t => {
  const rows = VARIANTS.map(v => {
    const tv = t.variants[v.key], c = tv.colors;
    return `| ${v.label} | [\`${tv.install}\`](${t.slug}/${v.key}/) | \`${c.background}\` | \`${c.foreground}\` | \`${c.accent}\` | \`${tv.icons}\` |`;
  }).join('\n');
  const colors = VARIANTS.map(v => {
    const a = t.variants[v.key].ansi;
    return `| ${v.label} | ${a.slice(0, 8).map(h => `\`${h}\``).join(' ')} | ${a.slice(8).map(h => `\`${h}\``).join(' ')} |`;
  }).join('\n');
  return `### ${t.name}

[![${t.name} in 5 variants: dark, day, high contrast, day high contrast and OLED](assets/shots/${t.slug}/variants.webp)](${SITE}/#${t.slug})

\`${pad(t.index)}\` · Folder: [\`${t.slug}/\`](${t.slug}/) · [Open in the gallery](${SITE}/#${t.slug})

${describe(t)}

| Variant | Theme name | \`background\` | \`foreground\` | \`accent\` | Icons |
| --- | --- | --- | --- | --- | --- |
${rows}

<details>
<summary>All 16 ANSI colors of each variant</summary>

| Variant | Normal, 0 to 7 | Bright, 8 to 15 |
| --- | --- | --- |
${colors}

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

const readme = `# 500 Omarchy themes

[![All 500 themes. Each row shows 5 themes in their 5 variants.](assets/mosaic.jpg)](${SITE})

This repo has 100 neon palettes for [Omarchy](https://omarchy.org), and each palette comes in 5 variants. That makes 500 Omarchy themes. Each variant has a 16-color ANSI palette, a background with the Omarchy wordmark, and a background drawn for its colors.

- Gallery: [${SITE.replace('https://', '')}](${SITE})
- Promo video: [\`assets/promo.mp4\`](assets/promo.mp4), every theme once, 20 from each variant
- Backgrounds: 1000 at 6K, 6144×3456

## Variants

| Variant | Theme name | What it is | Lowest ANSI contrast | Lowest text contrast |
| --- | --- | --- | --- | --- |
${variantTable}

The contrast columns show the lowest WCAG contrast ratio against the background, over all 100 themes. Each variant is a complete Omarchy theme with its own folder, so you can install any mix of them.

## Install

\`install.sh\` copies themes into \`~/.config/omarchy/themes\`. Each theme variant becomes a normal Omarchy theme folder. The script installs all 5 variants of a theme unless you name some with \`--variant\`.

### Install one theme without a clone

The script downloads only the themes that you name:

\`\`\`bash
curl -fsSL ${SITE}/install.sh | bash -s -- synthwave --set
\`\`\`

To install some variants only, add \`--variant\`:

\`\`\`bash
curl -fsSL ${SITE}/install.sh | bash -s -- synthwave hacker --variant oled,day
\`\`\`

\`--set\` applies the first installed variant of the last theme.

### Install from a clone

\`\`\`bash
git clone --depth 1 ${REPO} ~/.local/share/100-themes
cd ~/.local/share/100-themes
./install.sh --all --variant dark,oled
omarchy theme set synthwave-oled
\`\`\`

The full repo is about ${sizeMb} MB because it has 1000 backgrounds at 6K. To download less, use the \`curl\` command above. It downloads only the folders that you name.

### Options

| Command | Result |
| --- | --- |
| \`install.sh synthwave hacker\` | Installs all 5 variants of the named themes |
| \`install.sh synthwave --variant day,oled\` | Installs only these variants |
| \`install.sh --all\` | Installs all 500 themes |
| \`install.sh --list\` | Lists the 100 theme names |
| \`install.sh synthwave --set\` | Installs the theme, then applies its first variant |
| \`install.sh --update\` | Installs again every theme variant that the script installed |
| \`install.sh --remove synthwave\` | Removes the variants of a theme that the script installed |
| \`install.sh --link synthwave\` | Links to the clone instead of copying. Run \`git pull\` in the clone to update. |
| \`install.sh --force synthwave\` | Replaces a theme with the same name that the script did not install |

The variant names are \`dark\`, \`day\`, \`high-contrast\`, \`day-high-contrast\` and \`oled\`. The script writes a \`.100-themes\` marker file in each theme that it copies. \`--update\` and \`--remove\` use this file, so they never change a theme that you made.

### Apply with Aether

[Aether](https://github.com/omacom/aether) can apply a theme straight from the [gallery](${SITE}). Open a theme, pick a variant, and select 1 of these buttons:

| Button | Result |
| --- | --- |
| Apply with Aether | Aether loads the palette and the background, then applies them at once through its own theme. This works again and again. |
| Install as Omarchy theme | Aether adds the variant to \`~/.config/omarchy/themes\` and activates it at once. This stops if a theme with the same name exists, for example after \`install.sh\`. |
| Open in editor | Aether opens the palette in its editor. Nothing changes until you select Apply. |

Apply and Install use \`silent=true\`, like the links on the omarchy-themes site. They run at once, without the Aether window.

Aether stops a download after 60 seconds. On a slow connection, a 6K background can take longer, so the links download a 3840×2160 copy from \`assets/aether/\`. GitHub does not render \`aether://\` links, so use the gallery or build a link yourself:

\`\`\`text
aether://apply?colors=${SITE}/synthwave/oled/colors.toml&wallpaper=${SITE}/assets/aether/synthwave/oled/1-sunset-grid.jpg&silent=true
\`\`\`

Add \`&as_omarchy_theme=synthwave-oled\` to install the variant. Use \`&edit=true\` instead of \`&silent=true\` to open the editor.

### Name conflicts

The script does not replace a theme that it did not install. If \`~/.config/omarchy/themes/sakura\` exists, the script skips \`sakura\` and tells you. Rename your theme, or use \`--force\` to replace it.

\`omarchy theme install <url>\` does not work with this repo. That command expects one theme at the root of a repo.

## Switch themes and backgrounds

\`\`\`bash
omarchy theme set neon-tokyo-oled   # apply a theme
omarchy theme bg next               # show the next background of the current theme
omarchy theme current               # show the name of the current theme
\`\`\`

Omarchy starts with the first background in alphabetical order. That is \`0-omarchy-wordmark.jpg\`. Run \`omarchy theme bg next\` to show the native background.

## Repo layout

\`\`\`text
synthwave/
├── dark/                          # installs as synthwave
│   ├── colors.toml                # the palette that Omarchy reads
│   ├── icons.theme                # the Yaru icon theme for the accent color
│   ├── preview.png                # a screenshot of workspace 7 with the variant applied
│   └── backgrounds/
│       ├── 0-omarchy-wordmark.jpg # the Omarchy wordmark in the variant colors, 6K
│       └── 1-sunset-grid.jpg      # the native background for the variant colors, 6K
├── day/                           # installs as synthwave-day
├── high-contrast/                 # installs as synthwave-high-contrast
├── day-high-contrast/             # installs as synthwave-day-high-contrast
└── oled/                          # installs as synthwave-oled
\`\`\`

Omarchy generates the configs for Hyprland, the terminals, Neovim, btop, VS Code and other apps from \`colors.toml\`. The themes do not ship app configs. The light variants set \`mode = "light"\`, so Omarchy also switches GTK and other apps to light mode.

The \`assets/\` folder holds the files for the gallery and the README: screenshots, background previews, the 3840×2160 copies for Aether, the mosaic, and the video.

### \`colors.toml\`

Every variant sets all keys that Omarchy reads, so no key falls back to a derived value.

| Key | Source |
| --- | --- |
| \`background\`, \`foreground\` | The background and foreground of the variant |
| \`red\`, \`green\`, \`yellow\`, \`blue\`, \`magenta\`, \`cyan\` | ANSI colors 1 to 6 |
| \`bright_red\` to \`bright_magenta\` | ANSI colors 9 to 14 |
| \`lighter_background\` | ANSI color 0, a surface next to the background |
| \`muted\` | ANSI color 8. Terminals use it as bright black. |
| \`light_foreground\`, \`bright_foreground\` | ANSI colors 7 and 15 |
| \`accent\` | ANSI color 5 |
| \`selection\` | The background mixed with 22% to 38% of the accent |
| \`dark_background\`, \`darker_background\` | 2 steps away from the background. OLED keeps both at \`#000000\`. |
| \`dark_foreground\` | Dim text, such as comments |
| \`orange\`, \`brown\` | Orange sits between red and yellow. Brown is a dark orange. |
| \`hyprland_active_border\` | A 45° gradient from cyan to magenta |
| \`hyprland_inactive_border\` | \`muted\` at 67% opacity |

## How the palettes work

The palettes come from the Neon ANSI Palette design. The design builds each palette in the OKLCH color space from 5 values: the hue, lightness and chroma of the background, 6 hues for the ANSI colors, 1 chroma value, and 1 of 4 lightness sets. A seeded random offset of up to 4° moves each hue, so two palettes with the same hues are not identical.

All 5 variants keep these hues and the chroma. They change the lightness:

- **Dark** uses the design values. \`tools/palettes.mjs\` has the same table and the same math as the design.
- **Day** uses fixed OKLCH lightness values for a light background, from 0.50 to 0.66.
- **High contrast** starts each color at the design lightness. Then it makes the color lighter until the color reaches 7:1 against a near-black background. Bright colors go to 9:1.
- **Day high contrast** makes each color darker until it reaches 7:1 against a near-white background. Bright colors go to 9:1.
- **OLED** uses the dark colors on \`#000000\`.

Colors outside sRGB lose chroma until they fit.

## Backgrounds

Each variant has 2 backgrounds at 6K, 6144×3456. The important content stays near the center, so the images also fill 16:10 and 21:9 screens. The dark variants use night scenes. The light variants use day scenes of the same motif.

| Motif | Themes |
| --- | --- |
${motifTable}

## Regenerate the themes

The \`tools/\` folder has every script that made this repo. You need Node.js 22 or later, \`chromium\`, \`magick\` and \`ffmpeg\`.

| Command | Result |
| --- | --- |
| \`node tools/build.mjs\` | Writes \`colors.toml\`, \`icons.theme\` and \`assets/themes.js\` |
| \`node tools/render.mjs [theme...]\` | Renders the backgrounds at 6144×3456 with headless Chromium. Set \`VARIANTS=oled\` to render some variants, or \`SIZE=3840x2160\` for another size. |
| \`tools/capture.sh [--variant list] [theme...]\` | Applies each variant, takes a screenshot of workspace 7, and writes \`preview.png\` |
| \`node tools/assets.mjs\` | Writes the Aether copies, the gallery previews, the variant strips and the mosaic |
| \`node tools/promo.mjs <song.mp3>\` | Renders \`assets/promo.mp4\`, every theme once, 20 from each variant, one per beat |
| \`node tools/readme.mjs\` | Writes this README |

\`tools/capture.sh\` changes your desktop while it runs. It switches to workspace 7 and applies each variant. When it stops, it applies your original theme again and removes the links that it added. If another workspace becomes active, the script stops before it takes a screenshot.

The GitHub Pages workflow in \`.github/workflows/pages.yml\` publishes the gallery. It leaves out the 6K backgrounds and the \`preview.png\` files, because a Pages site can be at most 1 GB.

## All themes

| | | | | |
| --- | --- | --- | --- | --- |
${toc.join('\n')}

${sections.join('\n')}`;

writeFileSync(join(ROOT, 'README.md'), readme);
console.log(`wrote README.md (${readme.split('\n').length} lines)`);
