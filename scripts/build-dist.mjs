#!/usr/bin/env node
// Builds dist/ for publishing. Needs lightningcss and esbuild (devDependencies).
//   dist/comet.css, comet.min.css      everything: tokens, base, components, utilities
//   dist/core.min.css                  foundation only (tokens, base, type, layout, utilities). Budget: 30 kB.
//   dist/components.min.css            components and templates only
//   dist/brands/<name>.css             one file per brand
//   dist/comet.js, comet.min.js        behaviour
import { mkdirSync, writeFileSync, readdirSync, copyFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { gzipSync } from 'node:zlib';
import { bundle } from 'lightningcss';
import { buildSync } from 'esbuild';
import { root } from './lib/tokens.mjs';

const CORE_BUDGET = 30 * 1024;
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'brands'), { recursive: true });

const LAYERS = '@layer cu.tokens, cu.base, cu.components, cu.utilities;\n';
const src = (f) => join(root, 'src', f);
const entry = (lines) => {
  const dir = mkdtempSync(join(tmpdir(), 'comet-'));
  const file = join(dir, 'entry.css');
  writeFileSync(file, LAYERS + lines.map(([f, layer]) => `@import url('${src(f)}') layer(${layer});`).join('\n') + '\n');
  return file;
};
const foundation = [['variables.css', 'cu.tokens'], ['brands/index.css', 'cu.tokens'], ['base.css', 'cu.base'], ['typography.css', 'cu.components'],
  ['layout.css', 'cu.utilities'], ['utilities.css', 'cu.utilities']];
const rest = [['responsive.css', 'cu.utilities'], ['legacy.css', 'cu.utilities']];
const comps = [['components.css', 'cu.components']];

const sizes = [];
function emit(name, lines, { min = true, plain = false } = {}) {
  const file = entry(lines);
  if (plain) writeFileSync(join(dist, `${name}.css`), bundle({ filename: file, minify: false }).code);
  if (min) {
    const code = bundle({ filename: file, minify: true }).code;
    writeFileSync(join(dist, `${name}.min.css`), code);
    sizes.push([`${name}.min.css`, code.length, gzipSync(code).length]);
    return code.length;
  }
}
emit('comet', [...foundation.slice(0, 5), comps[0], ...foundation.slice(5), ...rest], { plain: true });
const coreSize = emit('core', foundation);
emit('components', comps);

for (const f of readdirSync(src('brands')).filter((f) => f.endsWith('.css') && f !== 'index.css')) copyFileSync(src(`brands/${f}`), join(dist, 'brands', f));

for (const [out, min] of [['comet.js', false], ['comet.min.js', true]]) {
  buildSync({ entryPoints: [src('comet.js')], outfile: join(dist, out), minify: min, bundle: false, target: 'es2018', legalComments: 'inline' });
}

for (const [n, raw, gz] of sizes) console.log(`${n.padEnd(20)} ${(raw / 1024).toFixed(1).padStart(6)} kB  ${(gz / 1024).toFixed(1).padStart(5)} kB gzip`);
if (coreSize > CORE_BUDGET) {
  console.error(`core.min.css is ${(coreSize / 1024).toFixed(1)} kB, over the ${CORE_BUDGET / 1024} kB budget`);
  process.exit(1);
}
console.log('dist/ ready');
