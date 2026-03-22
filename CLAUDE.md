# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**目に優しいフォント置換** — A Chrome Extension (Manifest V3) that replaces hard-to-read fonts on all websites with user-selected Japanese fonts. Users choose from 6 body fonts (Noto Sans JP, IBM Plex Sans JP, M PLUS 2, Murecho, Zen Kaku Gothic New, LINE Seed JP) and 3 monospace fonts (UDEV Gothic JPDOC, PlemolJP, Moralerspace Neon JPDOC) via a popup dropdown. Body font weight is selectable (Regular 400 / Medium 500); monospace fonts are fixed at Regular 400. Settings persist in `chrome.storage.local`.

## Build Commands

```bash
npm run build                # Full build: icons + CSS + preset JS
npm run generate-css         # Regenerate css/replacefont-extension.css + 36 preset JS files
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

### Runtime Data Flow — Two-Path System

The extension uses a two-path injection system for zero-flash font replacement:

```
┌─ Path A: Preset JS (同期注入、ちらつきゼロ) ─────────────────────────┐
│ background.js (Service Worker)                                       │
│   chrome.scripting.registerContentScripts で preset JS を登録         │
│   ↓                                                                  │
│ css/preset-{body}-{mono}-w{weight}.js (document_start, ISOLATED)     │
│   chrome.runtime.getURL('') で絶対URL構築 → <style> 注入             │
└──────────────────────────────────────────────────────────────────────┘

┌─ Path B: Fallback (非同期注入、プリセット失敗時) ────────────────────┐
│ font-config.js → FONT_REGISTRY (共有グローバル、先に読み込み)        │
│   ↓                                                                  │
│ preload-fonts.js (content script, document_start, all_frames: true)  │
│   1. loadFontSettings() → chrome.storage.local から設定読み込み       │
│   2. checkPresetCSSInDOM() → プリセット CSS が注入済みか確認          │
│      → 注入済み: document.head 注入をスキップ                         │
│      → 未注入: fetch + replaceFontPlaceholders() → <style> 注入      │
│   3. setupStyleSheetMonitor() → サイトの競合 @font-face を無効化     │
│   4. Shadow DOM へのCSS注入 + フォント preload                        │
└──────────────────────────────────────────────────────────────────────┘
```

### Preset JS System (事前ビルド方式)

**Build time** (`generate-css.js`): 6 body × 3 mono × 2 weight = 36 preset JS files を生成。各ファイルは IIFE で、テンプレートリテラル内に解決済みCSS（`__REPLACE_FONT_BASE__` プレースホルダーのみ残す）を含む。

**Install/Settings change** (`background.js`): `importScripts('font-config.js')` で `FONT_REGISTRY` を参照し、`chrome.scripting.registerContentScripts` でユーザー選択に対応するプリセット JS を登録。`persistAcrossSessions: true` で永続化。

**Page load** (preset JS): `chrome.runtime.getURL('')` (同期API) で `__REPLACE_FONT_BASE__` を拡張機能の絶対URLに置換し、`<style data-replace-font="preset">` を注入。`document_start` で実行されるためページ描画前に完了。

### Two-Stage CSS System (テンプレート方式、フォールバック用)

**Build time** (`generate-css.js`): Outputs ~2300 lines of CSS with placeholder tokens — 100+ gothic font families × 2 weights + 20+ mono font families × 2 weights = 240+ `@font-face` rules, plus CSS variable overrides for frameworks (Tailwind, Geist, etc.).

**Runtime** (`preload-fonts.js`): `replaceFontPlaceholders()` does global string replacement of all `__*__` tokens with actual font names/paths based on user selection.

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

- **`font-config.js`** — Single source of truth for all font metadata (`FONT_REGISTRY`), defaults, and storage key. Shared between content scripts (manifest injection), popup (`<script>` tag), background service worker (`importScripts`), and build script (`require`). Has conditional `module.exports` for Node.js compatibility.
- **`background.js`** — Service Worker. Registers preset JS via `chrome.scripting.registerContentScripts`. Listens for `chrome.storage.onChanged` to update registration when settings change. Imports `font-config.js` via `importScripts`.
- **`preload-fonts.js`** — Main content script (IIFE-wrapped). Detects preset CSS presence, falls back to dynamic injection, handles Shadow DOM, monitors competing `@font-face`, preloads fonts.
- **`inject.js`** — Tiny page-context script that overrides `Element.prototype.attachShadow` to dispatch a custom event, enabling CSS injection into closed Shadow DOM. Removes itself from DOM after execution.
- **`scripts/generate-css.js`** — Build-time script generating template CSS + 36 preset JS files. **Must run `npm run generate-css` after any modification** to regenerate both outputs.
- **`popup/popup.js`** — Reads `FONT_REGISTRY` to dynamically populate dropdowns, saves selections to `chrome.storage.local`. Supports dark/light theme via `prefers-color-scheme`.

### Shadow DOM Strategy

Two mechanisms ensure CSS reaches Shadow DOM:
1. **`inject.js`** (page context, MAIN world) — Intercepts `attachShadow()` calls, sets `data-rfs-shadow` attribute on host, dispatches event for newly created roots (including closed Shadow DOM). Uses `queueMicrotask` to defer `setAttribute` for custom element constructor compatibility.
2. **`setupShadowDOMObserver()`** (content script, ISOLATED world) — MutationObserver + TreeWalker scans for open Shadow DOM roots. Uses chunked scanning (200 elements/batch via `requestIdleCallback`).

CSS injection uses Constructable Stylesheets (`adoptedStyleSheets`) for ShadowRoot (single shared `CSSStyleSheet` instance across all roots for memory efficiency), falling back to `<style>` tags. Deduplication via `_replaceFontApplied` flag on each root prevents re-injection.

### Competing @font-face Neutralization

`setupStyleSheetMonitor()` in `preload-fonts.js` handles sites that define their own `@font-face` for fonts we redirect (e.g., Google Fonts loading Noto Sans JP):

1. Collects target font families from the **extension's own CSS only** (not from all site stylesheets — doing so would break icon fonts like icomoon/Font Awesome)
2. Excludes only the **currently selected** replacement font names (not all available fonts in `FONT_REGISTRY` — excluding all would prevent neutralization of non-selected fonts like Noto Sans JP when user chose LINE Seed JP)
3. Deletes matching `@font-face` rules from site stylesheets
4. For CORS-blocked stylesheets: repositions extension's `<style>` to end of `<head>` (last-defined `@font-face` wins in cascade)
5. MutationObserver watches for newly added `<style>`/`<link>` elements

### Adding a New Font

1. Place TTF files in `fonts/` directory
2. Run `npm run convert-fonts` to generate woff2
3. Add entry to `FONT_REGISTRY` in `font-config.js` (under `body` or `mono`)
4. Run `npm run generate-css` to regenerate template CSS + preset JS files
5. No changes needed to other files — popup, content script, and service worker read from the registry dynamically

### Storage Schema

Key: `fontSettings` in `chrome.storage.local`
```json
{ "enabled": true, "bodyFont": "noto-sans-jp", "monoFont": "udev-gothic-jpdoc", "bodyFontWeight": "400" }
```
Values: `bodyFont`/`monoFont` are keys from `FONT_REGISTRY.body`/`FONT_REGISTRY.mono`. `bodyFontWeight` is `"400"` (Regular) or `"500"` (Medium). `enabled` controls the on/off toggle. Font changes require page reload.

Additional key: `prebuiltCSSRegistered` (boolean) — set by `background.js` to signal `preload-fonts.js` whether preset JS registration succeeded.

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

### setupStyleSheetMonitor — Icon Font Protection

`setupStyleSheetMonitor()` でサイトの競合 `@font-face` を無効化する際、ターゲットフォント一覧は**拡張機能自身のCSS**からのみ収集すること。サイトの全 `@font-face` から収集すると icomoon、Font Awesome 等のアイコンフォントの定義まで削除してしまい表示が崩壊する。

また、除外対象（`replacementNames`）は**現在選択中の置換先フォント名のみ**にすること。`FONT_REGISTRY` 内の全フォント名を除外すると、例えばユーザーが LINE Seed JP を選択中に Noto Sans JP（FONT_REGISTRY に含まれるが未選択）がターゲットから外れ、サイトの Noto Sans JP @font-face が残って置換が効かなくなる。

### Performance — Content Script Hot Path

`preload-fonts.js` は全ページの `document_start` で全フレームにて実行される。以下を遵守:
- `document_start` 時点の同期処理を最小限に保つ
- DOM が空の状態での無意味な `querySelector` を避ける
- `MutationObserver` コールバック内で重い処理を行わない（`_replaceFontApplied` フラグで早期リターン）
- デバッグ用の `chrome.runtime.sendMessage` 等の IPC を本番コードに残さない

### Manifest Load Order

`manifest.json` content_scripts load order is critical:
- `inject.js` — MAIN world, `document_start` (Shadow DOM intercept must be first)
- `font-config.js` → `preload-fonts.js` — ISOLATED world, `document_start` (config must load before main script)
- Preset JS — ISOLATED world, `document_start` (registered dynamically by `background.js`)

### CSP Limitations

Sites with strict Content Security Policy (`font-src` or `default-src 'none'`) will block `url()` font loading from `chrome-extension://` origins. In such cases, only `local()` sources work (user must have the replacement font installed on their system). This is a browser-level limitation that cannot be circumvented by the extension.

### Other Constraints

- `web_accessible_resources` must include `fonts/*.woff2`, `css/*.css`, and `inject.js`.
- M PLUS 2 and Murecho are **variable fonts** — single woff2 file serves both Regular and Bold weights.
- Extension uses `"run_at": "document_start"` and `"all_frames": true` for earliest possible font injection across all frames.
- Font changes in popup require page reload — CSS is fetched once at `document_start` and cached.
- MAIN → ISOLATED world 間の `CustomEvent.detail` は構造化クローンで `null` になるため、`data-rfs-shadow` 属性方式で通信する。
- `chrome.scripting.registerContentScripts` の CSS ファイル内の相対URL はページオリジンに解決される（拡張機能オリジンではない）。そのため CSS ではなく JS ファイルを登録し、`chrome.runtime.getURL()` で絶対URLを構築する。
