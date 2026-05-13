# Changelog — default variant

「目に優しいフォント置換」(Chrome / Firefox 拡張、フォント選択 UI 付きの通常版) のリリース履歴。

## [1.0.27] - 2026-04-19

- 動的フォント検出を追加（任意のサイトが要求するフォントを自動的に置換対象に組み込む）
- プリセット JS のサイズを 37% 削減
- インストール時の初期描画フラッシュを解消

## [1.0.26] - 2026-04-15

- 多言語対応の改善（`unicode-range` 指定を撤廃し、フォントのカバレッジに任せる方針へ）
- セキュリティ強化（CSP 厳格化、`web_accessible_resources` の最小化）
- アイコン生成を環境非依存化（puppeteer + 埋め込み woff2 によるグリフ確実化）

## [1.0.x 系より前]

詳細な履歴は git ログ参照: `git log --oneline -- variants/default.json src/`

---

## バリアント方式 (2026-05-13 〜)

このリポジトリは 1 ソースから複数の派生版 (variant) をビルドできる方式に移行しました。

- `default` variant: 本ファイルが対象（フォント選択 UI 付きの通常版）
- `notosans` variant: [`changelog/notosans.md`](./notosans.md) 参照（Noto Sans JP + UDEV Gothic JPDOC 固定版）

各 variant の version は `variants/<name>.json` の `version` フィールドが真実の源泉です。
