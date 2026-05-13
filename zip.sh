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

# node -p で JSON を読む（jq 依存を避ける）
VERSION=$(node -p "require('$VARIANT_PATH').version")
ZIP_BASE=$(node -p "require('$VARIANT_PATH').zipBaseName")
echo "🎯 Variant: $VARIANT (version=$VERSION, zipBase=$ZIP_BASE)"
echo ""

# 依存関係のインストール（package-lock.json の整合性チェック付き）
echo "📦 依存関係をインストール中（npm ci）..."
npm ci
echo ""

# アイコン生成
echo "🎨 アイコンを生成中..."
node scripts/generate-icons.js
echo ""

# フォント変換（TTFがある場合）
if ls src/fonts/*.ttf 1> /dev/null 2>&1; then
  echo "🔄 フォントを変換中..."
  node scripts/convert-fonts.js
  echo ""
fi

# CSS生成
echo "🎨 CSSを生成中..."
node scripts/generate-css.js
echo ""

# variant manifest / variant.js を生成
echo "🧬 バリアント設定を適用中..."
node scripts/build-variant.js "$VARIANT"
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

# icons は対象 variant のみ同梱 (他 variant のアセットがストア掲載物に混入するのを防ぐ)
VARIANT_ICONS_DIR="icons/$VARIANT"
if [ ! -d "$VARIANT_ICONS_DIR" ]; then
  echo "❌ variant 用のアイコンディレクトリが見つかりません: $VARIANT_ICONS_DIR"
  exit 1
fi

echo "📦 Chrome Web Store用のZIPファイルを作成中..."
# preview.html はストア配信物に不要なので exclude
zip -r "$ZIP_PATH" \
  manifest.json \
  "$VARIANT_ICONS_DIR" \
  src/ \
  -x "*.DS_Store" "*.swp" "*~" "*/preview.html"

echo "✅ ZIPファイルを作成しました: $ZIP_PATH"
echo ""
echo "📊 ファイルサイズ:"
ls -lh "$ZIP_PATH"
