# Manifest・CSP・ブラウザ互換

## CSP の制限

`font-src` / `default-src 'none'` の厳格 CSP サイトでは拡張 URL の `url()` がブロックされ、`local()` フォールバックのみ動作する。拡張側では回避不可。

## Cross-Browser

Chrome / Firefox desktop 140+ / Firefox Android 142+ を単一コードで対応する。gecko id は variant から注入し、Chrome は `browser_specific_settings` を無視する。`chrome.runtime.getURL('')` が取得できない場合、`preload-fonts.js` は URL を組み立てずに処理を止める。popup のフォントは拡張内の相対パスを使う。

Firefox MV3 では AMO が `background.service_worker` 単独を拒否する。`manifest.template.json` は service worker のみを定義し、`bun scripts/build-variant.js <variant> --firefox` が `variant.js`、`font-config.js`、`background.js` の順で `background.scripts` を追加する（`zip.ps1` と CI も同経路）。Chrome は `--firefox` なしで生成する。event page では `importScripts` が使えないため、`background.js` は `typeof importScripts === 'function'` でガードする。

## その他の制約

- `web_accessible_resources` に `src/fonts/*.woff2` と `src/css/replacefont-extension.css` を含める（後者は Path B の fetch + placeholder 解決に必須）。`inject.js` は動的登録のため WAR に含めない。
- 宣言的 `all_frames: true` と動的登録 `allFrames: true` を揃える（iframe 内も対象）。`run_at` は `document_start`。
- `extension_pages` CSP: `script-src 'self'; object-src 'self'; base-uri 'self'; form-action 'none'`。
- M PLUS 2 / Murecho は variable font で Regular/Bold が同一 woff2。
- popup のフォント変更はページリロードが必要（CSS は `document_start` で一度キャッシュされる）。CSS ファイルの相対 URL はページオリジンに解決されるため、JS を登録して `chrome.runtime.getURL()` で絶対 URL を構築する。
