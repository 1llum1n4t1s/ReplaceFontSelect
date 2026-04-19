# Chrome Web Store / Firefox AMO 用のパッケージを作成するスクリプト (Windows PowerShell版)

# バージョン同期: package.json から全ファイルにバージョンを自動同期
$packageJson = Get-Content -Path "./package.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$version = $packageJson.version

$filesToUpdate = @("manifest.json", "README.md", "src/popup/popup.html", "webstore/screenshots/01-popup-ui.html", "webstore/screenshots/03-hero-promo.html", "webstore/screenshots/04-promo-small.html", "webstore/screenshots/05-promo-marquee.html")
foreach ($filePath in $filesToUpdate) {
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    
    # バージョン番号の置換
    $content = [regex]::Replace($content, 'v[0-9]+\.[0-9]+\.[0-9]+', "v$version")
    $content = [regex]::Replace($content, 'Version [0-9]+\.[0-9]+\.[0-9]+', "Version $version")
    $content = [regex]::Replace($content, '"version": "[^"]+"', "`"version`": `"$version`"")
    $content = [regex]::Replace($content, 'version-[0-9]+\.[0-9]+\.[0-9]+-', "version-$version-")
    
    # ファイルに書き戻す
    $content | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
}
Write-Host "Version synced: $version" -ForegroundColor Green
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

Write-Host "📦 Chrome Web Store用のZIPファイルを作成中..." -ForegroundColor Cyan

# 古いZIPファイルを削除
if (Test-Path "./replace-font-select-chrome.zip") {
    Remove-Item "./replace-font-select-chrome.zip" -Force
}

# 一時ディレクトリを作成
$tempDir = "./temp-build"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# 必要なファイルをコピー
Write-Host "📂 必要なファイルをコピー中..." -ForegroundColor Yellow

Copy-Item "manifest.json" -Destination $tempDir
Copy-Item "icons" -Destination $tempDir -Recurse
Copy-Item "src" -Destination $tempDir -Recurse

# 不要なファイルを除外
Get-ChildItem -Path $tempDir -Recurse -Include "*.DS_Store","*.swp","*~" | Remove-Item -Force

# ZIPファイルを作成
Compress-Archive -Path "$tempDir/*" -DestinationPath "./replace-font-select-chrome.zip" -Force

# 一時ディレクトリを削除
Remove-Item $tempDir -Recurse -Force

if (Test-Path "./replace-font-select-chrome.zip") {
    Write-Host "✅ ZIPファイルを作成しました: replace-font-select-chrome.zip" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 ファイルサイズ:" -ForegroundColor Cyan
    $fileSize = (Get-Item "./replace-font-select-chrome.zip").Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    Write-Host "   $fileSizeMB MB" -ForegroundColor White
    Write-Host ""
    Write-Host "✨ Chrome Web Store Developer Dashboardにアップロードできます！" -ForegroundColor Green
    Write-Host "   https://chrome.google.com/webstore/devconsole" -ForegroundColor Blue

    # Firefox AMO用のXPIファイルを作成（コードベースは同一）
    Write-Host ""
    Write-Host "🦊 Firefox AMO用のXPIファイルを作成中..." -ForegroundColor Cyan

    if (Test-Path "./replace-font-select-firefox.xpi") {
        Remove-Item "./replace-font-select-firefox.xpi" -Force
    }
    Copy-Item "./replace-font-select-chrome.zip" "./replace-font-select-firefox.xpi" -Force

    if (Test-Path "./replace-font-select-firefox.xpi") {
        Write-Host "✅ XPIファイルを作成しました: replace-font-select-firefox.xpi" -ForegroundColor Green
        Write-Host "✨ Firefox AMO Developer Hubにアップロードできます！" -ForegroundColor Green
        Write-Host "   https://addons.mozilla.org/developers/" -ForegroundColor Blue
    } else {
        Write-Host "❌ XPIファイルの作成に失敗しました" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ ZIPファイルの作成に失敗しました" -ForegroundColor Red
    exit 1
}
