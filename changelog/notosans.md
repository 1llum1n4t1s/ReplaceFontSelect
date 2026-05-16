# Changelog

## [3.0.5] - 2026-05-16

default variant と同じ Two-Path Injection 戦略の復活 + cxcx 純性能改善 10 件適用。 notosans は lockedFonts=on の挙動が core 機能で、 v3.0.4 改修によるレグレッション (旧来型サイトでの置換失敗) を解消。

### Fix
- **旧来型サイト (x.com / Yahoo 等) で置換が効かない問題を解消**: `setupStyleSheetMonitor` + Path B fetch を v3.0.3 ベースで復活
- **all_frames: true に復元**: iframe 内のフォントも置換対象

### Performance (cxcx report の純性能改善 10 件)
- scanDynamicFontFamilies size cache + early reject + idle debounce
- Shadow DOM observer microtask coalescing
- @font-face ASCII case-insensitive dedupe
- preload tag top frame + Regular のみ
- getFontFamilyName WeakMap キャッシュ
- updateContentScripts 移行 (atomic 1 API)
- setupStyleSheetMonitor 初回走査を DOMContentLoaded まで遅延 (2-tier)
- earlyStyleBuffer cap 50
- **lockedFonts variant 用 ZIP 最小化**: notosans は preset-noto-sans-jp-udev-gothic-jpdoc-w400.js のみ同梱 (-2.43 MB)

## [3.0.4] - 2026-05-16

default variant と同じ大規模リファクタを notosans にも適用 (preload-fonts.js / generate-css.js / font-config.js は variant 非依存で共有)。 加えて exclude_matches を default と同じ 17 ドメインに同期。

### 🚨 致命的 bug 修正
- **MARKER 不可視文字バグ**: `scripts/generate-css.js:431` の `const MARKER = '\x01'` (ASCII 制御文字 SOH) を split/join 区切りに使っていた時限爆弾を escape → `${B}` 直接置換 + sanity check に書き換え。 エディタ自動正規化で剥がれたら 36 preset 全壊するリスクを根絶

### ⚡ パフォーマンス改善 (rere 統合レビュー 26 件全件適用)
- **Single-Path Injection** (Path A 一本化、 旧 Path B 削除): preload-fonts.js を 795 → 約 470 行に短縮
- **Cascade 後勝ち戦略** (`ensureExtensionStyleAtEnd`): 旧 `setupStyleSheetMonitor` の deleteRule 連発を廃止、 head 末尾配置 + `font-display:swap` で勝つ
- **chrome.alarms 移行**: setTimeout debounce + retry を chrome.alarms に置換 (SW evict 耐性)、 manifest に `alarms` permission 追加
- **scanDynamicFontFamilies**: size キャッシュ + LRU 200 上限 + microtask debounce
- **MutationObserver coalescing**: drop → 蓄積方式に変更、 取りこぼし防止
- **idleScan chained schedule**: deadline 切れ後の中断再開対応
- **extStyleEndObserver 振動防止**: throttle + disconnect/observe で自己発火サイクル切断
- **bfcache 復帰対応**: pagehide で `event.persisted=true` ガード、 observer 群を維持
- **`@font-face` ASCII case-insensitive dedupe**: 337 → 302 個
- **CSS cascade 戦略**: `:not(:where(...))` 巨大 negation 廃止 → 編集領域に `revert` リセット
- **`use_dynamic_url: true`**: web_accessible_resources に追加 (fingerprinting 防御)
- **`updateContentScripts` 移行**: unregister + register の 2 API call を 1 回に統合

### 🎨 CSS / Bootstrap 対応
- **Bootstrap 5 用 `--bs-*` 変数追加**: `--bs-font-sans-serif` / `--bs-body-font-family` / `--bs-font-monospace` を CSS 変数オーバーライドに追加
- **all_frames: false**: iframe (広告 / 埋め込み) 注入を廃止、 long_tasks 削減

### 🎯 exclude_matches 拡張
default と同じ 17 ドメインに同期。 v2.0.53 までの 4 ドメイン (Office / SharePoint / Google Docs 等) に加えて以下 13 ドメインを追加:
`*.figma.com` / `www.canva.com` / `express.adobe.com` / `www.notion.so` / `app.slack.com` / `linear.app` / `*.github.dev` / `vscode.dev` / `replit.com` / `codesandbox.io` / `stackblitz.com` / `www.overleaf.com` / `discord.com/app`

### 🗑️ 削除
- **STEALTH (`chrome.storage.session.rfs_failure_<origin>` ステルス検知)**: write-only で誰も読まないコードを削除 (popup UI 復活時に再実装予定)
- **設定ファイルの整合性**: notosans variant ファイル群 (`variants/notosans.json` / `icons/notosans/` / `docs/notosans/` / `changelog/notosans.md`) は v3.0.4 で **一旦削除 → 復活**。 内容は v3.0.3 ベースで継続

## [2.0.53] - 2026-05-10

### 🛡️ 機能バグ修正

- **SHADOW_BATCH_MAX 飽和時の Shadow DOM 永続未処理を解消**: DoS 緩和無効化・属性永続残留・永続スキップの 3 問題を 1 修正で同時解決 (`processed` カウント位置 + `removeAttribute` 順序 + 上限超過時 `queueMicrotask` 持ち越し)
- **bfcache 重複注入の根絶**: `pagehide` での `documentApplied` / `sharedStyleSheetPromise` / `dynamicFontStyleNode` 等の過剰リセットを撤回し、保持された DOM・`adoptedStyleSheets`・`<style>`・`FontFaceSet` を再利用する形に統一
- **`scanDynamicFontFamilies` の size-only ガード削除**: SPA が同サイズで family を差し替えるケースの新規分を見逃すバグを解消

### 🏗️ 内部改善

- **ShadowRoot expando → WeakMap 化** (`shadowState`): ShadowRoot 自体への状態プロパティ汚染を回避
- **`DYNAMIC_FONT_PATTERN` / `MONO_KEYWORD_PATTERN` を `font-config.js` に集約** (FontFaceSet 移行 Phase 1)
- **`earlyStyleBuffer` cap 到達時の処理を `splice` 一括ドロップ化** (`shift` O(n) → amortized O(1))
- **動的フォント注入を `textContent` + 専用バッファ** に変更 (CSSOM 部分再評価のオーバーヘッド削減)
- **`getCSSText` の `clearTimeout` を `finally` 保証** (タイマーリーク防止)
- **`setupStyleSheetMonitor` 早期 return 時に再試行可能化**
- **`flushMutationQueue` の先祖フィルタ撤回**: フラット sibling burst での O(N²) overhead を削除し、`shadowState` による `injectCSS` skip で重複走査コストを許容する判断に
- **`stopEarlyHeadMonitor.__skipBuffer` デッドコード除去**

### 🎯 exclude_matches 拡張

- WYSIWYG ドキュメントエディタ系を完全除外: `*.onenote.com`, `*.officeapps.live.com`, `docs.google.com` (フォントが原稿の一部となる用途のため、`EDITABLE_SELECTORS` ではなくドメインレベルで除外)

### 📚 ドキュメント・ライセンス

- `src/fonts/LICENSE` に UDEV Gothic JPDOC コピーライト追記
- `docs/privacy.html` 英語版 Last Updated を `April 18, 2026` に修正
- `CLAUDE.md` 整合化: 行数表記 `~660` → `~775`、`exclude_matches` 運用方針セクション追加、フォント切替時の手動修正リスト追加、bfcache 復帰挙動の記述更新

## [2.0.52] - 2026-04-19

### 🎯 大改修: アーキテクチャ刷新・品質改善一括適用

Shadow DOM 処理・動的フォント検出・競合 @font-face 中和など、ランタイムの主要経路を全面的に再設計。

### 🛡️ セキュリティ

- `data-rfs-shadow` 属性と `replace-font-shadow-created` イベントによるスプーフィング耐性強化: 1 マイクロタスクあたり `SHADOW_BATCH_MAX = 512` で DoS 抑制
- `escapeFamilyName()`: `DYNAMIC_FONT_PATTERN` による主防壁に加えて `\` / `"` エスケープを追加（防御深化）
- `inject.js` の `console.debug` を `DEBUG = false` ガード（MAIN world でページ側から丸見えだった問題）
- `getCSSText()` / `getSharedStyleSheet()` に **self-identity チェック** を導入して、bfcache 突入時の非同期 race で新 Promise を踏み潰すバグを修正
- `fetchFailureAt` (`FAILURE_TTL_MS = 5000`) による fetch ストーム throttle を復活
- `processStyleNode()` の LINK ノード処理で `isConnected` チェック追加（detached link の load リスナー leak 防止）

### 🏗️ 内部改善

- **`src/content/font-config.js` を新設**: `BODY_FONT` / `MONO_FONT` 定義を単一の真実の源泉に集約。content_scripts と `scripts/generate-css.js` (Node require) の両方から参照され、手動同期が不要に
- `injectCSS()` の `catch` 内でも retry カウンタをインクリメント（以前は `null cssText` 分岐でしか増えず、ShadowRoot detach 時に無限再試行する経路があった）
- `injectToDocument()` を分離: メインドキュメントへの CSS 適用に `document.adoptedStyleSheets` を使用（~10ms CSSOM パースコスト削減）。フォールバックは `<style>` タグ
- `setupStyleSheetMonitor(ownSheet?)` が共有シートを引数で受け取って `querySelectorAll` introspection を省略する高速パスを持つ
- `onPagehideDispose(e)` が `e.persisted` チェック: bfcache 突入時はリスナー保持、最終アンロード時のみ dispose
- bfcache 突入時の状態フラグ (`initialized` 除く `documentApplied`, `styleSheetMonitorActive`, `preloadInjected` 等) を `onPagehideCacheClear` でリセットし、pageshow 復帰時に再適用
- MutationObserver コールバックが `pendingMutationNodes` Set に蓄積 → `queueMicrotask` でバッチ flush（以前は同期 TreeWalker で YouTube 等 10k 要素ページがブロックされる懸念）
- `earlyStyleBuffer` を `EARLY_STYLE_BUFFER_CAP = 1024` で FIFO 上限化（CSS fetch が永続失敗する環境でのメモリリーク防止）
- `runFontHealthCheck()`: 初期化 1.5 秒後に `document.fonts.check()` でロード確認。CSP `font-src` ブロック等の silent failure を `console.info` で可視化
- `validateConsistency()` 強化: `BODY_FONT.name` だけでなく `localFontsRegular` / `localFontsBold` の全エイリアスが `GOTHIC_FAMILIES` と衝突しないかチェック、衝突時は `process.exit(1)`
- `GOTHIC_FONT_FAMILIES` から `Noto Sans CJK JP` を削除（`BODY_FONT.localFontsRegular` に含まれるため自己参照だった）
- `exclude_matches` の運用を再構成: 決済/CAPTCHA 系の旧エントリを整理し、後続コミットで WYSIWYG エディタ系（OneNote / Office Online / Google Docs）に対象を絞った再導入を実施

### 🎨 UI

- popup を明示的な Light / Dark テーマ対応に刷新（`prefers-color-scheme`）。`Aa` アイコン、ステータスドット、フォントタグ一覧のクリーンなデザインに
- ライトテーマを基本に、視認性と情報密度のバランスを再設計

### 📚 ドキュメント

- `CLAUDE.md` を現実装に合わせて全面改訂（postMessage / isAcceptableCSS / APPLIED_FLAG / pendingClosedRoots / fetchFailureCache 等、削除済みの参照を一掃。行数・定数名も実際の値に修正）
- `sync-version.js` のバージョン同期対象に `docs/privacy.html` を追加

### 🗑️ 削除

- `manifest.json` の `minimum_chrome_version: "102"` 記述（declarative world: "MAIN" サポートの要件として CLAUDE.md に参考記述のみ）
- closed Shadow DOM 対応（`postMessage` / `isAcceptableCSS` / `pendingClosedRoots` / `APPLIED_FLAG` / `PAYLOAD_TYPE`）: 実世界での closed Shadow DOM 使用は稀で、複雑なクロスワールド通信に見合う価値がないため削除。影響は限定的

## [2.0.50] - 2026-04-18

> ⚠️ 注: このエントリの "exclude_matches (Stripe/PayPal/reCAPTCHA...) を追加" は v2.0.50 時点で実装済みだったが、
> v2.0.52 のアーキテクチャ刷新で一旦 **整理** された（決済/CAPTCHA 系の旧エントリを撤去）。
> その後、WYSIWYG エディタ系（OneNote / Office Online / Google Docs）に対象を絞った `exclude_matches` を再導入している（最新の状態は manifest.json を参照）。

### 🛡️ セキュリティ

- `inject.js` を `world: "MAIN"` 宣言式 content_scripts に移行し、`web_accessible_resources` からの露出を解消
- `postMessage` で受信する CSS を構造検証 (`@import` / 外部 `url()` / `expression()` / `behavior:` / `javascript:` / `<script` 排除、長さ上限 1MB)
- `manifest.json` に明示的 CSP と `exclude_matches` (Stripe/PayPal/reCAPTCHA/hCaptcha/Cloudflare/Google/Microsoft/Auth0) を追加
- `.github/workflows/publish.yml` を SHA pin 化、`|| npm install` フォールバック撤廃、`chrome-webstore-upload-cli` を `devDependencies` に固定

### ⚡ パフォーマンス

- MutationObserver を `queueMicrotask` でバッチ化して O(M×N) → O(M+N) に改善
- `pagehide` で MutationObserver を disconnect してリスナー永続発火を防止
- `createPreloadTag()` をトップフレーム限定にして iframe 重複注入を解消
- `FontFace.load()` を削除して二重フォント取得を撤廃
- fetch 失敗時の負キャッシュ + リトライ永久ロック撤廃 (30s 後に自動リセット)

### 🏗️ 内部改善

- `scripts/sync-version.js` を新設してバージョン同期処理を一本化 (zip.sh / zip.ps1 / publish.yml の 3 重実装解消)
- `APPLIED_FLAG` を inject.js / preload-fonts.js で統一、`adoptedStyleSheets.includes()` ガード追加
- `pendingClosedRoots` Set を 256 件 FIFO 上限化でメモリリーク緩和
- `GOTHIC_FONT_FAMILIES` から `Noto Sans JP` / `Noto Sans CJK JP` の自己参照削除
- フォント名 CSS エスケープ + `local()` を `webFontUrl` の後ろに移動 (fingerprint 緩和)
- マジック値を `MAX_RETRY_COUNT` / `CHUNK_SIZE` / `IDLE_TIMEOUT_MS` 等で定数化

### 📚 ドキュメント

- `docs/privacy.html` の最終更新日を `privacy-policy.md` と同期
- `CLAUDE.md` を新アーキテクチャに追従

## [2.0.49] - 2026-04-18

- fix: フォントパス追従・Closed Shadow DOM対応・エディタ除外CSS (#16)
- ci: Chrome Web Store 自動公開ワークフローを追加

## [2.1.0-archived] - 2026-01-17

> 注: このエントリは当時の実験系統（`*` ユニバーサルセレクタ方式）の記録で、現行 2.0.x 系列（`@font-face` 再定義方式）とはアプローチが異なる。歴史的記録としてのみ保持。本プロジェクトのバージョンは 2.0.x を patch `+1` で進める。

### 🎯 重大な変更

#### フォント置換方式の変更
- **変更前**: `@font-face` でフォント名を再定義する方式
- **変更後**: ユニバーサルセレクタ (`*`) で `!important` を使って強制置換

**理由**: 最新のChromeでは、`@font-face` で定義されたフォントよりもシステムフォントが優先されるため、`@font-face` による置換が機能しなくなりました。

### ✅ 改善点

#### パフォーマンス最適化（Geminiの提案を統合）
- ✅ **iframe処理の重複排除**: `all_frames: true` に完全委任し、親ページからのiframe走査を削除
- ✅ **CSS注入の堅牢性向上**: ID存在チェックとWeakSetの二重チェック
- ✅ **MutationObserverの最適化**: Shadow DOM検出のみに集中
- ✅ **初期化タイミングの改善**: `<head>` 待機ロジックを追加

#### コード削減
- **CSSファイル**: 1,249行 → 81行（93.5%削減）
- **JSファイル**: 296行 → 182行（38.5%削減）
- **合計**: 約1,400行削減

#### 新機能
- ✅ **UDEV Gothic JPDOC**: コードブロック専用フォントを追加
  - プログラミング向けの等幅フォント
  - BIZ UDゴシック + JetBrains Mono の合成
  - 日本語文書頻出記号が全角表示
  - 0（ゼロ）がスラッシュゼロで読みやすい
- ✅ **フォント変換スクリプト**: TTF→WOFF2自動変換機能を追加
  - `npm run convert-fonts` で実行
  - ファイルサイズを約50%削減

### 🔧 技術的な変更

#### 新しいファイル
- `css/universal-override.css` を追加（81行）
  - すべての要素に対して `!important` でフォントを強制適用
  - コードブロック用に UDEV Gothic JPDOC を指定
  - GitHub専用セレクタを追加
- `scripts/convert-fonts.js` を追加
  - TTF→WOFF2変換機能
- `fonts/UDEVGothicJPDOC-Regular.woff2` を追加（1.76MB）
- `fonts/UDEVGothicJPDOC-Bold.woff2` を追加（1.80MB）

#### 削除されたファイル
- `css/replacefont-extension-regular.css`（588行）
- `css/replacefont-extension-bold.css`（661行）
- `scripts/generate-css.js`（170行）

#### 削除された機能
- `processIframe()` 関数（iframe処理は `all_frames` に委任）
- `processPendingIframes()` 関数
- `createPreloadTag()` 関数（フォントpreloadは不要）
- `setupFontForceLoad()` 関数（CSS Font Loading APIは不要）
- デバウンス処理（`pendingIframes`, `debounceTimer`）
- イベントリスナー管理配列

#### 追加された機能
- `<head>` 要素の作成を待機する MutationObserver
- タイムアウト保険（100ms後に再チェック）
- コードブロック専用のフォント指定
- GitHub専用のセレクタ（`.blob-code`, `.blob-code-inner`, `.react-code-text`）

### 🐛 修正されたバグ

1. **iframe処理の重複**: 同一オリジンiframeでCSS二重注入が発生していた問題を解消
2. **初期化タイミング**: `document.head` が存在しない状態でCSS注入していた問題を解消
3. **`@font-face` が機能しない**: システムフォントが優先される問題を、ユニバーサルセレクタで解決

### 📝 既知の制限

- **`srcdoc` 属性を使った iframe**: 動作しません（実際のWebサイトでは問題なし）
- **インラインスタイル**: `!important` で上書きされます

### 🙏 謝辞

このバージョンは、Gemini AIによる詳細なコードレビューに基づいて改善されました。

---

## [2.0.24] - 以前

以前のバージョン履歴...
