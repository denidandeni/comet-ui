#!/usr/bin/env node
// Brand + theme contract check. Fails when
//   1. a brand is missing a key that the template defines (or has an extra one),
//   2. a semantic token lacks a light or dark value,
//   3. a strict text/surface pair is below its WCAG ratio in any brand x theme.
// Non-strict pairs below their ratio are reported as warnings.
import { load, resolveHex, ratio, modeValue } from './lib/tokens.mjs';

const t = load();
const errors = [];
const warnings = [];

// 1. Brand key parity
const want = new Set(t.template.leaves.map((l) => l.key));
for (const [name, b] of Object.entries(t.brands)) {
  const have = new Set(b.leaves.map((l) => l.key));
  for (const k of want) if (!have.has(k)) errors.push(`brand "${name}" is missing ${k}`);
  for (const k of have) if (!want.has(k)) errors.push(`brand "${name}" has unknown key ${k}`);
}

// 2. Semantic tokens need both modes
for (const l of t.semantic) {
  if (typeof l.value === 'object' && (!l.value.light || !l.value.dark)) errors.push(`semantic ${l.key} needs both light and dark`);
}

// 3. Contrast
let checked = 0;
for (const [name, b] of Object.entries(t.brands)) {
  for (const mode of ['light', 'dark']) {
    for (const p of t.contrast.pairs) {
      const fg = resolveHex(p.fg, mode, t, b);
      const bg = resolveHex(p.bg, mode, t, b);
      if (!fg || !bg) { errors.push(`contrast pair ${p.fg}/${p.bg} cannot be resolved to hex (${name}, ${mode})`); continue; }
      checked++;
      const r = ratio(fg, bg);
      if (r < p.min) {
        const msg = `${name}/${mode}: ${p.fg} on ${p.bg} is ${r.toFixed(2)}:1, needs ${p.min}:1`;
        (p.strict ? errors : warnings).push(msg);
      }
    }
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`\n${Object.keys(t.brands).length} brands, ${t.semantic.length} semantic tokens, ${checked} contrast checks. ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
