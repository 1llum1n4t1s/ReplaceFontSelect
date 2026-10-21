# Chrome Web Store / Firefox AMO 用のパッケージを作成するスクリプト (Windows PowerShell版)
#
# 使い方:
#   .\zip.ps1                     # default variant をビルド
#   .\zip.ps1 -Variant notosans   # notosans variant をビルド
#
# variants/<name>.json の version / zipBaseName を真実の源として使用する。

param(
    [string]$Variant = "default"
)


# 検証済みの作業対象だけを標準APIで削除する。
function Remove-LocalWorkItem {
    param([string[]]$LiteralPath, [string]$AllowedRoot, [switch]$IgnoreMissing, [switch]$AllowLeafJunction)
    if ([string]::IsNullOrWhiteSpace($AllowedRoot) -or -not [IO.Path]::IsPathRooted($AllowedRoot)) { throw 'Cleanup root must be absolute.' }
    $boundary = [IO.Path]::GetFullPath($AllowedRoot).TrimEnd('\','/') + [IO.Path]::DirectorySeparatorChar
    foreach ($target in $LiteralPath) {
        if ([string]::IsNullOrWhiteSpace($target) -or -not [IO.Path]::IsPathRooted($target)) { throw 'Cleanup target must be absolute.' }
        $resolved = [IO.Path]::GetFullPath($target)
        if (-not $resolved.StartsWith($boundary, [StringComparison]::OrdinalIgnoreCase)) { throw 'Cleanup target is outside the allowed root.' }
        $ancestor = $resolved
        while ($ancestor) {
            if (Test-Path -LiteralPath $ancestor) {
                $item = Get-Item -LiteralPath $ancestor -Force -ErrorAction Stop
                if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -and -not ($AllowLeafJunction -and $ancestor -eq $resolved -and $item.LinkType -eq 'Junction')) { throw 'Cleanup path contains a reparse point.' }
            }
            $ancestor = Split-Path $ancestor -Parent
        }
        if (-not (Test-Path -LiteralPath $resolved)) { if ($IgnoreMissing) { continue }; throw "Cleanup target is missing: $resolved" }
        $item = Get-Item -LiteralPath $resolved -Force -ErrorAction Stop
        $leafLink = [bool]($item.Attributes -band [IO.FileAttributes]::ReparsePoint)
        if ($item.PSIsContainer -and -not $leafLink) {
            if (@(Get-ChildItem -LiteralPath $resolved -Recurse -Force -ErrorAction Stop | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw 'Cleanup directory contains a reparse point.' }
        }
        Remove-Item -LiteralPath $resolved -Recurse:($item.PSIsContainer -and -not $leafLink) -Force -ErrorAction Stop
        if (Test-Path -LiteralPath $resolved) { throw "Cleanup target remains: $resolved" }
    }
}

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

# 依存関係のインストール（pnpm-lock.yaml の整合性チェック付き）
# pnpm install --frozen-lockfile: lockfile に厳密に従い、差分があれば失敗する。サプライチェーン攻撃対策
Write-Host "📦 依存関係をインストール中（pnpm install --frozen-lockfile）..." -ForegroundColor Cyan
pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依存関係のインストールに失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 共通サポート部品を npm package の正本から同期する。
# build:* を経由しないこの包装経路でも、問い合わせ UI の JS 2本 + CSS 3本を必ず揃える。
Write-Host "🧩 共通サポート部品を同期中..." -ForegroundColor Cyan
pnpm run sync:support
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 共通サポート部品の同期に失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host ""

# アイコン生成
Write-Host "🎨 アイコンを生成中..." -ForegroundColor Cyan
node scripts/generate-icons.js $Variant
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
if (Test-Path $zipPath) {  Remove-LocalWorkItem -LiteralPath ($ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($zipPath)) -AllowedRoot $PSScriptRoot }

# 一時ディレクトリを作成
$tempDir = "./temp-build"
if (Test-Path $tempDir) {  Remove-LocalWorkItem -LiteralPath ($ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($tempDir)) -AllowedRoot $PSScriptRoot }
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
node scripts/package-source.js $Variant --copy "$tempDir/src"
if ($LASTEXITCODE -ne 0) { throw "Chrome用ソースのコピーに失敗しました" }

# 不要なファイルを除外
# - preview.html はストア配信に不要 (SVG はインストール時不要だが残してもOK)
# - replacefont-extension.css は Path B (preload-fonts.js の TEMPLATE_CSS_URL fetch) が
#   web_accessible_resources 経由で参照するため配布に含める (publish.yml と同じ方針)
Get-ChildItem -Path $tempDir -Recurse -Include "*.DS_Store","*.swp","*~","preview.html" | ForEach-Object {  Remove-LocalWorkItem -LiteralPath $_.FullName -AllowedRoot $PSScriptRoot -IgnoreMissing }

# ZIPファイルを作成
Compress-Archive -Path "$tempDir/*" -DestinationPath $zipPath -Force
 Remove-LocalWorkItem -LiteralPath ($ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($tempDir)) -AllowedRoot $PSScriptRoot

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

# Firefox AMO用のXPIファイルを作成
# Chrome ZIP の単純コピーでは AMO MV3 validator が service_worker 単独を reject するため、
# build-variant.js --firefox で background.scripts を併記した manifest を作り直してから固める
# (publish.yml の「Firefox 用ソースディレクトリを準備」ステップと同じ構成)。
Write-Host ""
Write-Host "🦊 Firefox AMO用のXPIファイルを作成中..." -ForegroundColor Cyan
if (Test-Path $xpiPath) {  Remove-LocalWorkItem -LiteralPath ($ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($xpiPath)) -AllowedRoot $PSScriptRoot }

node scripts/build-variant.js $Variant --firefox
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firefox 用 manifest の生成に失敗しました" -ForegroundColor Red
    exit 1
}

$firefoxDir = "./firefox-build"
if (Test-Path $firefoxDir) {  Remove-LocalWorkItem -LiteralPath ($ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($firefoxDir)) -AllowedRoot $PSScriptRoot }
New-Item -ItemType Directory -Path $firefoxDir | Out-Null
Copy-Item "manifest.json" -Destination $firefoxDir
New-Item -ItemType Directory -Path "$firefoxDir/icons/$Variant" -Force | Out-Null
Copy-Item "$variantIconsSrc/*" -Destination "$firefoxDir/icons/$Variant/" -Recurse
node scripts/package-source.js $Variant --copy "$firefoxDir/src"
if ($LASTEXITCODE -ne 0) { throw "Firefox用ソースのコピーに失敗しました" }
# Chrome ZIP と同じ除外ポリシー + TTF 除外 (AMO はソース由来の TTF を配信物に含めない)
Get-ChildItem -Path $firefoxDir -Recurse -Include "*.DS_Store","*.swp","*~","preview.html","*.ttf" | ForEach-Object {  Remove-LocalWorkItem -LiteralPath $_.FullName -AllowedRoot $PSScriptRoot -IgnoreMissing }

# Compress-Archive は .zip 前提なので一旦 zip で固めてから .xpi へリネームする
$xpiTempZip = "./$zipBase-firefox-temp.zip"
if (Test-Path $xpiTempZip) {  Remove-LocalWorkItem -LiteralPath ($ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($xpiTempZip)) -AllowedRoot $PSScriptRoot }
Compress-Archive -Path "$firefoxDir/*" -DestinationPath $xpiTempZip -Force
 Remove-LocalWorkItem -LiteralPath ($ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($firefoxDir)) -AllowedRoot $PSScriptRoot
Move-Item $xpiTempZip $xpiPath -Force

# manifest.json を Chrome 版へ戻す (Firefox 版のまま残すと "Load unpacked" が壊れる)
node scripts/build-variant.js $Variant
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Chrome 用 manifest への復帰に失敗しました" -ForegroundColor Red
    exit 1
}

if (Test-Path $xpiPath) {
    Write-Host "✅ XPIファイルを作成しました: $xpiPath" -ForegroundColor Green
    Write-Host "✨ Firefox AMO Developer Hubにアップロードできます！" -ForegroundColor Green
    Write-Host "   https://addons.mozilla.org/developers/" -ForegroundColor Blue
} else {
    Write-Host "❌ XPIファイルの作成に失敗しました" -ForegroundColor Red
    exit 1
}
