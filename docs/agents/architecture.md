# ランタイムの変更制約

## ランタイム変更時の制約

構造・保存スキーマ・テーマの責務は [設計文書](../design/architecture.md#ランタイムデータフロー) を参照する。

- Path A（同期preset）とPath B（fallbackと競合font-face監視）を両方維持する。presetがある場合も競合font-face監視は必要。
- Chrome の YouTube ドメインだけは Path A を注入せず、Path B が Blob URL と CSS を準備する。取得・CSP 失敗時は競合 font-face を変更せず元の表示を保つ。
- presetには解決済みフォント設定とCSS全体を埋め込み、拡張URLの `__REPLACE_FONT_BASE__` だけを実行時に解決する。生成物を直接修正しない。
- preset生成の区切りには不可視ASCII制御文字を使わず、目視できるトークンまたは明示的なescapeを使う。
- 保存値は `mergeFontSettings()` で検証し、固定版の `lockedFonts` を優先する。フォント定義・検証を別の実装へ複製しない。
- 宣言的・動的content scriptの除外を一致させ、有効時だけMAIN worldフックを登録する。
- background の登録更新は、起動時・インストール時・storage 変更の debounce 発火のいずれも、直列化ロック内で storage を読み直してから行う。storage 変更経路は読込に失敗したら登録を変えず、起動・インストール経路は既定値にフォールバックする。
- 利用者の置換除外リスト（`storage.local.siteExclusions`、popupの「除外リスト」タブ）は `font-config.js` の `SiteExclusions` を正本にし、規則はReplaceTranslatorの自動翻訳ブラックリストと同じにする。除外の正本は `preload-fonts.js` の実行時判定（YouTube分岐・競合font-face除去より前）で、素のホスト名だけを動的登録の `excludeMatches` へ前倒しで加える。match pattern への変換を広げる場合は意味が完全に一致する規則に限る（無効な pattern は登録全体を失敗させる）。判定を変えたら `bun --bun run test:exclusions` と[回帰検証](testing.md)を実行する。
- Shadow DOMの注入順序を変更したら、[world別Shadow DOM処理](../design/section-01.md) と[テスト手順](testing.md)の回帰検証により、同期初期化後のCSS保持とページ破棄後の注入停止を確認する。
- popupの変更は両variant × light/darkの4テーマを実画面で確認する。notosansのテーマも利用中なので維持し、reduced motionとキーボードfocusの表示を保つ。

## フォントの追加

TTF の WOFF2 化、`FONT_REGISTRY` への登録、CSS 再生成の順で行い、既存キーは維持する。作業前に [フォント追加の作業手順](workflow.md) を読む。

## Manifest content_scripts のロード順（絶対）

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

## CSS とホットパス

暗黙の全要素セレクタを避け、`document_start` で動く `preload-fonts.js` の同期処理を最小限にする。変更前に [実装規約](conventions.md) を読む。

## Manifest・CSP・ブラウザ互換

Firefox 用の background 定義、`web_accessible_resources`、全 frame 登録、CSP の制約は、変更前に [Manifest・CSP・ブラウザ互換](section-02.md) を読む。
