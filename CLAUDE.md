# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**目に優しいフォント置換** — Chrome / Firefox (140+) 拡張機能 (Manifest V3) で、ウェブサイト上の読みづらいフォントを、ユーザーが選んだ日本語フォントへ自動置換する。本文 6 種 × 等幅 3 種 × Weight (400/500) = 36 通りのプリセットを `document_start` で同期注入することでちらつきゼロを実現している。

このリポジトリは **単一コードベース** から複数の派生版（variant）を別々の拡張機能として公開できる「バリアント方式」を採用している。現在 `default` (フォント選択 UI 付き) と `notosans` (Noto Sans JP + UDEV Gothic JPDOC 固定版) の 2 variant が定義されており、それぞれ独立した拡張機能 ID として Chrome Web Store / Firefox AMO に並行リリースできる。

両 variant 共通で次のドメインを `exclude_matches` で除外している（フォントが作品/編集体験の一部となるサービス保護のため）:
- **Microsoft / Google のリッチエディタ系**: `*.onenote.com` / `*.officeapps.live.com` (Excel/Word/PowerPoint Online) / `docs.google.com` (Docs / Sheets / Slides / Forms)
- **デザインツール系**: `*.figma.com` / `www.canva.com` / `express.adobe.com`

**多言語対応**: `@font-face` に `unicode-range` を指定しない。置換フォントのグリフカバレッジ範囲が置換対象となり、それ以外の文字は CSS font fallback で元サイトの指定 / システムフォントに自然に落ちる。

## Build Commands

```bash
npm run build:default               # icons + CSS + preset JS + variant=default のフルビルド
npm run build:notosans              # icons + CSS + preset JS + variant=notosans のフルビルド
npm run build                       # = build:default
npm run build-variant <name>        # manifest.json + src/content/variant.js だけ再生成（CSS/icons は維持）

npm run generate-css                # src/css/replacefont-extension.css + 36 個の preset-*.js を再生成（variant 非依存）
npm run convert-fonts               # src/fonts/*.ttf → *.woff2 変換（フォント追加時のみ手動実行、variant 非依存）
npm run generate-icons:<variant>    # icons/<variant>/icon.svg から PNG (16/48/128) を再生成
npm run generate-screenshots:<variant>  # webstore/screenshots/<variant>/*.html → webstore/images/<variant>/*.png（要 puppeteer）
```

> `generate-icons` / `generate-screenshots` は variant 引数が必須。`:default` / `:notosans` のエイリアスを使うか、直接 `node scripts/generate-icons.js <variant>` を呼ぶこと。引数なしのベース版 (`npm run generate-icons`) は usage 表示で abort する。

`manifest.json` と `src/content/variant.js` は **ビルド生成物 (.gitignore 済)**。"Load unpacked" やテスト実行の前に必ず `build:<variant>` を 1 回走らせる必要がある。Node.js 20 系を推奨（CI が `node-version: '20'` で固定）。テストスイートや linter は無く、UI 検証は実機ブラウザで行う。

### Local Testing

- **Chrome**: `chrome://extensions` → Developer mode ON → "Load unpacked" でリポジトリルートを選択
- **Firefox**: `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on..." で `manifest.json` を選択（Firefox 140+）
- コード変更後は拡張機能リストで再読み込み＋対象ページをリロード（preset JS / CSS は `document_start` 時にキャッシュされるため）

## Variant System (派生版リリース機構)

「同じソースから別ブランドの拡張機能を出す仕組み」。バリアント方式の中核は次の 3 つのファイル:

| ファイル | 役割 |
|---|---|
| `variants/<name>.json` | name / description / version / geckoId / lockedFonts / showFontSelector / excludeMatches / zipBaseName を定義 |
| `manifest.template.json` | プレースホルダー入りの manifest テンプレート |
| `scripts/build-variant.js` | template に variant 設定を注入して `manifest.json` と `src/content/variant.js` を生成 |
| `src/content/variant.js` | **ビルド生成物**。`const VARIANT = {...}` を定義し content scripts / popup / background から参照される |

| Variant | フォント | gecko id 末尾 | 用途 |
|---|---|---|---|
| `default` | ユーザー選択 (6×3×2=36プリセット) | `...323f` | 通常版 |
| `notosans` | Noto Sans JP + UDEV Gothic JPDOC 固定 | `...323e` | フォント選択 UI なしの固定版 |

### Variant が動作に影響する 2 つの経路

1. **`mergeFontSettings()` の lockedFonts override** (`src/content/font-config.js`): `VARIANT.lockedFonts` が non-null の variant では、ユーザーがどんな設定を popup から保存しても `mergeFontSettings` が validator 経由で lockedFonts の値に上書きする。これにより popup で UI が無い variant でも保存値が固定される単一の真実の源泉になっている。
2. **`showFontSelector` による UI 非表示** (`src/popup/popup.js`): `false` の variant では popup の `<div id="settings-section">` が `hidden = true` で完全非表示。トグルと説明文だけが残る。

### ストア掲載リソースも variant 別に管理

```
icons/<variant>/
├── icon.svg           ブランド別のアイコン SVG（Git 管理）
├── icon-{16,48,128}.png   生成 PNG（.gitignore 済、generate-icons で再生成）
└── preview.html       開発時のアイコンプレビュー（ストア配信物には不含）

webstore/screenshots/<variant>/
├── 01-popup-ui.html ～ 05-promo-marquee.html   variant ごとに popup タイトル等が違う
└── README.md

webstore/images/<variant>/
└── *.png   ストア用 PNG（.gitignore 済、generate-screenshots で再生成）

docs/<variant>/
├── privacy-policy.md   Markdown 版プライバシーポリシー（GitHub 上で閲覧可能）
├── privacy.html        HTML 版（GitHub Pages 公開、Web Store / AMO 申請の privacy URL に指定）
└── index.html          GitHub Pages ランディングページ

changelog/<variant>.md   variant ごとのリリース履歴
```

`manifest.json` の `icons` パスは `build-variant.js` が `icons/<variant>/icon-NN.png` に書き換える。ZIP/CI は対象 variant のディレクトリのみ同梱して別ブランドのアセットがストアに混入するのを防ぐ。`docs/<variant>/` と `changelog/<variant>.md` はストア配信物には含まれないが、ストア申請時の privacy URL や、ユーザー向け説明として variant ブランドごとに別 URL を持つ。

### 新しい variant を追加する手順

1. `variants/<name>.json` を作成（既存 default.json をコピーして編集が早い）
2. `icons/<name>/icon.svg` を配置（ブランド別ロゴ）
3. `webstore/screenshots/<name>/*.html` をコピー & 編集（ブランド名やタイトルを variant 用に変更）
4. `docs/<name>/privacy-policy.md` / `privacy.html` / `index.html` を variant ブランドで用意
5. `changelog/<name>.md` を作成（履歴を残す箱）
6. `package.json` の `scripts` に `"build:<name>"` と `"generate-icons:<name>"` / `"generate-screenshots:<name>"` を追加
7. `.github/workflows/publish.yml` の `strategy.matrix.variant` 配列と `variant に対応する EXTENSION_ID を決定` ステップの `case` 文の両方に新 variant を追加
8. GitHub Secrets に `CWS_EXTENSION_ID_<UPPER>` を登録
9. `variants/<新>.json` の `version` を他 variant と同じ値に揃える（リリース時 release.js が unique version チェックする）
9. **新変数を `variant.json` に追加した場合は `scripts/build-variant.js` の `REQUIRED_KEYS` 配列も更新**（バリデーション漏れ防止）

## Architecture

### Runtime — Two-Path Injection System

ちらつきゼロを実現するための 2 経路:

```
┌─ Path A: Preset JS (同期注入、document_start 同期実行) ────────────────┐
│ src/background/background.js (Service Worker)                          │
│   chrome.scripting.registerContentScripts で preset JS を ISOLATED に登録│
│   ↓                                                                    │
│ src/css/preset-{body}-{mono}-w{weight}.js                              │
│   chrome.runtime.getURL('') で __REPLACE_FONT_BASE__ を解決 → <style>注入│
└────────────────────────────────────────────────────────────────────────┘

┌─ Path B: Fallback (preset 未登録時の動的注入) ─────────────────────────┐
│ src/content/variant.js → variant.js → font-config.js → preload-fonts.js │
│ (manifest.json の content_scripts で document_start に同期ロード)        │
│   1. loadFontSettings() → chrome.storage.local                          │
│   2. checkPresetCSSInDOM() でプリセット注入済か判定（済なら skip）       │
│   3. fetch + replaceFontPlaceholders() → <style> 注入                  │
│   4. setupStyleSheetMonitor() でサイトの競合 @font-face を中和           │
│   5. Shadow DOM へ CSS 注入 + フォント preload                          │
└────────────────────────────────────────────────────────────────────────┘
```

両経路の入口で `src/content/variant.js` が最初に読まれることで、`mergeFontSettings()` がどちらの経路でも `VARIANT.lockedFonts` を参照できる構造になっている。

### Two-Stage CSS — テンプレート + プレースホルダー

`scripts/generate-css.js` が約 2300 行の CSS と 36 個の preset JS をビルド時に生成する。CSS は 100+ ゴシック × 2 weight + 20+ 等幅 × 2 weight = 240+ の `@font-face` 規則と、主要フレームワーク (Tailwind / Geist 等) の CSS 変数オーバーライドを含む。プレースホルダー (`__*__`) は preset JS では事前解決済みだが、Path B では `replaceFontPlaceholders()` がランタイムで置換する。

代表的なプレースホルダー:

| Placeholder | 例 |
|---|---|
| `__REPLACE_FONT_BASE__` | `chrome-extension://<id>/` or `moz-extension://<uuid>/` |
| `__BODY_FONT_NAME__` | `Noto Sans JP` |
| `__BODY_LOCAL_REGULAR__` | `local("Noto Sans JP"), local("Noto Sans CJK Variable")` |
| `__BODY_WOFF2_REGULAR__` | `NotoSansJP-Regular.woff2` (weight=500 時は Medium) |
| `__MONO_FONT_NAME__` | `UDEV Gothic JPDOC` |

### Single Source of Truth

| 概念 | 場所 |
|---|---|
| フォント定義 (`FONT_REGISTRY`) | `src/content/font-config.js` — content / popup / background / Node スクリプト全てから共有（CommonJS export 付き） |
| 設定マージ (`mergeFontSettings`) | `src/content/font-config.js` — validator 経由の白リスト検証 + lockedFonts override を一元化 |
| バリアント設定 (`VARIANT`) | `src/content/variant.js` (ビルド生成物) |
| マニフェスト | `manifest.template.json` + `variants/<name>.json` → `manifest.json` (ビルド生成物) |

### Shadow DOM 戦略

Closed Shadow DOM 含む 2 経路で CSS を届ける:

1. **`src/content/inject.js`** (page context / MAIN world) — `Element.prototype.attachShadow` をフックし、host 要素に `data-rfs-shadow` 属性を `queueMicrotask` で遅延設定（カスタム要素コンストラクタとの互換性のため）。実行後に自己削除。
2. **`setupShadowDOMObserver()`** (ISOLATED world) — MutationObserver + TreeWalker で open Shadow DOM を `requestIdleCallback` 200 要素チャンクでスキャン。

CSS 注入は `adoptedStyleSheets` (Constructable Stylesheets) を使い、全 ShadowRoot で **単一の `CSSStyleSheet` インスタンスを共有** してメモリ効率化。`_replaceFontApplied` フラグで重複注入を防ぐ。MAIN → ISOLATED world 間の `CustomEvent.detail` は構造化クローンで `null` になるため、属性 (`data-rfs-shadow`) で通信する。

### Competing @font-face Neutralization

`setupStyleSheetMonitor()` (`src/content/preload-fonts.js`) はサイトが独自に定義した `@font-face` (例: Google Fonts が Noto Sans JP をロード) を削除して、拡張機能の置換を優先させる。実装上の **2 つの落とし穴を回避** している:

- ターゲットフォント一覧の収集元は **拡張機能自身の CSS のみ**。サイト全 stylesheet から収集するとアイコンフォント (icomoon / Font Awesome / codicon 等) の定義まで巻き添えで削除されて UI が壊れる。
- `replacementNames` (削除除外リスト) は **現在選択中の置換先フォント名のみ**。`FONT_REGISTRY` 全体を除外すると、未選択フォントの `@font-face` がサイト側に残り、選択中フォントへの置換が効かなくなる。

CORS で `cssRules` 読めない stylesheet については、拡張機能の `<style>` を `<head>` 末尾へ再配置することで cascade 順序による上書きを狙う。

### Storage Schema

`chrome.storage.local` キー `fontSettings`:
```json
{ "enabled": true, "bodyFont": "noto-sans-jp", "monoFont": "udev-gothic-jpdoc", "bodyFontWeight": "400" }
```
キー `prebuiltCSSRegistered` (boolean) — `src/background/background.js` がプリセット JS 登録の成否を `src/content/preload-fonts.js` へ伝えるシグナル。`mergeFontSettings()` で validate されない値はサイレントに defaults に戻る。

### Adding a New Font

1. `src/fonts/` に TTF を置き `npm run convert-fonts` で woff2 化
2. `FONT_REGISTRY` (`src/content/font-config.js`) の `body` か `mono` にエントリ追加
3. `npm run generate-css` で template CSS + 36 preset JS を再生成
4. popup / content / background は `FONT_REGISTRY` を動的読みするので他ファイル変更不要

⚠️ **既存フォントキー (`noto-sans-jp` / `udev-gothic-jpdoc`) のリネーム禁止** — `variants/notosans.json` の `lockedFonts` がそのキー名で参照しており、リネームすると notosans variant が破綻する。

## Release Automation

### Release Kick-off (`scripts/release.js`) — 単一 version 体制

**全 variant が同じ version を共有**する設計 (v3.0.0 から)。`scripts/release.js` は `variants/*.json` の version を patch +1 し、`release/<X.Y.Z>` ブランチを作って push する。push が CI のトリガーになり、GitHub Actions の matrix strategy が **2 variant を並列公開**する。

```bash
npm run release                  # 全 variant patch +1 → release/<X.Y.Z> ブランチ
node scripts/release.js --yes    # 直接呼び (確認プロンプト省略、CI / Claude Code から)

# フラグ
--dry-run / -n  計画だけ表示。書き込み・push しない
--yes / -y      対話確認をスキップ
--prune-old     既存の release/* ブランチをリモートから削除（旧形式の release/<variant>-X.Y.Z も含む）
```

#### minor / major bump の運用

このスクリプトは **patch +1 専用**（`/vava` と一貫）。minor / major bump は **手作業**で:

```bash
# 例: 3.0.5 から 3.1.0 に minor bump する場合
# 1. variants/default.json と variants/notosans.json の "version" を 3.1.0 に手で書き換える（両方）
git add variants/
git commit -m "release: v3.1.0"
git push origin main
git checkout -b release/3.1.0
git push -u origin release/3.1.0
git checkout main
```

publish.yml はブランチ末尾 `X.Y.Z` と全 variant の `version` が一致するか matrix の各 job で検証する。

#### 前提条件と挙動
- 実行は **clean な main ブランチ** から (リモートと同期済みであること)。違反時は abort
- **全 variant の version が一致**していなければ abort（事前に手作業で揃える必要あり）
- リモートに同名 `release/<X.Y.Z>` が既存なら abort（force push しない）
- preset JS や `manifest.json` はビルド時に CI 側で生成されるため、ローカルでの再生成は不要 (variants/*.json だけが真実の源泉)

### Local Packaging（手動 Web Store アップロード用）
- `.\zip.ps1 [-Variant <name>]` (Windows): `npm ci` → アイコン / CSS 生成 → variant 適用 → `<zipBaseName>-chrome.zip` + `<zipBaseName>-firefox.xpi` 生成。引数省略時は `default`。
- `./zip.sh [<name>]` (Linux/Mac): Chrome ZIP のみ。Firefox XPI を含むフルリリースは `zip.ps1` 必須。

### CI 自動公開 (`.github/workflows/publish.yml`) — matrix strategy

- **トリガー**: `release/<X.Y.Z>` 形式のブランチへの push (例: `release/3.0.0`, `release/3.1.0`)
- **matrix strategy**: `variant: [default, notosans]` で全 variant を **並列実行**。`fail-fast: false` なので 1 つ失敗しても他は続行
- **整合性チェック**: ブランチ末尾の `X.Y.Z` と各 variant の `variants/<variant>.json` の `version` と生成された `manifest.json` の `version` が一致しないと該当 variant のジョブが失敗
- **拡張機能 ID の選択**: matrix の variant 値から `case` 文で `CWS_EXTENSION_ID_<UPPER>` シークレットを選ぶ (`default` → `CWS_EXTENSION_ID_DEFAULT`, `notosans` → `CWS_EXTENSION_ID_NOTOSANS`)
- **共通シークレット**: `CWS_CLIENT_ID` / `CWS_CLIENT_SECRET` / `CWS_REFRESH_TOKEN` は全 variant 共有 (同一 Google アカウントの OAuth 認証情報)
- Actions は SHA pin、`npm ci` 固定、`chrome-webstore-upload-cli` exact pin でサプライチェーン攻撃対策

## Critical Constraints

### Manifest content_scripts のロード順 (絶対)

`manifest.template.json` で定義され、`build-variant.js` が exclude_matches を注入する:

```
src/content/inject.js         — MAIN world      (Shadow DOM intercept は最優先)
src/content/variant.js        — ISOLATED world  (VARIANT を font-config 前に定義)
src/content/font-config.js    — ISOLATED world  (mergeFontSettings は VARIANT に依存)
src/content/preload-fonts.js  — ISOLATED world  (main script)
```

Service Worker (`background.js`) も同様の順序で `importScripts('/src/content/variant.js', '/src/content/font-config.js')` を呼ぶ。

### CSS — ユニバーサルセレクタ禁止

`*` や暗黙的なユニバーサル相当のセレクタは絶対禁止。Font Awesome / Material Icons / codicon のアイコンフォントの `font-family` を破壊する。

- ❌ `* { font-family: ... }`
- ❌ `:is(pre, code) :not(i, .icon)` — `:not()` 単独の子孫セレクタは `*:not(...)` と同義
- ✅ `:root :is(pre, code, kbd, samp, ...)` — コンテナ要素自体にマッチ (継承で子孫へ伝播)
- ✅ `[style*="monospace"]` — インラインスタイルを持つ要素のみ

### Performance — preload-fonts.js は Hot Path

全ページ全フレームで `document_start` 実行されるため:
- `document_start` 時点の同期処理を最小限に保つ
- DOM が空の状態での無意味な `querySelector` を避ける
- `MutationObserver` コールバックは `_replaceFontApplied` フラグで早期 return
- デバッグ用 `chrome.runtime.sendMessage` を本番に残さない

### CSP Limitations

`font-src` / `default-src 'none'` の厳格 CSP サイトでは `chrome-extension://` / `moz-extension://` からの `url()` ロードがブロックされる。`local()` フォールバックのみ動作する（ユーザーがフォントをシステムインストールしていれば置換成功）。ブラウザ仕様による制約で拡張側では回避不可能。

### Cross-Browser Compatibility

Chrome / Firefox 140+ を単一コードで対応:
- 使用している `chrome.*` API は全て Firefox の `chrome.*` 名前空間でも動作 (`browser.*` リライト不要)
- `chrome.scripting.registerContentScripts` の `persistAcrossSessions` / `world` は Firefox 140+ で対応
- gecko id は variant ごとに `variants/<name>.json` の `geckoId` から注入される (Chrome は `browser_specific_settings` を silently ignore)
- `chrome.runtime.getURL('')` は両ブラウザで正常動作するため、`getExtensionBaseURL()` の Chrome 固有フォールバック (`chrome-extension://${runtime.id}`) には到達しない
- `src/popup/style.css` のフォントは相対パス (`../fonts/...`) を使い、拡張機能オリジン内で両ブラウザが解決する

### その他の制約

- `web_accessible_resources` に `src/fonts/*.woff2` と `src/css/replacefont-extension.css` を含める。`src/content/inject.js` は manifest の `content_scripts` で MAIN world に直接注入されるため WAR に含めない (攻撃対象面の縮小)
- M PLUS 2 / Murecho は variable font — Regular/Bold が同一 woff2 から取得される
- `manifest.json` の `run_at: "document_start"` と `all_frames: true` で全フレーム最早期に注入
- popup でのフォント変更は **ページリロードが必要** — CSS は `document_start` 時に一度キャッシュされる
- `chrome.scripting.registerContentScripts` で CSS ファイル内の相対 URL はページオリジンに解決される (拡張オリジンではない)。そのため CSS ではなく JS を登録して `chrome.runtime.getURL()` で絶対 URL を構築する
