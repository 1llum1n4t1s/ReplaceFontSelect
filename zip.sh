#!/bin/bash

# Chrome Web Store用のZIPファイルを作成するスクリプト
#
# 使い方:
#   ./zip.sh                # default variant をビルド
#   ./zip.sh notosans       # notosans variant をビルド
#
# variants/<name>.json の version / zipBaseName を真実の源として使用する。

set -e

VARIANT="${1:-default}"
VARIANT_PATH="./variants/$VARIANT.json"

if [ ! -f "$VARIANT_PATH" ]; then
  echo "❌ バリアント設定が見つかりません: $VARIANT_PATH"
  exit 1
fi

# bun -p で JSON を読む（jq 依存を避ける）
VERSION=$(bun -p "require('$VARIANT_PATH').version")
ZIP_BASE=$(bun -p "require('$VARIANT_PATH').zipBaseName")
echo "🎯 Variant: $VARIANT (version=$VERSION, zipBase=$ZIP_BASE)"
echo ""

# 依存関係のインストール（bun.lock の整合性チェック付き）
echo "📦 依存関係をインストール中（bun run deps）..."
bun run deps
echo ""

# 共通部品の同期・アイコン・CSS・variant manifest は build:<variant> に一本化している。
# フォント変換（convert-fonts）は WOFF2 をコミット済みで扱うため、フォント追加時だけ手動で実行する。
echo "🏗️ ビルド中（bun run build:$VARIANT）..."
bun --bun run "build:$VARIANT"
echo ""

# zipコマンドの確認
if ! command -v zip &> /dev/null; then
  echo "❌ zip をインストールしてください"
  echo "   sudo apt install zip"
  exit 1
fi

ZIP_PATH="./$ZIP_BASE-chrome.zip"

# 古いZIPファイルを削除
rm -f "$ZIP_PATH"

# 同梱資産の選定はCI・Windowsと同じ --stage を使い、別ブランドのアイコンや不要ファイルを混入させない。
# 作業ディレクトリは mktemp で新規に作り、その配下の stage だけを使って終了時に片付ける。
WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT
bun scripts/package-source.js "$VARIANT" --stage chrome "$WORK_DIR/chrome"

echo "📦 Chrome Web Store用のZIPファイルを作成中..."
ZIP_ABS="$(cd "$(dirname "$ZIP_PATH")" && pwd)/$(basename "$ZIP_PATH")"
(cd "$WORK_DIR/chrome" && zip -r "$ZIP_ABS" manifest.json _locales "icons/$VARIANT" src)

echo "✅ ZIPファイルを作成しました: $ZIP_PATH"
echo ""
echo "📊 ファイルサイズ:"
ls -lh "$ZIP_PATH"
