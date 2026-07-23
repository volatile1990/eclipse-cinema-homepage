param(
  [string]$Magick = "magick",
  [int]$WebpQuality = 84,
  [int]$AvifQuality = 52,
  [int]$AvifSpeed = 6
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path
$assetRoot = (Resolve-Path (Join-Path $repoRoot "assets\used")).Path
$names = @(
  "equipment-jvc-nz7-projector",
  "equipment-nubert-nuvero-110-front-speaker",
  "equipment-nubert-nuvero-nova-12-center",
  "equipment-nubert-nuvero-70-surround",
  "equipment-scan-speak-30w4558t00-subwoofer"
)

if (-not (Get-Command $Magick -ErrorAction SilentlyContinue)) {
  throw "ImageMagick command not found: $Magick"
}

foreach ($name in $names) {
  $source = Join-Path $assetRoot "$name.png"
  $webp = Join-Path $assetRoot "$name.webp"
  $avif = Join-Path $assetRoot "$name.avif"

  if (-not (Test-Path -LiteralPath $source)) {
    throw "Missing equipment source: $source"
  }

  Write-Host "Exporting $name"
  & $Magick $source -strip -quality $WebpQuality -define "webp:method=6" $webp
  if ($LASTEXITCODE -ne 0) { throw "WebP export failed for $name" }

  & $Magick $source -strip -quality $AvifQuality -define "heic:speed=$AvifSpeed" $avif
  if ($LASTEXITCODE -ne 0) { throw "AVIF export failed for $name" }
}

Write-Host "Equipment image export complete: $assetRoot"
