# DESIGN.md

「目に優しいフォント置換」の現在の実装構造と設計判断を記録する。作業手順・必須コマンド・変更時の制約は [`AGENTS.md`](AGENTS.md) を正本とする。

## 目的と範囲

本システムは、Chrome / Firefox向けManifest V3拡張機能として、ウェブページが指定する読みづらい本文・等幅フォントを利用者が選んだ日本語フォントへ置換する。単一コードベースから次の2つの公開済みバリアントを生成する。

- `default`: 本文7種、等幅3種、本文weight 400/500をポップアップで選択する通常版
- `notosans`: Noto Sans JP、UDEV Gothic JPDOC、weight 400へ固定した版

`web/` は製品ページとプライバシーポリシーを配信する独立したCloudflare Workerであり、拡張機能のランタイムには含まれない。`docs/`、`webstore/`、`changelog/` はストア掲載・公開文書である。

## 主要コンポーネントと責務

| コンポーネント | 責務 |
|---|---|
| `variants/*.json` | 名前、version、Gecko ID、固定フォント、UI表示、除外サイト、成果物名を定義するバリアント正本 |
| `manifest.template.json` / `scripts/build-variant.js` | バリアント設定から対象ブラウザ用の `manifest.json` と `src/content/variant.js` を生成 |
| `src/content/font-config.js` | `FONT_REGISTRY`、既定値、保存値の検証、`lockedFonts`を含む設定マージを一元管理 |
| `scripts/generate-css.js` | fallback CSSテンプレートと42通りのpreset JSを生成 |
| `src/background/background.js` | 保存設定を読み、preset JSとShadow DOMフックの動的content script登録を同期 |
| `src/content/preload-fonts.js` | fallback CSSの解決・注入、競合font-face除去、動的フォント検出、open Shadow DOM適用、フォントpreloadを担当 |
| `src/content/inject.js` | MAIN worldで`attachShadow`を捕捉し、open rootを通知しつつclosed rootへ直接CSSを適用 |
| `src/popup/` | 有効状態・フォント・weightの設定UI。`chrome.storage.local`へ保存 |
| `kagayoi-support-extension` / `src/shared/kagayoi-support-*` | 共有パッケージを正本として問い合わせUIのJS/CSS 5資産を同梱し、Kagayoi Supportへの送信境界を形成。Firefoxでは個人識別・認証情報をrequiredとして申告し、通信内容のoptional permissionを送信前に取得 |
| `.github/workflows/publish.yml` | `release/X.Y.Z`を起点に2バリアントを生成し、Chrome Web StoreとFirefox AMOへ提出 |

## ビルド時データフロー

1. exact pinした`kagayoi-support-extension`から、問い合わせUIのJS/CSS 5資産を`src/shared/`へ逐語同期する。
2. `variants/<name>.json` と `manifest.template.json` から、対象バリアントのmanifestと`VARIANT`を生成する。
3. `FONT_REGISTRY`から、ランタイム置換用CSSと本文・等幅・weightの全42presetを生成する。
4. variant別SVGからPNGアイコンを生成する。
5. Chrome成果物には`background.service_worker`を使用する。Firefox成果物はAMO validatorとの互換性のため`background.scripts`を追加する。
6. 固定フォント版の配布物には、`lockedFonts`に一致するpresetだけを残す。
7. CIは共有資産の正本との一致とChrome ZIP内の必須CSSを検査し、問い合わせUIが不完全な成果物の公開を拒否する。

`manifest.json`、`src/content/variant.js`、`src/css/replacefont-extension.css`、`src/css/preset-*.js`、生成PNGはビルド成果物であり、直接編集しない。

## ランタイムデータフロー

1. `document_start`で`variant.js`、`font-config.js`、`preload-fonts.js`をISOLATED worldへ宣言的に読み込む。
2. Service Workerは`fontSettings`を検証・マージし、有効時だけ選択presetをISOLATED world、`inject.js`をMAIN worldへ全frame対象で動的登録する。
3. **Path A**はpreset JSがCSS変数を同期上書きし、CSS変数を使うモダンサイトをちらつきなく置換する。
4. **Path B**は`preload-fonts.js`がfallback CSSのプレースホルダーを実URL・選択フォントへ解決して注入する。直接font-familyを指定するサイトでは、競合する`@font-face`を除去してfallback chainを置換フォントへ導く。
5. open Shadow DOMはISOLATED world側の監視と共有`CSSStyleSheet`で処理する。closed Shadow DOMはMAIN world側が`attachShadow`の返り値を保持して直接処理する。Constructable Stylesheetを採用できないrootでは`<style>`へフォールバックする。
6. popupの変更は`chrome.storage.local.fontSettings`へ保存され、Service Workerが150msでデバウンスして動的登録を原子的に更新する。
7. 無効化時は動的登録と登録成功フラグを解除する。既に開いているページからMAIN worldフックを取り除くにはページ再読み込みが必要になる。

## 責務の境界

- `VARIANT.lockedFonts`は利用者の保存値より後に適用し、固定版の設定を常に優先する。
- 宣言的content script、preset、MAIN worldフックには同じ`excludeMatches`を適用する。
- MAIN worldとISOLATED worldの間でShadowRootを直接渡さず、open rootのhost属性`data-rfs-shadow`だけを通知に使う。
- Kagayoi Supportへの送信は共有コンポーネント内に閉じ、フォント置換ランタイムから分離する。
- 公開用Workerは静的アセットだけをGET / HEADで返し、拡張機能の設定や閲覧ページ情報を扱わない。

## 重要な不変条件

- Path AとPath Bは異なるサイト実装を補完するため、両方を維持する。
- content scriptの順序は`variant.js` → `font-config.js` → `preload-fonts.js`とする。
- `FONT_REGISTRY`をフォント定義と設定検証の単一の正本にする。
- `@font-face`の`unicode-range`は指定せず、選択フォントにない文字をブラウザのfont fallbackへ委ねる。
- default / notosansの公開済みIDと並行運用を維持する。
- サイト除外は宣言的・動的の両経路で一致させ、編集体験やアイコンフォントを保護する。
- open / closed Shadow DOMのstylesheetはworldごとに共有し、root単位の複製を避ける。
- 問い合わせUIの同梱5資産は共有パッケージと逐語一致させ、拡張側で派生実装を作らない。
- versionは全バリアントと`package.json`で同期し、release branch名とも一致させる。

## 採用済み設計判断とトレードオフ

### 二経路のフォント注入

同期presetは初期表示のちらつきを抑えられる一方、直接指定されたfont-familyだけでは不十分である。fallback CSSと競合font-face監視を併用し、初期表示と対応範囲を両立する代わりに、生成物とランタイム監視の複雑さを受け入れている。

競合font-faceの走査は、グループ規則の内側と読み取り可能な`@import`先も対象とする。`document.adoptedStyleSheets`は初回・BFCache復帰・style/link追加時に確認する。DOM変化を伴わないCSSOMだけの変更は常時監視しない。

### 動的content script登録

設定に一致するpresetだけを`document_start`へ登録でき、無効時はMAIN worldフックも停止できる。更新は`updateContentScripts`を優先し、初回だけ`registerContentScripts`へフォールバックすることで、unregister/register間のraceを避ける。MV3 Service Workerのevictionで短いdebounceが失われる可能性は、`persistAcrossSessions`と`onStartup`で回復する。

### world別Shadow DOM処理

open rootはISOLATED worldで安全に扱えるが、closed rootは`host.shadowRoot`から再取得できない。そのためMAIN worldで返り値を捕捉する責務を分け、共有sheetと`<style>` fallbackで互換性とメモリ効率を両立する。

### バリアント方式

公開IDと利用者層を維持しつつ実装を共有できる。代わりに、version、workflow matrix、store ID、variant必須キーを同期する運用制約がある。

### サイト単位の除外

リッチエディタやデザインツールまで強制置換すると、編集体験やアイコンフォントを壊す場合がある。全サイト対応より既存UIの保全を優先し、既知の対象はバリアント設定で除外する。

### 問い合わせUIの共有資産同期

複数拡張で問い合わせUIの挙動・プライバシー境界を揃えるため、共有パッケージを唯一の実装正本とする。一方、MV3拡張は実行時にnpm packageを参照できずremote codeも読み込めないため、JS/CSS 5資産をビルド前に`src/shared/`へ同期して配布物へ同梱する。ビルド時の自動同期に加えてCIで逐語一致とCSSのアーカイブ収録を検査し、正本との乖離や同梱漏れを公開前に止める。
