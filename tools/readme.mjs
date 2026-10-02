// Writes README.md (Chinese, the default) and README.en.md (English) from the theme data.
//
//   node tools/readme.mjs

import { writeFileSync, readdirSync, statSync } from 'node:fs';
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
function hueKey(hex, dark = false) {
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

// Repo size in MB, rounded to the nearest 10. Walks the tree instead of shelling
// out to du, so it also works where du is absent.
function repoSizeMb() {
  const skip = new Set(['.git', '.capture']);
  let bytes = 0;
  const walk = dir => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(e.name)) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) bytes += statSync(p).size;
    }
  };
  walk(ROOT);
  return Math.round(bytes / 1048576 / 10) * 10;
}
const sizeMb = repoSizeMb();

const VARIANT_LABEL_ZH = {
  'Dark': '深色',
  'Day': '日间',
  'High contrast': '高对比度',
  'Day high contrast': '日间高对比度',
  'OLED': 'OLED',
};

const HUE_ZH = {
  pink: '粉红', red: '红', orange: '橙', yellow: '黄', lime: '黄绿', green: '绿',
  teal: '青', cyan: '青蓝', blue: '蓝', indigo: '靛蓝', violet: '紫', magenta: '洋红',
  neutral: '中性', brown: '棕', olive: '橄榄', 'olive green': '橄榄绿', plum: '梅红',
};

const MOTIF_ZH = {
  label: {
    'sunset-grid': '落日网格', 'code-rain': '代码雨', nebula: '星云', aurora: '极光', skyline: '天际线',
    equalizer: '均衡器', waveform: '声波', blobs: '光斑', depths: '深水', embers: '余烬',
    pixels: '像素画', scanlines: 'VHS', contours: '等高线', tubes: '霓虹灯管', planet: '行星',
  },
  text: {
    'sunset-grid': '透视网格上的一轮霓虹太阳', 'code-rain': '一列列坠落的代码字符',
    nebula: '星野里的一片星云', aurora: '山湖上空的极光', skyline: '一座城市的天际线',
    equalizer: '一块 LED 频谱板', waveform: '层层叠叠的声波带', blobs: '带虚化的柔和光斑',
    depths: '水中的光线', embers: '沙丘上的余烬或尘土', pixels: '一处像素风景',
    scanlines: '带跟踪噪点的 VHS 画面', contours: '一张等高线地形图', tubes: '墙上的霓虹灯管造型',
    planet: '天空中的一颗行星',
  },
};

const en = {
  code: 'en',
  file: 'README.en.md',
  otherLink: '[中文](README.md)',
  title: '# 500 Omarchy themes',
  mosaicAlt: 'All 500 themes. Each row shows 5 themes in their 5 variants.',
  intro: 'This repo has 100 neon palettes for [Omarchy](https://omarchy.org), and each palette comes in 5 variants. That makes 500 Omarchy themes. Each variant has a 16-color ANSI palette, a background with the Omarchy wordmark, and a background drawn for its colors.',
  bullets: [
    `- Gallery: [${SITE.replace('https://', '')}](${SITE})`,
    '- Promo video: [`assets/promo.mp4`](assets/promo.mp4), every theme once, 20 from each variant',
    '- Backgrounds: 1000 at 6K, 6144×3456',
  ],
  variantLabel: label => label,
  hue: key => key,
  motifLabel: k => MOTIF[k][0],
  bgPhrase: key => key === 'neutral' ? 'a neutral black background' : `a dark ${key} background`,
  character: (kind, hueWord) => ({
    single: `The 6 ANSI hues stay close to ${hueWord}, so the palette reads as one color.`,
    pastel: 'The ANSI colors are light pastels.',
    veryHigh: 'The ANSI colors use very high chroma for a strong neon look.',
    saturated: 'The ANSI colors are saturated and bright.',
    medium: 'The ANSI colors use medium chroma for a calmer look.',
    low: 'The ANSI colors use low chroma for a soft, muted look.',
  })[kind],
  describe: (name, bg, acc, character, motif) =>
    `${name} has ${bg} and a ${acc} accent in its dark variant. ${character} The native background shows ${motif}.`,
  blackHoleMotif: 'a black hole, or an eclipse in the day variants',
  hVariants: '## Variants',
  variantsHeader: '| Variant | Theme name | What it is | Lowest ANSI contrast | Lowest text contrast |',
  variantsFooter: 'The contrast columns show the lowest WCAG contrast ratio against the background, over all 100 themes. Each variant is a complete Omarchy theme with its own folder, so you can install any mix of them.',
  use: {
    dark: 'The design palette. A dark background with neon colors.',
    day: 'A light background with the same hues. For bright rooms and daylight.',
    'high-contrast': 'A near-black background. Every ANSI color reaches 7:1, the WCAG AAA level.',
    'day-high-contrast': 'A near-white background. Every ANSI color reaches 7:1, the WCAG AAA level.',
    oled: 'The design colors on pure black. Panels stay black, so most pixels on an OLED screen stay off.',
  },
  hInstall: '## Install',
  installIntro: '`install.sh` copies themes into `~/.config/omarchy/themes`. Each theme variant becomes a normal Omarchy theme folder. The script installs all 5 variants of a theme unless you name some with `--variant`.',
  hInstallSingle: '### Install one theme without a clone',
  installSingleLead: 'The script downloads only the themes that you name:',
  installVariantLead: 'To install some variants only, add `--variant`:',
  setNote: '`--set` applies the first installed variant of the last theme.',
  hInstallClone: '### Install from a clone',
  cloneNote: `The full repo is about ${sizeMb} MB because it has 1000 backgrounds at 6K. To download less, use the \`curl\` command above. It downloads only the folders that you name.`,
  hOptions: '### Options',
  optionsHeader: '| Command | Result |',
  options: [
    '| `install.sh synthwave hacker` | Installs all 5 variants of the named themes |',
    '| `install.sh synthwave --variant day,oled` | Installs only these variants |',
    '| `install.sh --all` | Installs all 500 themes |',
    '| `install.sh --list` | Lists the 100 theme names |',
    '| `install.sh synthwave --set` | Installs the theme, then applies its first variant |',
    '| `install.sh --update` | Installs again every theme variant that the script installed |',
    '| `install.sh --remove synthwave` | Removes the variants of a theme that the script installed |',
    '| `install.sh --link synthwave` | Links to the clone instead of copying. Run `git pull` in the clone to update. |',
    '| `install.sh --force synthwave` | Replaces a theme with the same name that the script did not install |',
  ],
  optionsFooter: 'The variant names are `dark`, `day`, `high-contrast`, `day-high-contrast` and `oled`. The script writes a `.100-themes` marker file in each theme that it copies. `--update` and `--remove` use this file, so they never change a theme that you made.',
  hAether: '### Apply with Aether',
  aetherIntro: `[Aether](https://github.com/omacom/aether) can apply a theme straight from the [gallery](${SITE}). Open a theme, pick a variant, and select 1 of these buttons:`,
  aetherHeader: '| Button | Result |',
  aetherButtons: [
    '| Apply with Aether | Aether loads the palette and the background, then applies them at once through its own theme. This works again and again. |',
    '| Install as Omarchy theme | Aether adds the variant to `~/.config/omarchy/themes` and activates it at once. This stops if a theme with the same name exists, for example after `install.sh`. |',
    '| Open in editor | Aether opens the palette in its editor. Nothing changes until you select Apply. |',
  ],
  aetherSilent: 'Apply and Install use `silent=true`, like the links on the omarchy-themes site. They run at once, without the Aether window.',
  aetherTimeout: 'Aether stops a download after 60 seconds. On a slow connection, a 6K background can take longer, so the links download a 3840×2160 copy from `assets/aether/`. GitHub does not render `aether://` links, so use the gallery or build a link yourself:',
  aetherLinkNote: 'Add `&as_omarchy_theme=synthwave-oled` to install the variant. Use `&edit=true` instead of `&silent=true` to open the editor.',
  hConflicts: '### Name conflicts',
  conflicts: [
    'The script does not replace a theme that it did not install. If `~/.config/omarchy/themes/sakura` exists, the script skips `sakura` and tells you. Rename your theme, or use `--force` to replace it.',
    '`omarchy theme install <url>` does not work with this repo. That command expects one theme at the root of a repo.',
  ],
  hSwitch: '## Switch themes and backgrounds',
  switchComments: ['# apply a theme', '# show the next background of the current theme', '# show the name of the current theme'],
  switchNote: 'Omarchy starts with the first background in alphabetical order. That is `0-omarchy-wordmark.jpg`. Run `omarchy theme bg next` to show the native background.',
  hLayout: '## Repo layout',
  layoutTree: `synthwave/
├── dark/                          # installs as synthwave
│   ├── colors.toml                # the palette that Omarchy reads
│   ├── icons.theme                # the Yaru icon theme for the accent color
│   ├── preview.png                # a screenshot of workspace 7 with the variant applied
│   └── backgrounds/
│       ├── 0-omarchy-wordmark.jpg # the Omarchy wordmark in the variant colors, 6K
│       ├── 1-sunset-grid.jpg      # the native background for the variant colors, 6K
│       └── 2-neon-sign.mp4        # the wordmark as a blinking neon sign, 4K
├── day/                           # installs as synthwave-day
├── high-contrast/                 # installs as synthwave-high-contrast
├── day-high-contrast/             # installs as synthwave-day-high-contrast
└── oled/                          # installs as synthwave-oled`,
  layoutNotes: [
    'Omarchy generates the configs for Hyprland, the terminals, Neovim, btop, VS Code and other apps from `colors.toml`. The themes do not ship app configs. The light variants set `mode = "light"`, so Omarchy also switches GTK and other apps to light mode.',
    'The `assets/` folder holds the files for the gallery and the README: screenshots, background previews, the 3840×2160 copies for Aether, the mosaic, and the video.',
  ],
  hColors: '### `colors.toml`',
  colorsNote: 'Every variant sets all keys that Omarchy reads, so no key falls back to a derived value.',
  colorsHeader: '| Key | Source |',
  colors: [
    '| `background`, `foreground` | The background and foreground of the variant |',
    '| `red`, `green`, `yellow`, `blue`, `magenta`, `cyan` | ANSI colors 1 to 6 |',
    '| `bright_red` to `bright_magenta` | ANSI colors 9 to 14 |',
    '| `lighter_background` | ANSI color 0, a surface next to the background |',
    '| `muted` | ANSI color 8. Terminals use it as bright black. |',
    '| `light_foreground`, `bright_foreground` | ANSI colors 7 and 15 |',
    '| `accent` | ANSI color 5 |',
    '| `selection` | The background mixed with 22% to 38% of the accent |',
    '| `dark_background`, `darker_background` | 2 steps away from the background. OLED keeps both at `#000000`. |',
    '| `dark_foreground` | Dim text, such as comments |',
    '| `orange`, `brown` | Orange sits between red and yellow. Brown is a dark orange. |',
    '| `hyprland_active_border` | A 45° gradient from cyan to magenta |',
    '| `hyprland_inactive_border` | `muted` at 67% opacity |',
  ],
  hPalettes: '## How the palettes work',
  paletteLead: 'The palettes come from the Neon ANSI Palette design. The design builds each palette in the OKLCH color space from 5 values: the hue, lightness and chroma of the background, 6 hues for the ANSI colors, 1 chroma value, and 1 of 4 lightness sets. A seeded random offset of up to 4° moves each hue, so two palettes with the same hues are not identical.',
  paletteVariants: 'All 5 variants keep these hues and the chroma. They change the lightness:',
  paletteBullets: [
    '- **Dark** uses the design values. `tools/palettes.mjs` has the same table and the same math as the design.',
    '- **Day** uses fixed OKLCH lightness values for a light background, from 0.50 to 0.66.',
    '- **High contrast** starts each color at the design lightness. Then it makes the color lighter until the color reaches 7:1 against a near-black background. Bright colors go to 9:1.',
    '- **Day high contrast** makes each color darker until it reaches 7:1 against a near-white background. Bright colors go to 9:1.',
    '- **OLED** uses the dark colors on `#000000`.',
  ],
  paletteSrgb: 'Colors outside sRGB lose chroma until they fit.',
  hBackgrounds: '## Backgrounds',
  backgroundNotes: [
    'Each variant has 2 backgrounds at 6K, 6144×3456. The important content stays near the center, so the images also fill 16:10 and 21:9 screens. The dark variants use night scenes. The light variants use day scenes of the same motif.',
    'Every variant also has an animated background, `2-neon-sign.mp4`. It shows the Omarchy wordmark as a neon sign on a brick wall, in the colors of the variant. The light variants use a light wall. The sign flickers on, stays lit for about 7 seconds, has a short glitch, and blinks off again. Each video is 3840×2160, a 20 second loop of 0.7 to 2.6 MB. To show it, run `omarchy theme bg next` twice after you apply a theme.',
  ],
  motifHeader: '| Motif | Themes |',
  hRegenerate: '## Regenerate the themes',
  regenIntro: 'The `tools/` folder has every script that made this repo. You need Node.js 22 or later, `chromium`, `magick` and `ffmpeg`.',
  regenHeader: '| Command | Result |',
  regenRows: [
    '| `node tools/build.mjs` | Writes `colors.toml`, `icons.theme` and `assets/themes.js` |',
    '| `node tools/render.mjs [theme...]` | Renders the backgrounds at 6144×3456 with headless Chromium. Set `VARIANTS=oled` to render some variants, or `SIZE=3840x2160` for another size. |',
    '| `tools/capture.sh [--variant list] [theme...]` | Applies each variant, takes a screenshot of workspace 7, and writes `preview.png` |',
    '| `node tools/neon.mjs [theme...]` | Renders `2-neon-sign.mp4` for every variant. Set `VARIANTS=day` for some variants. It draws 4 stills per video and builds the video from a frame timeline. |',
    '| `node tools/assets.mjs` | Writes the Aether copies, the gallery thumbnails and previews, the variant strips and the mosaic |',
    '| `node tools/promo.mjs <song.mp3>` | Renders `assets/promo.mp4`, every theme once, 20 from each variant, one per beat |',
    '| `node tools/readme.mjs` | Writes README.md (Chinese) and README.en.md (English) |',
  ],
  regenCaptureNote: '`tools/capture.sh` changes your desktop while it runs. It switches to workspace 7 and applies each variant. When it stops, it applies your original theme again and removes the links that it added. If another workspace becomes active, the script stops before it takes a screenshot.',
  regenPagesNote: 'The GitHub Pages workflow in `.github/workflows/pages.yml` publishes the gallery. It leaves out the 6K backgrounds and the `preview.png` files, because a Pages site can be at most 1 GB.',
  hAllThemes: '## All themes',
  shotAlt: t => `${t.name} in 5 variants: dark, day, high contrast, day high contrast and OLED`,
  themeMeta: t => `\`${pad(t.index)}\` · Folder: [\`${t.slug}/\`](${t.slug}/) · [Open in the gallery](${SITE}/#${t.slug})`,
  themeTableHeader: '| Variant | Theme name | `background` | `foreground` | `accent` | Icons |',
  ansiSummary: 'All 16 ANSI colors of each variant',
  ansiTableHeader: '| Variant | Normal, 0 to 7 | Bright, 8 to 15 |',
};

const zh = {
  ...en,
  code: 'zh',
  file: 'README.md',
  otherLink: '[English](README.en.md)',
  title: '# 500 个 Omarchy 主题',
  mosaicAlt: '全部 500 个主题。每行 5 个主题，各含 5 个变体。',
  intro: '本仓库为 [Omarchy](https://omarchy.org) 准备了 100 组霓虹配色，每组配色有 5 个变体，合起来就是 500 个 Omarchy 主题。每个变体都有一套 16 色的 ANSI 调色板、一张带 Omarchy 字标的背景，以及一张按这组颜色绘制的背景。',
  bullets: [
    `- 画廊：[${SITE.replace('https://', '')}](${SITE})`,
    '- 宣传视频：[`assets/promo.mp4`](assets/promo.mp4)，每个主题各出现一次，5 个变体各 20 个',
    '- 背景图：1000 张 6K，6144×3456',
  ],
  variantLabel: label => VARIANT_LABEL_ZH[label],
  hue: key => HUE_ZH[key],
  motifLabel: k => MOTIF_ZH.label[k],
  bgPhrase: key => key === 'neutral' ? '中性黑背景' : `深${HUE_ZH[key]}背景`,
  character: (kind, hueWord) => ({
    single: `6 个 ANSI 色相都靠近${hueWord}，整组读起来像一个颜色。`,
    pastel: 'ANSI 色是浅淡的粉彩色。',
    veryHigh: 'ANSI 色使用极高的彩度，霓虹感强烈。',
    saturated: 'ANSI 色饱和而明亮。',
    medium: 'ANSI 色使用中彩度，观感更平静。',
    low: 'ANSI 色使用低彩度，柔和而不刺眼。',
  })[kind],
  describe: (name, bg, acc, character, motif) =>
    `${name} 的深色变体用${bg}，强调色为${acc}。${character}原生背景是${motif}。`,
  blackHoleMotif: '一个黑洞，日间变体里则是一次日食',
  hVariants: '## 变体',
  variantsHeader: '| 变体 | 主题名 | 说明 | 最低 ANSI 对比度 | 最低正文对比度 |',
  variantsFooter: '两列对比度取的是 100 个主题里相对各自背景的最低 WCAG 对比度。每个变体都是一个完整的 Omarchy 主题，各自有自己的目录，所以你可以任意混搭安装。',
  use: {
    dark: '设计配色本体。深色背景配霓虹色。',
    day: '同样的色相，换成浅色背景。适合明亮的房间和白天。',
    'high-contrast': '接近纯黑的背景。每个 ANSI 色都达到 7:1，即 WCAG AAA 级。',
    'day-high-contrast': '接近纯白的背景。每个 ANSI 色都达到 7:1，即 WCAG AAA 级。',
    oled: '纯黑底上放设计色。面板区域保持黑色，所以 OLED 屏上多数像素是灭的。',
  },
  hInstall: '## 安装',
  installIntro: '`install.sh` 把主题复制到 `~/.config/omarchy/themes`。每个主题变体都会变成一个普通的 Omarchy 主题目录。除非你用 `--variant` 点名，脚本会安装一个主题的全部 5 个变体。',
  hInstallSingle: '### 不克隆仓库，只装一个主题',
  installSingleLead: '脚本只下载你点名的主题：',
  installVariantLead: '只想装部分变体时，加上 `--variant`：',
  setNote: '`--set` 会应用最后一个主题里第一个被安装的变体。',
  hInstallClone: '### 从克隆的仓库安装',
  cloneNote: `整个仓库约 ${sizeMb} MB，因为里面有 1000 张 6K 背景图。想少下载一些就用上面的 \`curl\` 命令，它只下载你点名的那些目录。`,
  hOptions: '### 选项',
  optionsHeader: '| 命令 | 结果 |',
  options: [
    '| `install.sh synthwave hacker` | 为点名的主题安装全部 5 个变体 |',
    '| `install.sh synthwave --variant day,oled` | 只安装列出的这些变体 |',
    '| `install.sh --all` | 安装全部 500 个主题 |',
    '| `install.sh --list` | 列出 100 个主题名 |',
    '| `install.sh synthwave --set` | 安装主题，然后应用它的第一个变体 |',
    '| `install.sh --update` | 重新安装脚本装过的每个主题变体 |',
    '| `install.sh --remove synthwave` | 删除脚本为某个主题装过的变体 |',
    '| `install.sh --link synthwave` | 链接到克隆目录而不是复制。在克隆目录里执行 `git pull` 即可更新。 |',
    '| `install.sh --force synthwave` | 覆盖一个同名但不是本脚本装的主题 |',
  ],
  optionsFooter: '变体名是 `dark`、`day`、`high-contrast`、`day-high-contrast` 和 `oled`。脚本会在每个复制过去的主题里写一个 `.100-themes` 标记文件。`--update` 和 `--remove` 依据这个文件工作，所以绝不会改动你自己做的主题。',
  hAether: '### 用 Aether 应用',
  aetherIntro: `[Aether](https://github.com/omacom/aether) 可以直接从[画廊](${SITE})应用主题。打开一个主题、选一个变体，然后在这 3 个按钮里选 1 个：`,
  aetherHeader: '| 按钮 | 结果 |',
  aetherButtons: [
    '| Apply with Aether | Aether 载入配色和背景，然后通过它自己的主题一次性应用。可以反复使用。 |',
    '| Install as Omarchy theme | Aether 把这个变体加入 `~/.config/omarchy/themes` 并立刻启用。如果已存在同名主题，例如刚跑过 `install.sh`，它会停止。 |',
    '| Open in editor | Aether 在编辑器里打开这份配色。在你点 Apply 之前不会有任何改动。 |',
  ],
  aetherSilent: 'Apply 和 Install 都带 `silent=true`，和 omarchy-themes 站点上的链接一样。它们直接执行，不打开 Aether 窗口。',
  aetherTimeout: 'Aether 下载超过 60 秒就会中止。网络慢的时候 6K 背景可能不止 60 秒，所以这些链接下载的是 `assets/aether/` 里的 3840×2160 副本。GitHub 不渲染 `aether://` 链接，请用画廊，或者自己拼链接：',
  aetherLinkNote: '加上 `&as_omarchy_theme=synthwave-oled` 就能安装这个变体。想打开编辑器就用 `&edit=true` 代替 `&silent=true`。',
  hConflicts: '### 主题重名',
  conflicts: [
    '脚本不会替换它没有安装过的主题。如果 `~/.config/omarchy/themes/sakura` 已存在，脚本会跳过 `sakura` 并提示你。改掉你自己的主题名，或者用 `--force` 覆盖它。',
    '`omarchy theme install <url>` 在这个仓库上不可用。那条命令要求仓库根目录只有一个主题。',
  ],
  hSwitch: '## 切换主题和背景',
  switchComments: ['# 应用一个主题', '# 显示当前主题的下一张背景', '# 显示当前主题的名字'],
  switchNote: 'Omarchy 用的是字母序最靠前的那张背景，也就是 `0-omarchy-wordmark.jpg`。执行 `omarchy theme bg next` 就能看到这张主题自己的背景。',
  hLayout: '## 仓库结构',
  layoutTree: `synthwave/
├── dark/                          # 安装为 synthwave
│   ├── colors.toml                # Omarchy 读取的配色
│   ├── icons.theme                # 强调色对应的 Yaru 图标主题
│   ├── preview.png                # 应用该变体后工作区 7 的截图
│   └── backgrounds/
│       ├── 0-omarchy-wordmark.jpg # 用该变体颜色做的 Omarchy 字标，6K
│       ├── 1-sunset-grid.jpg      # 为该变体颜色绘制的背景，6K
│       └── 2-neon-sign.mp4        # 会闪烁的字标霓虹灯牌，4K
├── day/                           # 安装为 synthwave-day
├── high-contrast/                 # 安装为 synthwave-high-contrast
├── day-high-contrast/             # 安装为 synthwave-day-high-contrast
└── oled/                          # 安装为 synthwave-oled`,
  layoutNotes: [
    'Omarchy 根据 `colors.toml` 生成 Hyprland、各终端、Neovim、btop、VS Code 等应用的配置。这些主题不附带应用配置。浅色变体会设 `mode = "light"`，所以 Omarchy 也会把 GTK 等应用切到浅色模式。',
    '`assets/` 放的是画廊和 README 要用的文件：截图、背景预览、给 Aether 用的 3840×2160 副本、mosaic 和视频。',
  ],
  hColors: '### `colors.toml`',
  colorsNote: '每个变体都写全了 Omarchy 会读取的所有键，所以没有键会退回到推导值。',
  colorsHeader: '| 键 | 来源 |',
  colors: [
    '| `background`、`foreground` | 该变体的背景色和前景色 |',
    '| `red`、`green`、`yellow`、`blue`、`magenta`、`cyan` | ANSI 颜色 1 到 6 |',
    '| `bright_red` 到 `bright_magenta` | ANSI 颜色 9 到 14 |',
    '| `lighter_background` | ANSI 颜色 0，紧邻背景的那层表面 |',
    '| `muted` | ANSI 颜色 8。终端把它当作 bright black。 |',
    '| `light_foreground`、`bright_foreground` | ANSI 颜色 7 和 15 |',
    '| `accent` | ANSI 颜色 5 |',
    '| `selection` | 背景里混入 22% 到 38% 的强调色 |',
    '| `dark_background`、`darker_background` | 与背景相隔 2 档。OLED 把两者都留作 `#000000`。 |',
    '| `dark_foreground` | 变暗的文字，例如注释 |',
    '| `orange`、`brown` | 橙色列在红与黄之间。棕色是暗的橙。 |',
    '| `hyprland_active_border` | 从青到洋红的 45° 渐变 |',
    '| `hyprland_inactive_border` | 67% 不透明度的 `muted` |',
  ],
  hPalettes: '## 配色是怎么来的',
  paletteLead: '这些配色来自 Neon ANSI Palette 设计。该设计在 OKLCH 色彩空间里由 5 组值搭出每份配色：背景的色相、明度和彩度，6 个 ANSI 色的色相，1 个彩度值，以及 4 组明度值中的 1 组。每个色相还会被一个种子决定的、最大 4° 的偏移挪动，所以两份色相相同的配色也不会完全一样。',
  paletteVariants: '5 个变体都保留这些色相和彩度，只改明度：',
  paletteBullets: [
    '- **深色**用设计值。`tools/palettes.mjs` 里的表和设计的数学是同一套。',
    '- **日间**为浅色背景使用固定的 OKLCH 明度值，范围 0.50 到 0.66。',
    '- **高对比度**从设计明度起步，把每个颜色不断提亮，直到它对接近纯黑的背景达到 7:1。亮色要到 9:1。',
    '- **日间高对比度**把每个颜色不断压暗，直到它对接近纯白的背景达到 7:1。亮色要到 9:1。',
    '- **OLED**在 `#000000` 上使用深色的那些颜色。',
  ],
  paletteSrgb: '超出 sRGB 的颜色会被削减彩度，直到能表示为止。',
  hBackgrounds: '## 背景图',
  backgroundNotes: [
    '每个变体有 2 张 6K 背景，6144×3456。重要内容都靠近画面中心，所以这些图也能铺满 16:10 和 21:9 的屏幕。深色变体用夜景。浅色变体用同一母题的日景。',
    '每个变体还有一张动态背景 `2-neon-sign.mp4`。它把 Omarchy 的字标做成砖墙上的霓虹灯牌，用的就是该变体的颜色。浅色变体用浅色的墙。灯牌闪烁点亮，亮约 7 秒，中间闪一下故障，然后再熄灭。每条视频是 3840×2160、20 秒循环，0.7 到 2.6 MB。要看它，应用主题后把 `omarchy theme bg next` 执行两次。',
  ],
  motifHeader: '| 母题 | 主题 |',
  hRegenerate: '## 重新生成主题',
  regenIntro: '`tools/` 里有做出这个仓库的全部脚本。你需要 Node.js 22 或更高版本、`chromium`、`magick` 和 `ffmpeg`。',
  regenHeader: '| 命令 | 结果 |',
  regenRows: [
    '| `node tools/build.mjs` | 写出 `colors.toml`、`icons.theme` 和 `assets/themes.js` |',
    '| `node tools/render.mjs [theme...]` | 用无头 Chromium 以 6144×3456 渲染背景。设 `VARIANTS=oled` 只渲染某些变体，或用 `SIZE=3840x2160` 换别的尺寸。 |',
    '| `tools/capture.sh [--variant list] [theme...]` | 依次应用每个变体，给工作区 7 截图，写出 `preview.png` |',
    '| `node tools/neon.mjs [theme...]` | 为每个变体渲染 `2-neon-sign.mp4`。设 `VARIANTS=day` 只做某些变体。它每条视频画 4 张静帧，再按帧时间轴合成视频。 |',
    '| `node tools/assets.mjs` | 写出 Aether 副本、画廊缩略图与预览、变体条带和 mosaic |',
    '| `node tools/promo.mjs <song.mp3>` | 渲染 `assets/promo.mp4`，每个主题各一次，5 个变体各 20 个，一拍一个 |',
    '| `node tools/readme.mjs` | 写出 README.md（中文）和 README.en.md（英文） |',
  ],
  regenCaptureNote: '`tools/capture.sh` 运行期间会改动你的桌面。它切到工作区 7 并依次应用每个变体。结束时它会重新应用你原来的主题，并删掉它加上的链接。如果另一个工作区变成了活动工作区，脚本会在截图之前停下。',
  regenPagesNote: '`.github/workflows/pages.yml` 里的 GitHub Pages 工作流发布画廊。它不包含 6K 背景和 `preview.png`，因为 Pages 站点最大 1 GB。',
  hAllThemes: '## 全部主题',
  shotAlt: t => `${t.name} 的 5 个变体：深色、日间、高对比度、日间高对比度和 OLED`,
  themeMeta: t => `\`${pad(t.index)}\` · 目录：[\`${t.slug}/\`](${t.slug}/) · [在画廊中打开](${SITE}/#${t.slug})`,
  themeTableHeader: '| 变体 | 主题名 | `background` | `foreground` | `accent` | 图标主题 |',
  ansiSummary: '每个变体的全部 16 个 ANSI 颜色',
  ansiTableHeader: '| 变体 | 常规，0 到 7 | 亮色，8 到 15 |',
};

function themeSentence(t, l) {
  const v = t.variants.dark, c = v.colors, { c: chroma, set } = t.row;
  const bgKey = hueKey(c.background, true), accKey = hueKey(c.accent);
  let kind;
  if (hueSpread(v.ansi) < 60) kind = 'single';
  else if (set === 'p') kind = 'pastel';
  else if (chroma >= .27) kind = 'veryHigh';
  else if (chroma >= .2) kind = 'saturated';
  else if (chroma >= .14) kind = 'medium';
  else kind = 'low';
  const motif = t.slug === 'black-hole' ? l.blackHoleMotif : (l.code === 'zh' ? MOTIF_ZH.text[t.motif] : MOTIF[t.motif][1]);
  return l.describe(t.name, l.bgPhrase(bgKey), l.hue(accKey), l.character(kind, l.hue(hueKey(v.ansi[2]))), motif);
}

function build(l) {
  const variantTable = VARIANTS.map(v => {
    const s = stats(v.key);
    return `| ${l.variantLabel(v.label)} | \`synthwave${v.suffix}\` | ${l.use[v.key]} | ${s.normal}:1 | ${s.text}:1 |`;
  }).join('\n');

  const toc = [];
  for (let i = 0; i < themes.length; i += 5) {
    toc.push('| ' + themes.slice(i, i + 5).map(t => `${pad(t.index)} [${t.name}](#${anchor(t.name)})`).join(' | ') + ' |');
  }

  const sections = themes.map(t => {
    const rows = VARIANTS.map(v => {
      const tv = t.variants[v.key], c = tv.colors;
      return `| ${l.variantLabel(v.label)} | [\`${tv.install}\`](${t.slug}/${v.key}/) | \`${c.background}\` | \`${c.foreground}\` | \`${c.accent}\` | \`${tv.icons}\` |`;
    }).join('\n');
    const colors = VARIANTS.map(v => {
      const a = t.variants[v.key].ansi;
      return `| ${l.variantLabel(v.label)} | ${a.slice(0, 8).map(h => `\`${h}\``).join(' ')} | ${a.slice(8).map(h => `\`${h}\``).join(' ')} |`;
    }).join('\n');
    return `### ${t.name}

[![${l.shotAlt(t)}](assets/shots/${t.slug}/variants.webp)](${SITE}/#${t.slug})

${l.themeMeta(t)}

${themeSentence(t, l)}

${l.themeTableHeader}
| --- | --- | --- | --- | --- | --- |
${rows}

<details>
<summary>${l.ansiSummary}</summary>

${l.ansiTableHeader}
| --- | --- | --- |
${colors}

</details>

\`\`\`bash
curl -fsSL ${SITE}/install.sh | bash -s -- ${t.slug} --set
\`\`\`
`;
  });

  const motifTable = Object.keys(MOTIF).map(k => {
    const list = themes.filter(t => t.motif === k).map(t => `[${t.name}](#${anchor(t.name)})`).join(', ');
    return `| ${l.motifLabel(k)} | ${list} |`;
  }).join('\n');

  return `${l.title}

${l.otherLink}

[![${l.mosaicAlt}](assets/mosaic.jpg)](${SITE})

${l.intro}

${l.bullets.join('\n')}

${l.hVariants}

${l.variantsHeader}
| --- | --- | --- | --- | --- |
${variantTable}

${l.variantsFooter}

${l.hInstall}

${l.installIntro}

${l.hInstallSingle}

${l.installSingleLead}

\`\`\`bash
curl -fsSL ${SITE}/install.sh | bash -s -- synthwave --set
\`\`\`

${l.installVariantLead}

\`\`\`bash
curl -fsSL ${SITE}/install.sh | bash -s -- synthwave hacker --variant oled,day
\`\`\`

${l.setNote}

${l.hInstallClone}

\`\`\`bash
git clone --depth 1 ${REPO} ~/.local/share/100-themes
cd ~/.local/share/100-themes
./install.sh --all --variant dark,oled
omarchy theme set synthwave-oled
\`\`\`

${l.cloneNote}

${l.hOptions}

${l.optionsHeader}
| --- | --- |
${l.options.join('\n')}

${l.optionsFooter}

${l.hAether}

${l.aetherIntro}

${l.aetherHeader}
| --- | --- |
${l.aetherButtons.join('\n')}

${l.aetherSilent}

${l.aetherTimeout}

\`\`\`text
aether://apply?colors=${SITE}/synthwave/oled/colors.toml&wallpaper=${SITE}/assets/aether/synthwave/oled/1-sunset-grid.jpg&silent=true
\`\`\`

${l.aetherLinkNote}

${l.hConflicts}

${l.conflicts.join('\n\n')}

${l.hSwitch}

\`\`\`bash
omarchy theme set neon-tokyo-oled   ${l.switchComments[0]}
omarchy theme bg next               ${l.switchComments[1]}
omarchy theme current               ${l.switchComments[2]}
\`\`\`

${l.switchNote}

${l.hLayout}

\`\`\`text
${l.layoutTree}
\`\`\`

${l.layoutNotes.join('\n\n')}

${l.hColors}

${l.colorsNote}

${l.colorsHeader}
| --- | --- |
${l.colors.join('\n')}

${l.hPalettes}

${l.paletteLead}

${l.paletteVariants}

${l.paletteBullets.join('\n')}

${l.paletteSrgb}

${l.hBackgrounds}

${l.backgroundNotes.join('\n\n')}

${l.motifHeader}
| --- | --- |
${motifTable}

${l.hRegenerate}

${l.regenIntro}

${l.regenHeader}
| --- | --- |
${l.regenRows.join('\n')}

${l.regenCaptureNote}

${l.regenPagesNote}

${l.hAllThemes}

| | | | | |
| --- | --- | --- | --- | --- |
${toc.join('\n')}

${sections.join('\n')}`;
}

for (const l of [zh, en]) {
  const readme = build(l);
  writeFileSync(join(ROOT, l.file), readme);
  console.log(`wrote ${l.file} (${readme.split('\n').length} lines)`);
}
