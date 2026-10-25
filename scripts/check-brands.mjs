#!/usr/bin/env node
// Brand + theme contract check. Fails when
//   1. a brand is missing a key that the template defines (or has an extra one),
//   2. a semantic token lacks a light or dark value,
//   3. a strict text/surface pair is below its WCAG ratio in any brand x theme.
// Non-strict pairs below their ratio are reported as warnings.
import { load, contrastReport, keyParity } from './lib/tokens.mjs';

const t = load();
const errors = [];
const warnings = [];

// 1. Brand key parity
for (const b of Object.values(t.brands)) errors.push(...keyParity(t, b));

// 2. Semantic tokens need both modes
for (const l of t.semantic) {
  if (typeof l.value === 'object' && (!l.value.light || !l.value.dark)) errors.push(`semantic ${l.key} needs both light and dark`);
}

// 3. Contrast
let checked = 0;
for (const b of Object.values(t.brands)) {
  const r = contrastReport(t, b);
  checked += r.checked;
  errors.push(...r.errors);
  warnings.push(...r.warnings);
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`\n${Object.keys(t.brands).length} brands, ${t.semantic.length} semantic tokens, ${checked} contrast checks. ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
