// Collects everything the docs site needs into site/ for static hosting (Cloudflare Workers assets, Pages, any CDN).
import { cpSync, rmSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
rmSync('site', { recursive: true, force: true })
mkdirSync('site', { recursive: true })
for (const p of ['docs', 'src', 'dist', 'index.css', 'llms.txt', 'tailwind.css']) {
  if (existsSync(p)) cpSync(p, `site/${p}`, { recursive: true })
}
writeFileSync('site/_redirects', '/ /docs/index.html 302\n')
console.log('site/ ready')
