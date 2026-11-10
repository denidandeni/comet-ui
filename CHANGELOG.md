# Changelog

Versions follow semantic versioning. A deprecated name stays as an alias for at least one minor release before it is removed, and every release gets an entry here.

## 1.3.0

Closes the gap with shadcn/ui: 57 of its 66 components now have a Comet UI equivalent.

### Added
- **Atoms:** Toggle and Toggle group, Slider, Scroll area.
- **Molecules:** Collapsible, Popover, Hover card, Item, Code block (with copy), Calendar (inline datepicker), shared `cu-menu` surface.
- **Organisms:** Command (inline and Ctrl+K palette), Context menu, Menubar, Navigation menu, Carousel, Resizable panels.
- **Alert dialog:** `role="alertdialog"` with `data-cu-static` now also ignores Esc, so it must be answered.
- **comet.js:** popover placement with flip, menu keyboard navigation, `data-cu-copy`, `data-cu-hotkey`, and the events `cu:toggle`, `cu:select`, `cu:command`, `cu:slide`, `cu:resize`, `cu:copy`.
- **Docs:** a section for each new component, a "shadcn/ui coverage" page with the full mapping, and current install instructions on the Getting started page.

### Fixed
- Docs icons: the pages used `data-lucide` icons but never loaded Lucide, so no icon was drawn. The script is now loaded (pinned to 1.70.0).
- Password toggle swaps a Lucide eye icon as well as the icon font, and sets `aria-pressed` and its label.

### Not included
- Chart (needs a charting library), Direction (RTL), and the chat components (Attachment, Bubble, Marker, Message, Message Scroller, Questionnaire, Trace).

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
