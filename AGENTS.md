# AGENTS.md

This file provides guidance to Codex and other coding agents working in this repository.

## Project Overview

**目に優しいフォント置換** — Chrome / Firefox desktop (140+) / Firefox Android (142+) 拡張機能 (Manifest V3) で、 ウェブサイト上の読みづらいフォントを、 ユーザーが選んだ日本語フォントへ自動置換する。本文 7 種 × 等幅 3 種 × Weight (400/500) = 42 通りのプリセットを通常は `document_start` で同期注入する。Chrome の YouTube では非同期 Blob 経路を使い、ちらつきゼロは保証しない。

このリポジトリは **単一コードベース** から複数の派生版 (variant) を別々の拡張機能として公開できる「バリアント方式」を採用している。 現在 `default` (フォント選択 UI 付き) と `notosans` (Noto Sans JP + UDEV Gothic JPDOC 固定版) の 2 variant が定義されており、 それぞれ独立した拡張機能 ID として Chrome Web Store / Firefox AMO に並行リリースされている。 ユーザーの使い分け:
- **default**: フォント選択 UI で好きなフォントを 42 プリセットから選ぶ通常版
- **notosans variant**: 最初から Noto Sans JP + UDEV Gothic JPDOC に固定、 フォント選択 UI なし (popup がシンプル)

両 variant は次のドメインを `exclude_matches` で除外している (フォントが作品 / 編集体験の一部となるサービス保護、 およびアイコンフォント破壊回避のため、 全 18 ドメイン):
- **Microsoft / Google のリッチエディタ / ファイル管理系**: `*.onenote.com` / `*.officeapps.live.com` (Excel/Word/PowerPoint Online) / `*.sharepoint.com` (SharePoint Online — Excel/Word を開いた時のホストオリジン。 `officeapps.live.com` には遷移せず SharePoint オリジン内の iframe で WAC = WebApps Components が動くため別途除外が必要) / `onedrive.live.com` (OneDrive 個人版のファイル管理 UI — Fluent UI / FabricMDL2Icons のアイコンフォントが本文置換の巻き添えになるため除外。 OneDrive for Business は `*.sharepoint.com` 経由で別途カバー済) / `docs.google.com` (Docs / Sheets / Slides / Forms)
- **デザインツール系**: `*.figma.com` / `www.canva.com` / `express.adobe.com`
- **リッチエディタ / IDE 系 (v3.1 系で追加)**: `www.notion.so` / `app.slack.com` / `linear.app` / `*.github.dev` / `vscode.dev` / `replit.com` / `codesandbox.io` / `stackblitz.com` / `www.overleaf.com` / `discord.com` (アプリ本体は `/channels/*` 配下で `/app/*` にはマッチしないため、 Notion / Linear と同じくドメイン全体を除外)

**多言語対応**: `@font-face` の `unicode-range` は **省略する** (オープン範囲のまま運用)。 置換フォントのグリフカバレッジ範囲がそのまま置換対象となり、 範囲外の文字は CSS font fallback で元サイトの指定 / システムフォントに自然に落ちる。

## Build Commands

```bash
pnpm install --frozen-lockfile         # 初回 checkout 後・pnpm-lock.yaml 更新後の依存同期
pnpm run build:default              # icons + CSS + preset JS + variant=default のフルビルド
pnpm run build:notosans             # icons + CSS + preset JS + variant=notosans のフルビルド
pnpm run build                      # = build:default
pnpm run build-variant <name>       # manifest.json + src/content/variant.js だけ再生成 (variant 切替時)

pnpm run generate-css               # fallback / YouTube 用 CSS + 42 個の preset-*.js を再生成 (variant 非依存)
pnpm run convert-fonts              # src/fonts/*.ttf → *.woff2 変換 (フォント追加時のみ手動実行、 variant 非依存)
pnpm run generate-icons:default     # icons/default/icon.svg から PNG (16/48/128) を再生成
pnpm run generate-icons:notosans    # icons/notosans/icon.svg から PNG (16/48/128) を再生成
pnpm run generate-screenshots:default  # webstore/screenshots/default/*.html → webstore/images/default/*.png (要 puppeteer)
pnpm run generate-screenshots:notosans # webstore/screenshots/notosans/*.html → webstore/images/notosans/*.png (要 puppeteer)
pnpm run sync:support                  # 共有パッケージ正本から問い合わせUIの JS / CSS 5資産を同期
pnpm run check:support                 # 同梱資産が共有パッケージ正本と一致することを読み取り専用で検査
```

`manifest.json`、`src/content/variant.js`、`src/css/replacefont-extension.css`、`src/css/youtube-override.css`、`src/css/preset-*.js` は **ビルド生成物 (.gitignore 済)**。初回 checkout 後と `pnpm-lock.yaml` の変更後は `pnpm install --frozen-lockfile` で依存を同期する。"Load unpacked" の前には対象 variant のフルビルドを 1 回走らせる。`node --test scripts/verify-style-injection.cjs` はソースを直接読み込むためフルビルドは前提にしない。Node.js 22 系を推奨 (CI が `node-version: '22'` で固定。 pnpm 11 が Node 22.13+ を要求するため)。 フォント注入の回帰検証手順は下記 Local Testing を参照。その他の UI 検証は実機ブラウザで行う。

Kagayoi Support の問い合わせUIは、exact pinした `@kagayoi/support-extension` を正本とし、`src/shared/` の `kagayoi-support-footer.{js,css}`、`kagayoi-support-popup.{js,css}`、`kagayoi-support-form.css` へ逐語同期する。これら5資産を拡張側で直接改変しない。`build:default` / `build:notosans` と `zip.ps1` は実行前に自動同期し、CIは `check:support` とChrome ZIP内のCSS存在確認で欠落・乖離を拒否する。共有部品を更新するときは依存versionを更新してから `pnpm run sync:support` と両variantのbuildを実行する。

アイコン / スクショ生成 (puppeteer) は headless Chrome バイナリが必要。 初回のみ `pnpm exec puppeteer browsers install chrome` を実行する (`~/.cache/puppeteer/` に保存され、 未導入だと `build:*` が ChromeLauncher の resolveExecutablePath エラーで落ちる)。 puppeteer は v25+ (ESM-only) のため、 `scripts/generate-icons.js` / `generate-screenshots.js` は CommonJS から動的 `import('puppeteer')` で読み込む。

### Local Testing

- **フォント注入の回帰検証**: `node --test scripts/verify-style-injection.cjs` — Puppeteer の実ブラウザで Shadow 初期化、遅延した外部 CSS / @import、DOM 更新時の再移動、ページの破棄・復帰イベントを検証する。拡張 API は fixture を使用し、Firefox 実機の代替にはしない。
- **Chrome**: `chrome://extensions` → Developer mode ON → "Load unpacked" でリポジトリルートを選択
- **Firefox**: `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on..." で `manifest.json` を選択 (desktop 140+ / Android 142+)
- Firefox の読み込み前はフルビルド後に `node scripts/build-variant.js <variant> --firefox` を実行する。Chrome の検証へ戻るときは `pnpm run build-variant <variant>` で Chrome 用 manifest を再生成する。
- コード変更後は拡張機能リストで再読み込み+対象ページをリロード (preset JS / CSS は `document_start` 時にキャッシュされるため)

問い合わせUIまたはFirefoxの権限申告を変更するときは、[DESIGN.md の送信境界](DESIGN.md#問い合わせuiの共有資産同期)に従い、`manifest.template.json` の申告と共有部品の要求対象、popupの `firefox-data-consent` 属性を照合する。両variantのビルドと `pnpm run check:support` に加え、Firefoxで任意許可を拒否・取得失敗した場合に確認コード送信・再送・認証・問い合わせ送信が止まり、フォント置換は利用できることを検証する。

## Variant System

「同じソースから別ブランドの拡張機能を出す仕組み」の骨組み。 現在 `default` + `notosans` の 2 variant がアクティブで、 publish.yml の matrix strategy で並行リリースされる。 4 つのファイルが連動:

| ファイル | 役割 |
|---|---|
| `variants/<name>.json` | name / description / version / geckoId / lockedFonts / showFontSelector / excludeMatches / zipBaseName を定義 |
| `manifest.template.json` | プレースホルダー入りの manifest テンプレート |
| `scripts/build-variant.js` | template に variant 設定を注入して `manifest.json` と `src/content/variant.js` を生成 |
| `src/content/variant.js` | **ビルド生成物**。 `const VARIANT = {...}` を定義し content scripts / popup / background から参照される |

| Variant | フォント | gecko id 末尾 | 用途 |
|---|---|---|---|
| `default` | ユーザー選択 (7×3×2=42プリセット) | `...323f` | 通常版 |
| `notosans` | Noto Sans JP + UDEV Gothic JPDOC 固定 | `...323e` | フォント選択 UI なしの固定版 |

`mergeFontSettings()` (`src/content/font-config.js`) は **stored → VARIANT.lockedFonts** の順で override を適用 (後勝ち)。 つまり variant が `lockedFonts` を設定している場合 (notosans variant) はユーザーの保存値より優先される。

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

1. `src/fonts/` に TTF を置き `pnpm run convert-fonts` で woff2 化。追加・再生成した WOFF2 には [同梱フォントの描画設定](src/fonts/README.md#同梱フォントの描画設定)を適用して確認する（変換スクリプトは描画設定を自動統一しない）。
2. `FONT_REGISTRY` (`src/content/font-config.js`) の `body` か `mono` にエントリ追加
3. `pnpm run generate-css` で template CSS + 本文 × 等幅 × weight の全組み合わせ preset JS (現在 42 個) を再生成
4. popup / content / background は `FONT_REGISTRY` を動的読みするので他ファイル変更不要

⚠️ **既存フォントキー (`noto-sans-jp` / `udev-gothic-jpdoc`) はそのまま維持する** — `variants/notosans.json` の `lockedFonts` がそのキー名を参照しているので、 既存キーは固定で運用し、 新しいフォントは別キーで追加する。

## Release Automation

### Release Kick-off (`scripts/release.js`)

`scripts/release.js` は `variants/*.json` の version を patch +1 し、 `release/<X.Y.Z>` ブランチを作って push する。 push が CI のトリガーになり、 GitHub Actions の matrix strategy が default + notosans を並列公開する。

```bash
pnpm run release                 # variant patch +1 → release/<X.Y.Z> ブランチ
node scripts/release.js --yes    # 直接呼び（確認プロンプト省略、CI / Codex から）

# フラグ
--dry-run / -n  計画だけ表示。 書き込み・push しない
--yes / -y      対話確認をスキップ
--prune-old     既存の release/* ブランチをリモートから削除
```

#### minor / major bump の運用

このスクリプトは **patch +1 専用** (`/vava` と一貫)。 minor / major bump は手作業:

```bash
# 例: 3.0.5 から 3.1.0 に minor bump する場合
# variants/*.json の全ファイルと package.json の "version" を 3.1.0 に手で書き換え
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
- リモートに同名 `release/<X.Y.Z>` が既存なら abort (force push はしない)
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
- 同じ release branch へ新しい push を行うと両 variant の job が再実行される。`matrix.fail-fast: false` により、一方の失敗で他方の実行が打ち切られることはない
- 判定基準: GitHub Actions ログで「Chrome Web Store にアップロード & 公開」「Firefox AMO に submission API でアップロード」ステップに到達せず、 その前 (build / package step) で失敗していること

### Local Packaging (手動 Web Store アップロード用)
- `.\zip.ps1 [-Variant <name>]` (Windows): `pnpm install --frozen-lockfile` → アイコン / CSS 生成 → variant 適用 → `<zipBaseName>-chrome.zip` + `<zipBaseName>-firefox.xpi` 生成。 引数省略時は `default`
- `./zip.sh [<name>]` (Linux/Mac): Chrome ZIP のみ。 Firefox XPI を含むフルリリースは `zip.ps1` 必須

### `/vava` スキル経由の起動

このプロジェクトに対して `/vava` スキルが起動された場合、Codex は **標準フローを使わず** `pnpm run release`（`scripts/release.js`）に委譲する。

`release.js` は:
- `variants/<name>.json` の version → patch +1 → `package.json` の version も自動同期
- main に 1 commit → push
- `release/<X.Y.Z>` ブランチ作成 → push
- (`--prune-old` で) 古い release ブランチ削除

minor / major bump は手作業 (上述「minor / major bump の運用」参照)。

### CI 自動公開 (`.github/workflows/publish.yml`)

- **トリガー**: `release/<X.Y.Z>` 形式のブランチへの push (例: `release/3.0.3`, `release/3.1.0`)
- **matrix strategy**: 現在 `variant: [default, notosans]` の 2 要素で並列公開。 将来 variant を追加する場合は配列を拡張
- **整合性チェック**: ブランチ末尾の `X.Y.Z` と `variants/<matrix.variant>.json` の `version` と生成された `manifest.json` の `version` が一致しないと該当 variant のジョブが失敗
- **公開先**: Chrome Web Store と Firefox AMO の **両方** に並列公開

#### Chrome Web Store
- **拡張機能 ID の選択**: matrix の variant 値から `case` 文で `CWS_EXTENSION_ID_<UPPER>` シークレットを選ぶ (`default` → `CWS_EXTENSION_ID_DEFAULT`)
- **共通シークレット**: `CWS_CLIENT_ID` / `CWS_CLIENT_SECRET` / `CWS_REFRESH_TOKEN` / `CWS_PUBLISHER_ID` は全 variant 共有 (同一 Google アカウントの OAuth 認証情報 + publisher ID。 publisher ID は secrets.json の `chrome_web_store.publisher_id` にも保管)
- アップロードツール: `chrome-webstore-upload-cli` v4 exact pin。 **v4 から認証情報は CLI フラグ廃止・環境変数のみ** (`CLIENT_ID` / `CLIENT_SECRET` / `REFRESH_TOKEN` / `PUBLISHER_ID` / `EXTENSION_ID`)、 サブコマンドなし実行で upload + publish を一括 (`--auto-publish` フラグは v4 で削除済み)

##### Privacy practices タブの落とし穴 ⚠️

Chrome Web Store は公開リクエスト時に **Developer Dashboard の「Privacy practices」タブの入力を必須**としている。 未入力だと `chrome-webstore-upload-cli` が HTTP 400 で失敗する:

```
Error: Bad Request
  response: { error: { code: 400, message: 'Publish condition not met: To publish your item,
    you must provide mandatory privacy information in the new Developer Dashboard:
    https://chrome.google.com/webstore/devconsole. Click on your item from the home page
    and enter this information on the Privacy practices tab.' } }
```

**対処** (一度入力すれば以降のリリースで再発しない):
1. https://chrome.google.com/webstore/devconsole にアクセス
2. 拡張機能を選択 → 左メニュー「Privacy practices」タブ
3. single-purpose / data usage / data collection を全て入力 → 保存
4. CI を fast-forward 再 push で retry (バージョン消費なし)

**過去事例**: v3.0.4 リリース (run #25952259808) で踏んだ。 v3.0.3 までは Privacy practices タブが必須化される前にリリースされていたため通過していたが、 Google が Manifest V3 ポリシー強化 (2024-2026) で必須化。

#### Firefox AMO (addons.mozilla.org)
- **アップロードツール**: `web-ext sign --channel=listed` (exact pin、 Node 20 要件、 web-ext 10+ では submission API がデフォルト動作で `--use-submission-api` フラグは渡さない)
- **ソースディレクトリ**: `firefox-build/` を CI 内で構築 (Chrome ZIP と同じ `manifest.json + icons/<variant> + src` 構成、 TTF / preview.html / OS メタファイル除外)
- **gecko id (extension 識別子)**: `variants/<variant>.json` の `geckoId` から `build-variant.js` 経由で `manifest.json` の `browser_specific_settings.gecko.id` に注入される
- **共通シークレット**: `AMO_JWT_ISSUER` / `AMO_JWT_SECRET` は全 variant 共有 (同一 Mozilla アカウントの JWT credentials)
- **レビュー**: `--channel=listed` は AMO の人間レビューが入る。 submission API は受付完了で job 成功扱いとなり、 実際のストア反映は別事象
- **API キーの発行**: https://addons.mozilla.org/ja/developers/addon/api/key/ で JWT issuer / secret を生成し、 `gh secret set AMO_JWT_ISSUER` / `gh secret set AMO_JWT_SECRET` で登録

##### AMO API rate limit の落とし穴 ⚠️

AMO submission API は **アカウント単位で厳格な rate limit** がある。 短時間で複数バージョン or 同 version 再 push を繰り返すと throttle 発動:

```
WebExtError: Submission failed (2): Unknown Error
{ "detail": "Request was throttled. Expected available in 48547 seconds." }
```

48547 秒 ≒ **13.5 時間**。 解除されるまで待つしかない (Mozilla 側でリセット手段なし)。

**対処**:
1. **時間を置いて retry**: 表示秒数を待ってから fast-forward 再 push
2. **手動 submission に切替**: https://addons.mozilla.org/ja/developers/ → 該当 add-on → 「新しいバージョンを送信」から XPI を手動 upload (rate limit 別枠の可能性あり、 未検証)
3. **1 回失敗したらクールダウン**: 同セッションで連続再 fire する代わりに、 1 回目の失敗原因 (Chrome 側など) を解消してから 1 回だけ retry する

**過去事例**: v3.0.4 リリース (run #25952259808) で踏んだ。 Chrome 側の Privacy practices 必須化と同じ run で発生 → 両方失敗してリカバリー難度上昇。 1 回成功した後の連続再試行で発動する印象。

#### AMO 初回登録 (CI 自動公開の前提条件)

新 variant の初回登録は CI からは自動化できない (CI の `web-ext sign` は **既存 add-on への新バージョン提出のみ**)。 次のいずれかで事前に初回 submission を済ませる:

- **default variant**: 登録済み (`{ee49eeb2-93a9-4062-ba75-06610054323f}`)
- **将来 variant**: 下記方法 A or B で初回登録

##### 方法 A: ローカル `web-ext sign` で API 経由初回登録 (推奨)

`web-ext sign --channel=listed` は manifest の `gecko.id` が AMO 上に存在しない場合、 **新規 add-on として自動作成**する。 listed channel に必要な必須メタデータは `--amo-metadata=metadata.json` で渡す:

```bash
# 1. ローカルでビルド
pnpm run build:<variant>

# 2. Firefox用manifestへ切替後、firefox-build/ ディレクトリ構築 (CI と同じホワイトリスト)
node scripts/build-variant.js <variant> --firefox
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
  pnpm exec web-ext sign \
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
- Actions は SHA pin、 `pnpm install --frozen-lockfile` 固定、 `chrome-webstore-upload-cli` / `web-ext` を devDependencies に exact pin して `pnpm exec` で integrity 検証済みのローカル版を呼ぶ

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

CSS は **常に対象要素を明示** する。 `*` や暗黙的なユニバーサル相当のセレクタは Font Awesome / Material Icons / codicon のアイコンフォントの `font-family` を破壊するので、 対象を絞ったセレクタを書くこと。

- ❌ `* { font-family: ... }` — ユニバーサル相当、 アイコンフォント破壊
- ❌ `:is(pre, code) :not(i, .icon)` — `:not()` 単独の子孫セレクタは `*:not(...)` と同義
- ✅ `:root :is(pre, code, kbd, samp, ...)` — コンテナ要素自体にマッチ (継承で子孫へ伝播)
- ✅ `[style*="monospace"]` — インラインスタイルを持つ要素のみ
- ✅ `revert` リセット戦略: 通常ルール (negation なし) → 編集領域に separate ルールで `font-family: revert !important` (v3.x で導入)

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

Chrome / Firefox desktop 140+ / Firefox Android 142+ を単一コードで対応:
- 使用している `chrome.*` API は全て Firefox の `chrome.*` 名前空間でも動作 (`browser.*` リライト不要)
- `chrome.scripting.registerContentScripts` の `persistAcrossSessions` / `world` は Firefox desktop 140+ / Android 142+ で対応
- `chrome.scripting.updateContentScripts` (v3.x で導入、 unregister+register の atomic 化) も同じ下限で対応
- gecko id は variant ごとに `variants/<name>.json` の `geckoId` から注入される (Chrome は `browser_specific_settings` を silently ignore)
- `chrome.runtime.getURL('')` は両ブラウザで正常動作するため、 `getExtensionBaseURL()` の Chrome 固有フォールバック (`chrome-extension://${runtime.id}`) には到達しない
- `src/popup/style.css` のフォントは相対パス (`../fonts/...`) を使い、 拡張機能オリジン内で両ブラウザが解決する

### Firefox MV3 — background は service_worker と scripts の併記必須 🚨

AMO validator は `background.service_worker` 単独を **reject** し、 `background.scripts` を Firefox-compatible fallback として要求する:

```
Error: Unsupported "/background/service_worker" manifest property used
       without "/background/scripts" property as Firefox-compatible fallback.
```

[manifest.template.json](manifest.template.json) は `service_worker` のみを定義する。Firefox 用には `node scripts/build-variant.js <variant> --firefox` で、次のように `scripts` を併記した manifest を生成する (`zip.ps1` と CI もこの生成経路を使う):

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

- **Chrome**: `--firefox` を付けずに生成し、`service_worker` のみで SW として動作 ([background.js](src/background/background.js) が `importScripts('/src/content/variant.js', '/src/content/font-config.js')` で順次ロード)。Chrome 用成果物には `scripts` を含めない。
- **Firefox**: `scripts` を見て event page として動作 (3 ファイルが順次ロード、 `importScripts` は worker 限定 API なので使えない)

そのため [src/background/background.js](src/background/background.js) では `importScripts` を `typeof` ガード:

```js
if (typeof importScripts === 'function') {
  importScripts('/src/content/variant.js', '/src/content/font-config.js');
}
```

これがないと Firefox の event page で `ReferenceError: importScripts is not defined` で background script 全体が落ちる。 過去に release/3.0.3 でハマって解消済み。

### その他の制約

- `web_accessible_resources` に `src/fonts/*.woff2` と `src/css/replacefont-extension.css` を含める。 後者は Path B で `preload-fonts.js` が fetch + placeholder 解決して注入するために必須
- `src/content/inject.js` は `background.js` が拡張機能パッケージ内のファイルとして MAIN world へ動的登録するため WAR に含めない (攻撃対象面の縮小)
- 宣言的 `content_scripts.all_frames: true` と動的登録の `allFrames: true` を揃え、top + iframe 全フレームを対象にする。 iframe 内 (広告 / 埋め込みウィジェット) のフォントも置換対象になる
- `extension_pages` CSP: `script-src 'self'; object-src 'self'; base-uri 'self'; form-action 'none'` (base-uri / form-action は defense-in-depth)
- M PLUS 2 / Murecho は variable font — Regular/Bold が同一 woff2 から取得される
- `manifest.json` の `run_at: "document_start"` で最早期に注入
- popup でのフォント変更は **ページリロードが必要** — CSS は `document_start` 時に一度キャッシュされる
- `chrome.scripting.registerContentScripts` で CSS ファイル内の相対 URL はページオリジンに解決される (拡張オリジンではない)。 そのため CSS ではなく JS を登録して `chrome.runtime.getURL()` で絶対 URL を構築する設計
