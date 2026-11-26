# ストア掲載画像（vitrina）

スクショ（1280x800・9 言語×4 枚）と小タイル・マーキーは、`webstore/vitrina/`（共通キット。`Kagayoi.Support` の `sync-kit.mjs --repo` で逐語同期。**直接編集しない**）が実拡張を Chrome for Testing へ読み込んで撮る。設定は `webstore/store-assets.<variant>.json`、固定ページは `webstore/fixtures/`、撮影前の操作は `webstore/store-assets.steps.mjs`、variant 切替は `webstore/run-vitrina.mjs`。

- 実行前に対象 variant の `bun --bun run build:<variant>`（アイコン・preset CSS）が済んでいること。`generate-screenshots*` は撮影前に `build-variant` で manifest と `_locales` を作り直す。
- ビフォーアフター（`compare-*`）は同じ固定ページを拡張オン／オフで撮り、左カードをオフの実描画へ差し替える。置換元は読みづらい明朝体の指定で、フォント名は画像に書かない。
- 文言は `{ msg }` で `_locales` を参照するか、9 言語を `store-assets.<variant>.json` に直書きする（訳は `Kagayoi.Support` の `l10n/glossary.md` に従う）。
- 撮影中の欠陥は `<work-dir>/ui-defects.json`。固定ページが日本語本文のため、日本語以外のロケールで `kana-in-non-ja` / `font-mismatch` / `same-as-en` が出るのは想定内。
- 出力は `webstore/images/<variant>/`（gitignore 済み）。CI（Linux）は smoke プロファイル（en のみ）で verify は失敗する設計。
