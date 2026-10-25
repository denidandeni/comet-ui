#!/usr/bin/env node
// Comet UI foundation check. Dependency-free; run with `npm run lint:tokens`.
//
// Fails (exit 1) when:
//   1. a CSS variable is used as var(--cu-*) but never defined,
//   2. a class is used in docs/*.html but never defined in src/*.css (or only
//      defined as a deprecated alias in src/legacy.css),
//   3. an id appears more than once in the same docs/*.html page.
//
// Variables used with a fallback, e.g. var(--cu-x, 8px), count as optional
// hooks and are reported as warnings only.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(p, 'utf8');
const list = (dir, ext) =>
  readdirSync(join(root, dir))
    .filter((f) => f.endsWith(ext))
    .map((f) => join(dir, f));

const cssFiles = list('src', '.css').concat(['index.css']);
const htmlFiles = list('docs', '.html');
const stripComments = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '');

const errors = [];
const warnings = [];

// 1. Variables ---------------------------------------------------------------
const defined = new Set();
const used = new Map(); // name -> { hard: Set<file>, soft: Set<file> }
for (const f of [...cssFiles, ...htmlFiles]) {
  const text = f.endsWith('.css') ? stripComments(read(join(root, f))) : read(join(root, f));
  for (const m of text.matchAll(/(--cu-[a-z0-9-]+)\s*:/g)) defined.add(m[1]);
  for (const m of text.matchAll(/var\(\s*(--cu-[a-z0-9-]+)\s*(,)?/g)) {
    const entry = used.get(m[1]) ?? { hard: new Set(), soft: new Set() };
    (m[2] ? entry.soft : entry.hard).add(f);
    used.set(m[1], entry);
  }
}
for (const [name, { hard, soft }] of [...used].sort()) {
  if (defined.has(name)) continue;
  if (hard.size) errors.push(`undefined variable ${name} used in ${[...hard].join(', ')}`);
  else warnings.push(`optional variable ${name} (has fallback) used in ${[...soft].join(', ')}`);
}

// 2. Classes used in docs but not defined -----------------------------------
const classesIn = (f) => {
  const found = new Set();
  for (const m of stripComments(read(join(root, f))).matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) found.add(m[1]);
  return found;
};
const definedClasses = new Set();
for (const f of cssFiles.filter((f) => !f.endsWith('legacy.css'))) {
  for (const c of classesIn(f)) definedClasses.add(c);
}
// Classes provided by stylesheets we load from a CDN rather than from src/.
const EXTERNAL_CLASSES = new Set(['material-symbols-outlined']);

// Classes that only exist as deprecated aliases in src/legacy.css.
const legacyClasses = new Set([...classesIn('src/legacy.css')].filter((c) => !definedClasses.has(c)));

for (const f of htmlFiles) {
  const html = read(join(root, f));
  const missing = new Map();
  const deprecated = new Map();
  for (const m of html.matchAll(/class="([^"]*)"/g)) {
    for (const c of m[1].split(/\s+/)) {
      if (!c || EXTERNAL_CLASSES.has(c) || definedClasses.has(c)) continue;
      const bucket = legacyClasses.has(c) ? deprecated : missing;
      bucket.set(c, (bucket.get(c) ?? 0) + 1);
    }
  }
  for (const [c, n] of missing) errors.push(`${f}: class .${c} is used ${n}x but not defined in src/`);
  for (const [c, n] of deprecated) errors.push(`${f}: class .${c} is used ${n}x but is deprecated (legacy.css only)`);

  // 3. Duplicate ids ---------------------------------------------------------
  const seen = new Map();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) seen.set(m[1], (seen.get(m[1]) ?? 0) + 1);
  for (const [id, n] of seen) if (n > 1) errors.push(`${f}: id="${id}" appears ${n}x`);
}

// Report ---------------------------------------------------------------------
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(
  `\n${defined.size} variables defined, ${used.size} used, ${definedClasses.size} classes defined. ` +
    `${errors.length} error(s), ${warnings.length} warning(s).`
);
process.exit(errors.length ? 1 : 0);
