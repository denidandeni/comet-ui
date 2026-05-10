# Comet UI: Foundation & Skill Guide

This document defines the architectural patterns and foundation for **Comet UI**, a design system evolved from the Rover pattern but tailored for high-performance, light-themed "Nebula" interfaces.

## 1. Core Philosophy

- **Token First**: Every value must be a token. No magic numbers.
- **Utility Driven**: Use atomic classes for layout.
- **Component Isolation**: Use the `cu-` prefix for all classes.
- **Premium Aesthetics**: Focus on depth (shadows), glow effects, and smooth transitions.

## 2. Design Tokens (`variables.css`)

```css
:root {
  /* --------------------------------------------------------------------------
        COLORS: Nebula Palette (Light Mode)
        -------------------------------------------------------------------------- */
  --cu-brand-50: #f5f3ff;
  --cu-brand-100: #ede9fe;
  --cu-brand-200: #ddd6fe;
  --cu-brand-300: #c4b5fd;
  --cu-brand-400: #a78bfa;
  --cu-brand-500: #8b5cf6; /* Comet Purple */
  --cu-brand-600: #7c3aed;

  --cu-accent: #0891b2; /* Deeper Solar Cyan for contrast */

  --cu-neutral-50: #020617; /* Dark text for light mode */
  --cu-neutral-100: #475569;
  --cu-neutral-200: #94a3b8;
  --cu-neutral-300: #cbd5e1;
  --cu-neutral-400: #f1f5f9;
  --cu-neutral-500: #ffffff; /* Page background */

  --cu-white: #ffffff;
  --cu-black: #000000;
  --cu-danger: #e11d48;
  --cu-success: #059669;
  --cu-bdr: rgba(15, 23, 42, 0.08);

  /* --------------------------------------------------------------------------
        SHADOWS & DEPTH
        -------------------------------------------------------------------------- */
  --cu-shd-btn:
    0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --cu-shd-active: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  --cu-shd-pop:
    0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --cu-shd-glow: 0 0 15px rgba(139, 92, 246, 0.15);

  /* --------------------------------------------------------------------------
        SPACING & RADIUS
        -------------------------------------------------------------------------- */
  --cu-space-xs: 4px;
  --cu-space-sm: 8px;
  --cu-space-md: 16px;
  --cu-space-lg: 24px;
  --cu-space-xl: 32px;

  --cu-radius-sm: 6px;
  --cu-radius-md: 10px;
  --cu-radius-lg: 16px;
  --cu-radius-round: 9999px;

  /* --------------------------------------------------------------------------
        TYPOGRAPHY
        -------------------------------------------------------------------------- */
  --cu-font-main: "Plus Jakarta Sans", sans-serif;
  --cu-font-mono: "Ui-Monospace", "SF Mono", monospace;
  --cu-font-size-sm: 12px;
  --cu-font-size-md: 14px;
  --cu-font-size-lg: 16px;
}
```

## 3. Utility Patterns (`base.css`)

Follow the naming convention: `.cu-[property][Value]` (camelCase).

- **Flexbox**: `.cu-flex`, `.cu-flexCol`, `.cu-itemsCenter`, `.cu-justifyBetween`
- **Spacing**: `.cu-pMd` (padding 16px), `.cu-mSm` (margin 8px), `.cu-gapLg` (gap 24px)
- **Text**: `.cu-textSm`, `.cu-textBrand`, `.cu-fontBold`
- **Visibility**: `.cu-hidden`, `.cu-block`

## 4. Implementation Skills

1. **Always use the prefix**: Never write a class without `cu-`.
2. **Layering**: Use `z-index` tokens: `--cu-z-sticky: 100`, `--cu-z-overlay: 1000`.
3. **Glassmorphism**: For overlays, use `background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid var(--cu-bdr);`.
4. **Interactive States**: Hover effects should include a slight glow (`var(--cu-shd-glow)`) and a subtle lift (`translateY(-1px)`).
