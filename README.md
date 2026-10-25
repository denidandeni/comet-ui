# Comet UI ☄️

Comet UI is a modern, high-contrast, and lightweight CSS component library designed for building polished, high-performance web applications. It evolved from a dark-themed foundation into a sophisticated, light-mode-focused "Nebula" aesthetic.

## Features

- **Nebula Design System**: A carefully curated light-mode color palette, typography, and spacing scale.
- **Lightweight & Fast**: Built with pure CSS and zero dependencies.
- **Pre-built Components**: Includes Buttons, Inputs, Dialogs, Dropdowns, Badges, and more.
- **Accessible & Responsive**: Designed with modern best practices in mind.
- **Interactive Documentation**: Comes with a built-in documentation site for exploring components.

## Installation

```bash
npm install git+https://github.com/denidandeni/comet-ui.git
```

## Usage

```html
<link rel="stylesheet" href="node_modules/comet-ui/dist/comet.min.css">
<script src="node_modules/comet-ui/dist/comet.min.js" defer></script>
```

With a bundler: `import 'comet-ui/comet.min.css'; import 'comet-ui/comet.min.js';`

| File | What it is | Size (min / gzip) |
| --- | --- | --- |
| `comet.min.css` | Everything: tokens, components, utilities | 88 kB / 13 kB |
| `core.min.css` | Foundation only: tokens, reset, typography, layout, utilities. Budget 30 kB | 24 kB / 4 kB |
| `components.min.css` | Components and templates only | 53 kB / 8 kB |
| `brands/<name>.css` | One brand each (already inside `comet.min.css`) | 1 kB |
| `comet.min.js` | Behaviour (table, toast, datepicker, tabs...) | 26 kB |
| `tailwind.css` | Tailwind v4 preset: `@import "comet-ui/tailwind.css"` | 3 kB |
| `llms.txt` | Guide for AI agents, generated from the tokens | 16 kB |

`npm run build` creates `dist/`. Source files are plain CSS, so `index.css` also works with no build step.

## Local Development & Documentation

To preview the documentation and components locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/denidandeni/comet-ui.git
   ```
2. Open `docs/index.html` in your browser.
3. Alternatively, use a local server:
   ```bash
   npx serve .
   ```

## Design Tokens

Comet UI uses a robust set of CSS variables (tokens) that you can override to customize your theme:

- `--cu-brand-500`: Primary brand color.
- `--cu-radius-md`: Standard corner radius.
- `--cu-shd-pop`: Elevation shadow for modals and dropdowns.

## Components and behaviour

Most components are CSS only. These need `src/comet.js` (no dependencies, no build step) for behaviour:

```html
<link rel="stylesheet" href="index.css">
<script src="src/comet.js" defer></script>
```

| Component | Hook | What comet.js does |
| --- | --- | --- |
| Table | `data-cu-table` | Sorting, text and column filter, pagination |
| Toast | `CometUI.toast({...})` | Popover region, auto-dismiss, pause on hover |
| Datepicker | `data-cu-datepicker` | Calendar popover, keyboard navigation, min/max |
| Searchbar | `.cu-searchbar` | Clear button, `cu:search` event |
| Quantity input | `data-cu-quantity="dec\|inc"` | Clamps to min/max, honours step |
| File upload | `data-cu-file-upload` | Type, size and count validation, file list |
| Drawer, Dialog | `data-cu-open`, `data-cu-close` | Open and close native `<dialog>` |
| Alert, Toast | `data-cu-dismiss` | Dismiss |
| Checkbox, Spinner, Skeleton, Progress, Empty state, Stats card | none | CSS only |

Call `CometUI.init(container)` after inserting markup dynamically.

## Themes and brands

Comet UI has two independent switches, set as attributes on any element (usually `<html>`):

```html
<html data-cu-theme="dark" data-cu-brand="comet">
```

- **Theme** (`light` default, `dark`) swaps the semantic tokens such as `--cu-background` and `--cu-primary`.
- **Brand** swaps the color scale, fonts and corner radius. The default brand is `neutral` (black and white, like shadcn/ui). `comet` (purple) and `ocean` (blue) are included as examples.

Components only use semantic tokens, so no component code changes per brand or theme. Scopes can be nested (a dark card inside a light page).

### Add a brand

Fastest way, from any project that has `comet-ui` installed:

```bash
npx comet-ui brand create acme --primary "#0f766e" --font '"Inter", sans-serif' --radius 0.5rem
npx comet-ui brand build comet-brands/acme.json   # checks contrast, writes comet-brands/acme.css
```

Load `acme.css` after Comet UI and set `data-cu-brand="acme"`. Contrast problems are shown before anything is written.

Inside this repository (so the brand ships with the package):

1. Copy `tokens/brands/_template.json` to `tokens/brands/<name>.json` and change the values. Keep every key.
2. Run `npm run build:tokens`. It writes `src/brands/<name>.css`, `tailwind.css` and `tokens/figma-variables.json`.
3. Run `npm test`. It checks that every brand has the same keys and that text/surface pairs meet WCAG contrast.
4. Use it with `data-cu-brand="<name>"`.

Token sources live in `tokens/*.json`. Never edit the generated files (`src/variables.css`, `src/brands/*.css`, `tailwind.css`).

## License

This project is licensed under the MIT License.
