# フォント追加の作業手順

1. `src/fonts/` に TTF を置き `bun --bun run convert-fonts` で woff2 化。追加・再生成した WOFF2 には [同梱フォントの描画設定](../../src/fonts/README.md#同梱フォントの描画設定)を適用して確認する（変換スクリプトは描画設定を自動統一しない）。
2. `FONT_REGISTRY` (`src/content/font-config.js`) の `body` か `mono` にエントリ追加
3. `bun --bun run generate-css` で template CSS + 本文 × 等幅 × weight の全組み合わせ preset JS (現在 42 個) を再生成
4. popup / content / background は `FONT_REGISTRY` を動的読みするので他ファイル変更不要

⚠️ **既存フォントキー (`noto-sans-jp` / `udev-gothic-jpdoc`) はそのまま維持する** — `variants/notosans.json` の `lockedFonts` がそのキー名を参照しているので、 既存キーは固定で運用し、 新しいフォントは別キーで追加する。
