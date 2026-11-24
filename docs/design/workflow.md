# ビルド時データフロー

1. exact pinした`@kagayoi/support-extension`から、問い合わせUIのJS/CSS 5資産を`src/shared/`へ逐語同期する。
2. `variants/<name>.json` と `manifest.template.json` から、対象バリアントのmanifestと`VARIANT`を生成する。あわせて`l10n/shared/<code>.json`（9言語共通のUI文言）に`variants/<name>.json`の`locales`（拡張名・説明・popup文言）を合成し、`_locales/<code>/messages.json`を生成する。
3. `FONT_REGISTRY`から、ランタイム置換用CSSと本文・等幅・weightの全42presetを生成する。
4. variant別SVGからPNGアイコンを生成する。
5. Chrome成果物には`background.service_worker`を使用する。Firefox成果物はAMO validatorとの互換性のため`background.scripts`を追加する。
6. `scripts/package-source.js`がCI・Windows・Linuxの同梱資産を選定する。`--stage <chrome|firefox> <新規dir>`はmanifest.json・_locales・icons/<variant>・srcを、OS残骸・preview.html（firefoxはTTFも）を除いて新規ディレクトリへ集約し、publish.yml・verify.yml・zip.ps1・zip.shが共用する（manifestは呼び出し側が事前に生成し、削除・再生成はしない）。完全かつ有効な`lockedFonts`を持つ固定版は、一致するpresetとレジストリで解決した置換用WOFF2、およびpopup・共有UIなどのCSSが実参照するWOFF2を残す。通常版や不完全・不正な固定設定は全preset・WOFF2を保持する。ソース資産、Path B用CSS、ライセンスは削除しない。
7. CIは共有資産の正本との一致とChrome ZIP内の必須CSSを検査し、問い合わせUIが不完全な成果物の公開を拒否する。

`manifest.json`、`src/content/variant.js`、`src/css/replacefont-extension.css`、`src/css/youtube-override.css`、`src/css/preset-*.js`、生成PNGはビルド成果物であり、直接編集しない。
