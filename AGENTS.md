# AGENTS.md

This file provides guidance to Codex (and other AI agents) when working with code in this repository.

## Overview

Chrome extension (Manifest V3) — 読みづらい日本語フォントを **ユーザーが選択した好みの日本語フォント**（Noto Sans JP / IBM Plex Sans JP / LINE Seed JP / 等）に自動置換。フォント組み合わせをポップアップで選択可能。Firefox AMO 用 XPI も同時生成。

## Commands

**Build:** `npm install && node scripts/generate-icons.js && node scripts/generate-css.js`
**Package:** `.\zip.ps1` (Windows) / `./zip.sh` (Linux/macOS) → `replace-font-select-chrome.zip` + `replace-font-select-firefox.xpi`

## Directory Structure (統一規約)

```
manifest.json
icons/
src/
├── popup/                     # popup.html / popup.js / style.css
├── background/                # service worker (動的 registerContentScripts)
├── content/                   # inject.js (MAIN) + preload-fonts.js + font-config.js
├── css/                       # 統合CSS + プリセットJS (preset-*.js)
└── fonts/                     # woff2 ファイル
scripts/                       # ビルドツール (generate-icons / generate-css / convert-fonts)
webstore/                      # ストア申請用スクショ
.github/workflows/             # 自動公開ワークフロー
```

## Architecture

- **`src/background/background.js`** — `font-config.js` を `importScripts('/src/content/font-config.js')` で読込。設定変更時に該当プリセット JS (`src/css/preset-{body}-{mono}-w{weight}.js`) を `chrome.scripting.registerContentScripts` で登録
- **`src/content/inject.js`** — MAIN world で attachShadow をフック
- **`src/content/preload-fonts.js`** — isolated world で動作。Shadow Root への CSS 適用
- **`src/content/font-config.js`** — フォント定義の Single Source of Truth (FONT_REGISTRY)
- **`src/css/preset-*.js`** — `generate-css.js` が事前生成する全フォント組み合わせの CSS-in-JS
- **`src/fonts/`** — woff2 ファイル

## Conventions

- バージョンは `package.json` を Source of truth として `manifest.json` 等に同期
- フォント参照は **`src/fonts/`** 配下に統一
- `__REPLACE_FONT_BASE__src/fonts/` プレースホルダを実行時に拡張機能ベース URL に置換
