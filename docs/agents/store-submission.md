# ストア別の提出規則

## Chrome Web Store

- 拡張機能 ID は variant から `CWS_EXTENSION_ID_<UPPER>`（immutable）を選ぶ。`CWS_CLIENT_ID` / `CWS_CLIENT_SECRET` / `CWS_REFRESH_TOKEN` / `CWS_PUBLISHER_ID` は全 variant 共通。アップロードは `scripts/Publish-Cws.ps1`（API v2）。必須情報不足なら Dashboard の Privacy practices を入力し、提出状態を確認して手動再開する。
- `publish.yml` は `-Stage Upload` で下書きをアップロードするだけで申請しない。Dashboard（Edictora）でロケール別掲載画像などを整えた後、`gh workflow run cws-submit.yml -f version=x.y.z --ref vx.y.z` で申請（`-Stage Publish`、variant ごとの matrix）する。
- `cws-submit.yml` が `:publish` するのは、実行 ref が `main` の祖先の軽量タグ `v<version>` で manifest の版が入力と一致し、`publish.yml` の直近のアップロード成功 run（ステップ名 `Chrome Web Store にアップロード（下書き）`、job 名 `Publish <variant>`）が同じ commit・同じタグから起動している場合だけ。同版が申請済み・公開済みなら再送せず成功終了する。別版の審査中・より新しい版の存在・アップロード進行中/失敗・状態不明は停止する。Dashboard で手動アップロードした下書きは申請されないので Dashboard から手動で申請する。

## Firefox AMO

- 最終XPIを verifier で照合し、SHA-256・GUID・version を `scripts/Publish-Amo.ps1`（PowerShell 7.2 以上）へ渡す。JWT 認証、非公開 listed 版の検査、upload 検証、既存 GUID への PUT 提出の受付応答まで確認する。保存 UUID の再利用・重複・不明な受付結果は停止する。CI 成功は審査完了・公開を意味しない。
- `firefox-build/` は CI で `package-source.js --stage firefox` により構築する。gecko id は `variants/<variant>.json` の `geckoId` から `manifest.json` へ注入される。`AMO_JWT_ISSUER` / `AMO_JWT_SECRET` は全 variant 共通。
- 新 variant の初回登録は AMO Developer Hub の「Submit a New Add-on」で行う（publisher は登録済み GUID 専用で 404 では停止する）。default は登録済み。
- AMO はアカウント単位で提出を制限する。throttle 時は表示時間を待ち、提出状態を確認してから手動再開する。連続再試行しない。
