# Comet UI ☄️

Comet UI is a modern, high-contrast, and lightweight CSS component library designed for building polished, high-performance web applications. It evolved from a dark-themed foundation into a sophisticated, light-mode-focused "Nebula" aesthetic.

## Features

- **Nebula Design System**: A carefully curated light-mode color palette, typography, and spacing scale.
- **Lightweight & Fast**: Built with pure CSS and zero dependencies.
- **Pre-built Components**: Includes Buttons, Inputs, Dialogs, Dropdowns, Badges, and more.
- **Accessible & Responsive**: Designed with modern best practices in mind.
- **Interactive Documentation**: Comes with a built-in documentation site for exploring components.

## Installation

You can install Comet UI directly from GitHub using npm:

```bash
npm install git+https://github.com/denidandeni/comet-ui.git
```

## Usage

After installation, simply import the library into your main JavaScript entry point (e.g., `index.js`, `main.js`, or `_app.js` in Next.js):

```javascript
import 'comet-ui';
```

Alternatively, you can link the CSS file directly in your HTML:

```html
<link rel="stylesheet" href="node_modules/comet-ui/index.css">
```

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

## License

This project is licensed under the MIT License.
