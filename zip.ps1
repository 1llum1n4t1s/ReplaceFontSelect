# Chrome Web Store / Firefox AMO 用のパッケージを作成するスクリプト (Windows PowerShell版)
#
# 使い方:
#   .\zip.ps1                     # default variant をビルド
#   .\zip.ps1 -Variant notosans   # notosans variant をビルド
#
# variants/<name>.json の version / zipBaseName を真実の源として使用する。
# 同梱ファイルの選定は scripts/package-source.js --stage、アーカイブ化は scripts/New-FirefoxArchive.ps1、
# 検証は scripts/verify-release-archive.js で、publish.yml・verify.yml と同じ経路を使う。
# 検証には Python 3 が必要（RELEASE_ZIP_PYTHON で実行ファイルを指定できる）。

param(
    [string]$Variant = "default"
)


# 検証済みの作業対象だけを標準APIで削除する。
function Remove-LocalWorkItem {
    param([string[]]$LiteralPath, [string]$AllowedRoot, [switch]$IgnoreMissing)
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
                if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Cleanup path contains a reparse point.' }
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

# 検証用の Python 3 を探す（Windows の WindowsApps エイリアスは import 確認で弾く）。
# RELEASE_ZIP_PYTHON が設定されていればその値だけを試し、無効でも他へはフォールバックしない。
function Resolve-ReleasePython {
    if ($env:RELEASE_ZIP_PYTHON) {
        $candidates = @(, @($env:RELEASE_ZIP_PYTHON))
    } else {
        $candidates = @(@('py', '-3'), @('python3'), @('python'))
    }
    foreach ($candidate in $candidates) {
        if (-not (Get-Command $candidate[0] -ErrorAction SilentlyContinue)) { continue }
        $rest = @($candidate | Select-Object -Skip 1)
        $path = & $candidate[0] @rest -I -c 'import sys, zipfile; print(sys.executable)' 2>$null
        if ($LASTEXITCODE -eq 0 -and $path) { return ($path | Select-Object -First 1) }
    }
    return $null
}

# 配布物を stage → アーカイブ → 検証の順で作る（publish.yml / verify.yml と同じ手順）。
function New-VerifiedArchive {
    param([string]$Platform, [string]$Stage, [string]$Archive)
    bun scripts/package-source.js $Variant --stage $Platform $Stage
    if ($LASTEXITCODE -ne 0) { throw "$Platform 用ソースの構築に失敗しました" }
    pwsh -NoProfile -File scripts/New-FirefoxArchive.ps1 -SourceDirectory $Stage -Archive $Archive | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "$Platform 用アーカイブの作成に失敗しました" }
    # 見つけた Python は verifier の実行中だけ渡し、呼び出し元セッションの環境変数を残さない。
    $previousPython = $env:RELEASE_ZIP_PYTHON
    try {
        $env:RELEASE_ZIP_PYTHON = $python
        bun scripts/verify-release-archive.js verify $Variant $version $Stage $Archive $Platform
        $verifyExit = $LASTEXITCODE
    } finally {
        $env:RELEASE_ZIP_PYTHON = $previousPython
    }
    if ($verifyExit -ne 0) { throw "$Platform 用アーカイブの検証に失敗しました" }
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

$python = Resolve-ReleasePython
if (-not $python) {
    if ($env:RELEASE_ZIP_PYTHON) {
        Write-Host "❌ RELEASE_ZIP_PYTHON に指定された Python を実行できません: $($env:RELEASE_ZIP_PYTHON)" -ForegroundColor Red
    } else {
        Write-Host "❌ 検証用の Python 3 が見つかりません（RELEASE_ZIP_PYTHON で指定できます）" -ForegroundColor Red
    }
    exit 1
}

# 出力パッケージ名は variant ごと。古い成果物は build より前に消し、消せなければ停止する。
$zipPath = Join-Path $PSScriptRoot "$zipBase-chrome.zip"
$xpiPath = Join-Path $PSScriptRoot "$zipBase-firefox.xpi"
foreach ($old in @($zipPath, $xpiPath)) {
    try {
        if (Test-Path -LiteralPath $old) { Remove-LocalWorkItem -LiteralPath $old -AllowedRoot $PSScriptRoot }
    } catch {
        Write-Host "❌ 既存の成果物を削除できません: $old ($($_.Exception.Message))" -ForegroundColor Red
        exit 1
    }
}

# 依存関係のインストール（bun.lock の整合性チェック付き）
# bun run deps: lockfile に厳密に従い、差分があれば失敗する。サプライチェーン攻撃対策
Write-Host "📦 依存関係をインストール中（bun run deps）..." -ForegroundColor Cyan
bun run deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 依存関係のインストールに失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 共通部品の同期・アイコン・CSS・variant manifest は build:<variant> に一本化している。
# フォント変換（convert-fonts）は WOFF2 をコミット済みで扱うため、フォント追加時だけ手動で実行する。
Write-Host "🏗️ ビルド中（bun run build:$Variant）..." -ForegroundColor Cyan
bun --bun run "build:$Variant"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ビルドに失敗しました" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 作業ディレクトリ（.gitignore 済み）。失敗しても必ず片付け、manifest.json を Chrome 版へ戻す。
# アーカイブも作業ディレクトリ内で作って検証し、両方通ってから最終名へ移す。
# 最終名は開始時に消してあるため、検証を通っていないアーカイブは最終名に置かれない。
# 最終名へ移す途中で失敗した場合は置いた分を外す。Ctrl+C などの中断では、検証済みの片方だけが最終名に残ることがある。
$workDir = Join-Path $PSScriptRoot "temp-build"
if (Test-Path $workDir) { Remove-LocalWorkItem -LiteralPath $workDir -AllowedRoot $PSScriptRoot }
New-Item -ItemType Directory -Path $workDir | Out-Null
$workZip = Join-Path $workDir "chrome.zip"
$workXpi = Join-Path $workDir "firefox.xpi"

try {
    # Chrome: manifest.json は Chrome 版のまま包装し、検証する。
    Write-Host "📂 Chrome 用パッケージを作成・検証中..." -ForegroundColor Yellow
    New-VerifiedArchive -Platform chrome -Stage (Join-Path $workDir "chrome") -Archive $workZip

    # Firefox: AMO MV3 validator は service_worker 単独を reject するため、
    # build-variant.js --firefox で background.scripts を併記した manifest を作り直してから固める。
    Write-Host ""
    Write-Host "🦊 Firefox AMO用のXPIファイルを作成・検証中..." -ForegroundColor Cyan
    bun scripts/build-variant.js $Variant --firefox
    if ($LASTEXITCODE -ne 0) { throw "Firefox 用 manifest の生成に失敗しました" }
    New-VerifiedArchive -Platform firefox -Stage (Join-Path $workDir "firefox") -Archive $workXpi

    # 両方の検証が通った後で2件を最終名へ移す。新版と旧版を混在させないため、失敗したら置いた分を外す。
    try {
        Move-Item -LiteralPath $workZip -Destination $zipPath
        Move-Item -LiteralPath $workXpi -Destination $xpiPath
    } catch {
        foreach ($path in @($zipPath, $xpiPath)) {
            try { Remove-LocalWorkItem -LiteralPath $path -AllowedRoot $PSScriptRoot -IgnoreMissing } catch { }
        }
        foreach ($path in @($zipPath, $xpiPath)) {
            $state = if (Test-Path -LiteralPath $path) { "存在します" } else { "ありません" }
            Write-Host "❌ 最終名への移動に失敗しました。最終名の現状: $path は$state" -ForegroundColor Red
        }
        throw
    }
}
finally {
    # finally 内では throw / exit しない（元の失敗理由を置き換えないため）。失敗はフラグで後へ伝える。
    # manifest.json を Chrome 版へ戻す (Firefox 版のまま残すと "Load unpacked" が壊れる)
    bun scripts/build-variant.js $Variant
    $manifestRestored = ($LASTEXITCODE -eq 0)
    if (-not $manifestRestored) {
        Write-Host "❌ Chrome 用 manifest への復帰に失敗しました" -ForegroundColor Red
    }
    try {
        if (Test-Path $workDir) { Remove-LocalWorkItem -LiteralPath $workDir -AllowedRoot $PSScriptRoot }
    } catch {
        Write-Host "⚠️ 作業ディレクトリを片付けられませんでした: $workDir ($($_.Exception.Message))" -ForegroundColor Yellow
    }
}
# ここへ来るのは成功時だけ。manifest を戻せなかった場合は失敗として終える。
if (-not $manifestRestored) { exit 1 }

Write-Host ""
Write-Host "✅ ZIPファイルを作成しました: $zipPath" -ForegroundColor Green
Write-Host "📊 ファイルサイズ:" -ForegroundColor Cyan
Write-Host ("   {0} MB" -f [math]::Round((Get-Item $zipPath).Length / 1MB, 2)) -ForegroundColor White
Write-Host "✨ Chrome Web Store Developer Dashboardにアップロードできます！" -ForegroundColor Green
Write-Host "   https://chrome.google.com/webstore/devconsole" -ForegroundColor Blue
Write-Host ""
Write-Host "✅ XPIファイルを作成しました: $xpiPath" -ForegroundColor Green
Write-Host "✨ Firefox AMO Developer Hubにアップロードできます！" -ForegroundColor Green
Write-Host "   https://addons.mozilla.org/developers/" -ForegroundColor Blue
