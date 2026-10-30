# Changelog

Versions follow semantic versioning. A deprecated name stays as an alias for at least one minor release before it is removed, and every release gets an entry here.

## 1.3.0

### Added
- **Brand:** `amanimile` (biru `#1d78b4`, aksen oranye `#b84a06`, radius 12px, Inter + Plus Jakarta Sans), lolos cek kontras di light dan dark.
- **Tokens:** `info`, `info-subtle`, `info-subtle-foreground`; `chart-1` sampai `chart-8` (aman untuk buta warna, >= 3:1 terhadap surface); `media`, `media-foreground`, `media-muted-foreground`; primitive `sky`; `space.card` (20px). Pasangan kontras baru di `tokens/contrast.json`.
- **Badge:** `cu-badge-md`, `cu-badge-warning`, `-info`, `-accent`, `-destructive-subtle`.
- **Card:** `cu-card-compact`, `cu-card-header/-title/-subtitle/-actions/-body`, `cu-card-scroll`.
- **Components:** `cu-stat-compact`, `cu-status` + `cu-status-dot` (running, waiting, stopped, offline; beda bentuk, bukan hanya warna), `cu-legend`, `cu-stepper` (horizontal dan vertical), `cu-chart` (wrapper, fill/stroke 1-8, tooltip), `cu-gauge`, `cu-overlay-panel` + `cu-map-frame`, `cu-video-panel` (live, weak-signal, no-device, no-access), `cu-pill-navbar`, `cu-brand-band`, `cu-select-inverse`, `cu-icon-btn`, `cu-count-badge`.
- **Docs:** bagian baru dengan Preview, Code, dan catatan a11y untuk tiap komponen; halaman contoh `docs/examples/amanimile.html`.

### Changed
- Semua perubahan bersifat additive; varian lama tidak berubah.

## 1.2.0

### Added
- **Templates:** `cu-app-shell` (sidebar, header, content; sidebar becomes off-canvas below 48rem), `cu-auth`, `cu-settings`.
- **Components:** Tabs, Sidebar, Field, Kbd.
- **comet.js:** tabs (arrow keys, Home, End, roving tabindex), OTP input (auto-advance, backspace, paste), app shell toggle.
- **Build:** `npm run build` writes `dist/` (`comet.css`, `comet.min.css`, `core.min.css`, `components.min.css`, `brands/*.css`, `comet.js`, `comet.min.js`). The foundation file has a 30 kB budget checked by `npm test`.
- **CLI:** `comet-ui brand create` and `comet-ui brand build` make a new brand from one colour, with contrast checks.
- **Package:** `exports` map with subpaths, `bin`, `llms.txt` generated from the tokens and component headers.
- **Docs:** every example has Preview and Code tabs with a Copy button. KAI Fuelguard dashboard, auth and settings example pages.

### Changed
- `docs/` auth example replaced by the `cu-auth` template page.
- Brand CSS generation and contrast checks are shared between the build, the lint script and the CLI.

## 1.1.0

### Added
- Three-tier design tokens (primitive, semantic with light and dark, brand) generated from `tokens/*.json`; brands `neutral` (default, black and white), `comet`, `ocean`.
- Tailwind v4 preset (`tailwind.css`) and Figma variables JSON, generated from the same tokens.
- CSS layers (`cu.tokens`, `cu.base`, `cu.components`, `cu.utilities`); atomic folders `src/atoms`, `src/molecules`, `src/organisms`.
- Components: Checkbox, Spinner, Skeleton, Progress, Searchbar, Quantity input, File upload, Datepicker, Alert, Empty state, Stats card, Drawer, Toast, Data table (sort, filter, paginate).
- `comet.js` behaviour layer (no dependencies). Dialog and Drawer use native `<dialog>`; toasts use the popover API.
- Focus-visible, disabled and invalid states; mobile topbar; mobile-first responsive utilities.
- Lint scripts: undefined CSS variables and classes, brand key parity, WCAG contrast per brand and theme.

### Deprecated
- `src/legacy.css` and the v1.0.0 token names (`--cu-neutral-*`, `--cu-bdr`, `--cu-danger`...). They follow the active theme. Removal is planned for 2.0.0.

## 1.0.0
- First release: plain CSS components and a documentation page.
