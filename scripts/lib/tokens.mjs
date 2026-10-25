// Shared helpers for reading tokens/*.json (W3C-style: every token has "$value").
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DEFAULT_BRAND = 'comet';

const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

function flatten(obj, path = [], out = []) {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$') || key === 'name') continue;
    if (val && typeof val === 'object' && '$value' in val) {
      out.push({
        path: [...path, key],
        key: [...path, key].join('.'),
        value: val.$value,
        scope: val.$scope ?? null,
        deprecated: Boolean(val.$deprecated),
        description: val.$description ?? null,
        nameOverride: val.$name ?? null,
      });
    } else if (val && typeof val === 'object') flatten(val, [...path, key], out);
    else throw new Error(`Token "${[...path, key].join('.')}" must be an object with "$value"`);
  }
  return out;
}

// --cu-slate-950 for color.slate.950; --cu-text-sm for text.sm; $name wins.
export function cssName(leaf) {
  if (leaf.nameOverride) return `--cu-${leaf.nameOverride}`;
  const p = leaf.path[0] === 'color' ? leaf.path.slice(1) : leaf.path;
  return `--cu-${p.join('-')}`;
}

export function load() {
  const primitive = flatten(readJson('tokens/primitive.json'));
  const semantic = flatten(readJson('tokens/semantic.json'));
  const legacy = flatten(readJson('tokens/legacy.json'));
  const contrast = readJson('tokens/contrast.json');
  const brands = {};
  let template = null;
  for (const f of readdirSync(join(root, 'tokens/brands')).filter((f) => f.endsWith('.json')).sort()) {
    const json = readJson(`tokens/brands/${f}`);
    const entry = { file: f, name: json.name, description: json.$description ?? '', leaves: flatten(json) };
    if (f.startsWith('_')) template = entry;
    else brands[json.name] = entry;
  }
  const index = new Map();
  for (const l of [...primitive, ...semantic, ...legacy, ...(brands[DEFAULT_BRAND]?.leaves ?? [])]) index.set(l.key, l);
  return { primitive, semantic, legacy, brands, template, contrast, index };
}

// "{color.brand.500}" -> "var(--cu-brand-500)"; other text is left alone.
export function toCss(value, index, where = '') {
  return value.replace(/\{([^}]+)\}/g, (_, ref) => {
    const leaf = index.get(ref);
    if (!leaf) throw new Error(`Unknown token reference {${ref}} ${where}`);
    return `var(${cssName(leaf)})`;
  });
}

export const modeValue = (leaf, mode) => (typeof leaf.value === 'object' ? leaf.value[mode] : leaf.value);

// ---- colour maths for the contrast check ----
export function resolveHex(ref, mode, tokens, brand) {
  const leaf = brand.leaves.find((l) => l.key === ref) ?? tokens.index.get(ref);
  if (!leaf) return null;
  const v = modeValue(leaf, mode);
  if (typeof v !== 'string') return null;
  const alias = v.match(/^\{([^}]+)\}$/);
  if (alias) return resolveHex(alias[1], mode, tokens, brand);
  return /^#[0-9a-f]{6}$/i.test(v) ? v : null;
}
const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
export const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
