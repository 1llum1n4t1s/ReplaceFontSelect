# 依存管理

- 固定復元は `bun run deps`（lock 欠落・破損を拒否し、`[run] bun=true` で postinstall も Bun 実行）。通常の `bun install` 直接実行へ戻さない。ローカルでは `bun audit` で監査する。警告を除外・成功扱いにしない。
- Dependabot の通常更新 PR は維持し、Dependency validation で検証する。手動実行は `mode=pr`（既定、`pr`・`base`・`head` 必須で本人性・最新 SHA・merge parents を検査）と `mode=main`（PR 入力を空にし既定ブランチを選ぶ。run-name `dependency-main-validation sha=...`）。
- 暫定修正: minimatch は 11.0.4 以降、multimatch は named import 対応の 8 系へ override。ESLint 設定の ESM 経路は @eslint/eslintrc@3.3.7 と @eslint/config-array@0.21.2 の最小 import patch。web-ext@10.8.0 の FileFilter は Windows で windowsPathsNoEscape を明示する。
- deepmerge 4.3.1（CVE-2026-93753）は公式修正版が未公開のため `patches/deepmerge@4.3.1.patch`（Bun の patchedDependencies）で `__proto__` 経由の汚染を防ぐ。`bun run test:dependencies` で検証し、公式修正版の採用時に要否を再確認する。
