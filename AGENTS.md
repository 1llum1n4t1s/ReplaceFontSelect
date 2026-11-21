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
bun --bun run generate-screenshots          # ストア掲載画像（vitrina）を両 variant で生成。notosans → default の順で、終了時は default の manifest.json が残る
bun --bun run generate-screenshots:default  # default 版だけ: manifest 再生成 → webstore/images/default/<locale>/screenshot-NN.png と tile-*.png（9 言語・要 puppeteer・Windows）
bun --bun run generate-screenshots:notosans # notosans 版だけ（同上。終了後の manifest.json は notosans なので、続けて build:default か build-variant default で戻す）
bun --bun run verify-screenshots            # webstore/images/<variant> の枚数・寸法・命名・アルファ無し・英語フォールバック有無を検査
bun --bun run sync:support                  # 共有パッケージ正本から問い合わせUIの JS / CSS 5資産を同期
bun --bun run check:support                 # 同梱資産が共有パッケージ正本と一致することを読み取り専用で検査
```

`manifest.json`、`src/content/variant.js`、`src/css/replacefont-extension.css`、`src/css/youtube-override.css`、`src/css/preset-*.js` は **ビルド生成物 (.gitignore 済)**。初回 checkout 後と `bun.lock` の変更後は `bun run deps` で依存を同期する。"Load unpacked" の前には対象 variant のフルビルドを 1 回走らせる。`bun test ./scripts/verify-style-injection.cjs` はソースを直接読み込むためフルビルドは前提にしない。開発には Bun 1.4.5 を使用する（package.json の packageManager と CI を同じ版に固定）。PowerShell のパッケージ処理には pwsh 7.7.0 以降を推奨する。 フォント注入の回帰検証手順は下記 Local Testing を参照。その他の UI 検証は実機ブラウザで行う。

`ttf2woff2@8.0.1` は Bun では同梱 WASM へ自動フォールバックする。実 TTF から WOFF2 が生成できることを確認する。

依存は `bun.lock` で固定し、`package.json` の overrides / trustedDependencies と `bunfig.toml` の公開後24時間待機・検証済み版の例外を維持する。

Kagayoi Support の問い合わせUIは、exact pin した `@kagayoi/support-extension` を正本とし、`src/shared/` の `kagayoi-support-{footer,popup}.{js,css}` と `kagayoi-support-form.css` の5資産へ逐語同期する。拡張側で直接改変しない。`build:*` と `zip.ps1` は実行前に自動同期し、CI は `check:support` で乖離を拒否する。更新時は依存 version を上げてから `bun --bun run sync:support` と両 variant の build を実行する。

アイコン・スクショ生成には headless Chrome が必要。初回は `bun --bun run puppeteer browsers install chrome` で導入する。Puppeteer v25+ は ESM-only のため生成スクリプトは動的 import を使う。

#### ストア掲載画像（vitrina）

スクショ（1280x800・9 言語×4 枚）と小タイル・マーキーは、`webstore/vitrina/`（共通キット。`Kagayoi.Support` の `sync-kit.mjs --repo` で逐語同期。**直接編集しない**）が実拡張を Chrome for Testing へ読み込んで撮る。設定は `webstore/store-assets.<variant>.json`、固定ページは `webstore/fixtures/`、撮影前の操作は `webstore/store-assets.steps.mjs`、variant 切替は `webstore/run-vitrina.mjs`。

- 実行前に対象 variant の `bun --bun run build:<variant>`（アイコン・preset CSS）が済んでいること。`generate-screenshots*` は撮影前に `build-variant` で manifest と `_locales` を作り直す。
- ビフォーアフター（`compare-*`）は同じ固定ページを拡張オン／オフで撮り、左カードをオフの実描画へ差し替える。置換元は読みづらい明朝体の指定で、フォント名は画像に書かない。
- 文言は `{ msg }` で `_locales` を参照するか、9 言語を `store-assets.<variant>.json` に直書きする（訳は `Kagayoi.Support` の `l10n/glossary.md` に従う）。
- 撮影中の欠陥は `<work-dir>/ui-defects.json`。固定ページが日本語本文のため、日本語以外のロケールで `kana-in-non-ja` / `font-mismatch` / `same-as-en` が出るのは想定内。
- 出力は `webstore/images/<variant>/`（gitignore 済み）。CI（Linux）は smoke プロファイル（en のみ）で verify は失敗する設計。

### Local Testing

- **フォント注入の回帰検証**: `bun test ./scripts/verify-style-injection.cjs` — Puppeteer の実ブラウザで Shadow 初期化、遅延した外部 CSS / @import、DOM 更新時の再移動、ページの破棄・復帰、除外リスト一致時の撤去を検証する。拡張 API は fixture で、Firefox 実機の代替にはしない。
- **置換除外リストの判定**: `bun --bun run test:exclusions` — 規則の正規化・glob/前方一致・match pattern への変換を検証する（CI の verify でも実行）。
- **配布 stage の選定規則**: `bun --bun run test:package` — `stagePackage` の除外・拒否・固定版の除外を一時 fixture で検証する（CI の verify でも実行）。
- **Chrome**: `chrome://extensions` → Developer mode ON → "Load unpacked" でリポジトリルートを選択
- **Firefox**: `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on..." で `manifest.json` を選択 (desktop 140+ / Android 142+)
- Firefox の読み込み前はフルビルド後に `bun scripts/build-variant.js <variant> --firefox` を実行する。Chrome の検証へ戻るときは `bun --bun run build-variant <variant>` で Chrome 用 manifest を再生成する。
- コード変更後は拡張機能リストで再読み込み+対象ページをリロード (preset JS / CSS は `document_start` 時にキャッシュされるため)

問い合わせUIまたはFirefoxの権限申告を変更するときは、[DESIGN.md の送信境界](DESIGN.md#問い合わせuiの共有資産同期)に従い、`manifest.template.json` の申告と共有部品の要求対象、popupの `firefox-data-consent` 属性を照合する。両variantのビルドと `bun --bun run check:support` に加え、Firefoxで任意許可を拒否・取得失敗した場合に確認コード送信・再送・認証・問い合わせ送信が止まり、フォント置換は利用できることを検証する。

- **Chrome を起動するスクリプトはシード必須**: puppeteer.launch・chrome-launcher・Chrome の直接起動は、起動前に user-data-dir の `Local State` へ `{"password_manager":{"os_password_blank":false,"os_password_last_changed":"9223372036854775000"}}` を書く。Windows の Chromium は新規プロファイルごとに空パスワードで LogonUser を呼びログオン失敗（Security 4625）として数えられ、並列・連続起動でアカウントがロックされる（実害あり）。`scripts/chrome-profile-seed.mjs` の `createSeededProfile()` / `seedChromeProfile()` を使い、userDataDir 未指定の起動は作らない。

## Variant System

`default` と `notosans` は同じソースから別拡張として公開する。設定変更前に [default.json](variants/default.json)、[notosans.json](variants/notosans.json)、[manifest.template.json](manifest.template.json)、[scripts/build-variant.js](scripts/build-variant.js) を読む。variant は名前・説明・版・geckoId・フォント固定・除外・ZIP名等を定義し、生成器は manifest と `src/content/variant.js` を生成する。生成した `VARIANT` は content / popup / background が参照する。

`mergeFontSettings()` は保存値に `VARIANT.lockedFonts` を後勝ちで適用し、固定版ではユーザー保存値より優先する。
### Variant の運用方針 — default / notosans 並行維持 💖

公開済み variant (default / notosans) は **2 variant 並行運用を維持** する。「機能の重複」「YAGNI」「default に統合できる」等の技術的合理性で退役を推奨したくなった場合は、実装せず、ストア掲載済みの拡張機能 ID と既存ユーザー資産に直結するビジネス判断として議題化し、ゆろさんの明示承認を得てから進める。

### 新しい variant を追加する手順 (将来用)

1. `variants/<name>.json` を作成 (既存 default.json をコピーして編集が早い)
2. `icons/<name>/icon.svg` を配置
3. (任意) `webstore/store-assets.<name>.json`（固有の撮影操作は `store-assets.steps.mjs`）
4. (任意) `docs/<name>/` の privacy-policy.md / privacy.html / index.html
5. (任意) `changelog/<name>.md` を作成
6. `package.json` の `scripts` に `build:<name>` / `generate-icons:<name>` / `generate-screenshots:<name>` を追加
7. 次の variant 列挙箇所すべてに新 variant を追加する
   - `publish.yml`: `workflow_dispatch.inputs.variant.options`、`strategy.matrix.variant`、`対象を選択` と EXTENSION_ID 決定の `case` 文（`CWS_EXTENSION_ID_<UPPER>` の env も）
   - `cws-submit.yml`: `strategy.matrix.variant` と extension ID の `case` 文（env も）
   - `verify.yml` と `dependency-validation.yml`: `build:<name>` ステップ
   - `webstore/run-vitrina.mjs`: `VARIANTS` 配列
8. GitHub Secrets に `CWS_EXTENSION_ID_<UPPER>` を登録
9. `variants/<新>.json` の `version` を default と同じ値に揃える
10. **新変数を `variant.json` に追加した場合は `scripts/build-variant.js` の `REQUIRED_KEYS` 配列も更新**
11. リポジトリ直下に `.amo-metadata-<name>.json` を作成（`.amo-metadata-default.json` を参考）。`Publish-Amo.ps1 -Metadata` の必須ファイルで、無いと AMO 提出だけが失敗する

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
- background の登録更新は、起動時・インストール時・storage 変更の debounce 発火のいずれも、直列化ロック内で storage を読み直してから行う。storage 変更経路は読込に失敗したら登録を変えず、起動・インストール経路は既定値にフォールバックする。
- 利用者の置換除外リスト（`storage.local.siteExclusions`、popupの「除外リスト」タブ）は `font-config.js` の `SiteExclusions` を正本にし、規則はReplaceTranslatorの自動翻訳ブラックリストと同じにする。除外の正本は `preload-fonts.js` の実行時判定（YouTube分岐・競合font-face除去より前）で、素のホスト名だけを動的登録の `excludeMatches` へ前倒しで加える。match pattern への変換を広げる場合は意味が完全に一致する規則に限る（無効な pattern は登録全体を失敗させる）。判定を変えたら `bun --bun run test:exclusions` と下記の回帰検証を実行する。
- Shadow DOMの注入順序を変更したら、[world別Shadow DOM処理](DESIGN.md#world別shadow-dom処理) とLocal Testingの回帰検証により、同期初期化後のCSS保持とページ破棄後の注入停止を確認する。
- popupの変更は両variant × light/darkの4テーマを実画面で確認する。notosansのテーマも利用中なので維持し、reduced motionとキーボードfocusの表示を保つ。

### Adding a New Font

1. `src/fonts/` に TTF を置き `bun --bun run convert-fonts` で woff2 化。追加・再生成した WOFF2 には [同梱フォントの描画設定](src/fonts/README.md#同梱フォントの描画設定)を適用して確認する（変換スクリプトは描画設定を自動統一しない）。
2. `FONT_REGISTRY` (`src/content/font-config.js`) の `body` か `mono` にエントリ追加
3. `bun --bun run generate-css` で template CSS + 本文 × 等幅 × weight の全組み合わせ preset JS (現在 42 個) を再生成
4. popup / content / background は `FONT_REGISTRY` を動的読みするので他ファイル変更不要

⚠️ **既存フォントキー (`noto-sans-jp` / `udev-gothic-jpdoc`) はそのまま維持する** — `variants/notosans.json` の `lockedFonts` がそのキー名を参照しているので、 既存キーは固定で運用し、 新しいフォントは別キーで追加する。

## Release Automation

### リリース起動

- `bun --bun run release`（`scripts/release.js`、`--dry-run`/`-n`、`--yes`/`-y`）は `variants/*.json` の版を patch +1 し、main へ commit・push して、同じ commit に軽量タグ `v<X.Y.Z>` を付け、そのタグだけを push する（`git push --tags` は使わない）。タグ push が `publish.yml` を起動し、matrix で default + notosans を並列公開する。
- 実行は clean かつリモートと同期済みの main から。同名タグがリモートにあれば abort し、タグの付け替え・force push はしない。preset JS と `manifest.json` は CI がビルドで生成する。
- minor / major は `/vava` で版を決め、全 `variants/*.json` と `package.json` を手動で更新して main に commit・push し、同じ commit に軽量タグを付けてそのタグだけを push する（`release.js` は使わない）。タグ push はストア提出を起動するため、公開依頼の範囲でのみ行う。patch の `/vava` は `release.js` に委譲する。

### 失敗時のリカバリー

版タグの新規 push だけが自動提出を開始する。修復 push や rerun は提出を開始しない。同一 job で Chrome が失敗すると後続の Firefox は skip される。

1. 各 variant・ストアの提出状態をストアと Actions で確認し、未提出・再提出が必要な対象を特定する。受付済みか不明な間は再提出しない。
2. 版タグは動かさない（削除・付け替え・force push 禁止）。コード・workflow の修正が要るなら patch を上げて新タグで公開し直す（/vava）。runner・外部障害・secret・Environment など修正不要な原因は解消し、タグの 40 桁 SHA を確認する。
3. Publish workflow を `--ref v<X.Y.Z>` で手動実行し、`variant`・`target`（chrome / firefox）・`expected_sha` を指定する。対象ごとに実行し、結果とストア状態を確認する。

### ローカル梱包（手動アップロード用）

- `.\zip.ps1 [-Variant <name>]`（Windows、既定 `default`）: `bun run deps` → `build:<variant>` → `package-source.js --stage` → `New-FirefoxArchive.ps1` で `temp-build` 内に `chrome.zip` + `firefox.xpi` を作り、`verify-release-archive.js`（Python 3 が必要。`RELEASE_ZIP_PYTHON` 設定時はその値のみ使う）で検証してから最終名 `<zipBaseName>-chrome.zip` / `-firefox.xpi` へ移す。検証前のアーカイブは最終名に置かない。既存の最終名は build 前に削除する。Chrome 用 manifest へ戻せなければ失敗終了する。`convert-fonts` は自動実行しない。
- `./zip.sh [<name>]`（Linux/Mac）は Chrome ZIP のみで verifier を呼ばない。Firefox XPI を含むフルリリースは `zip.ps1` 必須。
- 同梱ファイル（manifest.json・_locales・icons/<variant>・src）の選定と OS 残骸・preview.html・Firefox の TTF 除外は `scripts/package-source.js <variant> --stage <chrome|firefox> <新規dir>` に一本化している（事前に `build-variant` で manifest を生成する）。

### CI 自動公開（`.github/workflows/publish.yml`）

- トリガーは main のコミットに付けた軽量タグ `v<X.Y.Z>` の push。`workflow_dispatch` は再開・対象指定用。Secrets を使う step より前にタグの形・軽量タグ・main の祖先を確認する。
- 公開前ゲートの `verify` job（`verify.yml` を呼ぶ）が依存検証・除外判定・配布 stage 規則・共通部品同期・両 variant のビルド・`verify-style-injection.cjs`・アーカイブ verifier・各 publisher の fixture テストを実行し、失敗すると publish は走らない。`verify.yml` は main への push と全 PR でも動く。
- タグの `X.Y.Z`、`variants/<variant>.json` の `version`、生成 `manifest.json` の `version` が一致しなければ該当 variant の job は失敗する。
- 公開workflowはネイティブgit・公式BunアーカイブとSHA-256検証・PowerShellのHTTP publisherを使い、公開専用CLI/NodeActionsは使わない。CWS・AMO workflow は同じ repository 固定の concurrency group で直列化し、提出中は Dashboard など他の公開操作を並行しない。

#### Chrome Web Store

- 拡張機能 ID は variant から `CWS_EXTENSION_ID_<UPPER>`（immutable）を選ぶ。`CWS_CLIENT_ID` / `CWS_CLIENT_SECRET` / `CWS_REFRESH_TOKEN` / `CWS_PUBLISHER_ID` は全 variant 共通。アップロードは `scripts/Publish-Cws.ps1`（API v2）。必須情報不足なら Dashboard の Privacy practices を入力し、提出状態を確認して手動再開する。
- `publish.yml` は `-Stage Upload` で下書きをアップロードするだけで申請しない。Dashboard（Edictora）でロケール別掲載画像などを整えた後、`gh workflow run cws-submit.yml -f version=x.y.z --ref vx.y.z` で申請（`-Stage Publish`、variant ごとの matrix）する。
- `cws-submit.yml` が `:publish` するのは、実行 ref が `main` の祖先の軽量タグ `v<version>` で manifest の版が入力と一致し、`publish.yml` の直近のアップロード成功 run（ステップ名 `Chrome Web Store にアップロード（下書き）`、job 名 `Publish <variant>`）が同じ commit・同じタグから起動している場合だけ。同版が申請済み・公開済みなら再送せず成功終了する。別版の審査中・より新しい版の存在・アップロード進行中/失敗・状態不明は停止する。Dashboard で手動アップロードした下書きは申請されないので Dashboard から手動で申請する。

#### Firefox AMO

- 最終XPIを verifier で照合し、SHA-256・GUID・version を `scripts/Publish-Amo.ps1`（PowerShell 7.2 以上）へ渡す。JWT 認証、非公開 listed 版の検査、upload 検証、既存 GUID への PUT 提出の受付応答まで確認する。保存 UUID の再利用・重複・不明な受付結果は停止する。CI 成功は審査完了・公開を意味しない。
- `firefox-build/` は CI で `package-source.js --stage firefox` により構築する。gecko id は `variants/<variant>.json` の `geckoId` から `manifest.json` へ注入される。`AMO_JWT_ISSUER` / `AMO_JWT_SECRET` は全 variant 共通。
- 新 variant の初回登録は AMO Developer Hub の「Submit a New Add-on」で行う（publisher は登録済み GUID 専用で 404 では停止する）。default は登録済み。
- AMO はアカウント単位で提出を制限する。throttle 時は表示時間を待ち、提出状態を確認してから手動再開する。連続再試行しない。

## Critical Constraints

### Manifest content_scripts のロード順（絶対）

宣言的 content script は `manifest.template.json` で定義し、`build-variant.js` が exclude_matches を注入する。MAIN world の `inject.js` とプリセット JS は `background.js` が同じ excludeMatches で動的登録する。

```
src/content/youtube-target.js — ISOLATED (静的・動的 preset に先行する対象判定)
src/content/variant.js        — ISOLATED (VARIANT を font-config 前に定義)
src/content/font-config.js    — ISOLATED (mergeFontSettings は VARIANT に依存)
src/content/preload-fonts.js  — ISOLATED (main script)
動的: src/content/inject.js   — MAIN     (有効時のみ Shadow DOM intercept)
動的: youtube-target.js → src/css/preset-*.js — ISOLATED (有効時のみ選択プリセット)
```

Service Worker（`background.js`）も `importScripts('/src/content/variant.js', '/src/content/font-config.js')` を同順で呼ぶ。

### CSS — 対象要素を明示したセレクタ

アイコンフォントを壊さないよう、`*` や `:is(pre, code) :not(i, .icon)` のような暗黙の全要素指定を使わない。`:root :is(pre, code, kbd, samp, ...)` はコンテナに適用して継承させ、`[style*="monospace"]` は該当要素だけを対象にする。編集領域は通常ルールと分離し `font-family: revert !important` で戻す。

### Performance — preload-fonts.js は Hot Path

全ページ・全フレームの `document_start` で実行されるため:
- 同期処理を最小限にし、DOM が空の状態での無意味な `querySelector` を避ける。
- `MutationObserver` のコールバックは `_replaceFontApplied` フラグで早期 return する。
- debug 用 `chrome.runtime.sendMessage` を本番に残さない。
- `scanDynamicFontFamilies` は `document.fonts.size` キャッシュ + `'__' startsWith` 早期 reject + `requestIdleCallback` debounce。`loadingdone` では `event.fontfaces` だけを同期確認し、未注入の動的 family があるか `event.fontfaces` が使えなければ件数キャッシュを無効化して次の走査を強制する。`document.fonts` 全体の反復はイベントごとには行わない。

### CSP の制限

`font-src` / `default-src 'none'` の厳格 CSP サイトでは拡張 URL の `url()` がブロックされ、`local()` フォールバックのみ動作する。拡張側では回避不可。

### Cross-Browser

Chrome / Firefox desktop 140+ / Firefox Android 142+ を単一コードで対応する。gecko id は variant から注入し、Chrome は `browser_specific_settings` を無視する。`chrome.runtime.getURL('')` が取得できない場合、`preload-fonts.js` は URL を組み立てずに処理を止める。popup のフォントは拡張内の相対パスを使う。

Firefox MV3 では AMO が `background.service_worker` 単独を拒否する。`manifest.template.json` は service worker のみを定義し、`bun scripts/build-variant.js <variant> --firefox` が `variant.js`、`font-config.js`、`background.js` の順で `background.scripts` を追加する（`zip.ps1` と CI も同経路）。Chrome は `--firefox` なしで生成する。event page では `importScripts` が使えないため、`background.js` は `typeof importScripts === 'function'` でガードする。

### その他の制約

- `web_accessible_resources` に `src/fonts/*.woff2` と `src/css/replacefont-extension.css` を含める（後者は Path B の fetch + placeholder 解決に必須）。`inject.js` は動的登録のため WAR に含めない。
- 宣言的 `all_frames: true` と動的登録 `allFrames: true` を揃える（iframe 内も対象）。`run_at` は `document_start`。
- `extension_pages` CSP: `script-src 'self'; object-src 'self'; base-uri 'self'; form-action 'none'`。
- M PLUS 2 / Murecho は variable font で Regular/Bold が同一 woff2。
- popup のフォント変更はページリロードが必要（CSS は `document_start` で一度キャッシュされる）。CSS ファイルの相対 URL はページオリジンに解決されるため、JS を登録して `chrome.runtime.getURL()` で絶対 URL を構築する。

## 依存管理

- 固定復元は `bun run deps`（lock 欠落・破損を拒否し、`[run] bun=true` で postinstall も Bun 実行）。通常の `bun install` 直接実行へ戻さない。ローカルでは `bun audit` で監査する。警告を除外・成功扱いにしない。
- Dependabot の通常更新 PR は維持し、Dependency validation で検証する。手動実行は `mode=pr`（既定、`pr`・`base`・`head` 必須で本人性・最新 SHA・merge parents を検査）と `mode=main`（PR 入力を空にし既定ブランチを選ぶ。run-name `dependency-main-validation sha=...`）。
- 暫定修正: minimatch は 11.0.4 以降、multimatch は named import 対応の 8 系へ override。ESLint 設定の ESM 経路は @eslint/eslintrc@3.3.7 と @eslint/config-array@0.21.2 の最小 import patch。web-ext@10.8.0 の FileFilter は Windows で windowsPathsNoEscape を明示する。
- deepmerge 4.3.1（CVE-2026-93753）は公式修正版が未公開のため `patches/deepmerge@4.3.1.patch`（Bun の patchedDependencies）で `__proto__` 経由の汚染を防ぐ。`bun run test:dependencies` で検証し、公式修正版の採用時に要否を再確認する。
