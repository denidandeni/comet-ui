#!/usr/bin/env node
// comet-ui CLI. Dependency-free.
//   comet-ui brand create <name> --primary <#hex> [--accent <#hex>] [--font <css>] [--heading-font <css>] [--radius <rem>] [--out <dir>]
//   comet-ui brand build <file.json> [--out <file.css>]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { load, readBrandFile, renderBrandCss, contrastReport, keyParity, scaleFromSeed, root } from '../scripts/lib/tokens.mjs';

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const HELP = `comet-ui ${pkg.version}

Usage
  comet-ui brand create <name> --primary <#hex> [options]
      Writes <out>/<name>.json with a full brand scale made from the primary colour.
      --accent <#hex>        accent colour (default: the primary)
      --font <css>           body font family, e.g. '"Inter", sans-serif'
      --heading-font <css>   heading font family (default: same as --font)
      --radius <length>      the radius knob, e.g. 0.5rem (default 0.625rem)
      --out <dir>            where to write (default ./comet-brands)
  comet-ui brand build <file.json> [--out <file.css>]
      Checks the brand against the template and the contrast rules, then writes the CSS.
      Load the CSS after comet.css and set data-cu-brand="<name>" on any element.

  comet-ui --version | --help
`;

function parse(argv) {
  const pos = [], opt = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { opt[argv[i].slice(2)] = argv[i + 1]?.startsWith('--') || argv[i + 1] === undefined ? true : argv[++i]; }
    else pos.push(argv[i]);
  }
  return { pos, opt };
}
const fail = (msg) => { console.error(`error: ${msg}\n`); console.error('Run comet-ui --help'); process.exit(1); };
const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
const lumOf = (hex) => { const n = parseInt(hex.slice(1), 16); const l = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * l(n >> 16) + 0.7152 * l((n >> 8) & 255) + 0.0722 * l(n & 255); };
const contrast = (a, b) => { const [hi, lo] = [lumOf(a), lumOf(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

function create(name, o) {
  if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) fail('brand name must be lowercase letters, digits and dashes, e.g. "acme"');
  if (!isHex(o.primary)) fail('--primary must be a 6 digit hex colour such as #0f766e');
  if (o.accent !== undefined && !isHex(o.accent)) fail('--accent must be a 6 digit hex colour');
  const t = load();
  const brand = JSON.parse(readFileSync(join(root, 'tokens/brands/_template.json'), 'utf8'));
  const scale = scaleFromSeed(o.primary);
  const set = (path, v) => { let n = brand; const keys = path.split('.'); for (const k of keys.slice(0, -1)) n = n[k]; n[keys.at(-1)].$value = v; };
  brand.name = name;
  brand.$description = `${name}: generated from ${o.primary.toLowerCase()} by comet-ui brand create. Edit freely, then run comet-ui brand build.`;
  for (const [k, v] of Object.entries(scale)) set(`color.brand.${k}`, v);
  set('color.accent', o.accent ?? o.primary);
  const fg = contrast('#ffffff', scale[600]) >= 4.5 ? '#ffffff' : '#000000';
  for (const m of ['light', 'dark']) {
    set(`color.primary.${m}`, scale[600]);
    set(`color.primary-hover.${m}`, scale[700]);
    set(`color.primary-foreground.${m}`, fg);
  }
  set('color.ring.light', scale[500]);
  set('color.ring.dark', scale[400]);
  if (o.font) { set('font-family.default', o.font); set('font-family.heading', o['heading-font'] ?? o.font); }
  else if (o['heading-font']) set('font-family.heading', o['heading-font']);
  if (o.radius) set('radius.base', o.radius);
  void t;
  const dir = resolve(o.out && o.out !== true ? o.out : 'comet-brands');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${name}.json`);
  if (existsSync(file)) fail(`${file} already exists`);
  writeFileSync(file, JSON.stringify(brand, null, 2) + '\n');
  console.log(`wrote ${file}\nNext: comet-ui brand build ${file}`);
}

function build(file, o) {
  if (!file || !existsSync(file)) fail('give the brand JSON file: comet-ui brand build <file.json>');
  const t = load();
  const brand = readBrandFile(resolve(file));
  const errors = keyParity(t, brand);
  const rep = contrastReport(t, brand);
  errors.push(...rep.errors);
  for (const w of rep.warnings) console.warn(`warn  ${w}`);
  for (const e of errors) console.error(`error ${e}`);
  if (errors.length) { console.error(`\n${errors.length} error(s). Nothing written.`); process.exit(1); }
  const out = resolve(o.out && o.out !== true ? o.out : join(dirname(resolve(file)), `${basename(file, '.json')}.css`));
  writeFileSync(out, renderBrandCss(t, brand, { source: basename(file) }));
  console.log(`${rep.checked} contrast checks, ${rep.warnings.length} warning(s).\nwrote ${out}\nUse: <html data-cu-brand="${brand.name}"> after loading comet.css and ${basename(out)}`);
}

const { pos, opt } = parse(process.argv.slice(2));
if (opt.version || pos[0] === 'version') console.log(pkg.version);
else if (opt.help || !pos.length || pos[0] === 'help') console.log(HELP);
else if (pos[0] === 'brand' && pos[1] === 'create') create(pos[2], opt);
else if (pos[0] === 'brand' && pos[1] === 'build') build(pos[2], opt);
else fail(`unknown command "${pos.join(' ')}"`);
