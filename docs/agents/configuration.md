# バリアント設定

## Variant System

`default` と `notosans` は同じソースから別拡張として公開する。設定変更前に [default.json](../../variants/default.json)、[notosans.json](../../variants/notosans.json)、[manifest.template.json](../../manifest.template.json)、[scripts/build-variant.js](../../scripts/build-variant.js) を読む。variant は名前・説明・版・geckoId・フォント固定・除外・ZIP名等を定義し、生成器は manifest と `src/content/variant.js` を生成する。生成した `VARIANT` は content / popup / background が参照する。

`mergeFontSettings()` は保存値に `VARIANT.lockedFonts` を後勝ちで適用し、固定版ではユーザー保存値より優先する。

両 variant は編集体験とアイコンフォントの保護のため、リッチエディタ・ファイル管理・デザイン・IDE 等のドメインを除外する。除外や登録経路の変更前に [default.json](../../variants/default.json) と [notosans.json](../../variants/notosans.json) の `excludeMatches` を両方読み、宣言的・動的登録で一致させる。SharePoint は Office を同一オリジンの iframe で開き、OneDrive 個人版はアイコンフォントを使うため両方を除外する。Discord は `/channels/*` にアプリがあるためドメイン全体を除外する。

## 新しい variant を追加する手順 (将来用)

1. `variants/<name>.json` を作成 (既存 default.json をコピーして編集が早い)
2. `icons/<name>/icon.svg` を配置
3. (任意) `webstore/store-assets.<name>.json`（固有の撮影操作は `store-assets.steps.mjs`）
4. (任意) `docs/<name>/` の privacy-policy.md / privacy.html / index.html
5. (任意) `changelog/<name>.md` を作成
6. `package.json` の `scripts` に `build:<name>` / `generate-icons:<name>` / `generate-screenshots:<name>` を追加
7. 次の variant 列挙箇所すべてに新 variant を追加する
   - `publish.yml`: `workflow_dispatch.inputs.variant.options`、`strategy.matrix.variant`、`対象を選択` と EXTENSION_ID 決定の `case` 文（`CWS_EXTENSION_ID_<UPPER>` の env も）
   - `cws-submit.yml`: `strategy.matrix.variant` と extension ID の `case` 文（env も）
   - `verify.yml` と `dependency-validation.yml`: `build:<name>` ステップ
   - `webstore/run-vitrina.mjs`: `VARIANTS` 配列
8. GitHub Secrets に `CWS_EXTENSION_ID_<UPPER>` を登録
9. `variants/<新>.json` の `version` を default と同じ値に揃える
10. **新変数を `variant.json` に追加した場合は `scripts/build-variant.js` の `REQUIRED_KEYS` 配列も更新**
11. リポジトリ直下に `.amo-metadata-<name>.json` を作成（`.amo-metadata-default.json` を参考）。`Publish-Amo.ps1 -Metadata` の必須ファイルで、無いと AMO 提出だけが失敗する
