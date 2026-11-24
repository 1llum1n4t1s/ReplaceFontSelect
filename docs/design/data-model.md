# 保存設定とpopup

`chrome.storage.local.fontSettings`は次の形式で保存する。

```json
{
  "enabled": true,
  "bodyFont": "ibm-plex-sans-jp",
  "monoFont": "udev-gothic-jpdoc",
  "bodyFontWeight": "400"
}
```

`mergeFontSettings()`は不正な値を既定値へ戻し、最後に`VARIANT.lockedFonts`を適用する。固定版ではフォント選択UIも非表示になる。`prebuiltCSSRegistered`は動的preset登録の成否を示すbooleanであり、そのページへの注入成功を保証しないためDOMも確認する。popupは設定を自動保存し、開いているページへの反映には再読み込みが必要となる。

popupは「設定」（ステータスとフォント設定）と「除外リスト」の2タブで構成し、WAI-ARIAのタブパターン（左右・Home/Endキー）に従う。固定版でも除外リストは利用できる。

`chrome.storage.local.siteExclusions`は置換除外規則の文字列配列で、`fontSettings`とは別キーに保存する（フォント設定の保存・YouTube経路の設定変更監視へ影響させないため）。規則と判定はReplaceTranslatorの自動翻訳ブラックリストと同じで、`font-config.js`の`SiteExclusions`を正本にする。

- 1行1規則。前後の空白を除き、重複・1000文字超を捨て、最大500件。
- `*`は任意の文字列。`://`を含むURL規則は同一オリジンの指定パス以下（`*`を含む場合はURL全体へのglob）、ホスト規則はホスト名全体（大文字小文字を区別しない）、`host/path`はそのホストの指定パス以下に一致する。
- 判定は各frame自身のURLで行う（content scriptはabout:blank等のframeでは動かない）。タブ全体のURLで判定するReplaceTranslatorとは異なり、除外サイトに埋め込まれた別オリジンのiframeは、そのiframeのURLで判定する。
- default / notosansが同居する場合、除外時に外すpresetとclosed Shadow rootのCSSは、自身の拡張URLを含むものに限る。共有されるMAIN worldフックは、他方のCSSが残っていればそれを使い続ける。
- popupは入力を450msのdebounceとblurで自動保存し、前回保存値との差分を最新の保存値へ適用する。「現在のサイトを追加」はアクティブタブのhttp(s)ホスト名を追加する。開いているページへの反映には再読み込みが必要になる。

popupは`body[data-variant]`と`prefers-color-scheme`でテーマを切り替える。defaultはEditorial Day / Editorial Night、notosansはLab Day / Cyber Nightを使用する。フォントは同梱WOFF2から読み込み、外部CDNへ依存しない。`prefers-reduced-motion`でアニメーションを停止し、`:focus-visible`でキーボード操作を示す。
