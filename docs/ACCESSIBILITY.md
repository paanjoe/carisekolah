# Accessibility (WCAG)

This document summarizes accessibility practices for **carisekolahmy** (official domain: carisekolah.civictech.my) and how to run checks.

## Target

We aim for **WCAG 2.1 Level AA** where applicable: sufficient contrast, keyboard and screen-reader support, and clear structure.

## Implemented practices

### Structure and navigation

- **Skip to main content** — A link at the top of the page (visible on focus) jumps to `#main-content`. Use Tab once after load to focus it.
- **Landmarks** — One `<main id="main-content">` per page; `<header>`, `<nav>`, `<footer>` used in the locale layout.
- **Heading hierarchy** — Key pages use a logical order (e.g. one `h1`, then `h2` for sections).

### Theming and contrast

- **Theme** — `app/globals.css` defines light and dark variables. `--muted-foreground` is set for at least ~4.5:1 contrast on background where used for body text.
- **Focus** — Global `:focus-visible` outline (2px solid foreground) for keyboard users.

### Interactive components

- **Home hero search** — Implemented as an ARIA combobox: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`. The suggestions list uses `role="listbox"` and `role="option"` with `aria-selected`. Keyboard: Arrow Up/Down, Enter, Escape. Submit button has an accessible name (e.g. “Search”).
- **Form controls** — Labels or `aria-label` where appropriate; buttons and links are semantic.

### Content

- **Language** — `lang` is set per locale in the app layout.
- **Decorative icons** — Given `aria-hidden` where they don’t convey unique information.

## Running accessibility checks

### Automated (axe + Playwright)

1. Install Playwright browsers (once):
   ```bash
   npx playwright install chromium
   ```
2. Run the a11y test suite (starts the dev server automatically):
   ```bash
   npm run test:e2e:a11y
   ```
   This runs axe-core with WCAG 2.1 A/AA tags on:

   - Home (`/en`)
   - Directory, Map, Statistics, Page statistics
   - A sample school detail page

   The test fails if there are **critical** or **serious** violations.

3. Full E2E suite:
   ```bash
   npm run test:e2e
   ```

### Manual checks

- **Keyboard** — Use Tab to move focus; ensure all interactive elements are reachable and focus is visible. Use Enter/Space on buttons and links, Arrow keys in the home search combobox.
- **Screen reader** — Test with NVDA (Windows), VoiceOver (macOS), or similar. Confirm skip link, headings, and combobox announcements.
- **Contrast** — Use browser DevTools or a tool like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) for custom colors.

## References

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices – Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
