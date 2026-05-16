# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**目に優しいフォント置換** — Chrome / Firefox (140+) 拡張機能 (Manifest V3) で、 ウェブサイト上の読みづらいフォントを、 ユーザーが選んだ日本語フォントへ自動置換する。 本文 6 種 × 等幅 3 種 × Weight (400/500) = 36 通りのプリセットを `document_start` で同期注入することでちらつきゼロを実現している。

現在は **`default` variant のみがリリース対象**。 旧 `notosans` variant (Noto Sans JP + UDEV Gothic JPDOC 固定版) は v3.x の途中で退役し、 popup の **シンプルモードトグル** (`SIMPLE_MODE_LOCKED` in `font-config.js`) に統合された。 variant 機構 (`variants/<name>.json` + `manifest.template.json` + `scripts/build-variant.js`) は将来別ブランドを出す自由度として骨組みのみ残してある。

default variant は次のドメインを `exclude_matches` で除外している (フォントが作品 / 編集体験の一部となるサービス保護のため、 全 17 ドメイン):
- **Microsoft / Google のリッチエディタ系**: `*.onenote.com` / `*.officeapps.live.com` (Excel/Word/PowerPoint Online) / `*.sharepoint.com` (SharePoint Online — Excel/Word を開いた時のホストオリジン。 `officeapps.live.com` には遷移せず SharePoint オリジン内の iframe で WAC = WebApps Components が動くため別途除外が必要) / `docs.google.com` (Docs / Sheets / Slides / Forms)
- **デザインツール系**: `*.figma.com` / `www.canva.com` / `express.adobe.com`
- **リッチエディタ / IDE 系 (v3.1 系で追加)**: `www.notion.so` / `app.slack.com` / `linear.app` / `*.github.dev` / `vscode.dev` / `replit.com` / `codesandbox.io` / `stackblitz.com` / `www.overleaf.com` / `discord.com/app`

**多言語対応**: `@font-face` に `unicode-range` を指定しない。 置換フォントのグリフカバレッジ範囲が置換対象となり、 それ以外の文字は CSS font fallback で元サイトの指定 / システムフォントに自然に落ちる。

## Build Commands

```bash
npm run build:default               # icons + CSS + preset JS + variant=default のフルビルド
npm run build                       # = build:default
npm run build-variant <name>        # manifest.json + src/content/variant.js だけ再生成 (将来 variant 追加用)

npm run generate-css                # src/css/replacefont-extension.css + 36 個の preset-*.js を再生成 (variant 非依存)
npm run convert-fonts               # src/fonts/*.ttf → *.woff2 変換 (フォント追加時のみ手動実行、 variant 非依存)
npm run generate-icons:default      # icons/default/icon.svg から PNG (16/48/128) を再生成
npm run generate-screenshots:default  # webstore/screenshots/default/*.html → webstore/images/default/*.png (要 puppeteer)
```

`manifest.json` と `src/content/variant.js` と `src/css/preset-*.js` は **ビルド生成物 (.gitignore 済)**。 "Load unpacked" やテスト実行の前に必ず `build:default` を 1 回走らせる必要がある。 Node.js 20 系を推奨 (CI が `node-version: '20'` で固定)。 テストスイートや linter は無く、 UI 検証は実機ブラウザで行う。

### Local Testing

- **Chrome**: `chrome://extensions` → Developer mode ON → "Load unpacked" でリポジトリルートを選択
- **Firefox**: `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on..." で `manifest.json` を選択 (Firefox 140+)
- コード変更後は拡張機能リストで再読み込み+対象ページをリロード (preset JS / CSS は `document_start` 時にキャッシュされるため)

## Variant System

「同じソースから別ブランドの拡張機能を出す仕組み」の骨組み。 現在 `default` 1 variant のみアクティブ。 4 つのファイルが連動:

| ファイル | 役割 |
|---|---|
| `variants/<name>.json` | name / description / version / geckoId / lockedFonts / showFontSelector / excludeMatches / zipBaseName を定義 |
| `manifest.template.json` | プレースホルダー入りの manifest テンプレート |
| `scripts/build-variant.js` | template に variant 設定を注入して `manifest.json` と `src/content/variant.js` を生成 |
| `src/content/variant.js` | **ビルド生成物**。 `const VARIANT = {...}` を定義し content scripts / popup / background から参照される |

| Variant | フォント | gecko id 末尾 | 用途 |
|---|---|---|---|
| `default` | ユーザー選択 (6×3×2=36プリセット) + simpleMode トグル | `...323f` | 現行リリース |

`mergeFontSettings()` (`src/content/font-config.js`) は **simpleMode → SIMPLE_MODE_LOCKED → VARIANT.lockedFonts** の順で override を適用 (後勝ち)。 つまり variant が `lockedFonts` を設定している場合は simpleMode より優先される。

### 新しい variant を追加する手順 (将来用)

1. `variants/<name>.json` を作成 (既存 default.json をコピーして編集が早い)
2. `icons/<name>/icon.svg` を配置
3. (任意) `webstore/screenshots/<name>/*.html` をコピー
4. (任意) `docs/<name>/privacy-policy.md` / `privacy.html` / `index.html` を用意
5. (任意) `changelog/<name>.md` を作成
6. `package.json` の `scripts` に `build:<name>` / `generate-icons:<name>` / `generate-screenshots:<name>` を追加
7. `.github/workflows/publish.yml` の `strategy.matrix.variant` 配列と `variant に対応する EXTENSION_ID を決定` ステップの `case` 文の両方に新 variant を追加
8. GitHub Secrets に `CWS_EXTENSION_ID_<UPPER>` を登録
9. `variants/<新>.json` の `version` を default と同じ値に揃える
10. **新変数を `variant.json` に追加した場合は `scripts/build-variant.js` の `REQUIRED_KEYS` 配列も更新**

## Architecture

### Runtime — Single-Path Injection (Path A 一本化)

v3.x で旧 Path B (fetch + replaceFontPlaceholders) を削除し、 Path A 単独に統合した。 ちらつきゼロを担保しつつコードを簡潔化。

```
┌─ Path A: Preset JS (同期注入、 document_start 同期実行) ───────────────┐
│ src/background/background.js (Service Worker)                          │
│   chrome.scripting.registerContentScripts で preset JS を ISOLATED に登録│
│   (settings 変更時は chrome.scripting.updateContentScripts で差分パッチ) │
│   ↓                                                                    │
│ src/css/preset-{body}-{mono}-w{weight}.js (36 個から 1 個選択)          │
│   IIFE 内で ${B} = chrome.runtime.getURL('') にテンプレートリテラル補間  │
│   → <style data-replace-font="preset"> を <head> に同期注入             │
└────────────────────────────────────────────────────────────────────────┘

┌─ Companion: src/content/preload-fonts.js (ISOLATED world) ─────────────┐
│ (manifest.json の content_scripts で document_start に同期ロード)       │
│   1. preset CSS の DOM 存在確認 (checkPresetCSSInDOM)                   │
│   2. Shadow DOM への adoptedStyleSheets 共有 (CSSStyleSheet 単一実体)   │
│   3. 拡張 <style> を head 末尾に維持する MutationObserver (cascade 後勝ち)│
│   4. 動的フォント検出 (Next.js next/font 等のハッシュ family)            │
│   5. Regular weight の woff2 を <link rel=preload> (top frame のみ)     │
└────────────────────────────────────────────────────────────────────────┘
```

**preset 未注入時の挙動**: SW スリープ race 等で `<style data-replace-font="preset">` が無い場合、 preload-fonts.js は何もしない (fallback なし)。 v3.x 改修時の意図的判断 (Path B 削除で fallback も削除)。 SW の `persistAcrossSessions: true` + `onStartup` でほぼ救済される。

### Cascade 後勝ち戦略 (旧 setupStyleSheetMonitor から置換)

旧 `setupStyleSheetMonitor()` がサイトの同名 `@font-face` を `deleteRule` で削除していたが、 v3.x で削除した。 副作用 (アイコンフォント破壊リスク、 invalidation 連鎖) を避けるため。

代わりに `ensureExtensionStyleAtEnd()` (`src/content/preload-fonts.js`) が拡張機能の `<style data-replace-font="preset">` を **head 末尾に維持する MutationObserver** だけ走らせる。 cascade の自然な後勝ち + `font-display: swap` で競合 `@font-face` に勝つ。

### Two-Stage CSS — テンプレート + プレースホルダー

`scripts/generate-css.js` が `src/css/replacefont-extension.css` テンプレート (約 68 KB、 302 個の `@font-face` — ASCII case-insensitive dedupe 済み) と 36 個の preset JS をビルド時に生成する。 preset JS は約 57 KB / 1 個。

**プレースホルダー解決**: 旧来 runtime の `String.replace(/__REPLACE_FONT_BASE__/g, ...)` で動的展開していたが、 v3.x で **ビルド時にテンプレートリテラル `${B}` 補間** に書き換えた (V8 最適化に乗る、 不可視 marker 依存を排除)。

代表的なプレースホルダー (ビルド時に解決):

| Placeholder | 例 |
|---|---|
| `__REPLACE_FONT_BASE__` | `${B}` テンプレ補間に変換 (preset JS 実行時 `chrome.runtime.getURL('')`) |
| `__BODY_FONT_NAME__` | `Noto Sans JP` |
| `__BODY_LOCAL_REGULAR__` | `local("Noto Sans JP"), local("Noto Sans CJK Variable")` |
| `__BODY_WOFF2_REGULAR__` | `NotoSansJP-Regular.woff2` (weight=500 時は Medium) |
| `__MONO_FONT_NAME__` | `UDEV Gothic JPDOC` |

### Single Source of Truth

| 概念 | 場所 |
|---|---|
| フォント定義 (`FONT_REGISTRY`) | `src/content/font-config.js` — content / popup / background / Node スクリプト全てから共有 (CommonJS export 付き) |
| 設定マージ (`mergeFontSettings`) | `src/content/font-config.js` — validator 経由の白リスト検証 + simpleMode override + lockedFonts override を一元化 |
| シンプルモード固定値 (`SIMPLE_MODE_LOCKED`) | `src/content/font-config.js` — popup の simpleMode トグル ON 時に強制される設定 |
| バリアント設定 (`VARIANT`) | `src/content/variant.js` (ビルド生成物) |
| マニフェスト | `manifest.template.json` + `variants/<name>.json` → `manifest.json` (ビルド生成物) |

### Popup Theme System — 2 テーマ体制

popup (`src/popup/`) は **prefers-color-scheme** で 2 テーマ:

| variant | light | dark |
|---|---|---|
| `default` | **Editorial Day** (紙のクリーム + 墨色 + 印章の朱) | **Editorial Night** (革表紙 + 銅色アクセント) |

旧 notosans variant の Lab Day / Cyber Night テーマブロックは style.css に dead CSS として残存している可能性あり (別 PR で削除予定)。

実装の中核:
- **`body[data-variant="default"]`**: `popup.js` が `VARIANT.name` から設定。 CSS 変数のスコープがこのセレクタで variant 別に切り替わる (現在 default のみ)
- **`@media (prefers-color-scheme: dark)`**: OS の light/dark テーマに自動追従
- **Self-hosted woff2**: popup.html から拡張機能同梱の woff2 (`../fonts/...`) を `@font-face` で参照 (Zen Kaku Gothic New / IBM Plex Sans JP / UDEV Gothic JPDOC)。 外部 CDN 依存ゼロ
- **アクセシビリティ**: `prefers-reduced-motion: reduce` で点滅・パルス停止、 `:focus-visible` でキーボード操作時アウトライン
- **シンプルモードトグル**: `popup.html` で「ON で Noto Sans JP + UDEV Gothic JPDOC に固定」のトグル。 `popup.js` が `simpleMode` 状態に応じて Typography セクションを `hidden` 切替

### Shadow DOM 戦略

1. **`src/content/inject.js`** (page context / MAIN world) — `Element.prototype.attachShadow` をフックし、 host 要素に `data-rfs-shadow` 属性を `queueMicrotask` で遅延設定 (カスタム要素コンストラクタとの互換性のため)。 ISOLATED 側へは `window.dispatchEvent(new Event('replace-font-shadow-created'))` で通知。
2. **`setupShadowEventListener()`** (ISOLATED world) — `replace-font-shadow-created` 受信時に `querySelectorAll('[data-rfs-shadow]')` で host を取り出して `injectCSS(host.shadowRoot)`。
3. **`setupShadowDOMObserver()`** (ISOLATED world) — MutationObserver (`subtree: true`) + 初回 TreeWalker scan で既存 Shadow DOM をカバー (inject.js のフックを補完するセーフティネット)。

CSS 注入は `adoptedStyleSheets` (Constructable Stylesheets) で **単一の `CSSStyleSheet` インスタンスを全 ShadowRoot で共有** してメモリ効率化。 `_replaceFontApplied` フラグで重複注入を防ぐ。 MAIN → ISOLATED world 間は属性 (`data-rfs-shadow`) で通信 (`CustomEvent.detail` は構造化クローンで `null` になるため)。

ShadowRoot への adopt は `pendingShadowRoots: Set` でバッチ化 → 1 microtask で N 個に sheet を流し込む。

### Storage Schema

`chrome.storage.local` キー `fontSettings`:
```json
{
  "enabled": true,
  "bodyFont": "noto-sans-jp",
  "monoFont": "udev-gothic-jpdoc",
  "bodyFontWeight": "400",
  "simpleMode": false
}
```

- **`simpleMode: true`** にすると `mergeFontSettings` が `SIMPLE_MODE_LOCKED` (Noto Sans JP + UDEV Gothic JPDOC + 400) で `bodyFont` / `monoFont` / `bodyFontWeight` を上書きする (旧 notosans variant の lockedFonts 代替機構)。 popup 側は Typography セクションを `hidden` にする
- `mergeFontSettings()` で validate されない値はサイレントに defaults に戻る

`chrome.storage.local` キー `prebuiltCSSRegistered` (boolean) — `src/background/background.js` がプリセット JS 登録の成否を `src/content/preload-fonts.js` へ伝えるシグナル。 v3.x 改修で実コードでは消費されていない (log のみ)、 将来削除候補。

### Adding a New Font

1. `src/fonts/` に TTF を置き `npm run convert-fonts` で woff2 化
2. `FONT_REGISTRY` (`src/content/font-config.js`) の `body` か `mono` にエントリ追加
3. `npm run generate-css` で template CSS + 36 preset JS を再生成
4. popup / content / background は `FONT_REGISTRY` を動的読みするので他ファイル変更不要

⚠️ **既存フォントキー (`noto-sans-jp` / `udev-gothic-jpdoc`) のリネーム禁止** — `font-config.js` の `SIMPLE_MODE_LOCKED` がそのキー名を参照しており、 リネームすると simpleMode 機能が破綻する。

## Release Automation

### Release Kick-off (`scripts/release.js`)

`scripts/release.js` は `variants/*.json` の version を patch +1 し、 `release/<X.Y.Z>` ブランチを作って push する。 push が CI のトリガーになり、 GitHub Actions の matrix strategy が公開する (現在 default 1 variant のみ matrix 実行)。

```bash
npm run release                  # variant patch +1 → release/<X.Y.Z> ブランチ
node scripts/release.js --yes    # 直接呼び (確認プロンプト省略、 CI / Claude Code から)

# フラグ
--dry-run / -n  計画だけ表示。 書き込み・push しない
--yes / -y      対話確認をスキップ
--prune-old     既存の release/* ブランチをリモートから削除
```

#### minor / major bump の運用

このスクリプトは **patch +1 専用** (`/vava` と一貫)。 minor / major bump は手作業:

```bash
# 例: 3.0.5 から 3.1.0 に minor bump する場合
# variants/default.json と package.json の "version" を 3.1.0 に手で書き換え
git add variants/ package.json
git commit -m "release: v3.1.0"
git push origin main
git checkout -b release/3.1.0
git push -u origin release/3.1.0
git checkout main
```

publish.yml はブランチ末尾 `X.Y.Z` と variant の `version` が一致するか matrix の各 job で検証する。

#### 前提条件と挙動
- 実行は **clean な main ブランチ** から (リモートと同期済みであること)。 違反時は abort
- リモートに同名 `release/<X.Y.Z>` が既存なら abort (force push しない)
- preset JS や `manifest.json` はビルド時に CI 側で生成されるため、 ローカルでの再生成は不要 (variants/*.json だけが真実の源泉)

### リリース失敗時のリカバリー

`release/<X.Y.Z>` push 後の CI で一部のストア publish が失敗した場合の対処。

#### Step 間の連鎖 skip 解除 (matrix.fail-fast: false の落とし穴) ⭐ 必読

`matrix.fail-fast: false` は **matrix 間の job レベル** にのみ作用し、 **同一 job 内の step 間** では「前 step 失敗 → 後続 step 自動 skip」が GitHub Actions のデフォルト挙動になる。

publish.yml では Chrome step が失敗 (例: 同 version 重複 upload) しても Firefox AMO step を独立実行したいので、 Firefox 関連 step に `if: ${{ success() || failure() }}` を明示する (`cancelled()` 時のみ skip)。 これがないと「Chrome 失敗 → Firefox AMO 連鎖 skip」で**リカバリーフロー全体が機能しなく**なる。

**過去事例**: release/3.0.3 retry #1 (manifest 修正の fast-forward push) で踏んだ。 Chrome 失敗 (v3.0.3 既公開済) → Firefox AMO step が `skipped` で意図せずスキップ → 「if 条件追加」で解決 → retry #2 で Firefox AMO default が submission 成功して AMO 上で v3.0.3 即時公開達成。

#### 同 version 再 push でリカバリー (推奨)

`if:` 条件が整っていれば、 同じ `release/<X.Y.Z>` ブランチに修正を fast-forward push するだけでバージョンを消費せずリカバリーできる:

```bash
# main で修正 commit & push
git commit -m "fix(ci): ..."
git push origin main

# release/<X.Y.Z> に fast-forward (force push 不要)
git checkout release/<X.Y.Z>
git merge main --ff-only
git push origin release/<X.Y.Z>
git checkout main
```

- Chrome 側は同 version 再 upload で重複エラーになるが、 既公開分には影響なし (`if:` 条件で Firefox AMO は独立続行)
- Firefox AMO 側は初回 submit or 修正後の挙動で再試行

#### v+1 で再リリース (代替案)

Chrome の重複エラーログを避けたい / 履歴をクリーンに保ちたい場合は `/vava` で v+1 を発行。 Chrome は新バージョン公開、 Firefox は修正後の挙動で再試行。

#### Build / 認証エラー等で全 job 失敗のケース

- ストアへの upload が **一度も成功していない** ことを確認した上で、 同じ `release/<X.Y.Z>` に修正 commit を追加 push して OK
- `matrix.fail-fast: false` なので失敗した variant のみ再実行される (現在 default 1 variant のみだが、 将来 variant 追加時の動作保証)
- 判定基準: GitHub Actions ログで「Chrome Web Store にアップロード & 公開」「Firefox AMO に submission API でアップロード」ステップに到達せず、 その前 (build / package step) で失敗していること

### Local Packaging (手動 Web Store アップロード用)
- `.\zip.ps1 [-Variant <name>]` (Windows): `npm ci` → アイコン / CSS 生成 → variant 適用 → `<zipBaseName>-chrome.zip` + `<zipBaseName>-firefox.xpi` 生成。 引数省略時は `default`
- `./zip.sh [<name>]` (Linux/Mac): Chrome ZIP のみ。 Firefox XPI を含むフルリリースは `zip.ps1` 必須

### `/vava` スキル経由の起動

このプロジェクトに対して `/vava` スキルが起動された場合、 Claude Code は **標準フローを使わず** `npm run release` (scripts/release.js) に委譲する。

`release.js` は:
- `variants/<name>.json` の version → patch +1 → `package.json` の version も自動同期
- main に 1 commit → push
- `release/<X.Y.Z>` ブランチ作成 → push
- (`--prune-old` で) 古い release ブランチ削除

minor / major bump は手作業 (上述「minor / major bump の運用」参照)。

### CI 自動公開 (`.github/workflows/publish.yml`)

- **トリガー**: `release/<X.Y.Z>` 形式のブランチへの push (例: `release/3.0.3`, `release/3.1.0`)
- **matrix strategy**: 現在 `variant: [default]` 1 要素。 将来 variant を追加する場合は配列を拡張
- **整合性チェック**: ブランチ末尾の `X.Y.Z` と `variants/default.json` の `version` と生成された `manifest.json` の `version` が一致しないと該当 variant のジョブが失敗
- **公開先**: Chrome Web Store と Firefox AMO の **両方** に並列公開

#### Chrome Web Store
- **拡張機能 ID の選択**: matrix の variant 値から `case` 文で `CWS_EXTENSION_ID_<UPPER>` シークレットを選ぶ (`default` → `CWS_EXTENSION_ID_DEFAULT`)
- **共通シークレット**: `CWS_CLIENT_ID` / `CWS_CLIENT_SECRET` / `CWS_REFRESH_TOKEN` は全 variant 共有 (同一 Google アカウントの OAuth 認証情報)
- アップロードツール: `chrome-webstore-upload-cli` exact pin、 `--auto-publish` で即時公開

#### Firefox AMO (addons.mozilla.org)
- **アップロードツール**: `web-ext sign --channel=listed` (exact pin、 Node 20 要件、 web-ext 10+ では submission API がデフォルト動作で `--use-submission-api` フラグは渡さない)
- **ソースディレクトリ**: `firefox-build/` を CI 内で構築 (Chrome ZIP と同じ `manifest.json + icons/<variant> + src` 構成、 TTF / preview.html / OS メタファイル除外)
- **gecko id (extension 識別子)**: `variants/<variant>.json` の `geckoId` から `build-variant.js` 経由で `manifest.json` の `browser_specific_settings.gecko.id` に注入される
- **共通シークレット**: `AMO_JWT_ISSUER` / `AMO_JWT_SECRET` は全 variant 共有 (同一 Mozilla アカウントの JWT credentials)
- **レビュー**: `--channel=listed` は AMO の人間レビューが入る。 submission API は受付完了で job 成功扱いとなり、 実際のストア反映は別事象
- **API キーの発行**: https://addons.mozilla.org/ja/developers/addon/api/key/ で JWT issuer / secret を生成し、 `gh secret set AMO_JWT_ISSUER` / `gh secret set AMO_JWT_SECRET` で登録

#### AMO 初回登録 (CI 自動公開の前提条件)

新 variant の初回登録は CI からは自動化できない (CI の `web-ext sign` は **既存 add-on への新バージョン提出のみ**)。 次のいずれかで事前に初回 submission を済ませる:

- **default variant**: 登録済み (`{ee49eeb2-93a9-4062-ba75-06610054323f}`)
- **将来 variant**: 下記方法 A or B で初回登録

##### 方法 A: ローカル `web-ext sign` で API 経由初回登録 (推奨)

`web-ext sign --channel=listed` は manifest の `gecko.id` が AMO 上に存在しない場合、 **新規 add-on として自動作成**する。 listed channel に必要な必須メタデータは `--amo-metadata=metadata.json` で渡す:

```bash
# 1. ローカルでビルド
npm run build:<variant>

# 2. firefox-build/ ディレクトリ構築 (CI と同じホワイトリスト)
firefox_dir="firefox-build"
variant_icons_dir="icons/<variant>"
rm -rf "$firefox_dir" && mkdir -p "$firefox_dir/icons"
cp manifest.json "$firefox_dir/"
cp -r "$variant_icons_dir" "$firefox_dir/icons/<variant>"
cp -r src "$firefox_dir/src"
find "$firefox_dir" \( -name "*.DS_Store" -o -name "*.swp" -o -name "*~" -o -name "preview.html" -o -name "*.ttf" \) -delete

# 3. .amo-metadata.json を作成
cat > .amo-metadata.json <<'EOF'
{
  "categories": ["appearance", "language-support"],
  "version": { "license": "MIT" }
}
EOF

# 4. web-ext sign で AMO に初回登録
WEB_EXT_API_KEY=$AMO_JWT_ISSUER WEB_EXT_API_SECRET=$AMO_JWT_SECRET \
  npx --no web-ext sign \
    --source-dir=firefox-build \
    --artifacts-dir=web-ext-artifacts \
    --channel=listed \
    --amo-metadata=.amo-metadata.json
```

実装上の罠:
- `license` は `version.license` (nested) で渡す。 top-level だと無効 ("This field, or custom_license, is required for listed versions." エラー)
- `web-ext sign` が `Approval: timeout exceeded` と表示しても、 **submission 自体は AMO で受理されている** (ローカル待ち時間切れだけ)
- リスティング情報 (summary / description / privacy_policy / default_locale) は別途 API で PATCH 可能
- `default_locale` を `ja` に切り替える時は `name: {ja: "..."}` も同じ PATCH に含めないと "A value in the default locale of \"ja\" is required." HTTP 400
- screenshots は API 不対応 — AMO Developer Hub から手動 upload (`webstore/images/<variant>/*.png`)

初回登録後、 `status: nominated` (Mozilla 人間レビュー待ち、 通常数日) になる。 既存 add-on の新バージョン提出は通常オート承認で即時公開。

##### 方法 B: AMO Developer Hub で手動 submit

https://addons.mozilla.org/ja/developers/ で「Submit a New Add-on」から XPI を upload → リスティング情報を手動入力。

#### AMO リスティング情報の API 更新時の落とし穴

`PATCH /api/v5/addons/addon/{guid}/` で description / summary / privacy_policy 等を更新する運用 know-how:

- **HTML タグは plain text 化される**: API 経由で送る `<ul>` 等は `&lt;ul&gt;` としてエスケープ保存される。 リッチ HTML 表示は AMO Web UI のリッチテキストエディタ経由のみ可能
- **locale コードは BCP 47 厳密**: `en` 単独は HTTP 400 拒否、 `en-US` を使う。 送信時のキーは `{ja: "...", "en-US": "..."}` 形式
- **license の格納先**: top-level `license` ではなく `current_version.license.slug` に格納される (PATCH 時は `{license: {slug: "MIT"}}` で OK)
- **privacy_policy の取得**: GET 本文には含まれず `has_privacy_policy: true` boolean のみ
- **`?lang=all` クエリのバグ**: 一部 locale が省略される。 確認時は `?lang=ja` 等のピンポイント指定が安全
- **レート制限**: 短時間連投で HTTP 429。 60 秒待機で解除
- **JWT 認証**: `Authorization: JWT <token>` ヘッダー、 HS256 で `{iss, jti, iat, exp}` を `AMO_JWT_SECRET` で署名 (`exp` は 60 秒程度の短命トークンが推奨)

#### サプライチェーン対策
- Actions は SHA pin、 `npm ci` 固定、 `chrome-webstore-upload-cli` / `web-ext` を devDependencies に exact pin して `npx --no` で integrity 検証済みのローカル版を呼ぶ

#### Secrets Rotation / Revocation (運用ノウハウ)

- **CWS OAuth refresh token**: 6 か月以内に release を回せば自動で alive。 失効した場合は https://developer.chrome.com/docs/webstore/using-api#test の手順で refresh token を再発行 → `gh secret set CWS_REFRESH_TOKEN`
- **AMO JWT**: 漏洩疑いがあれば https://addons.mozilla.org/ja/developers/addon/api/key/ から即 revoke → 新発行 → `gh secret set AMO_JWT_ISSUER` / `gh secret set AMO_JWT_SECRET` で更新 (60 秒で反映)
- **CWS_EXTENSION_ID**: immutable (拡張機能の identity)、 rotation 不要

## Critical Constraints

### Manifest content_scripts のロード順 (絶対)

`manifest.template.json` で定義され、 `build-variant.js` が exclude_matches を注入する:

```
src/content/inject.js         — MAIN world      (Shadow DOM intercept は最優先)
src/content/variant.js        — ISOLATED world  (VARIANT を font-config 前に定義)
src/content/font-config.js    — ISOLATED world  (mergeFontSettings は VARIANT に依存)
src/content/preload-fonts.js  — ISOLATED world  (main script)
```

Service Worker (`background.js`) も同様の順序で `importScripts('/src/content/variant.js', '/src/content/font-config.js')` を呼ぶ。

### CSS — ユニバーサルセレクタ禁止

`*` や暗黙的なユニバーサル相当のセレクタは絶対禁止。 Font Awesome / Material Icons / codicon のアイコンフォントの `font-family` を破壊する。

- ❌ `* { font-family: ... }`
- ❌ `:is(pre, code) :not(i, .icon)` — `:not()` 単独の子孫セレクタは `*:not(...)` と同義
- ✅ `:root :is(pre, code, kbd, samp, ...)` — コンテナ要素自体にマッチ (継承で子孫へ伝播)
- ✅ `[style*="monospace"]` — インラインスタイルを持つ要素のみ
- ✅ `revert` リセット戦略: 通常ルール (negation なし) → 編集領域に separate ルールで `font-family: revert !important` (v3.x で導入)

### Performance — preload-fonts.js は Hot Path

全ページ document_start (top frame のみ、 v3.x で all_frames:false に変更) 実行されるため:
- `document_start` 時点の同期処理を最小限に保つ
- DOM が空の状態での無意味な `querySelector` を避ける
- `MutationObserver` コールバックは `_replaceFontApplied` フラグで早期 return
- debug 用 `chrome.runtime.sendMessage` を本番に残さない
- `scanDynamicFontFamilies` は `document.fonts.size` キャッシュ + `'__' startsWith` 早期 reject + `requestIdleCallback` debounce

### CSP Limitations

`font-src` / `default-src 'none'` の厳格 CSP サイトでは `chrome-extension://` / `moz-extension://` からの `url()` ロードがブロックされる。 `local()` フォールバックのみ動作する (ユーザーがフォントをシステムインストールしていれば置換成功)。 ブラウザ仕様による制約で拡張側では回避不可能。

### Cross-Browser Compatibility

Chrome / Firefox 140+ を単一コードで対応:
- 使用している `chrome.*` API は全て Firefox の `chrome.*` 名前空間でも動作 (`browser.*` リライト不要)
- `chrome.scripting.registerContentScripts` の `persistAcrossSessions` / `world` は Firefox 140+ で対応
- `chrome.scripting.updateContentScripts` (v3.x で導入、 unregister+register の atomic 化) も同 Firefox 140+ で対応
- gecko id は variant ごとに `variants/<name>.json` の `geckoId` から注入される (Chrome は `browser_specific_settings` を silently ignore)
- `chrome.runtime.getURL('')` は両ブラウザで正常動作するため、 `getExtensionBaseURL()` の Chrome 固有フォールバック (`chrome-extension://${runtime.id}`) には到達しない
- `src/popup/style.css` のフォントは相対パス (`../fonts/...`) を使い、 拡張機能オリジン内で両ブラウザが解決する

### Firefox MV3 — background は service_worker と scripts の併記必須 🚨

AMO validator は `background.service_worker` 単独を **reject** し、 `background.scripts` を Firefox-compatible fallback として要求する:

```
Error: Unsupported "/background/service_worker" manifest property used
       without "/background/scripts" property as Firefox-compatible fallback.
```

[manifest.template.json](manifest.template.json) は両方併記する設計:

```json
"background": {
  "service_worker": "src/background/background.js",
  "scripts": [
    "src/content/variant.js",
    "src/content/font-config.js",
    "src/background/background.js"
  ]
}
```

- **Chrome**: `service_worker` を見て SW として動作 ([background.js](src/background/background.js) が `importScripts('/src/content/variant.js', '/src/content/font-config.js')` で順次ロード)
- **Firefox**: `scripts` を見て event page として動作 (3 ファイルが順次ロード、 `importScripts` は worker 限定 API なので使えない)

そのため [src/background/background.js](src/background/background.js) では `importScripts` を `typeof` ガード:

```js
if (typeof importScripts === 'function') {
  importScripts('/src/content/variant.js', '/src/content/font-config.js');
}
```

これがないと Firefox の event page で `ReferenceError: importScripts is not defined` で background script 全体が落ちる。 過去に release/3.0.3 でハマって解消済み。

### その他の制約

- `web_accessible_resources` に `src/fonts/*.woff2` を含める (v3.x で `use_dynamic_url: true` 追加、 fingerprinting 対策)。 `replacefont-extension.css` は WAR から除外済 (Path B 削除で fetch 不要)
- `src/content/inject.js` は manifest の `content_scripts` で MAIN world に直接注入されるため WAR に含めない (攻撃対象面の縮小)
- `content_scripts.all_frames: false` (v3.x、 P3-2 で iframe 注入廃止)、 background.js の `registerContentScripts` も `allFrames: false`。 long_tasks 増加抑制効果あり。 iframe 内置換が必要なケースは将来 per-origin allowlist UI で個別対応 (別 PR)
- `extension_pages` CSP: `script-src 'self'; object-src 'self'; base-uri 'self'; form-action 'none'` (v3.x で base-uri / form-action 追加)
- M PLUS 2 / Murecho は variable font — Regular/Bold が同一 woff2 から取得される
- `manifest.json` の `run_at: "document_start"` で最早期に注入
- popup でのフォント変更は **ページリロードが必要** — CSS は `document_start` 時に一度キャッシュされる
- `chrome.scripting.registerContentScripts` で CSS ファイル内の相対 URL はページオリジンに解決される (拡張オリジンではない)。 そのため CSS ではなく JS を登録して `chrome.runtime.getURL()` で絶対 URL を構築する設計
