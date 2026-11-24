# ローカルテスト

- **フォント注入の回帰検証**: `bun test ./scripts/verify-style-injection.cjs` — Puppeteer の実ブラウザで Shadow 初期化、遅延した外部 CSS / @import、DOM 更新時の再移動、ページの破棄・復帰、除外リスト一致時の撤去を検証する。拡張 API は fixture で、Firefox 実機の代替にはしない。
- **置換除外リストの判定**: `bun --bun run test:exclusions` — 規則の正規化・glob/前方一致・match pattern への変換を検証する（CI の verify でも実行）。
- **起動後の補填注入**: `bun --bun run test:startup` — 対象判定・除外・応答しないタブの独立性を検証する（CI の verify でも実行）。
- **配布 stage の選定規則**: `bun --bun run test:package` — `stagePackage` の除外・拒否・固定版の除外を一時 fixture で検証する（CI の verify でも実行）。
- **Chrome**: `chrome://extensions` → Developer mode ON → "Load unpacked" でリポジトリルートを選択
- **Firefox**: `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on..." で `manifest.json` を選択 (desktop 140+ / Android 142+)
- Firefox の読み込み前はフルビルド後に `bun scripts/build-variant.js <variant> --firefox` を実行する。Chrome の検証へ戻るときは `bun --bun run build-variant <variant>` で Chrome 用 manifest を再生成する。
- コード変更後は拡張機能リストで再読み込み+対象ページをリロード (preset JS / CSS は `document_start` 時にキャッシュされるため)

問い合わせUIまたはFirefoxの権限申告を変更するときは、[DESIGN.md の送信境界](../design/security.md#問い合わせuiの共有資産同期)に従い、`manifest.template.json` の申告と共有部品の要求対象、popupの `firefox-data-consent` 属性を照合する。両variantのビルドと `bun --bun run check:support` に加え、Firefoxで任意許可を拒否・取得失敗した場合に確認コード送信・再送・認証・問い合わせ送信が止まり、フォント置換は利用できることを検証する。

- **Chrome を起動するスクリプトはシード必須**: puppeteer.launch・chrome-launcher・Chrome の直接起動は、起動前に user-data-dir の `Local State` へ `{"password_manager":{"os_password_blank":false,"os_password_last_changed":"9223372036854775000"}}` を書く。Windows の Chromium は新規プロファイルごとに空パスワードで LogonUser を呼びログオン失敗（Security 4625）として数えられ、並列・連続起動でアカウントがロックされる（実害あり）。`scripts/chrome-profile-seed.mjs` の `createSeededProfile()` / `seedChromeProfile()` を使い、userDataDir 未指定の起動は作らない。
