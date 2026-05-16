# Chrome Web Store / Firefox AMO 用のパッケージを作成するスクリプト (Windows PowerShell版)
#
# 使い方:
#   .\zip.ps1                  # default variant をビルド
#   .\zip.ps1 -Variant <name>  # 将来追加される variant をビルド (default 以外は variants/*.json 必須)
#
# variants/<name>.json の version / zipBaseName を真実の源として使用する。

param(
    [string]$Variant = "default"
)

$ErrorActionPreference = "Stop"

# バリアント設定を読み込む
$variantPath = "./variants/$Variant.json"
if (-not (Test-Path $variantPath)) {
    Write-Host "❌ バリアント設定が見つかりません: $variantPath" -ForegroundColor Red
    exit 1
}
$variantConfig = Get-Content -Path $variantPath -Raw -Encoding UTF8 | ConvertFrom-Json
$version = $variantConfig.version
$zipBase = $variantConfig.zipBaseName
Write-Host "🎯 Variant: $Variant (version=$version, zipBase=$zipBase)" -ForegroundColor Cyan
Write-Host ""

# 依存関係のインストール（package-lock.json の整合性チェック付き）
# npm ci: lockfile に厳密に従い、差分があれば失敗する。サプライチェーン攻撃対策
Write-Host "📦 依存関係をインストール中（npm ci）..." -ForegroundColor Cyan
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依存関係のインストールに失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host ""

# アイコン生成
Write-Host "🎨 アイコンを生成中..." -ForegroundColor Cyan
node scripts/generate-icons.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ アイコン生成に失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host ""

# フォント変換（TTFがある場合）
if (Test-Path "src/fonts/*.ttf") {
    Write-Host "🔄 フォントを変換中..." -ForegroundColor Cyan
    node scripts/convert-fonts.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ フォント変換に失敗しました" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# CSS生成
Write-Host "🎨 CSSを生成中..." -ForegroundColor Cyan
node scripts/generate-css.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ CSS生成に失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host ""

# variant manifest / variant.js を生成
Write-Host "🧬 バリアント設定を適用中..." -ForegroundColor Cyan
node scripts/build-variant.js $Variant
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ バリアントビルドに失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 出力パッケージ名は variant ごと
$zipPath = "./$zipBase-chrome.zip"
$xpiPath = "./$zipBase-firefox.xpi"

# 古いZIPファイルを削除
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# 一時ディレクトリを作成
$tempDir = "./temp-build"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 必要なファイルをコピー (icons は対象 variant のみ同梱して別ブランドのアイコンが混入しないようにする)
Write-Host "📂 必要なファイルをコピー中..." -ForegroundColor Yellow
Copy-Item "manifest.json" -Destination $tempDir
$variantIconsSrc = "icons/$Variant"
if (-not (Test-Path $variantIconsSrc)) {
    Write-Host "❌ variant 用のアイコンディレクトリが見つかりません: $variantIconsSrc" -ForegroundColor Red
    exit 1
}
New-Item -ItemType Directory -Path "$tempDir/icons/$Variant" -Force | Out-Null
Copy-Item "$variantIconsSrc/*" -Destination "$tempDir/icons/$Variant/" -Recurse
Copy-Item "src" -Destination $tempDir -Recurse

# 不要なファイルを除外
# - preview.html はストア配信に不要 (SVG はインストール時不要だが残してもOK)
# - replacefont-extension.css は preset JS 生成用のビルド時 input で
#   ランタイムでは誰も参照しない (Path B 削除後) ため配布から除外
Get-ChildItem -Path $tempDir -Recurse -Include "*.DS_Store","*.swp","*~","preview.html","replacefont-extension.css" | Remove-Item -Force

# ZIPファイルを作成
Compress-Archive -Path "$tempDir/*" -DestinationPath $zipPath -Force
Remove-Item $tempDir -Recurse -Force

if (-not (Test-Path $zipPath)) {
    Write-Host "❌ ZIPファイルの作成に失敗しました" -ForegroundColor Red
    exit 1
}

Write-Host "✅ ZIPファイルを作成しました: $zipPath" -ForegroundColor Green
Write-Host ""
Write-Host "📊 ファイルサイズ:" -ForegroundColor Cyan
$fileSize = (Get-Item $zipPath).Length
$fileSizeMB = [math]::Round($fileSize / 1MB, 2)
Write-Host "   $fileSizeMB MB" -ForegroundColor White
Write-Host ""
Write-Host "✨ Chrome Web Store Developer Dashboardにアップロードできます！" -ForegroundColor Green
Write-Host "   https://chrome.google.com/webstore/devconsole" -ForegroundColor Blue

# Firefox AMO用のXPIファイルを作成（コードベースは同一）
Write-Host ""
Write-Host "🦊 Firefox AMO用のXPIファイルを作成中..." -ForegroundColor Cyan
if (Test-Path $xpiPath) { Remove-Item $xpiPath -Force }
Copy-Item $zipPath $xpiPath -Force

if (Test-Path $xpiPath) {
    Write-Host "✅ XPIファイルを作成しました: $xpiPath" -ForegroundColor Green
    Write-Host "✨ Firefox AMO Developer Hubにアップロードできます！" -ForegroundColor Green
    Write-Host "   https://addons.mozilla.org/developers/" -ForegroundColor Blue
} else {
    Write-Host "❌ XPIファイルの作成に失敗しました" -ForegroundColor Red
    exit 1
}
