// Palette source for all themes and variants. The table and the dark
// generator are ported from the "Neon ANSI Palette" design. The day, high
// contrast and OLED variants reuse the hues, chroma and lightness set of
// each design palette. Do not change the table or the math unless you want
// every theme to change.

const ORIGINAL = ['#12121C','#FF2E63','#2BFF88','#FFE600','#3D7BFF','#FF2BD6','#00F0FF','#C8C8D8','#4F4F70','#FF6B8F','#7DFFB0','#FFF27A','#7AA8FF','#FF7AE6','#7AF7FF','#FFFFFF'];
const LM = { n: [.66,.82,.93,.62,.7,.84], p: [.78,.84,.9,.76,.8,.86], m: [.55,.78,.92,.62,.7,.86], s: [.72,.8,.86,.72,.75,.8] };

// name|bg hue|bg lightness|bg chroma|hues for red,green,yellow,blue,magenta,cyan|chroma|lightness set
const TABLE = `Synthwave|295|.14|.06|0,330,70,285,320,210|.25|n
Neon Wave|275|.12|.03|20,150,100,260,335,200|.28|n
Lofi|60|.21|.02|25,140,85,250,330,195|.1|s
Hacker|150|.12|.03|130,145,120,155,160,140|.24|m
Ember|35|.13|.03|28,55,80,15,5,45|.22|n
Vaporwave|300|.18|.05|355,175,95,285,330,200|.14|p
Cyberpunk|255|.13|.04|15,125,105,240,345,205|.3|n
Outrun|285|.12|.07|20,340,60,275,325,215|.27|n
Toxic|130|.13|.04|110,135,115,155,95,170|.26|m
Abyss|245|.12|.04|195,175,215,250,275,190|.17|m
Ultraviolet|300|.12|.06|330,285,315,265,305,295|.25|m
Arcade|0|.1|0|25,145,100,262,335,200|.32|n
Noir Rain|230|.13|.02|45,195,75,225,30,200|.2|n
Glacier|230|.16|.03|205,190,215,240,260,185|.13|p
Tropical|195|.14|.04|15,155,95,215,345,180|.25|n
Sakura|350|.16|.03|5,145,40,320,350,330|.16|s
Amber CRT|60|.13|.025|55,70,85,60,45,75|.17|m
Dreampop|280|.2|.03|340,165,90,270,305,205|.11|p
Solar Flare|40|.13|.04|25,95,100,50,10,75|.24|m
Bioluminescent|210|.11|.04|170,150,190,235,290,185|.2|n
Darkwave|300|.1|.03|350,170,60,280,310,220|.2|n
Chillwave|220|.18|.03|15,165,85,240,320,195|.14|s
Retrowave|320|.13|.06|10,300,55,270,335,190|.26|n
Phonk|20|.1|.03|25,350,45,300,10,330|.24|n
Drum & Bass|160|.11|.03|30,140,110,250,300,185|.28|n
Dubstep|290|.1|.05|340,130,110,280,300,160|.3|n
Techno|0|.09|0|20,140,90,230,320,190|.22|n
House|30|.13|.03|20,150,85,260,340,190|.24|n
Trance|250|.13|.05|340,190,210,270,300,220|.24|n
Acid House|110|.12|.03|100,125,105,240,330,145|.28|n
Jungle|145|.13|.04|40,140,95,170,20,160|.22|n
Grime|240|.12|.015|25,125,95,250,320,195|.22|n
Trap|300|.1|.03|15,150,80,280,330,200|.25|n
Hyperpop|330|.14|.06|350,130,105,265,320,190|.3|n
Glitchcore|200|.1|.04|15,135,110,260,320,195|.32|n
Chiptune|265|.14|.04|25,145,95,260,330,195|.3|n
8-Bit|0|.11|0|30,140,100,265,340,205|.3|n
Industrial|70|.12|.015|30,90,75,220,15,60|.18|m
Punk|0|.1|.01|25,125,100,262,345,200|.3|n
Metal|0|.09|0|25,30,60,20,10,45|.22|m
Goth|320|.1|.03|15,340,20,300,325,350|.2|m
Grunge|80|.14|.02|35,110,85,230,15,170|.15|s
Shoegaze|290|.2|.03|350,170,80,275,315,215|.12|p
Jazz Club|45|.12|.03|30,70,85,250,15,195|.16|s
Blues|255|.14|.04|15,190,85,260,285,215|.17|n
Disco|330|.13|.05|15,175,95,270,335,195|.3|n
Funk|50|.14|.04|25,140,90,275,330,60|.24|n
Soul|30|.15|.03|25,125,80,270,340,60|.18|s
Reggae|140|.12|.04|25,145,100,260,340,190|.24|n
Ambient|220|.2|.02|10,160,90,240,300,200|.08|p
Midnight|265|.1|.04|15,165,90,262,300,210|.18|n
Dawn|20|.19|.03|20,150,75,260,350,50|.15|p
Dusk|290|.16|.05|15,340,60,280,310,35|.2|s
Aurora|195|.1|.04|150,165,120,215,300,185|.24|n
Nebula|290|.1|.05|340,270,320,245,305,200|.24|n
Galaxy|270|.09|.05|20,200,90,265,315,230|.22|n
Supernova|30|.1|.04|25,55,100,60,340,85|.28|m
Black Hole|0|.07|0|25,150,95,262,315,200|.16|n
Mars|35|.13|.04|25,45,70,15,5,55|.18|m
Deep Space|250|.08|.03|15,160,100,245,290,200|.2|n
Lagoon|190|.13|.04|160,175,120,210,340,195|.2|m
Coral Reef|200|.13|.04|20,170,80,215,350,185|.24|n
Rainforest|145|.12|.04|90,140,110,170,30,155|.22|m
Desert|65|.15|.03|30,90,80,45,15,70|.16|m
Volcano|25|.1|.04|25,15,60,35,5,45|.26|m
Tundra|220|.18|.015|15,180,90,235,300,200|.1|p
Swamp|120|.12|.03|60,125,95,150,30,140|.18|m
Mushroom|300|.12|.04|10,130,70,290,320,190|.2|n
Firefly|120|.09|.03|100,125,110,210,40,150|.25|m
Jellyfish|240|.1|.04|330,185,210,265,315,200|.22|n
Candy|350|.17|.04|10,150,95,270,340,195|.2|p
Bubblegum|345|.16|.05|355,175,95,290,330,210|.18|p
Lemonade|100|.14|.03|30,130,100,230,340,110|.24|n
Mint|165|.14|.03|15,160,110,200,330,180|.16|m
Grape|300|.12|.05|330,290,315,270,300,280|.22|m
Watermelon|150|.13|.03|10,145,120,170,355,160|.24|n
Espresso|50|.12|.02|35,85,75,50,20,65|.12|m
Matcha|135|.14|.03|60,130,110,160,30,145|.16|m
Cotton Candy|300|.2|.04|350,190,95,265,320,210|.12|p
Blood Moon|20|.09|.04|25,15,40,5,350,30|.24|m
Poison|140|.1|.04|130,300,110,150,320,145|.27|n
Hazard|90|.1|.02|25,100,95,60,15,85|.24|m
Radioactive|125|.1|.04|120,130,115,140,110,160|.28|m
Plasma Arc|260|.09|.04|300,210,230,265,320,195|.3|n
Laser Tag|0|.09|0|25,145,105,262,330,200|.32|n
Stealth|200|.1|.015|200,150,105,230,300,190|.14|m
Mainframe|240|.1|.02|25,145,95,235,300,195|.2|n
Terminal Green|145|.09|.02|145,145,145,145,145,145|.22|m
Terminal Blue|255|.11|.04|230,210,245,262,275,200|.18|m
Neon Tokyo|320|.11|.05|10,160,95,250,330,200|.28|n
Neon Vegas|340|.1|.04|15,150,85,270,330,55|.3|n
Miami Night|310|.12|.05|355,175,85,280,330,195|.26|n
Hong Kong Rain|200|.12|.03|15,165,90,235,340,195|.24|n
Berlin Club|0|.08|0|25,130,100,260,320,190|.24|n
Arcade Carpet|280|.1|.05|25,145,95,275,330,200|.3|n
Pinball|20|.11|.03|25,150,95,245,340,195|.3|n
Racing|0|.1|.01|25,150,95,230,340,55|.28|n
VHS|260|.14|.03|15,160,90,250,320,195|.18|s
Polaroid|60|.19|.015|25,145,85,240,340,195|.12|s
Cathode|200|.11|.03|205,185,215,235,160,195|.2|m`;

function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// OKLCH to linear sRGB.
function lin(L, C, h) {
  h *= Math.PI / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + .3963377774 * a + .2158037573 * b) ** 3;
  const m = (L - .1055613458 * a - .0638541728 * b) ** 3;
  const s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + .2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s,
    -.0041960863 * l - .7034186147 * m + 1.707614701 * s,
  ];
}

// OKLCH to hex. Chroma drops until the color fits in sRGB.
export function oklchHex(L, C, h) {
  let c = C, r = lin(L, c, h);
  while (c > 0 && r.some(v => v < -.001 || v > 1.001)) { c -= .005; r = lin(L, c, h); }
  return '#' + r.map(v => {
    v = Math.min(1, Math.max(0, v));
    v = v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055;
    return Math.round(v * 255).toString(16).padStart(2, '0');
  }).join('').toUpperCase();
}

// Hex to OKLCH. Used to pick the icon theme from the accent hue.
export function hexOklch(hex) {
  const [r, g, b] = [1, 3, 5].map(i => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  const L = .2104542553 * l + .7936177850 * m - .0040720468 * s;
  const A = 1.9779984951 * l - 2.4285922050 * m + .4505937099 * s;
  const B = .0259040371 * l + .7827717662 * m - .8086757660 * s;
  return { L, C: Math.hypot(A, B), h: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
}

// Linear sRGB mix, the same math that Omarchy uses for derived shades.
export function mix(a, b, t) {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.floor(v * (1 - t) + pb[i] * t + .5).toString(16).padStart(2, '0')).join('');
}

export function slugify(name) {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const rows = TABLE.split('\n').map(line => {
  const [n, bh, bl, bc, h, c, L] = line.split('|');
  return { n, bg: [+bl, +bc, +bh], h: h.split(',').map(Number), c: +c, L: LM[L], set: L };
});

// Dark: the 16 ANSI colors, background, and foreground, as the design builds them.
const darkPalettes = rows.map((g, gi) => {
  if (g.n === 'Neon Wave') return { name: 'Neon Wave', bg: '#0A0A12', fg: '#E6E6F0', c: ORIGINAL };
  const r = rng(gi * 7919 + 13), bh = g.bg[2], bl = g.bg[0], bc = g.bg[1], bf = .55 + r() * .3;
  const hs = g.h.map(h => h + (r() - .5) * 8);
  const normal = hs.map((h, k) => oklchHex(Math.min(.97, g.L[k]), g.c, h));
  const bright = hs.map((h, k) => oklchHex(Math.min(.98, g.L[k] + .1), g.c * bf, h));
  return {
    name: g.n, bg: oklchHex(bl, bc, bh), fg: oklchHex(.93, .012, bh),
    c: [oklchHex(bl + .06, bc, bh), ...normal, oklchHex(.84, .015, bh), oklchHex(.5, bc + .02, bh), ...bright, oklchHex(.985, .005, bh)],
  };
});

// Yaru icon themes that ship with Omarchy, keyed by OKLCH hue.
const YARU = [
  [15, 'Yaru-red'], [45, 'Yaru'], [85, 'Yaru-yellow'], [115, 'Yaru-olive'],
  [150, 'Yaru-sage'], [200, 'Yaru-prussiangreen'], [255, 'Yaru-blue'],
  [300, 'Yaru-purple'], [345, 'Yaru-magenta'], [375, 'Yaru-red'],
];

function iconTheme(hex) {
  const { h } = hexOklch(hex);
  let best = YARU[0], dist = Infinity;
  for (const entry of YARU) {
    const d = Math.min(Math.abs(entry[0] - h), Math.abs(entry[0] - (h + 360)));
    if (d < dist) { dist = d; best = entry; }
  }
  return best[1];
}

// Orange sits between the red and yellow hues of each palette.
function orangeFor(red, yellow) {
  const a = hexOklch(red), b = hexOklch(yellow);
  let dh = b.h - a.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return oklchHex((a.L + b.L) / 2, (a.C + b.C) / 2, a.h + dh / 2).toLowerCase();
}

// WCAG contrast ratio of two hex colors.
export function contrast(a, b) {
  const lum = hex => {
    const [r, g, bl] = [1, 3, 5].map(i => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
    });
    return .2126 * r + .7152 * g + .0722 * bl;
  };
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}

// The first color at or above lightness L that reaches the target contrast.
function lighten(L, C, h, bg, target) {
  let hex = oklchHex(L, C, h);
  while (contrast(hex, bg) < target && L < 1) { L = Math.min(1, L + .005); hex = oklchHex(L, C, h); }
  return hex;
}

const clampL = (L, lo, hi) => Math.min(hi, Math.max(lo, L));

// The first color at or below lightness L that reaches the target contrast.
function darken(L, C, h, bg, target) {
  let hex = oklchHex(L, C, h);
  while (contrast(hex, bg) < target && L > 0) { L = Math.max(0, L - .005); hex = oklchHex(L, C, h); }
  return hex;
}

// The native background motif for each theme. tools/render-*.html draw them.
const MOTIFS = {
  'sunset-grid': ['Synthwave', 'Neon Wave', 'Vaporwave', 'Outrun', 'Retrowave', 'Dusk', 'Miami Night', 'Racing'],
  'code-rain': ['Hacker', 'Stealth', 'Mainframe', 'Terminal Green', 'Terminal Blue'],
  'nebula': ['Ultraviolet', 'Midnight', 'Nebula', 'Galaxy', 'Supernova', 'Deep Space'],
  'aurora': ['Glacier', 'Chillwave', 'Shoegaze', 'Ambient', 'Dawn', 'Aurora', 'Tundra'],
  'skyline': ['Cyberpunk', 'Noir Rain', 'Grime', 'Industrial', 'Neon Tokyo', 'Neon Vegas', 'Hong Kong Rain'],
  'equalizer': ['Phonk', 'Drum & Bass', 'Dubstep', 'Techno', 'House', 'Acid House', 'Trap', 'Punk', 'Metal'],
  'waveform': ['Lofi', 'Darkwave', 'Trance', 'Goth', 'Grunge', 'Jazz Club', 'Blues', 'Funk', 'Soul', 'Reggae'],
  'blobs': ['Sakura', 'Dreampop', 'Candy', 'Bubblegum', 'Lemonade', 'Mint', 'Grape', 'Watermelon', 'Espresso', 'Matcha', 'Cotton Candy', 'Polaroid'],
  'depths': ['Abyss', 'Tropical', 'Bioluminescent', 'Lagoon', 'Coral Reef', 'Jellyfish'],
  'embers': ['Ember', 'Solar Flare', 'Desert', 'Volcano', 'Hazard'],
  'pixels': ['Arcade', 'Chiptune', '8-Bit', 'Arcade Carpet', 'Pinball'],
  'scanlines': ['Amber CRT', 'Glitchcore', 'VHS', 'Cathode'],
  'contours': ['Toxic', 'Jungle', 'Rainforest', 'Swamp', 'Mushroom', 'Firefly', 'Poison', 'Radioactive'],
  'tubes': ['Hyperpop', 'Disco', 'Plasma Arc', 'Laser Tag', 'Berlin Club'],
  'planet': ['Black Hole', 'Mars', 'Blood Moon'],
};
const motifFor = name => Object.keys(MOTIFS).find(m => MOTIFS[m].includes(name));

// Day: OKLCH lightness of red, green, yellow, blue, magenta and cyan on a light
// background, for each lightness set of the design.
const LIGHT = { n: [.55, .56, .64, .5, .55, .56], p: [.58, .6, .66, .55, .58, .6], m: [.5, .55, .63, .5, .53, .56], s: [.56, .57, .64, .53, .56, .57] };

const dayPalettes = rows.map((g, gi) => {
  const r = rng(gi * 7919 + 13), bh = g.bg[2], bc = g.bg[1];
  r();
  const hs = g.h.map(h => h + (r() - .5) * 8);
  const L = LIGHT[g.set];
  const tint = Math.min(bc * .45, .022);
  const bgL = g.set === 'p' || g.set === 's' ? .965 : .975;
  const normal = hs.map((h, k) => oklchHex(L[k], g.c, h));
  const bright = hs.map((h, k) => oklchHex(L[k] - .07, g.c * 1.05, h));
  return {
    bgL, tint, bh,
    bg: oklchHex(bgL, tint, bh), fg: oklchHex(.27, Math.min(bc * .6 + .01, .04), bh),
    c: [
      oklchHex(bgL - .06, tint * 1.3, bh), ...normal, oklchHex(.4, Math.min(bc * .5 + .01, .035), bh),
      oklchHex(.72, Math.min(bc * .5 + .01, .03), bh), ...bright, oklchHex(.19, Math.min(bc * .5 + .01, .03), bh),
    ],
  };
});

// High contrast: each color starts from the design lightness and gets lighter
// until it reaches the WCAG target against a near-black background.
// 7:1 is WCAG AAA for normal text.
const TARGET = { normal: 7, bright: 9, muted: 4.5 };

const highContrastPalettes = rows.map((g, gi) => {
  const r = rng(gi * 7919 + 13), bh = g.bg[2], bc = g.bg[1], bf = .55 + r() * .3;
  const hs = g.h.map(h => h + (r() - .5) * 8);
  const bg = oklchHex(.08, Math.min(bc * .8, .03), bh);
  const normal = hs.map((h, k) => lighten(clampL(g.L[k], .7, .88), g.c, h, bg, TARGET.normal));
  const bright = hs.map((h, k) => lighten(clampL(g.L[k] + .1, .82, .93), g.c * Math.max(bf, .8), h, bg, TARGET.bright));
  return {
    bh, bg, fg: oklchHex(.97, .008, bh),
    c: [
      oklchHex(.2, Math.min(bc + .01, .05), bh), ...normal, oklchHex(.9, .012, bh),
      lighten(.6, Math.min(bc + .02, .06), bh, bg, TARGET.muted), ...bright, oklchHex(1, 0, bh),
    ],
  };
});

// Day high contrast: the day hues get darker until they reach the WCAG target
// against a near-white background.
const highContrastDayPalettes = rows.map((g, gi) => {
  const r = rng(gi * 7919 + 13), bh = g.bg[2], bc = g.bg[1];
  r();
  const hs = g.h.map(h => h + (r() - .5) * 8);
  const L = LIGHT[g.set];
  const bg = oklchHex(.995, Math.min(bc * .2, .008), bh);
  const normal = hs.map((h, k) => darken(Math.min(L[k], .5), g.c, h, bg, TARGET.normal));
  const bright = hs.map((h, k) => darken(Math.min(L[k] - .07, .45), g.c * 1.05, h, bg, TARGET.bright));
  return {
    bh, bg, fg: oklchHex(.14, Math.min(bc * .6 + .01, .04), bh),
    c: [
      oklchHex(.94, Math.min(bc * .4, .02), bh), ...normal, oklchHex(.3, .02, bh),
      darken(.62, Math.min(bc * .5 + .01, .03), bh, bg, TARGET.muted), ...bright, oklchHex(.08, .01, bh),
    ],
  };
});

const lower = x => x.toLowerCase();

// Variant order, labels, and the suffix of the installed theme name.
export const VARIANTS = [
  { key: 'dark', label: 'Dark', title: '', suffix: '', mode: 'dark', renderer: 'night' },
  { key: 'day', label: 'Day', title: 'Day', suffix: '-day', mode: 'light', renderer: 'day' },
  { key: 'high-contrast', label: 'High contrast', title: 'High Contrast', suffix: '-high-contrast', mode: 'dark', renderer: 'night' },
  { key: 'day-high-contrast', label: 'Day high contrast', title: 'Day High Contrast', suffix: '-day-high-contrast', mode: 'light', renderer: 'day' },
  { key: 'oled', label: 'OLED', title: 'OLED', suffix: '-oled', mode: 'dark', renderer: 'night' },
];

function semantic(c, bg, fg, extra) {
  const orange = extra.orange || orangeFor(c[1], c[3]);
  return {
    mode: extra.mode,
    accent: c[5],
    selection: extra.selection,
    muted: c[8],
    background: bg,
    dark_background: extra.dark_background,
    darker_background: extra.darker_background,
    lighter_background: c[0],
    foreground: fg,
    dark_foreground: extra.dark_foreground,
    light_foreground: c[7],
    bright_foreground: c[15],
    red: c[1], yellow: c[3], orange, green: c[2], cyan: c[6], blue: c[4], magenta: c[5],
    brown: mix(orange, '#000000', extra.brown),
    bright_red: c[9], bright_yellow: c[11], bright_green: c[10], bright_cyan: c[14], bright_blue: c[12], bright_magenta: c[13],
  };
}

function variant(key, base, name, c, colors) {
  const v = VARIANTS.find(x => x.key === key);
  return { variant: key, label: v.label, install: `${base}${v.suffix}`, name: v.title ? `${name} ${v.title}` : name, ansi: c, icons: iconTheme(colors.accent), colors };
}

export const themes = darkPalettes.map((p, i) => {
  const base = slugify(p.name);
  const out = {};

  // Dark: the design palette.
  {
    const c = p.c.map(lower), bg = lower(p.bg), fg = lower(p.fg);
    out.dark = variant('dark', base, p.name, c, semantic(c, bg, fg, {
      mode: 'dark', selection: mix(bg, c[5], .28),
      dark_background: mix(bg, '#000000', .25), darker_background: mix(bg, '#000000', .5),
      dark_foreground: mix(fg, bg, .35), brown: .5,
    }));

    // OLED: the design colors on true black. Panels stay black, surfaces get a dark tint.
    const g = rows[i], bh = g.bg[2], bc = g.bg[1];
    const oc = [...c];
    oc[0] = lower(oklchHex(.15, Math.min(bc + .01, .05), bh));
    out.oled = variant('oled', base, p.name, oc, semantic(oc, '#000000', fg, {
      mode: 'dark', selection: mix('#000000', c[5], .3),
      dark_background: '#000000', darker_background: '#000000',
      dark_foreground: mix(fg, '#000000', .38), brown: .5,
    }));
  }

  // Day
  {
    const d = dayPalettes[i], c = d.c.map(lower), bg = lower(d.bg), fg = lower(d.fg);
    out.day = variant('day', base, p.name, c, semantic(c, bg, fg, {
      mode: 'light', selection: mix(bg, c[5], .22),
      dark_background: lower(oklchHex(d.bgL - .035, d.tint, d.bh)), darker_background: lower(oklchHex(d.bgL - .075, d.tint, d.bh)),
      dark_foreground: lower(oklchHex(.55, Math.min(d.tint + .01, .03), d.bh)), brown: .4,
    }));
  }

  // High contrast
  {
    const h = highContrastPalettes[i], c = h.c.map(lower), bg = lower(h.bg), fg = lower(h.fg);
    const o = hexOklch(orangeFor(c[1], c[3]));
    out['high-contrast'] = variant('high-contrast', base, p.name, c, semantic(c, bg, fg, {
      mode: 'dark', selection: mix(bg, c[5], .38),
      dark_background: mix(bg, '#000000', .3), darker_background: mix(bg, '#000000', .6),
      dark_foreground: lower(lighten(.75, .015, h.bh, bg, TARGET.normal)), brown: .45,
      orange: lower(lighten(o.L, o.C, o.h, bg, TARGET.normal)),
    }));
  }

  // Day high contrast
  {
    const h = highContrastDayPalettes[i], c = h.c.map(lower), bg = lower(h.bg), fg = lower(h.fg);
    const o = hexOklch(orangeFor(c[1], c[3]));
    out['day-high-contrast'] = variant('day-high-contrast', base, p.name, c, semantic(c, bg, fg, {
      mode: 'light', selection: mix(bg, c[5], .25),
      dark_background: lower(oklchHex(.96, Math.min(rows[i].bg[1] * .3, .012), h.bh)), darker_background: lower(oklchHex(.92, Math.min(rows[i].bg[1] * .3, .012), h.bh)),
      dark_foreground: lower(darken(.45, .02, h.bh, bg, TARGET.normal)), brown: .4,
      orange: lower(darken(Math.min(o.L, .5), o.C, o.h, bg, TARGET.normal)),
    }));
  }

  return { index: i + 1, name: p.name, slug: base, motif: motifFor(p.name), row: rows[i], variants: out };
});

export function colorsToml(v) {
  const k = v.colors;
  const hx = h => `rgba(${h.slice(1)}ee)`;
  return `mode = "${k.mode}"

accent = "${k.accent}"
selection = "${k.selection}"
muted = "${k.muted}"

background = "${k.background}"
dark_background = "${k.dark_background}"
darker_background = "${k.darker_background}"
lighter_background = "${k.lighter_background}"

foreground = "${k.foreground}"
dark_foreground = "${k.dark_foreground}"
light_foreground = "${k.light_foreground}"
bright_foreground = "${k.bright_foreground}"

hyprland_active_border = "${hx(k.cyan)} ${hx(k.magenta)} 45deg"
hyprland_inactive_border = "rgba(${k.muted.slice(1)}aa)"

red = "${k.red}"
yellow = "${k.yellow}"
orange = "${k.orange}"
green = "${k.green}"
cyan = "${k.cyan}"
blue = "${k.blue}"
magenta = "${k.magenta}"
brown = "${k.brown}"

bright_red = "${k.bright_red}"
bright_yellow = "${k.bright_yellow}"
bright_green = "${k.bright_green}"
bright_cyan = "${k.bright_cyan}"
bright_blue = "${k.bright_blue}"
bright_magenta = "${k.bright_magenta}"
`;
}
