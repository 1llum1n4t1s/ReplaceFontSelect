# リリースと公開

## リリース起動

- `bun --bun run release`（`scripts/release.js`、`--dry-run`/`-n`、`--yes`/`-y`）は `variants/*.json` の版を patch +1 し、main へ commit・push して、同じ commit に軽量タグ `v<X.Y.Z>` を付け、そのタグだけを push する（`git push --tags` は使わない）。タグ push が `publish.yml` を起動し、matrix で default + notosans を並列公開する。
- 実行は clean かつリモートと同期済みの main から。同名タグがリモートにあれば abort し、タグの付け替え・force push はしない。preset JS と `manifest.json` は CI がビルドで生成する。
- minor / major は `/vava` で版を決め、全 `variants/*.json` と `package.json` を手動で更新して main に commit・push し、同じ commit に軽量タグを付けてそのタグだけを push する（`release.js` は使わない）。タグ push はストア提出を起動するため、公開依頼の範囲でのみ行う。patch の `/vava` は `release.js` に委譲する。

## 失敗時のリカバリー

版タグの新規 push だけが自動提出を開始する。修復 push や rerun は提出を開始しない。同一 job で Chrome が失敗すると後続の Firefox は skip される。

1. 各 variant・ストアの提出状態をストアと Actions で確認し、未提出・再提出が必要な対象を特定する。受付済みか不明な間は再提出しない。
2. 版タグは動かさない（削除・付け替え・force push 禁止）。コード・workflow の修正が要るなら patch を上げて新タグで公開し直す（/vava）。runner・外部障害・secret・Environment など修正不要な原因は解消し、タグの 40 桁 SHA を確認する。
3. Publish workflow を `--ref v<X.Y.Z>` で手動実行し、`variant`・`target`（chrome / firefox）・`expected_sha` を指定する。対象ごとに実行し、結果とストア状態を確認する。

## ローカル梱包（手動アップロード用）

- `.\zip.ps1 [-Variant <name>]`（Windows、既定 `default`）: `bun run deps` → `build:<variant>` → `package-source.js --stage` → `New-FirefoxArchive.ps1` で `temp-build` 内に `chrome.zip` + `firefox.xpi` を作り、`verify-release-archive.js`（Python 3 が必要。`RELEASE_ZIP_PYTHON` 設定時はその値のみ使う）で検証してから最終名 `<zipBaseName>-chrome.zip` / `-firefox.xpi` へ移す。検証前のアーカイブは最終名に置かない。既存の最終名は build 前に削除する。Chrome 用 manifest へ戻せなければ失敗終了する。`convert-fonts` は自動実行しない。
- `./zip.sh [<name>]`（Linux/Mac）は Chrome ZIP のみで verifier を呼ばない。Firefox XPI を含むフルリリースは `zip.ps1` 必須。
- 同梱ファイル（manifest.json・_locales・icons/<variant>・src）の選定と OS 残骸・preview.html・Firefox の TTF 除外は `scripts/package-source.js <variant> --stage <chrome|firefox> <新規dir>` に一本化している（事前に `build-variant` で manifest を生成する）。

## CI 自動公開（`.github/workflows/publish.yml`）

- トリガーは main のコミットに付けた軽量タグ `v<X.Y.Z>` の push。`workflow_dispatch` は再開・対象指定用。Secrets を使う step より前にタグの形・軽量タグ・main の祖先を確認する。
- 公開前ゲートの `verify` job（`verify.yml` を呼ぶ）が依存検証・除外判定・配布 stage 規則・共通部品同期・両 variant のビルド・`verify-style-injection.cjs`・アーカイブ verifier・各 publisher の fixture テストを実行し、失敗すると publish は走らない。`verify.yml` は main への push と全 PR でも動く。
- タグの `X.Y.Z`、`variants/<variant>.json` の `version`、生成 `manifest.json` の `version` が一致しなければ該当 variant の job は失敗する。
- 公開workflowはネイティブgit・公式BunアーカイブとSHA-256検証・PowerShellのHTTP publisherを使い、公開専用CLI/NodeActionsは使わない。CWS・AMO workflow は同じ repository 固定の concurrency group で直列化し、提出中は Dashboard など他の公開操作を並行しない。

### ストア別の提出規則

Chrome は `publish.yml` で下書きまで行い `cws-submit.yml` で申請し、Firefox は検証済み XPI を `Publish-Amo.ps1` で提出する。提出・再開・publisher 変更の前に [ストア別の提出規則](store-submission.md) を読む。
