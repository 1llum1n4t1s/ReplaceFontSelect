# AGENTS.md

This file provides guidance to Codex and other coding agents working in this repository.

## Project Overview

**目に優しいフォント置換** — Chrome / Firefox desktop (140+) / Firefox Android (142+) の Manifest V3 拡張機能。ウェブサイトのフォントを選択した日本語フォントへ置換する。本文 7 種 × 等幅 3 種 × Weight 2 種の 42 プリセットを通常は `document_start` で同期注入し、Chrome の YouTube だけ非同期 Blob 経路を使う。

単一コードベースから `default`（フォント選択 UI 付き）と `notosans`（Noto Sans JP + UDEV Gothic JPDOC 固定）を別々の拡張機能 ID で公開する。置換フォントの `unicode-range` は省略し、範囲外の文字は font fallback に委ねる。

## 基本コマンド

```bash
bun run deps                     # 初回 checkout 後・bun.lock 更新後の依存同期
bun --bun run build:default      # default のフルビルド
bun --bun run build:notosans     # notosans のフルビルド
bun test ./scripts/verify-style-injection.cjs  # フォント注入の回帰検証
```

## 全作業共通の制約

- `manifest.json`、`src/content/variant.js`、`src/css/` の生成 CSS と `preset-*.js`、`_locales/` は生成物。直接編集せず生成元を変える。
- Path A（同期 preset）と Path B（fallback と競合 font-face 監視）を両方維持する。フォント定義と検証は `font-config.js` に一元化する。
- サイト除外は両 variant と、宣言的・動的登録で一致させる。
- 公開済み variant は並行運用を維持する。退役・統合はゆろさんの明示承認を得てから進める。
- `src/shared/kagayoi-support-*` と `webstore/vitrina/` は正本から同期する。直接改変しない。
- 開発は Bun 1.4.5。依存は `bun run deps` で復元する。
- Chrome を起動するスクリプトは `scripts/chrome-profile-seed.mjs` でシードしたプロファイルを必ず使う。省くと Windows アカウントがロックされ得る。
- 版タグの push はストア提出を起動する。公開依頼の範囲でのみ行い、タグの付け替え・force push はしない。

## 作業別の必読文書

- ビルド・生成・掲載画像・共有資産の変更前: [commands.md](docs/agents/commands.md)
- テストの実行・追加、Chrome 起動スクリプト、問い合わせ UI・Firefox 権限申告の変更前: [testing.md](docs/agents/testing.md)
- variant・除外ドメインの変更前: [configuration.md](docs/agents/configuration.md)
- ランタイム・フォント・manifest・CSS の変更前: [architecture.md](docs/agents/architecture.md)
- リリース・梱包・公開 workflow の作業前: [release-process.md](docs/agents/release-process.md)
- 依存の更新前: [dependency-management.md（依存管理）](docs/agents/dependency-management.md)
- システム構造と設計判断: [DESIGN.md](DESIGN.md)
