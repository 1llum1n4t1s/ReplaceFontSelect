#requires -Version 7.0
[CmdletBinding()]
param([string]$Archive, [ValidatePattern('^[a-fA-F0-9]{64}$')][string]$ExpectedSha256, [switch]$CheckExistingVersion, [switch]$AllowUnpublishedItem, [ValidateSet('Fail','Published','Accepted')][string]$ExistingVersionPolicy='Fail', [Net.Http.HttpMessageHandler]$HttpHandler, [ValidateSet('Upload','Publish','All')][string]$Stage, [string]$Version)
$ErrorActionPreference = 'Stop'
if (-not $PSBoundParameters.ContainsKey('Stage')) { throw '-Stage is required (Upload, Publish or All). Stage was not specified, so nothing was sent.' }
# API contract: https://developer.chrome.com/docs/webstore/using-api
# 既存pwsh/.NETとHttpHandler fixtureを維持し、処理本体はC#へ渡す。
# -Stage(必須・既定値なし。未指定は通信前に拒否): Upload=ZIPのアップロードのみ / Publish=申請のみ(-Version必須) / All=連続実行。
$source = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'CwsPublisher.cs'))
$hasher = [Security.Cryptography.SHA256]::Create()
try { $hash = [BitConverter]::ToString($hasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($source))).Replace('-','') }
finally { $hasher.Dispose() }
$typeName = 'Kagayoi.Cws.H' + $hash + '.Publisher'
$publisher = $typeName -as [type]
if (!$publisher) {
    Add-Type -TypeDefinition $source.Replace('__SOURCE_HASH__', ('H' + $hash))
    $publisher = $typeName -as [type]
}
# Publish段はZIPを持たない(別workflowで版だけ受け取る)。引数の組合せ検証はC#側で通信前に行う。
$archivePath = if ([string]::IsNullOrEmpty($Archive)) { $null } else { (Resolve-Path -LiteralPath $Archive).ProviderPath }
$publisher::Run($archivePath, $ExpectedSha256, $CheckExistingVersion.IsPresent, $AllowUnpublishedItem.IsPresent, $ExistingVersionPolicy, $HttpHandler, $Stage, $Version)
