// Writes colors.toml and icons.theme for every theme and variant, and the
// theme data for index.html.
//
//   node tools/build.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { themes, VARIANTS, colorsToml } from './palettes.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

for (const t of themes) {
  for (const { key } of VARIANTS) {
    const v = t.variants[key];
    const dir = join(ROOT, t.slug, key);
    mkdirSync(join(dir, 'backgrounds'), { recursive: true });
    writeFileSync(join(dir, 'colors.toml'), colorsToml(v));
    writeFileSync(join(dir, 'icons.theme'), `${v.icons}\n`);
  }
}

// Theme data for index.html.
const data = {
  variants: VARIANTS.map(({ key, label, suffix }) => ({ key, label, suffix })),
  themes: themes.map(t => ({
    index: t.index, name: t.name, slug: t.slug, motif: t.motif,
    variants: Object.fromEntries(VARIANTS.map(({ key }) => {
      const v = t.variants[key];
      return [key, { install: v.install, name: v.name, icons: v.icons, colors: v.colors, ansi: v.ansi }];
    })),
  })),
};
mkdirSync(join(ROOT, 'assets'), { recursive: true });
writeFileSync(join(ROOT, 'assets', 'themes.js'), `window.THEMES = ${JSON.stringify(data)};\n`);

console.log(`wrote ${themes.length} themes x ${VARIANTS.length} variants`);
