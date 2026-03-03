# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**目に優しいフォント置換** — A Chrome Extension (Manifest V3) that replaces hard-to-read fonts on all websites with user-selected Japanese fonts. Users choose from 5 body fonts (Noto Sans JP, IBM Plex Sans JP, M PLUS 2, Murecho, Zen Kaku Gothic New) and 2 monospace fonts (UDEV Gothic JPDOC, PlemolJP) via a popup dropdown. Settings persist in `chrome.storage.local`.

## Build Commands

```bash
npm run build              # Full build: icons + CSS + screenshots
npm run generate-css       # Regenerate css/replacefont-extension.css from scripts/generate-css.js
npm run convert-fonts      # Convert all fonts/*.ttf → fonts/*.woff2
npm run generate-icons     # Regenerate PNG icons from icons/icon.svg
npm run generate-screenshots  # Generate Chrome Web Store promotional images
```

There are no tests or linting configured.

## Architecture

### Runtime Data Flow

```
chrome.storage.local (user font selection)
        ↓
font-config.js → FONT_REGISTRY (shared global, loaded first)
        ↓
preload-fonts.js (content script, runs at document_start)
  1. loadFontSettings() → reads from storage
  2. Fetches css/replacefont-extension.css (contains placeholders)
  3. replaceFontPlaceholders() → replaces __BODY_FONT_NAME__, __MONO_WOFF2_REGULAR__, etc.
  4. Injects resolved CSS into document.head
  5. inject.js intercepts attachShadow → dispatches custom event
  6. preload-fonts.js listens → injects CSS into each ShadowRoot
```

### Placeholder System

`generate-css.js` outputs CSS with placeholder tokens (not hardcoded font names). `preload-fonts.js` replaces them at runtime based on user selection:

| Placeholder | Example Replacement |
|---|---|
| `__BODY_FONT_NAME__` | `Noto Sans JP` |
| `__BODY_FONT_FALLBACK__` | `sans-serif` |
| `__BODY_LOCAL_REGULAR__` | `local("Noto Sans JP"), local("Noto Sans CJK Variable")` |
| `__BODY_WOFF2_REGULAR__` | `NotoSansJP-Regular.woff2` |
| `__MONO_FONT_NAME__` | `UDEV Gothic JPDOC` |
| `__MONO_LOCAL_BOLD__` | `local("UDEV Gothic JPDOC Bold")` |
| `__REPLACE_FONT_BASE__` | `chrome-extension://<id>/` |

### Key Files

- **`font-config.js`** — Single source of truth for all font metadata (`FONT_REGISTRY`). Shared between content scripts and popup via different loading mechanisms (content_script injection vs `<script>` tag).
- **`preload-fonts.js`** — Main content script. Handles CSS fetching, placeholder replacement, injection into document + Shadow DOM, font preloading, and MutationObserver-based monitoring.
- **`inject.js`** — Tiny page-context script that overrides `Element.prototype.attachShadow` to dispatch a custom event, enabling CSS injection into closed Shadow DOM.
- **`scripts/generate-css.js`** — Build-time script generating `@font-face` rules for 100+ font families (Gothic/Mono) with placeholder tokens. Run via `npm run generate-css`.
- **`popup/popup.js`** — Reads `FONT_REGISTRY` to populate dropdowns, saves selections to `chrome.storage.local`.

### Shadow DOM Strategy

Two mechanisms ensure CSS reaches Shadow DOM:
1. **`inject.js`** (page context) — Intercepts `attachShadow()` calls, dispatches event for newly created roots.
2. **`setupShadowDOMObserver()`** (content script) — MutationObserver + TreeWalker scans for open Shadow DOM roots on existing/new elements. Uses chunked scanning (200 elements/batch via `requestIdleCallback`).

CSS is injected via Constructable Stylesheets (`adoptedStyleSheets`) when supported, falling back to `<style>` tags.

### Adding a New Font

1. Place TTF files in `fonts/` directory
2. Run `npm run convert-fonts` to generate woff2
3. Add entry to `FONT_REGISTRY` in `font-config.js` (under `body` or `mono`)
4. No changes needed to other files — popup and content script read from the registry dynamically

### Storage Schema

Key: `fontSettings` in `chrome.storage.local`
```json
{ "bodyFont": "noto-sans-jp", "monoFont": "udev-gothic-jpdoc" }
```
Values are keys from `FONT_REGISTRY.body` / `FONT_REGISTRY.mono`. Font changes require page reload.

## Important Notes

- M PLUS 2 and Murecho are **variable fonts** — single woff2 file serves both Regular and Bold weights.
- The generated CSS (`css/replacefont-extension.css`) is ~2300 lines. Regenerate after modifying `generate-css.js`.
- `manifest.json` loads `font-config.js` before `preload-fonts.js` in `content_scripts` so `FONT_REGISTRY` is available as a global.
- Popup loads `font-config.js` via `<script src="../font-config.js">` tag.
- Extension uses `"run_at": "document_start"` for earliest possible font injection.
