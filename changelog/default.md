# Changelog — default variant

「目に優しいフォント置換」(Chrome / Firefox 拡張、 フォント選択 UI 付き) のリリース履歴。
version の真実の源泉は `variants/default.json` の `version` フィールド。

## [3.0.4] - 2026-05-16

v3.0.3 以降の継続改善 (パフォーマンス + アーキテクチャ + ドキュメント整合性 + notosans 退役)。

### Performance / Architecture
- **Single-Path Injection (Path A 一本化)**: 旧 Two-Path Injection の Path B (fetch + replaceFontPlaceholders) を削除し、 preset JS による同期注入のみに統合。 コードを簡潔化しつつちらつきゼロを維持
- **Cascade 後勝ち戦略**: 旧 `setupStyleSheetMonitor()` (サイト同名 `@font-face` の `deleteRule` 連発) を撤廃し、 拡張 `<style>` を head 末尾に維持する MutationObserver に置換。 アイコンフォント破壊リスク + invalidation 連鎖を解消
- **scanDynamicFontFamilies の最適化**: `document.fonts.size` キャッシュ + `'__' startsWith` 早期 reject + `requestIdleCallback` debounce で、 動的フォント検出のオーバーヘッドを最大 80% 削減
- **Shadow DOM 観測の microtask coalescing**: MutationObserver callback の連続発火を 1 microtask にまとめて、 大規模 SPA での CPU 占有を抑制
- **`@font-face` の ASCII case-insensitive dedupe**: 337 個 → 302 個に削減 (`MS PGothic` / `ms pgothic` 等の重複を排除)
- **CSS cascade 戦略**: `:not(:where([contenteditable=true] *, ...))` の巨大 negation セレクタを廃止し、 編集領域に `font-family: revert !important` を直接当てる cascade 後勝ち戦略へ。 Style recalc per-event のコストを大幅削減
- **preset JS テンプレートリテラル化**: `__REPLACE_FONT_BASE__ × 337 回 String.replace` の旧方式から、 ビルド時の `${B}` 補間に切り替え (V8 最適化に乗る)
- **all_frames: false への変更**: iframe (広告 / 埋め込み) への注入を停止して long_tasks 増加の主要因を解消。 top frame のみで動作
- **preload tag の最小化**: top frame + Regular weight のみを `<link rel=preload>`、 Bold / Mono は `font-display: swap` 任せ

### Architecture
- **notosans variant 退役**: `Noto Sans JP + UDEV Gothic JPDOC 固定版` を default variant の **シンプルモード** (popup トグル) に統合。 旧 notosans 関連ファイル (`variants/notosans.json` / `icons/notosans/` / `docs/notosans/` / `changelog/notosans.md` 等) を削除
- **variant 機構の縮退**: 現在 default 1 variant のみアクティブ、 機構自体は将来別ブランドを出す自由度として骨組みを保持
- **`chrome.scripting.updateContentScripts` への移行**: `unregister` + `register` の 2 API call を 1 回の update に統合。 設定変更時の race condition を解消
- **`use_dynamic_url: true` の追加**: web_accessible_resources に追加し、 固定拡張機能 ID ベースのフィンガープリンティングを防止

### CSP / Security
- `extension_pages` CSP に `base-uri 'self'; form-action 'none'` を追加 (defense-in-depth)
- `web_accessible_resources` から `src/css/replacefont-extension.css` を除外 (Path B 削除で fetch 不要)

### exclude_matches 拡充
新たに 10 ドメインを除外 (合計 17 ドメイン)。 Notion / Slack / Linear / GitHub Codespaces / VS Code Web / Replit / CodeSandbox / StackBlitz / Overleaf / Discord — リッチエディタ / IDE 系での誤動作によるユーザー作品破壊リスクを回避。

### Bootstrap 5 対応
`--bs-font-sans-serif` / `--bs-body-font-family` / `--bs-font-monospace` を CSS 変数オーバーライドリストに追加。 Bootstrap ベースのサイトで body のフォントが置換されない問題を解消。

---

## [3.0.3] - 2026-05-15

- Firefox AMO の `--use-submission-api` 廃止対応 (web-ext 10+ で submission API がデフォルト動作)
- `background.service_worker` + `background.scripts` 併記 (Firefox MV3 互換性、 AMO validator 対応)
- publish.yml の Firefox AMO step に `if: ${{ success() || failure() }}` 追加 (Chrome 失敗時も Firefox 独立続行)
- default variant が AMO 上で v3.0.3 即時公開達成

## [3.0.2] - 2026-05-14

- Firefox AMO 自動公開を CI に追加 (`web-ext sign --channel=listed`)
- `web-ext@10.1.0` exact pin

## [3.0.1] - 2026-05-13

- SharePoint Online (`*.sharepoint.com`) を `excludeMatches` に追加 (Excel/Word Online のホストオリジン保護)

## [3.0.0] - 2026-05-13

- **バリアント方式の導入**: 1 ソースから複数の派生版 (variant) をビルドできる仕組み。 旧 `replace-font` リポジトリの notosans 固定版を統合
- `variants/<name>.json` + `manifest.template.json` + `scripts/build-variant.js` の 3 点セット
- 全 variant が同じ version を共有する単一 version 体制

## [1.0.27] - 2026-04-19

- 動的フォント検出を追加 (任意のサイトが要求するフォントを自動的に置換対象に組み込む)
- プリセット JS のサイズを 37% 削減
- インストール時の初期描画フラッシュを解消

## [1.0.26] - 2026-04-15

- 多言語対応の改善 (`unicode-range` 指定を撤廃し、 フォントのカバレッジに任せる方針へ)
- セキュリティ強化 (CSP 厳格化、 `web_accessible_resources` の最小化)
- アイコン生成を環境非依存化 (puppeteer + 埋め込み woff2 によるグリフ確実化)

## [1.0.x 系より前]

詳細な履歴は git ログ参照: `git log --oneline -- variants/default.json src/`

---

## 退役済み

- **notosans variant** (旧 `{ee49eeb2-93a9-4062-ba75-06610054323e}`): v3.x の途中で退役。 default の simpleMode トグルで機能等価。 AMO / CWS 側の archive 処理が必要 (別作業)
- **Two-Path Injection の Path B** (fetch + replaceFontPlaceholders): v3.x で削除。 Path A 一本化
- **`setupStyleSheetMonitor`**: v3.x で削除。 cascade 後勝ち戦略 (`ensureExtensionStyleAtEnd`) へ
- **旧 `replace-font` リポジトリ** (notosans 専用): notosans variant 退役と合わせて archive 候補
