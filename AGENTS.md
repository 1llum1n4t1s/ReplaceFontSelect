# AGENTS.md

This file provides guidance to Codex and other coding agents working in this repository.

## Project Overview

**目に優しいフォント置換** — Chrome / Firefox desktop (140+) / Firefox Android (142+) 拡張機能 (Manifest V3) で、 ウェブサイト上の読みづらいフォントを、 ユーザーが選んだ日本語フォントへ自動置換する。本文 7 種 × 等幅 3 種 × Weight (400/500) = 42 通りのプリセットを通常は `document_start` で同期注入する。Chrome の YouTube では非同期 Blob 経路を使い、ちらつきゼロは保証しない。

このリポジトリは **単一コードベース** から複数の派生版 (variant) を別々の拡張機能として公開できる「バリアント方式」を採用している。 現在 `default` (フォント選択 UI 付き) と `notosans` (Noto Sans JP + UDEV Gothic JPDOC 固定版) の 2 variant が定義されており、 それぞれ独立した拡張機能 ID として Chrome Web Store / Firefox AMO に並行リリースされている。 ユーザーの使い分け:
- **default**: フォント選択 UI で好きなフォントを 42 プリセットから選ぶ通常版
- **notosans variant**: 最初から Noto Sans JP + UDEV Gothic JPDOC に固定、 フォント選択 UI なし (popup がシンプル)

両 variant は編集体験とアイコンフォントの保護のため、リッチエディタ・ファイル管理・デザイン・IDE 等のドメインを除外する。除外や登録経路の変更前に [default.json](variants/default.json) と [notosans.json](variants/notosans.json) の `excludeMatches` を両方読み、宣言的・動的登録で一致させる。SharePoint は Office を同一オリジンの iframe で開き、OneDrive 個人版はアイコンフォントを使うため両方を除外する。Discord は `/channels/*` にアプリがあるためドメイン全体を除外する。
**多言語対応**: `@font-face` の `unicode-range` は **省略する** (オープン範囲のまま運用)。 置換フォントのグリフカバレッジ範囲がそのまま置換対象となり、 範囲外の文字は CSS font fallback で元サイトの指定 / システムフォントに自然に落ちる。

## Build Commands

```bash
bun run deps         # 初回 checkout 後・bun.lock 更新後の依存同期
bun --bun run build:default              # icons + CSS + preset JS + variant=default のフルビルド
bun --bun run build:notosans             # icons + CSS + preset JS + variant=notosans のフルビルド
bun --bun run build                      # = build:default
bun --bun run build-variant <name>       # manifest.json + src/content/variant.js だけ再生成 (variant 切替時)

bun --bun run generate-css               # fallback / YouTube 用 CSS + 42 個の preset-*.js を再生成 (variant 非依存)
bun --bun run convert-fonts              # src/fonts/*.ttf → *.woff2 変換 (フォント追加時のみ手動実行、 variant 非依存)
bun --bun run generate-icons:default     # icons/default/icon.svg から PNG (16/48/128) を再生成
bun --bun run generate-icons:notosans    # icons/notosans/icon.svg から PNG (16/48/128) を再生成
bun --bun run generate-screenshots:default  # webstore/screenshots/default/*.html → webstore/images/default/*.png (要 puppeteer)
bun --bun run generate-screenshots:notosans # webstore/screenshots/notosans/*.html → webstore/images/notosans/*.png (要 puppeteer)
bun --bun run sync:support                  # 共有パッケージ正本から問い合わせUIの JS / CSS 5資産を同期
bun --bun run check:support                 # 同梱資産が共有パッケージ正本と一致することを読み取り専用で検査
```

`manifest.json`、`src/content/variant.js`、`src/css/replacefont-extension.css`、`src/css/youtube-override.css`、`src/css/preset-*.js` は **ビルド生成物 (.gitignore 済)**。初回 checkout 後と `bun.lock` の変更後は `bun run deps` で依存を同期する。"Load unpacked" の前には対象 variant のフルビルドを 1 回走らせる。`bun test ./scripts/verify-style-injection.cjs` はソースを直接読み込むためフルビルドは前提にしない。開発には Bun 1.4.4 を使用する（package.json の packageManager と CI を同じ版に固定）。PowerShell のパッケージ処理には pwsh 7.6.9 以降を推奨する。 フォント注入の回帰検証手順は下記 Local Testing を参照。その他の UI 検証は実機ブラウザで行う。

`ttf2woff2@8.0.1` のフォント変換は Bun では同梱 WASM への自動フォールバックを使う。ネイティブ addon を必須にせず、実 TTF から WOFF2 が生成できることを確認する。

依存関係は `bun.lock` で固定し、`bun run deps` で再現する。`package.json` の overrides / trustedDependencies と `bunfig.toml` の公開後24時間待機・検証済み版の例外を維持する。

Kagayoi Support の問い合わせUIは、exact pinした `@kagayoi/support-extension` を正本とし、`src/shared/` の `kagayoi-support-footer.{js,css}`、`kagayoi-support-popup.{js,css}`、`kagayoi-support-form.css` へ逐語同期する。これら5資産を拡張側で直接改変しない。`build:default` / `build:notosans` と `zip.ps1` は実行前に自動同期し、CIは `check:support` とChrome ZIP内のCSS存在確認で欠落・乖離を拒否する。共有部品を更新するときは依存versionを更新してから `bun --bun run sync:support` と両variantのbuildを実行する。

アイコン・スクショ生成には headless Chrome が必要。初回は `bun --bun run puppeteer browsers install chrome` で導入する。Puppeteer v25+ は ESM-only のため生成スクリプトは動的 import を使う。

### Local Testing

- **フォント注入の回帰検証**: `bun test ./scripts/verify-style-injection.cjs` — Puppeteer の実ブラウザで Shadow 初期化、遅延した外部 CSS / @import、DOM 更新時の再移動、ページの破棄・復帰イベントを検証する。拡張 API は fixture を使用し、Firefox 実機の代替にはしない。
- **Chrome**: `chrome://extensions` → Developer mode ON → "Load unpacked" でリポジトリルートを選択
- **Firefox**: `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on..." で `manifest.json` を選択 (desktop 140+ / Android 142+)
- Firefox の読み込み前はフルビルド後に `bun scripts/build-variant.js <variant> --firefox` を実行する。Chrome の検証へ戻るときは `bun --bun run build-variant <variant>` で Chrome 用 manifest を再生成する。
- コード変更後は拡張機能リストで再読み込み+対象ページをリロード (preset JS / CSS は `document_start` 時にキャッシュされるため)

問い合わせUIまたはFirefoxの権限申告を変更するときは、[DESIGN.md の送信境界](DESIGN.md#問い合わせuiの共有資産同期)に従い、`manifest.template.json` の申告と共有部品の要求対象、popupの `firefox-data-consent` 属性を照合する。両variantのビルドと `bun --bun run check:support` に加え、Firefoxで任意許可を拒否・取得失敗した場合に確認コード送信・再送・認証・問い合わせ送信が止まり、フォント置換は利用できることを検証する。

## Variant System

`default` と `notosans` は同じソースから別拡張として公開する。設定変更前に [default.json](variants/default.json)、[notosans.json](variants/notosans.json)、[manifest.template.json](manifest.template.json)、[scripts/build-variant.js](scripts/build-variant.js) を読む。variant は名前・説明・版・geckoId・フォント固定・除外・ZIP名等を定義し、生成器は manifest と `src/content/variant.js` を生成する。生成した `VARIANT` は content / popup / background が参照する。

`mergeFontSettings()` は保存値に `VARIANT.lockedFonts` を後勝ちで適用し、固定版ではユーザー保存値より優先する。
### Variant の運用方針 — default / notosans 並行維持 💖

公開済み variant (default / notosans) は **現状の 2 variant 並行運用を維持** する。 「機能の重複」「YAGNI」「scope creep」「default に統合できる」 といった技術的合理性で退役を推奨したくなった場合は、 実装せず **ストア掲載済みの拡張機能 ID と既存ユーザー資産に直結するビジネス判断マター** として議題化し、 ゆろさんの明示承認を得てから進める。

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

システム全体の責務・境界・データフロー・設計判断は [`DESIGN.md`](DESIGN.md) を正本とし、以下ではエージェントが変更時に守る実装契約を補足する。

### ランタイム変更時の制約

構造・保存スキーマ・テーマの責務は [DESIGN.md](DESIGN.md#ランタイムデータフロー) を参照する。

- Path A（同期preset）とPath B（fallbackと競合font-face監視）を両方維持する。presetがある場合も競合font-face監視は必要。
- Chrome の YouTube ドメインだけは Path A を注入せず、Path B が Blob URL と CSS を準備する。取得・CSP 失敗時は競合 font-face を変更せず元の表示を保つ。
- presetには解決済みフォント設定とCSS全体を埋め込み、拡張URLの `__REPLACE_FONT_BASE__` だけを実行時に解決する。生成物を直接修正しない。
- preset生成の区切りには不可視ASCII制御文字を使わず、目視できるトークンまたは明示的なescapeを使う。
- 保存値は `mergeFontSettings()` で検証し、固定版の `lockedFonts` を優先する。フォント定義・検証を別の実装へ複製しない。
- 宣言的・動的content scriptの除外を一致させ、有効時だけMAIN worldフックを登録する。
- Shadow DOMの注入順序を変更したら、[world別Shadow DOM処理](DESIGN.md#world別shadow-dom処理) とLocal Testingの回帰検証により、同期初期化後のCSS保持とページ破棄後の注入停止を確認する。
- popupの変更は両variant × light/darkの4テーマを実画面で確認する。notosansのテーマも利用中なので維持し、reduced motionとキーボードfocusの表示を保つ。

### Adding a New Font

1. `src/fonts/` に TTF を置き `bun --bun run convert-fonts` で woff2 化。追加・再生成した WOFF2 には [同梱フォントの描画設定](src/fonts/README.md#同梱フォントの描画設定)を適用して確認する（変換スクリプトは描画設定を自動統一しない）。
2. `FONT_REGISTRY` (`src/content/font-config.js`) の `body` か `mono` にエントリ追加
3. `bun --bun run generate-css` で template CSS + 本文 × 等幅 × weight の全組み合わせ preset JS (現在 42 個) を再生成
4. popup / content / background は `FONT_REGISTRY` を動的読みするので他ファイル変更不要

⚠️ **既存フォントキー (`noto-sans-jp` / `udev-gothic-jpdoc`) はそのまま維持する** — `variants/notosans.json` の `lockedFonts` がそのキー名を参照しているので、 既存キーは固定で運用し、 新しいフォントは別キーで追加する。

## Release Automation

### Release Kick-off (`scripts/release.js`)

`scripts/release.js` は `variants/*.json` の version を patch +1 し、 `release/<X.Y.Z>` ブランチを作って push する。 push が CI のトリガーになり、 GitHub Actions の matrix strategy が default + notosans を並列公開する。

```bash
bun --bun run release                 # variant patch +1 → release/<X.Y.Z> ブランチ
bun scripts/release.js --yes    # 直接呼び（確認プロンプト省略、CI / Codex から）

# フラグ
--dry-run / -n  計画だけ表示。 書き込み・push しない
--yes / -y      対話確認をスキップ
--prune-old     既存の release/* ブランチをリモートから削除
```

#### minor / major bump の運用

スクリプトは patch +1 専用。minor / major は `/vava` で指定版を決定し、全 `variants/*.json` と `package.json` をその版に手動更新して main に commit・push し、同じ版の `release/<X.Y.Z>` branch を作成・push する。`release.js` は実行しない。branch push はストア提出を起動するため、公開依頼の範囲でのみ実行する。

#### 前提条件と挙動
- 実行は **clean な main ブランチ** から (リモートと同期済みであること)。 違反時は abort
- リモートに同名 `release/<X.Y.Z>` が既存なら abort (force push はしない)
- preset JS や `manifest.json` はビルド時に CI 側で生成されるため、 ローカルでの再生成は不要 (variants/*.json だけが真実の源泉)

### リリース失敗時のリカバリー

`release/<X.Y.Z>` push 後の CI で一部のストア publish が失敗した場合の対処。

#### 対象を指定して再開

新規 release branch の初回 push だけが両 variant の自動提出を開始する。同一 job の Chrome が失敗すると後続の Firefox は skip される。修復 push や GitHub の rerun は提出を開始しない。

1. 各 variant・ストアの提出状態をストアと Actions で確認し、未提出または再提出が必要な対象を特定する。受付済みか不明な場合は確認が済むまで再提出しない。
2. 修正が必要なら main と該当 release branch に反映し、release branch の完全な 40 桁 SHA を確認する。
3. Actions の Publish workflow を該当 release branch で手動実行し、`variant`（default / notosans）、`target`（chrome / firefox）、`expected_sha`（確認した release branch の SHA）を指定する。対象ごとに実行し、結果とストア側の状態を確認する。

全 job が build / 認証等で失敗した場合も同じ手順で未提出対象ごとに再開する。新しい version を公開する場合は /vava を使う。

### Local Packaging (手動 Web Store アップロード用)
- `.\zip.ps1 [-Variant <name>]` (Windows): `bun run deps` → アイコン / CSS 生成 → variant 適用 → `<zipBaseName>-chrome.zip` + `<zipBaseName>-firefox.xpi` 生成。 引数省略時は `default`
- `./zip.sh [<name>]` (Linux/Mac): Chrome ZIP のみ。 Firefox XPI を含むフルリリースは `zip.ps1` 必須

### `/vava` スキル経由の起動

このプロジェクトの `/vava` は patch リリースに限り `bun --bun run release`（`scripts/release.js`）に委譲する。patch 版の同期、main への commit・push と release branch の作成・push を行う。minor / major は上記の手動手順に従う。旧 branch の削除は明示許可がある場合の `--prune-old` 指定時のみ。

### CI 自動公開 (`.github/workflows/publish.yml`)

- **トリガー**: `release/<X.Y.Z>` 形式のブランチへの push (例: `release/3.0.3`, `release/3.1.0`)
- **matrix strategy**: 現在 `variant: [default, notosans]` の 2 要素で並列公開。 将来 variant を追加する場合は配列を拡張
- **整合性チェック**: ブランチ末尾の `X.Y.Z` と `variants/<matrix.variant>.json` の `version` と生成された `manifest.json` の `version` が一致しないと該当 variant のジョブが失敗
- **公開先**: Chrome Web Store と Firefox AMO の **両方** に並列公開

#### Chrome Web Store
- **拡張機能 ID の選択**: matrix の variant 値から `case` 文で `CWS_EXTENSION_ID_<UPPER>` シークレットを選ぶ (`default` → `CWS_EXTENSION_ID_DEFAULT`)
- **共通シークレット**: `CWS_CLIENT_ID` / `CWS_CLIENT_SECRET` / `CWS_REFRESH_TOKEN` / `CWS_PUBLISHER_ID` は全 variant 共有 (同一 Google アカウントの OAuth 認証情報 + publisher ID。 publisher ID は secrets.json の `chrome_web_store.publisher_id` にも保管)
- アップロードは `scripts/Publish-Cws.ps1` のネイティブHTTP API v2を使う。既存OAuth secretsとpublisher/item IDを維持する。

##### Privacy practices

CWS の公開で必須情報不足なら Developer Dashboard の Privacy practices で single-purpose / data usage / data collection を入力し、提出状態を確認して上記の手動再開手順を使う。

#### Firefox AMO (addons.mozilla.org)
- **提出ツール**: 最終XPIをverifierで照合後、receiptのSHA-256を `scripts/Publish-Amo.ps1` へ渡す。既存GUIDへのPUTで新versionを提出し、人手レビューの承認は待たない。
- **ソースディレクトリ**: `firefox-build/` を CI 内で構築 (Chrome ZIP と同じ `manifest.json + icons/<variant> + src` 構成、 TTF / preview.html / OS メタファイル除外)
- **gecko id (extension 識別子)**: `variants/<variant>.json` の `geckoId` から `build-variant.js` 経由で `manifest.json` の `browser_specific_settings.gecko.id` に注入される
- **共通シークレット**: `AMO_JWT_ISSUER` / `AMO_JWT_SECRET` は全 variant 共有 (同一 Mozilla アカウントの JWT credentials)
- **レビュー**: `--channel=listed` は AMO の人間レビューが入る。 submission API は受付完了で job 成功扱いとなり、 実際のストア反映は別事象
- **API キーの発行**: https://addons.mozilla.org/ja/developers/addon/api/key/ で JWT issuer / secret を生成し、 `gh secret set AMO_JWT_ISSUER` / `gh secret set AMO_JWT_SECRET` で登録

##### AMO API rate limit

AMO はアカウント単位で提出を制限する。throttle 時は表示された時間を待ち、提出状態を確認してから手動再開する。連続再試行しない。

#### AMO 初回登録 (CI 自動公開の前提条件)

新 variant の初回登録は AMO Developer Hub で行う。共通PowerShell publisherは登録済みGUIDの新version提出専用で、未登録GUIDの404では停止する。

- **default variant**: 登録済み (`{ee49eeb2-93a9-4062-ba75-06610054323f}`)
- **将来 variant**: 下記 Developer Hub 手順で初回登録

##### AMO Developer Hub で初回登録

https://addons.mozilla.org/ja/developers/ で「Submit a New Add-on」から XPI を upload → リスティング情報を手動入力。

#### AMO リスティング情報の API 更新時の落とし穴

`PATCH /api/v5/addons/addon/{guid}/` の HTML はプレーンテキスト化される。locale は `ja`・`en-US` 等を使い、英語に `en` 単独は使わない（HTTP 400）。license は `current_version.license.slug` に格納される。GET の privacy policy は本文でなく `has_privacy_policy` で確認する。`?lang=all` は locale が欠けることがあるため個別 locale を指定する。429 時は制限解除を待ち、JWT は短命の HS256 署名を使う。
#### サプライチェーン対策
- 公開workflowはネイティブgit・公式BunアーカイブとSHA-256検証・PowerShellのHTTP publisherを使う。製品build/lint用Bunとlockfile固定を維持し、公開専用CLI/NodeActionsは使わない。

#### Secrets Rotation / Revocation (運用ノウハウ)

- **CWS OAuth refresh token**: 6 か月以内に release を回せば自動で alive。 失効した場合は https://developer.chrome.com/docs/webstore/using-api#test の手順で refresh token を再発行 → `gh secret set CWS_REFRESH_TOKEN`
- **AMO JWT**: 漏洩疑いがあれば https://addons.mozilla.org/ja/developers/addon/api/key/ から即 revoke → 新発行 → `gh secret set AMO_JWT_ISSUER` / `gh secret set AMO_JWT_SECRET` で更新 (60 秒で反映)
- **CWS_EXTENSION_ID**: immutable (拡張機能の identity)、 rotation 不要

## Critical Constraints

### Manifest content_scripts のロード順 (絶対)

宣言的 content script は `manifest.template.json` で定義され、 `build-variant.js` が exclude_matches を注入する。MAIN world の `inject.js` とプリセット JS は `background.js` が同じ excludeMatches で動的登録する:

```
src/content/youtube-target.js — ISOLATED world  (静的・動的 preset に先行する対象判定)
src/content/variant.js        — ISOLATED world  (VARIANT を font-config 前に定義)
src/content/font-config.js    — ISOLATED world  (mergeFontSettings は VARIANT に依存)
src/content/preload-fonts.js  — ISOLATED world  (main script)

動的: src/content/inject.js   — MAIN world      (有効時のみ Shadow DOM intercept)
動的: youtube-target.js → src/css/preset-*.js — ISOLATED world  (有効時のみ選択プリセット)
```

Service Worker (`background.js`) も同様の順序で `importScripts('/src/content/variant.js', '/src/content/font-config.js')` を呼ぶ。

### CSS — 対象要素を明示したセレクタを書く

アイコンフォントを壊さないよう、`*` や `:is(pre, code) :not(i, .icon)` のような暗黙の全要素指定を使わない。`:root :is(pre, code, kbd, samp, ...)` はコンテナに適用して継承させ、`[style*="monospace"]` は該当要素だけを対象にする。編集領域は通常ルールと分離し `font-family: revert !important` で戻す。
### Performance — preload-fonts.js は Hot Path

全ページ document_start (top + iframe 全フレーム、 `all_frames: true`) 実行されるため:
- `document_start` 時点の同期処理を最小限に保つ
- DOM が空の状態での無意味な `querySelector` を避ける
- `MutationObserver` コールバックは `_replaceFontApplied` フラグで早期 return
- debug 用 `chrome.runtime.sendMessage` を本番に残さない
- `scanDynamicFontFamilies` は `document.fonts.size` キャッシュ + `'__' startsWith` 早期 reject + `requestIdleCallback` debounce

### CSP Limitations

`font-src` / `default-src 'none'` の厳格 CSP サイトでは `chrome-extension://` / `moz-extension://` からの `url()` ロードがブロックされる。 `local()` フォールバックのみ動作する (ユーザーがフォントをシステムインストールしていれば置換成功)。 ブラウザ仕様による制約で拡張側では回避不可能。

### Cross-Browser Compatibility

Chrome / Firefox desktop 140+ / Firefox Android 142+ を単一コードで対応する。Firefox は `chrome.*`、`registerContentScripts` の `persistAcrossSessions` / `world`、`updateContentScripts` に対応する。gecko id は variant から注入し、Chrome は `browser_specific_settings` を無視する。`chrome.runtime.getURL('')` は両ブラウザで動作し、Chrome 固有フォールバックには到達しない。popup のフォントは拡張内の相対パスを使う。
### Firefox MV3 — background は service_worker と scripts の併記必須

AMO は `background.service_worker` 単独を拒否する。[manifest.template.json](manifest.template.json) は service worker のみを定義し、`bun scripts/build-variant.js <variant> --firefox` が Firefox 用に `variant.js`、`font-config.js`、`background.js` の順で `background.scripts` を追加する。`zip.ps1` と CI もこの生成経路を使う。Chrome は `--firefox` なしで生成し `scripts` を含めない。

Firefox の event page では `importScripts` が使えないため、[background.js](src/background/background.js) は `typeof importScripts === 'function'` でガードする。Chrome service worker では同関数で variant・font config を順次ロードする。
### その他の制約

- `web_accessible_resources` に `src/fonts/*.woff2` と `src/css/replacefont-extension.css` を含める。 後者は Path B で `preload-fonts.js` が fetch + placeholder 解決して注入するために必須
- `src/content/inject.js` は `background.js` が拡張機能パッケージ内のファイルとして MAIN world へ動的登録するため WAR に含めない (攻撃対象面の縮小)
- 宣言的 `content_scripts.all_frames: true` と動的登録の `allFrames: true` を揃え、top + iframe 全フレームを対象にする。 iframe 内 (広告 / 埋め込みウィジェット) のフォントも置換対象になる
- `extension_pages` CSP: `script-src 'self'; object-src 'self'; base-uri 'self'; form-action 'none'` (base-uri / form-action は defense-in-depth)
- M PLUS 2 / Murecho は variable font — Regular/Bold が同一 woff2 から取得される
- `manifest.json` の `run_at: "document_start"` で最早期に注入
- popup でのフォント変更は **ページリロードが必要** — CSS は `document_start` 時に一度キャッシュされる
- `chrome.scripting.registerContentScripts` で CSS ファイル内の相対 URL はページオリジンに解決される (拡張オリジンではない)。 そのため CSS ではなく JS を登録して `chrome.runtime.getURL()` で絶対 URL を構築する設計

### AMO 公開のHTTP境界

公開workflowは生成した最終XPIを既存の配布物検証へ通し、SHA-256・GUID・versionを `scripts/Publish-Amo.ps1`（PowerShell 7.2 以上）へ渡す。旧web-ext sign/承認タイムアウトを成功化する手順に代えて、JWT認証・全ページの非公開listed版検査・upload検証・GUIDに対するPUT提出の受付応答まで確認する。XPIの同一snapshotをhash検証と送信に使い、保存UUIDの再利用・重複・不明な受付結果は停止する。CI成功は審査完了・ストア公開を意味しない。

CWS公開workflowはrepository固定のconcurrency groupで直列化する。同期uploadの成功・ID・版を確認した場合だけpublishし、非同期uploadはAPI v2でdraft版を要求と結び付けられないため停止する。APIにはuploadとpublishの原子的なCASが無いため、提出中はDashboardや他の手動公開操作を並行しない。

## Bun依存の脆弱性検出

依存の固定復元は `bun run deps` を使う。lock欠落・破損を拒否し、`[run] bun=true` 経由で依存のpostinstallまでBunで実行する。Node.jsがあるPCでも通常の `bun install` を直接使う経路へ戻さない。

ローカルでは `bun audit` でlock全体を監査できる。通常のDependabot更新PRは維持し、Dependency validationで検証する。


### 依存の暫定セキュリティ修正

依存検証 workflow の手動実行は `mode=pr`（既定）と `mode=main` を選べる。PR 再検証では従来どおり `pr`・`base`・`head` を必須とし、本人性・最新 SHA・merge parents の証跡を検査する。`mode=main` は PR 入力をすべて空にし、現在の既定ブランチを選ぶ場合に限る。実行 SHA を固定して検証し、`dependency-main-validation sha=...` の run-name により PR 再検証の証跡とは区別する。

minimatch は 11.0.4 以降、multimatch は named import 対応の 8 系へ override する。ESLint 設定の ESM 経路は @eslint/eslintrc@3.3.7 と @eslint/config-array@0.21.2 の最小 import patch で互換性を保つ。web-ext@10.8.0 の FileFilter は Windows で windowsPathsNoEscape を明示し、開発用ファイルやアーカイブの除外を維持する。

CVE-2026-93753（GHSA-gcqx-w48m-w2h4）の deepmerge 4.3.1 は公式修正版が未公開のため、patches/deepmerge@4.3.1.patch で戻り値への書込みを own データ属性にし、__proto__ 経由の prototype 汚染を防ぐ。bun run test:dependencies で web-ext → addons-linter の実解決先の攻撃入力と通常 API を検証する。Bun 標準の patchedDependencies で適用し、公式修正版の採用時に patch の要否を再確認する。バージョンベースの bun audit 警告は残るため、警告を除外したり成功扱いにしない。
