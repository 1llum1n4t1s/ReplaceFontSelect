# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**目に優しいフォント置換** — A Chrome Extension (Manifest V3) that replaces hard-to-read fonts on all websites with user-selected Japanese fonts. Users choose from 5 body fonts (Noto Sans JP, IBM Plex Sans JP, M PLUS 2, Murecho, Zen Kaku Gothic New) and 3 monospace fonts (UDEV Gothic JPDOC, PlemolJP, Moralerspace Neon JPDOC) via a popup dropdown. Body font weight is selectable (Regular 400 / Medium 500); monospace fonts are fixed at Regular 400. Settings persist in `chrome.storage.local`.

## Build Commands

```bash
npm run build                # Full build: icons + CSS
npm run generate-css         # Regenerate css/replacefont-extension.css from scripts/generate-css.js
npm run convert-fonts        # Convert all fonts/*.ttf → fonts/*.woff2
npm run generate-icons       # Regenerate PNG icons from icons/icon.svg
npm run generate-screenshots # Generate Chrome Web Store promotional images (requires puppeteer)
```

**Release workflow** — `.\zip.ps1` runs the complete pipeline:
1. Syncs version from `package.json` → `manifest.json`, `README.md`, screenshot HTMLs
2. `npm install` → icon generation → font conversion → screenshots → CSS generation
3. Copies extension files to temp directory and creates `replace-font-select-chrome.zip`

There are no tests or linting configured.

## Architecture

### Runtime Data Flow

```
chrome.storage.local (user font selection)
        ↓
font-config.js → FONT_REGISTRY (shared global, loaded first)
        ↓
preload-fonts.js (content script, runs at document_start, all_frames: true)
  1. loadFontSettings() → reads from storage
  2. Fetches css/replacefont-extension.css (contains placeholders)
  3. replaceFontPlaceholders() → replaces __BODY_FONT_NAME__, __MONO_WOFF2_REGULAR__, etc.
  4. Injects resolved CSS into document.head
  5. createPreloadTag() + setupFontForceLoad() → ensures fonts load early
  6. inject.js intercepts attachShadow → dispatches custom event
  7. preload-fonts.js listens → injects CSS into each ShadowRoot
```

### Two-Stage CSS System

**Build time** (`generate-css.js`): Outputs ~2300 lines of CSS with placeholder tokens — 100+ gothic font families × 2 weights + 20+ mono font families × 2 weights = 240+ `@font-face` rules, plus CSS variable overrides for frameworks (Tailwind, Geist, etc.).

**Runtime** (`preload-fonts.js`): `replaceFontPlaceholders()` does global string replacement of all `__*__` tokens with actual font names/paths based on user selection. Results cached as Promises in `fixedCSSCache` Map (prevents duplicate in-flight fetches).

| Placeholder | Example Replacement |
|---|---|
| `__BODY_FONT_NAME__` | `Noto Sans JP` |
| `__BODY_FONT_FALLBACK__` | `sans-serif` |
| `__BODY_LOCAL_REGULAR__` | `local("Noto Sans JP"), local("Noto Sans CJK Variable")` |
| `__BODY_FONT_WEIGHT__` | `400` or `500` |
| `__BODY_WOFF2_REGULAR__` | `NotoSansJP-Regular.woff2` (or Medium variant based on weight) |
| `__MONO_FONT_NAME__` | `UDEV Gothic JPDOC` |
| `__MONO_LOCAL_BOLD__` | `local("UDEV Gothic JPDOC Bold")` |
| `__REPLACE_FONT_BASE__` | `chrome-extension://<id>/` |

### Key Files

- **`font-config.js`** — Single source of truth for all font metadata (`FONT_REGISTRY`). Shared between content scripts (manifest injection) and popup (`<script>` tag).
- **`preload-fonts.js`** — Main content script (IIFE-wrapped). Handles CSS fetching, placeholder replacement, injection into document + Shadow DOM, font preloading, and MutationObserver-based monitoring.
- **`inject.js`** — Tiny page-context script that overrides `Element.prototype.attachShadow` to dispatch a custom event, enabling CSS injection into closed Shadow DOM. Removes itself from DOM after execution.
- **`scripts/generate-css.js`** — Build-time script generating `@font-face` rules with placeholder tokens. **Must run `npm run generate-css` after any modification** to regenerate `css/replacefont-extension.css`.
- **`popup/popup.js`** — Reads `FONT_REGISTRY` to dynamically populate dropdowns, saves selections to `chrome.storage.local`.

### Shadow DOM Strategy

Two mechanisms ensure CSS reaches Shadow DOM:
1. **`inject.js`** (page context, MAIN world) — Intercepts `attachShadow()` calls, sets `data-rfs-shadow` attribute on host, dispatches event for newly created roots (including closed Shadow DOM). Uses `queueMicrotask` to defer `setAttribute` for custom element constructor compatibility.
2. **`setupShadowDOMObserver()`** (content script, ISOLATED world) — MutationObserver + TreeWalker scans for open Shadow DOM roots. Uses chunked scanning (200 elements/batch via `requestIdleCallback`).

CSS injection uses Constructable Stylesheets (`adoptedStyleSheets`) for ShadowRoot (single shared `CSSStyleSheet` instance across all roots for memory efficiency), falling back to `<style>` tags. Deduplication via `_replaceFontApplied` flag on each root prevents re-injection.

### Adding a New Font

1. Place TTF files in `fonts/` directory
2. Run `npm run convert-fonts` to generate woff2
3. Add entry to `FONT_REGISTRY` in `font-config.js` (under `body` or `mono`)
4. No changes needed to other files — popup and content script read from the registry dynamically

### Storage Schema

Key: `fontSettings` in `chrome.storage.local`
```json
{ "bodyFont": "noto-sans-jp", "monoFont": "udev-gothic-jpdoc", "bodyFontWeight": "400" }
```
Values: `bodyFont`/`monoFont` are keys from `FONT_REGISTRY.body`/`FONT_REGISTRY.mono`. `bodyFontWeight` is `"400"` (Regular) or `"500"` (Medium). Font changes require page reload.

## Critical Constraints

### CSS Selector Rules — No Universal Selectors

**ユニバーサルセレクタ (`*`) や暗黙的にユニバーサルセレクタとして機能するセレクタは絶対に使用しないこと。** Font Awesome、Material Icons、codicon 等のアイコンフォントの `font-family` を上書きして表示が崩壊する。

禁止パターン:
- `* { font-family: ... }` — 明示的なユニバーサルセレクタ
- `:is(pre, code) :not(i, .icon)` — `:not()` 単独の子孫セレクタは `*:not(...)` と同義
- あらゆる形で「全子孫要素にマッチ」するセレクタ

許可パターン:
- `:root :is(pre, code, kbd, samp, ...)` — コンテナ要素自体にマッチ（CSS継承で子孫に伝播）
- `[style*="monospace"]` — インラインスタイルを持つ特定要素のみ

### Performance — Content Script Hot Path

`preload-fonts.js` は全ページの `document_start` で全フレームにて実行される。以下を遵守:
- `document_start` 時点の同期処理を最小限に保つ
- DOM が空の状態での無意味な `querySelector` を避ける
- `MutationObserver` コールバック内で重い処理を行わない（`_replaceFontApplied` フラグで早期リターン）

### Manifest Load Order

`manifest.json` content_scripts load order is critical:
- `inject.js` — MAIN world, `document_start` (Shadow DOM intercept must be first)
- `font-config.js` → `preload-fonts.js` — ISOLATED world, `document_start` (config must load before main script)

### Other Constraints

- `web_accessible_resources` must include `fonts/*.woff2`, `css/*.css`, and `inject.js`.
- M PLUS 2 and Murecho are **variable fonts** — single woff2 file serves both Regular and Bold weights.
- Extension uses `"run_at": "document_start"` and `"all_frames": true` for earliest possible font injection across all frames.
- Font changes in popup require page reload — CSS is fetched once at `document_start` and cached.
- MAIN → ISOLATED world 間の `CustomEvent.detail` は構造化クローンで `null` になるため、`data-rfs-shadow` 属性方式で通信する。
