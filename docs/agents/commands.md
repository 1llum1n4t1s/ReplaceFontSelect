# ビルドと生成コマンド

## Build Commands

```bash
bun run deps         # 初回 checkout 後・bun.lock 更新後の依存同期
bun --bun run build:default              # icons + CSS + preset JS + variant=default のフルビルド
bun --bun run build:notosans             # icons + CSS + preset JS + variant=notosans のフルビルド
bun --bun run build                      # = build:default
bun --bun run build-variant <name>       # manifest.json + src/content/variant.js だけ再生成 (variant 切替時)

bun --bun run generate-css               # fallback / YouTube 用 CSS + 42 個の preset-*.js を再生成 (variant 非依存)
bun --bun run convert-fonts              # src/fonts/*.ttf → *.woff2 変換 (フォント追加時のみ手動実行、 variant 非依存)
bun --bun run generate-icons:default     # icons/default/icon.svg から PNG (16/48/128) を再生成
bun --bun run generate-icons:notosans    # icons/notosans/icon.svg から PNG (16/48/128) を再生成
bun --bun run generate-screenshots          # ストア掲載画像（vitrina）を両 variant で生成。notosans → default の順で、終了時は default の manifest.json が残る
bun --bun run generate-screenshots:default  # default 版だけ: manifest 再生成 → webstore/images/default/<locale>/screenshot-NN.png と tile-*.png（9 言語・要 puppeteer・Windows）
bun --bun run generate-screenshots:notosans # notosans 版だけ（同上。終了後の manifest.json は notosans なので、続けて build:default か build-variant default で戻す）
bun --bun run verify-screenshots            # webstore/images/<variant> の枚数・寸法・命名・アルファ無し・英語フォールバック有無を検査
bun --bun run sync:support                  # 共有パッケージ正本から問い合わせUIの JS / CSS 5資産を同期
bun --bun run check:support                 # 同梱資産が共有パッケージ正本と一致することを読み取り専用で検査
```

`manifest.json`、`src/content/variant.js`、`src/css/replacefont-extension.css`、`src/css/youtube-override.css`、`src/css/preset-*.js` は **ビルド生成物 (.gitignore 済)**。"Load unpacked" の前には対象 variant のフルビルドを 1 回走らせる。`bun test ./scripts/verify-style-injection.cjs` はソースを直接読み込むためフルビルドは前提にしない。開発には Bun 1.4.5 を使用する（package.json の packageManager と CI を同じ版に固定）。PowerShell のパッケージ処理には pwsh 7.7.0 以降を推奨する。フォント注入の回帰検証手順は[テスト手順](testing.md) を参照。その他の UI 検証は実機ブラウザで行う。

`ttf2woff2@8.0.1` は Bun では同梱 WASM で動く。実 TTF から WOFF2 が生成できることを確認する。

依存は `bun.lock` で固定し、`package.json` の overrides / trustedDependencies と `bunfig.toml` の公開後24時間待機・検証済み版の例外を維持する。

Kagayoi Support の問い合わせUIは、exact pin した `@kagayoi/support-extension` を正本とし、`src/shared/` の `kagayoi-support-{footer,popup}.{js,css}` と `kagayoi-support-form.css` の5資産へ逐語同期する。`build:*` と `zip.ps1` は実行前に自動同期し、CI は `check:support` で乖離を拒否する。更新時は依存 version を上げてから `bun --bun run sync:support` と両 variant の build を実行する。

アイコン・スクショ生成には headless Chrome が必要。初回は `bun --bun run puppeteer browsers install chrome` で導入する。Puppeteer v25+ は ESM-only のため生成スクリプトは動的 import を使う。

## ストア掲載画像

`webstore/vitrina/` の共通キットが実拡張を撮影して生成する。キットは直接編集しない。生成・文言変更の前に [ストア掲載画像（vitrina）](store-listing-images.md) を読む。
