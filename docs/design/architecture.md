# 構造とランタイムの設計判断

## 主要コンポーネントと責務

| コンポーネント | 責務 |
|---|---|
| `variants/*.json` | 名前、version、Gecko ID、固定フォント、UI表示、除外サイト、成果物名を定義するバリアント正本 |
| `manifest.template.json` / `scripts/build-variant.js` | バリアント設定から対象ブラウザ用の `manifest.json` と `src/content/variant.js` を生成 |
| `src/content/font-config.js` | `FONT_REGISTRY`、既定値、保存値の検証、`lockedFonts`を含む設定マージを一元管理 |
| `scripts/generate-css.js` | fallback・YouTube用CSSテンプレートと42通りのpreset JSを生成 |
| `src/background/background.js` | 保存設定を読み、preset JSとShadow DOMフックの動的content script登録を同期。補填注入も担当 |
| `src/content/preload-fonts.js` | preset CSSの再利用またはfallback CSSの解決・注入、競合font-face除去、動的フォント検出、open Shadow DOM適用、フォントpreloadを担当 |
| `src/content/inject.js` | MAIN worldで`attachShadow`を捕捉し、open rootを通知しつつclosed rootへ直接CSSを適用 |
| `src/popup/` | 有効状態・フォント・weightの設定UI。`chrome.storage.local`へ保存 |
| `@kagayoi/support-extension` / `src/shared/kagayoi-support-*` | 共有パッケージを正本として問い合わせUIのJS/CSS 5資産を同梱し、Kagayoi Supportへの送信境界を形成。申告と許可は[送信境界](security.md)を参照 |
| `.github/workflows/publish.yml` | 版タグ`vX.Y.Z`のpushを起点に2バリアントを生成し、Chrome Web StoreとFirefox AMOへ提出 |

## ランタイムデータフロー

1. `document_start`で`youtube-target.js`、`variant.js`、`font-config.js`、`preload-fonts.js`をISOLATED worldへ宣言的に読み込む。動的presetにも同じ対象判定を先行させる。
2. Service Workerは`fontSettings`を検証・マージし、有効時だけ選択presetをISOLATED world、`inject.js`をMAIN worldへ全frame対象で動的登録する。
3. **Path A**はpreset JSが選択設定を解決済みのCSS全体（`@font-face`、置換規則、CSS変数override）を同期注入する。`__REPLACE_FONT_BASE__`だけは実行時に`chrome.runtime.getURL('')`で解決し、headがなければdocumentElementへ置く。
4. **Path B**は`preload-fonts.js`がpresetの登録成功フラグとDOM上の存在を確認し、presetがあればCSSを再利用し、なければfallback CSSをfetchして実URL・選択フォントへ解決して注入する。どちらの場合も競合する`@font-face`の監視・除去を行い、直接font-familyを指定するサイトのfallback chainを置換フォントへ導く。
5. open Shadow DOMはISOLATED world側の監視と共有`CSSStyleSheet`で処理する。closed Shadow DOMはMAIN world側が`attachShadow`の返り値を保持して直接処理する。Constructable Stylesheetを採用できないrootでは`<style>`へフォールバックする。
6. popupの変更は`chrome.storage.local.fontSettings`へ保存され、Service Workerが150msでデバウンスして動的登録を原子的に更新する。
7. 無効化時は動的登録と登録成功フラグを解除する。既に開いているページからMAIN worldフックを取り除くにはページ再読み込みが必要になる。
8. 利用者の置換除外リスト（`chrome.storage.local.siteExclusions`）に一致したframeでは置換せず、注入済みのCSSも撤去する。

## 設計判断の詳細

- [フォント注入の二経路とYouTube例外](section-02.md): 同期presetとfallback・競合font-face監視を併用する。ChromeのYouTubeだけはPath Bの非同期Blob経路を使う。
- [動的content script登録と補填注入](section-03.md): 登録更新のraceを避け、起動時に処理が入らなかったタブを補う。
- [world別Shadow DOM処理](section-01.md): open rootとclosed rootの責務をworldで分け、注入を遅延する。
- [サイト単位の除外](section-04.md): 実行時判定を正本とし、完全に一致する規則だけを動的登録へ前倒しする。

## 製品ページの配信先

製品ページの配信HTMLは `../vps-web/lp/replacefont/`（編集元は `../vps-web/tools/lp/templates/`）、公開実体はVPSの `/srv/www/lp/replacefont/`。
直接配信の設定は `../vps-web/deploy/caddy-sites/lp-replacefont.caddy` に置く。
公開URLを維持し、静的ファイルの配信は `../vps-web/deploy/deploy-lp.ps1` へ統一する。
