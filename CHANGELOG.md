# 変更履歴

Git のバージョン記録・コミット差分と既存の変更履歴をもとに、確認できた版ごとの変更点をまとめています。「Git 記録日」は公開日ではありません。番号の欠番だけから未確認のリリースは補っていません。

## 未リリース

## [3.0.17] — Git 記録日: 2026-09-05

- **フォントの描画設定を統一**: 同梱フォントの滑らかさ・輪郭補正に関する設定を揃え、表示環境に応じた描画を調整
- **closed Shadow内の置換漏れを修正**: ページ部品の初期化で拡張CSSが上書きされ、フォント置換が消える問題を修正
- **後から読み込まれる外部CSSへの対応を改善**: 外部CSSやimport先の規則を読み取れない場合も、本文内への追加を含めて拡張CSSを後から適用し、置換を維持

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/629eb37bb4d76fb94d90733da84d770d1b496c81) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/94b7106541310ba00b12750d09f5481a1699d1d7...629eb37bb4d76fb94d90733da84d770d1b496c81) / [フォント選択版の詳細](changelog/default.md) / [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [3.0.16] — Git 記録日: 2026-09-05

- **Firefoxのお問い合わせ権限を整合**: 個人識別情報・認証情報の送信許可をインストール・更新時の必須権限に変更。通信内容は送信前に任意の許可を求め、拒否時もフォント置換は利用可能。実際の送信はお問い合わせ操作時のみ
- **M PLUS Rounded 1cを追加**: 本文用の丸ゴシックを追加し、7種の本文フォントから選択可能に
- **言語切替UIの表示を修正**: コード以外の言語切替ボタンなどが等幅フォントになる問題を修正

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/94b7106541310ba00b12750d09f5481a1699d1d7) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/f04265183ec7b923331801ac72f00ba2a0136317...94b7106541310ba00b12750d09f5481a1699d1d7) / [フォント選択版の詳細](changelog/default.md) / [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [3.0.15] — Git 記録日: 2026-08-30

- **お問い合わせダイアログのスクロールを修正**: ダイアログ表示中は設定ポップアップ本体を固定し、二重スクロールバーを防止。閉じた後は元の表示位置とフォーカスを復元
- **ライト／ダークテーマ表示を改善**: 共通フォームの配色と選択肢背景をテーマへ追従させ、狭いポップアップでも読みやすく表示
- **問い合わせ用CSSの同梱を保証**: 共通部品をビルド前に同期し、CIとストア用ZIPで必須CSSの欠落を検出して、スタイル無しのフォームが配布される問題を防止

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/f04265183ec7b923331801ac72f00ba2a0136317) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/ec74f40704f1a683efa1c977ee7bc2614fd3ef7c...f04265183ec7b923331801ac72f00ba2a0136317) / [フォント選択版の詳細](changelog/default.md) / [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [3.0.14] — Git 記録日: 2026-08-27

- **お問い合わせフォームを追加**: 設定ポップアップからメール認証付きで Kagayoi Support へ問い合わせを送信可能
- **Firefox のデータ送信許可に対応**: 問い合わせ情報を送る直前にブラウザの許可を取得し、拒否時は送信しない
- **Google AdSense のページ見出しを保護**: 「ホーム」の横に上下のトグル風グリフが表示される問題を修正

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/ec74f40704f1a683efa1c977ee7bc2614fd3ef7c) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/6f981f8ffb8cc3a7bec3cb9e4a22e30ef62aadd9...ec74f40704f1a683efa1c977ee7bc2614fd3ef7c) / [フォント選択版の詳細](changelog/default.md) / [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [3.0.13] — Git 記録日: 2026-08-24

- 配布に使う推移的依存の既知の脆弱性へ対応。

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/6f981f8ffb8cc3a7bec3cb9e4a22e30ef62aadd9) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/045a19ba1add29904f3f39192fb3a9d6b9fb518a...6f981f8ffb8cc3a7bec3cb9e4a22e30ef62aadd9)。

## [3.0.12] — Git 記録日: 2026-08-09

- ページ復元後の監視停止、Shadow DOM の資源残留、固定フォントの補完漏れを修正。フォント選択版の既定を IBM Plex Sans JP に変更。

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/045a19ba1add29904f3f39192fb3a9d6b9fb518a) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/2a603ddb4647000f066c0a042608824d26c71f3b...045a19ba1add29904f3f39192fb3a9d6b9fb518a)。

## [3.0.11] — Git 記録日: 2026-08-09

- 設定読み込みがタイムアウトしたときに無効設定が無視される問題と、Discord の除外 URL を修正。

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/2a603ddb4647000f066c0a042608824d26c71f3b) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/4b80e895c3f94efbcc893ee8a867a7bbfa2e994f...2a603ddb4647000f066c0a042608824d26c71f3b)。

## [3.0.10] — Git 記録日: 2026-07-09

- Google Meet のアイコンを保護し、設定保存と Shadow DOM の検出を整理。

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/4b80e895c3f94efbcc893ee8a867a7bbfa2e994f) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/6dfb288442ba1c8bc7ef1a2b82c8526430159ec8...4b80e895c3f94efbcc893ee8a867a7bbfa2e994f)。

## [3.0.9] — Git 記録日: 2026-06-15

- アイコンフォントの保護と、編集領域を置換しない処理を改善。

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/6dfb288442ba1c8bc7ef1a2b82c8526430159ec8) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/a2101c54979b5612a9fa873f6b1b42d6fc8767ea...6dfb288442ba1c8bc7ef1a2b82c8526430159ec8)。

## [3.0.8] — Git 記録日: 2026-05-27

- **`onedrive.live.com` を `excludeMatches` に追加**: OneDrive 個人版のファイル管理 UI は SharePoint と同じ FabricMDL2Icons アイコンフォントを PUA コードポイントで描画している。 `:root :is(button, li, ...)` の本文強制ルールが巻き込んで Noto Sans JP 等に置換 → PUA がカバレッジ外で豆腐化していた。 OneDrive for Business は `*.sharepoint.com` 経由で既存除外済
- 除外ドメイン総数 17 → 18 に更新 (`CLAUDE.md` の「Microsoft / Google のリッチエディタ / ファイル管理系」グループに記載)
- `manifest.json` (静的登録) と `VARIANT.excludeMatches` (動的登録のプリセット JS) の両経路に反映 (v3.0.7 で確立した二重管理プラクティスを継承)

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/a2101c54979b5612a9fa873f6b1b42d6fc8767ea) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/e812451a60cd6f7eeb015da96cbed2dd5c21f5c6...a2101c54979b5612a9fa873f6b1b42d6fc8767ea) / [フォント選択版の詳細](changelog/default.md) / [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [3.0.7] — Git 記録日: 2026-05-19

- **動的登録のプリセット JS にも `excludeMatches` を継承させる**: `scripts/build-variant.js` が `VARIANT.excludeMatches` を `src/content/variant.js` に焼き込み、 `src/background/background.js` の `_doEnsureRegistration` が `chrome.scripting.updateContentScripts` / `registerContentScripts` に渡す経路を新設
- **`isRegistrationUpToDate` の比較項目に `excludeMatches` の sorted equality を追加**: 旧登録 (excludeMatches なし) が残った状態で skip 判定されるのを防止
- 教訓: `manifest.json` の `exclude_matches` (宣言的登録) と動的登録の `excludeMatches` は別管理。 除外ドメインを追加するときは両経路に反映する (`systemPatterns.md` の「excludeMatches の二重管理」セクション参照)

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/e812451a60cd6f7eeb015da96cbed2dd5c21f5c6) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/be8a87aa5a646ce2c101d2133cc0a0d8aab34fa2...e812451a60cd6f7eeb015da96cbed2dd5c21f5c6) / [フォント選択版の詳細](changelog/default.md) / [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [3.0.6] — Git 記録日: 2026-05-17

- **body 本文への直接適用ルール追加 (BODY_FORCE_TARGETS)**: block container (`body, p, h1-h6, li, dt, dd, blockquote, figcaption, caption, th, td, label, button, article, section, main, aside, nav, header, footer, summary, details`) に対して `:root :is(...)` で direct `font-family !important` を当てるルールを生成。 inline 要素 (`span, a, i, b, em, strong`) は意図的に除外して Font Awesome / Material Icons 等のアイコンフォントを保護
- **minifyCSS の正規表現 bug 修正 (致命)**: 旧 `replace(/\s*([{}:;,>])\s*/g, '$1')` が `:` 周辺の空白も消去していたため、 `:root :is(...)` の descendant combinator が `:root:is(...)` (compound selector) に化けて永遠に不発になる dead selector を生成していた。 既存の MONO 強制ルール (`:root :is(pre, code, ...)`) も同じ影響で CSS 変数経由でしか機能していなかった。 `:` を圧縮対象から除外し descendant combinator を保護
- 検証: `https://www.tohoho-web.com/ex/semver.html` を含む direct font-family 指定サイトで置換が機能するようになった

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/be8a87aa5a646ce2c101d2133cc0a0d8aab34fa2) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/7f936c28570102a76d6dd53d59086c4ad44d9fac...be8a87aa5a646ce2c101d2133cc0a0d8aab34fa2) / [フォント選択版の詳細](changelog/default.md) / [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [3.0.5] — Git 記録日: 2026-05-16

- **x.com / Yahoo 等で置換が効かない問題を解消**: v3.0.4 で削除された `setupStyleSheetMonitor` + `neutralizeCompetingFontFaces` を復活。 サイト固有の `@font-face` (例: x.com の `Chirp`) を `deleteRule` で削除 → ブラウザ fallback chain で拡張機能の Noto Sans JP に到達する戦略を再導入
- **Path B (replacefont-extension.css の fetch + placeholder 解決) を復活**: 旧来型サイト向け置換戦略の核
- **all_frames: true に復元**: iframe 内 (広告 / 埋め込みウィジェット) のフォントも置換対象に復活

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/7f936c28570102a76d6dd53d59086c4ad44d9fac) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/c1a8df461a073fb0e6de16547987b6b649290dc9...7f936c28570102a76d6dd53d59086c4ad44d9fac) / [フォント選択版の詳細](changelog/default.md) / [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [3.0.4] — Git 記録日: 2026-05-16

- **Single-Path Injection (Path A 一本化)**: 旧 Two-Path Injection の Path B (fetch + replaceFontPlaceholders) を削除し、 preset JS による同期注入のみに統合。 コードを簡潔化しつつちらつきゼロを維持
- **Cascade 後勝ち戦略**: 旧 `setupStyleSheetMonitor()` (サイト同名 `@font-face` の `deleteRule` 連発) を撤廃し、 拡張 `<style>` を head 末尾に維持する MutationObserver に置換。 アイコンフォント破壊リスク + invalidation 連鎖を解消
- **scanDynamicFontFamilies の最適化**: `document.fonts.size` キャッシュ + `'__' startsWith` 早期 reject + `requestIdleCallback` debounce で、 動的フォント検出のオーバーヘッドを最大 80% 削減

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/c1a8df461a073fb0e6de16547987b6b649290dc9) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/76bcf5f7439079fc0aa8c2150de645c618ddf3e3...c1a8df461a073fb0e6de16547987b6b649290dc9) / [フォント選択版の詳細](changelog/default.md) / [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [3.0.3] — Git 記録日: 2026-05-15

- Firefox AMO の `--use-submission-api` 廃止対応 (web-ext 10+ で submission API がデフォルト動作)
- `background.service_worker` + `background.scripts` 併記 (Firefox MV3 互換性、 AMO validator 対応)
- publish.yml の Firefox AMO step に `if: ${{ success() || failure() }}` 追加 (Chrome 失敗時も Firefox 独立続行)

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/76bcf5f7439079fc0aa8c2150de645c618ddf3e3) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/64a0e38dad46e01cb125a1efb25d18aee94249e3...76bcf5f7439079fc0aa8c2150de645c618ddf3e3) / [フォント選択版の詳細](changelog/default.md)。

## [3.0.2] — Git 記録日: 2026-05-15

- Firefox AMO 自動公開を CI に追加 (`web-ext sign --channel=listed`)
- `web-ext@10.1.0` exact pin

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/64a0e38dad46e01cb125a1efb25d18aee94249e3) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/d074f5ca76f66cff3b964c1f7ee9b71bc7b8511d...64a0e38dad46e01cb125a1efb25d18aee94249e3) / [フォント選択版の詳細](changelog/default.md)。

## [3.0.1] — Git 記録日: 2026-05-14

- SharePoint Online (`*.sharepoint.com`) を `excludeMatches` に追加 (Excel/Word Online のホストオリジン保護)

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/d074f5ca76f66cff3b964c1f7ee9b71bc7b8511d) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/68c6997ba1b2167fd993738428f8102e6ef5abd6...d074f5ca76f66cff3b964c1f7ee9b71bc7b8511d) / [フォント選択版の詳細](changelog/default.md)。

## [3.0.0] — Git 記録日: 2026-05-13

- **バリアント方式の導入**: 1 ソースから複数の派生版 (variant) をビルドできる仕組み。 旧 `replace-font` リポジトリの notosans 固定版を統合
- `variants/<name>.json` + `manifest.template.json` + `scripts/build-variant.js` の 3 点セット
- 全 variant が同じ version を共有する単一 version 体制

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/68c6997ba1b2167fd993738428f8102e6ef5abd6) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/631e96b6a156c0484dca6f14dc697d068536ed8b...68c6997ba1b2167fd993738428f8102e6ef5abd6) / [フォント選択版の詳細](changelog/default.md)。

## [2.1.0-archived] — 既存履歴の日付: 2026-01-17

- Noto Sans 固定版。
- **変更前**: `@font-face` でフォント名を再定義する方式
- **変更後**: ユニバーサルセレクタ (`*`) で `!important` を使って強制置換
- ✅ **iframe処理の重複排除**: `all_frames: true` に完全委任し、親ページからのiframe走査を削除

出典: [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [2.0.56] — Git 記録日: 2026-05-13

- Noto Sans 固定版。ポップアップを 4 種類のテーマから選べるデザインへ刷新。

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/631e96b6a156c0484dca6f14dc697d068536ed8b) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/09dcdc36d843328ccbb9a893c3468c108c63d112...631e96b6a156c0484dca6f14dc697d068536ed8b)。

## [2.0.55] — Git 記録日: 2026-05-13

- Noto Sans 固定版。デザインツールを置換対象から除外し、説明ページのリンクを更新。

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/09dcdc36d843328ccbb9a893c3468c108c63d112) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/c427bfa97ae12d911da58356f4fac89c93ec771a...09dcdc36d843328ccbb9a893c3468c108c63d112)。

## [2.0.54] — Git 記録日: 2026-05-13

- バリアント方式を導入し旧 replace-font リポジトリを統合

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/c427bfa97ae12d911da58356f4fac89c93ec771a) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/89e29ee01b809ad51b4d735034f11bff6b065ad0...c427bfa97ae12d911da58356f4fac89c93ec771a)。

## [2.0.53] — 既存履歴の日付: 2026-05-10

- Noto Sans 固定版。
- **SHADOW_BATCH_MAX 飽和時の Shadow DOM 永続未処理を解消**: DoS 緩和無効化・属性永続残留・永続スキップの 3 問題を 1 修正で同時解決 (`processed` カウント位置 + `removeAttribute` 順序 + 上限超過時 `queueMicrotask` 持ち越し)
- **bfcache 重複注入の根絶**: `pagehide` での `documentApplied` / `sharedStyleSheetPromise` / `dynamicFontStyleNode` 等の過剰リセットを撤回し、保持された DOM・`adoptedStyleSheets`・`<style>`・`FontFaceSet` を再利用する形に統一
- **`scanDynamicFontFamilies` の size-only ガード削除**: SPA が同サイズで family を差し替えるケースの新規分を見逃すバグを解消

出典: [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [2.0.52] — 既存履歴の日付: 2026-04-19

- Noto Sans 固定版。
- `data-rfs-shadow` 属性と `replace-font-shadow-created` イベントによるスプーフィング耐性強化: 1 マイクロタスクあたり `SHADOW_BATCH_MAX = 512` で DoS 抑制
- `escapeFamilyName()`: `DYNAMIC_FONT_PATTERN` による主防壁に加えて `\` / `"` エスケープを追加（防御深化）
- `inject.js` の `console.debug` を `DEBUG = false` ガード（MAIN world でページ側から丸見えだった問題）

出典: [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [2.0.50] — 既存履歴の日付: 2026-04-18

- Noto Sans 固定版。
- `inject.js` を `world: "MAIN"` 宣言式 content_scripts に移行し、`web_accessible_resources` からの露出を解消
- `postMessage` で受信する CSS を構造検証 (`@import` / 外部 `url()` / `expression()` / `behavior:` / `javascript:` / `<script` 排除、長さ上限 1MB)
- `manifest.json` に明示的 CSP と `exclude_matches` (Stripe/PayPal/reCAPTCHA/hCaptcha/Cloudflare/Google/Microsoft/Auth0) を追加

出典: [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [2.0.49] — 既存履歴の日付: 2026-04-18

- Noto Sans 固定版。
- fix: フォントパス追従・Closed Shadow DOM対応・エディタ除外CSS (#16)
- ci: Chrome Web Store 自動公開ワークフローを追加

出典: [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [2.0.40] — Git 記録日: 2026-03-04

- フォント選択機能追加 & アプリ名変更

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/88565fd203b46215cbc5827044faaab8c4a95124)。

## [2.0.24]

- Noto Sans 固定版。
- 以前のバージョン履歴...

出典: [Noto Sans 固定版の詳細](changelog/notosans.md)。

## [1.0.29] — Git 記録日: 2026-05-13

- フォント選択版。ポップアップを 4 種類のテーマから選べるデザインへ刷新。

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/631e96b6a156c0484dca6f14dc697d068536ed8b) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/09dcdc36d843328ccbb9a893c3468c108c63d112...631e96b6a156c0484dca6f14dc697d068536ed8b)。

## [1.0.28] — Git 記録日: 2026-05-13

- フォント選択版。デザインツールを置換対象から除外。

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/09dcdc36d843328ccbb9a893c3468c108c63d112) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/c427bfa97ae12d911da58356f4fac89c93ec771a...09dcdc36d843328ccbb9a893c3468c108c63d112)。

## [1.0.27] — Git 記録日: 2026-04-19

- フォント選択版。
- 動的フォント検出を追加 (任意のサイトが要求するフォントを自動的に置換対象に組み込む)
- プリセット JS のサイズを 37% 削減
- インストール時の初期描画フラッシュを解消

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/89e29ee01b809ad51b4d735034f11bff6b065ad0) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/dbd299043d60502904e6e0f71507a7b68ddb7613...89e29ee01b809ad51b4d735034f11bff6b065ad0) / [フォント選択版の詳細](changelog/default.md)。

## [1.0.26] — Git 記録日: 2026-04-18

- フォント選択版。
- 多言語対応の改善 (`unicode-range` 指定を撤廃し、 フォントのカバレッジに任せる方針へ)
- セキュリティ強化 (CSP 厳格化、 `web_accessible_resources` の最小化)
- アイコン生成を環境非依存化 (puppeteer + 埋め込み woff2 によるグリフ確実化)

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/dbd299043d60502904e6e0f71507a7b68ddb7613) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/9f5fa40bc03ec44b62c7ebfd19b139e884b2b3b6...dbd299043d60502904e6e0f71507a7b68ddb7613) / [フォント選択版の詳細](changelog/default.md)。

## [1.0.25] — Git 記録日: 2026-04-18

- 編集可能領域の置換除外ゾーンを追加、src/ 配下へ再構成 (#1)

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/9f5fa40bc03ec44b62c7ebfd19b139e884b2b3b6) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/1015aa255d308ecee05d2993b4a9416e1f4cab0a...9f5fa40bc03ec44b62c7ebfd19b139e884b2b3b6)。

## [1.0.24] — Git 記録日: 2026-04-10

- Firefox対応

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/1015aa255d308ecee05d2993b4a9416e1f4cab0a) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/feec60d989dab0094dbf4772ec19f2412fca3b59...1015aa255d308ecee05d2993b4a9416e1f4cab0a)。

## [1.0.22] — Git 記録日: 2026-04-03

- 未設定のフォント情報の補完、ブラウザ起動時の再登録、ページ復元後の競合フォント監視を改善。
- Shadow DOM の走査をまとめて実行し、LINE Seed JP の未提供ウェイトを Regular で補完。

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/feec60d989dab0094dbf4772ec19f2412fca3b59) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/15cfef70b8ae2b6a47e0e30e1b806787376c75e4...feec60d989dab0094dbf4772ec19f2412fca3b59)。

## [1.0.20] — Git 記録日: 2026-03-23

- 事前ビルド方式によるちらつきゼロのフォント注入、LINE Seed JP追加、ダークテーマ対応

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/15cfef70b8ae2b6a47e0e30e1b806787376c75e4) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/2c8e95043e883afe700cb4988e439ca7667c4999...15cfef70b8ae2b6a47e0e30e1b806787376c75e4)。

## [1.0.16] — Git 記録日: 2026-03-20

- アイコンフォント破壊セレクタ除去、コード最適化

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/2c8e95043e883afe700cb4988e439ca7667c4999) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/f0c8eac83327510398d4df7153cefa31a2178eac...2c8e95043e883afe700cb4988e439ca7667c4999)。

## [1.0.14] — Git 記録日: 2026-03-16

- カスタム要素との互換性修正、webstore整理

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/f0c8eac83327510398d4df7153cefa31a2178eac) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/943e4559f566b135fcfecb636d0628f46eed68c0...f0c8eac83327510398d4df7153cefa31a2178eac)。

## [1.0.10] — Git 記録日: 2026-03-06

- アイコンフォント破壊を修正、Shadow DOM フルCSS注入

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/943e4559f566b135fcfecb636d0628f46eed68c0) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/d9763bb045c37aee396fa9126ae580bb3a6d017b...943e4559f566b135fcfecb636d0628f46eed68c0)。

## [1.0.4] — Git 記録日: 2026-03-06

- 本文フォントウェイト選択、コード最適化、著作権更新

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/d9763bb045c37aee396fa9126ae580bb3a6d017b) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/1c9039b81db8552f75f548198bb0ff89bc9f483c...d9763bb045c37aee396fa9126ae580bb3a6d017b)。

## [1.0.1] — Git 記録日: 2026-03-05

- Mediumウェイト採用、Moralerspace追加、README/ストア説明更新

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/1c9039b81db8552f75f548198bb0ff89bc9f483c) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/bec1ea0ee9f19e043214acc104f3d2c61106e08f...1c9039b81db8552f75f548198bb0ff89bc9f483c)。

## [1.0.0] — Git 記録日: 2026-03-04

- フォント選択版を「目に優しいフォント置換」として再識別し、製品紹介と配布パッケージを整備。

出典: [版の記録](https://github.com/1llum1n4t1s/ReplaceFontSelect/commit/bec1ea0ee9f19e043214acc104f3d2c61106e08f) / [変更差分](https://github.com/1llum1n4t1s/ReplaceFontSelect/compare/88565fd203b46215cbc5827044faaab8c4a95124...bec1ea0ee9f19e043214acc104f3d2c61106e08f)。
