# DESIGN.md

「目に優しいフォント置換」の現在の実装構造と設計判断を記録する。作業手順・必須コマンド・変更時の制約は [`AGENTS.md`](AGENTS.md) を正本とする。

## 目的と範囲

本システムは、Chrome / Firefox向けManifest V3拡張機能として、ウェブページが指定する読みづらい本文・等幅フォントを利用者が選んだ日本語フォントへ置換する。単一コードベースから次の2つの公開済みバリアントを生成する。

- `default`: 本文7種、等幅3種、本文weight 400/500をポップアップで選択する通常版
- `notosans`: Noto Sans JP、UDEV Gothic JPDOC、weight 400へ固定した版

`../vps-web/lp/replacefont/` はVPSから配信する製品ページとプライバシーポリシーであり、拡張機能のランタイムには含まれない。`docs/`、`webstore/`、`changelog/` はストア掲載・公開文書である。`webstore/` の掲載画像は共通キット `webstore/vitrina/` が variant ごとの `store-assets.<variant>.json` から生成する（手順は [ストア掲載画像](docs/agents/store-listing-images.md)）。

## 構造とデータフロー

バリアント設定からmanifestと`VARIANT`を、`FONT_REGISTRY`からpresetを生成する。Service Workerが選択presetを動的登録し、content scriptがページへ適用する。

- [構造とランタイムの設計判断](docs/design/architecture.md): コンポーネントの責務、注入経路、動的登録と起動時の補填注入、Shadow DOM、サイト除外、製品ページの配信先。
- [ビルド時データフロー](docs/design/workflow.md): 生成と同梱資産の選定。
- [保存設定とpopup](docs/design/data-model.md): 保存形式、除外規則、popupの構成とテーマ。
- [問い合わせUIの送信境界](docs/design/security.md): 共有資産の同期とFirefoxのデータ送信許可。

## 責務の境界

- `VARIANT.lockedFonts`は利用者の保存値より後に適用し、固定版の設定を常に優先する。
- 宣言的content script、preset、MAIN worldフックには同じ`excludeMatches`を適用する。利用者の除外リストは実行時判定を正本とし、素のホスト名だけを動的登録の`excludeMatches`へ追加する。
- MAIN worldとISOLATED worldの間でShadowRootを直接渡さず、open rootのhost属性`data-rfs-shadow`だけを通知に使う。
- Kagayoi Supportへの送信は共有コンポーネント内に閉じ、フォント置換ランタイムから分離する。

## 重要な不変条件

- Path AとPath Bは異なるサイト実装を補完するため、両方を維持する。
- 宣言的content scriptの順序は`youtube-target.js` → `variant.js` → `font-config.js` → `preload-fonts.js`、動的presetは`youtube-target.js` → presetとする。
- `FONT_REGISTRY`をフォント定義と設定検証の単一の正本にする。
- `@font-face`の`unicode-range`は指定せず、選択フォントにない文字をブラウザのfont fallbackへ委ねる。
- default / notosansの公開済みIDと並行運用を維持する。
- サイト除外は宣言的・動的の両経路で一致させ、編集体験やアイコンフォントを保護する。
- open / closed Shadow DOMのstylesheetはworldごとに共有し、root単位の複製を避ける。
- 問い合わせUIの同梱5資産は共有パッケージと逐語一致させ、拡張側で派生実装を作らない。
- versionは全バリアントと`package.json`で同期し、版タグ名とも一致させる。

## 主な設計判断とトレードオフ

- **二経路の注入**: 初期表示のちらつき抑制と対応範囲を両立する代わりに、生成物と監視の複雑さを受け入れる。
- **サイト除外**: 全サイト対応より、編集体験とアイコンフォントの保全を優先する。
- **バリアント方式**: 公開IDと利用者層を維持しつつ実装を共有できる。代わりに、version、workflow matrix、store ID、variant必須キーを同期する運用制約がある。
