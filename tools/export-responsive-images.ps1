param(
  [string]$Magick = "magick",
  [int]$WebpQuality = 96,
  [int]$AvifQuality = 74,
  [int]$AvifSpeed = 4,
  [string[]]$Only = @()
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$OutputDir = Join-Path $RepoRoot "assets\used\responsive"
$DevelopedDir = Join-Path $RepoRoot "assets\used\selected-developed"
$RawDir = Join-Path $RepoRoot "assets\used\selected-raw"
$TempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("eclipse-cinema-export-" + [System.Guid]::NewGuid().ToString("N"))

$images = @(
  @{
    Name = "cinema-room-hero-4776";
    Aspect = "16:9";
    Widths = @(900, 1200, 1800, 2560);
    Source = "assets\used\IMG_4776.DNG";
    DevelopArgs = @("-sigmoidal-contrast", "3.2x46%", "-brightness-contrast", "2x5", "-modulate", "102,108,100")
  },
  @{ Name = "cinema-platform-blue-green"; Aspect = "16:9"; Widths = @(900, 1200, 1800); Source = "assets\used\IMG_E4785.JPG" },
  @{ Name = "cinema-podium-step-warm-light"; Aspect = "16:9"; Widths = @(900, 1200, 1800); Source = "assets\used\IMG_E4749.JPG" },
  @{
    Name = "cinema-side-row-purple-light";
    Aspect = "4:5";
    Widths = @(720, 900, 1200);
    Source = "assets\used\IMG_4788.DNG";
    DevelopArgs = @("-sigmoidal-contrast", "2.4x45%", "-brightness-contrast", "2x4", "-modulate", "102,106,100")
  },
  @{ Name = "cinema-screen-blue-cyan"; Aspect = "16:9"; Widths = @(900, 1200, 1800); Source = "assets\used\IMG_E4811.JPG" },
  @{ Name = "cinema-front-row-warm-screen"; Aspect = "4:5"; Widths = @(720, 900, 1200); Source = "assets\used\IMG_E4795.JPG" },
  @{ Name = "cinema-podium-front-eclipse"; Aspect = "16:9"; Widths = @(900, 1200, 1800); Source = "assets\used\IMG_E4806.JPG" },
  @{
    Name = "cinema-front-row-magenta-screen";
    Aspect = "4:5";
    Widths = @(720, 900, 1200);
    Source = "assets\used\IMG_4791.DNG";
    DevelopArgs = @("-sigmoidal-contrast", "2.4x45%", "-brightness-contrast", "2x4", "-modulate", "102,106,100")
  },
  @{ Name = "cinema-room-hero-modified"; Aspect = "source"; Widths = @(900, 1200, 1672); Source = "assets\used\cinema-room-hero-modified.png" },
  @{ Name = "cinema-room-hero"; Aspect = "16:9"; Widths = @(1200, 1800, 2560) },
  @{ Name = "cinema-front-lounge-seats"; Aspect = "16:9"; Widths = @(900, 1400, 1800) },
  @{ Name = "cinema-screen-blue-violet-glow"; Aspect = "16:9"; Widths = @(900, 1200, 1800) },
  @{ Name = "cinema-front-wall-open"; Aspect = "source"; Widths = @(900, 1055); Source = "assets\images\front-open.png" },
  @{ Name = "cinema-two-level-seating"; Aspect = "16:9"; Widths = @(900, 1200, 1800) },
  @{ Name = "cinema-acoustic-side-wall"; Aspect = "16:9"; Widths = @(900, 1400, 1800) },
  @{ Name = "cinema-entry-diffuser-detail"; Aspect = "4:5"; Widths = @(720, 900, 1200) },
  @{ Name = "cinema-lounge-depth"; Aspect = "16:9"; Widths = @(900, 1200, 1800) },
  @{ Name = "cinema-diffuser-magenta-detail"; Aspect = "4:5"; Widths = @(720, 900, 1200) },
  @{ Name = "cinema-side-seats-cupholders"; Aspect = "4:5"; Widths = @(720, 900, 1200) }
)

function Resolve-RepoPath {
  param([string]$RelativePath)
  return Join-Path $RepoRoot $RelativePath
}

function Get-PreferredSource {
  param(
    [hashtable]$Image
  )

  if ($Image.ContainsKey("Source")) {
    $source = Resolve-RepoPath $Image.Source
    if (Test-Path $source) { return $source }
    throw "Missing source for $($Image.Name): $source"
  }

  foreach ($ext in @(".tif", ".tiff", ".png", ".jpg", ".jpeg", ".webp")) {
    $candidate = Join-Path $DevelopedDir ($Image.Name + $ext)
    if (Test-Path $candidate) { return $candidate }
  }

  $raw = Join-Path $RawDir ($Image.Name + ".dng")
  if (Test-Path $raw) { return $raw }

  throw "Missing developed master or DNG for $($Image.Name)"
}

function Get-AspectHeight {
  param(
    [int]$Width,
    [string]$Aspect
  )

  switch ($Aspect) {
    "16:9" { return [int][Math]::Round($Width * 9 / 16) }
    "4:5" { return [int][Math]::Round($Width * 5 / 4) }
    default { throw "Unsupported fixed aspect: $Aspect" }
  }
}

function Invoke-Magick {
  param([string[]]$Arguments)
  & $Magick @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "ImageMagick failed: $Magick $($Arguments -join ' ')"
  }
}

if (-not (Get-Command $Magick -ErrorAction SilentlyContinue)) {
  throw "ImageMagick command not found: $Magick"
}

if ($Only.Count -gt 0) {
  $requested = @{}
  foreach ($name in $Only) { $requested[$name] = $true }
  $images = @($images | Where-Object { $requested.ContainsKey($_.Name) })

  if ($images.Count -ne $Only.Count) {
    $known = ($images | ForEach-Object { $_.Name }) -join ", "
    throw "One or more requested images were not found. Matched: $known"
  }
}

New-Item -ItemType Directory -Force $OutputDir | Out-Null
New-Item -ItemType Directory -Force $TempDir | Out-Null

try {
  foreach ($image in $images) {
    $name = $image.Name
    $source = Get-PreferredSource $image
    $maxWidth = ($image.Widths | Measure-Object -Maximum).Maximum
    $master = Join-Path $TempDir ($name + "-master.tif")
    $developArgs = @()

    if ($image.ContainsKey("DevelopArgs")) {
      $developArgs = $image.DevelopArgs
    }

    Write-Host "Exporting $name from $source"

    if ($image.Aspect -eq "source") {
      $masterArgs = @(
        $source,
        "-auto-orient",
        "-colorspace", "sRGB",
        "-depth", "16"
      )
    } else {
      $maxHeight = Get-AspectHeight -Width $maxWidth -Aspect $image.Aspect
      $masterArgs = @(
        $source,
        "-auto-orient",
        "-colorspace", "sRGB",
        "-resize", "${maxWidth}x${maxHeight}^",
        "-gravity", "center",
        "-extent", "${maxWidth}x${maxHeight}",
        "-depth", "16"
      )
    }

    Invoke-Magick ($masterArgs + $developArgs + @($master))

    foreach ($width in $image.Widths) {
      $webp = Join-Path $OutputDir ("$name-$width.webp")
      $avif = Join-Path $OutputDir ("$name-$width.avif")

      if ($image.Aspect -eq "source") {
        $resize = "${width}x>"
      } else {
        $height = Get-AspectHeight -Width $width -Aspect $image.Aspect
        $resize = "${width}x${height}!"
      }

      Invoke-Magick @(
        $master,
        "-filter", "Lanczos",
        "-resize", $resize,
        "-unsharp", "0x0.45+0.32+0.015",
        "-strip",
        "-quality", $WebpQuality,
        "-define", "webp:method=6",
        $webp
      )

      Invoke-Magick @(
        $master,
        "-filter", "Lanczos",
        "-resize", $resize,
        "-unsharp", "0x0.45+0.32+0.015",
        "-strip",
        "-depth", "10",
        "-quality", $AvifQuality,
        "-define", "heic:speed=$AvifSpeed",
        $avif
      )
    }
  }
} finally {
  if (Test-Path $TempDir) {
    Remove-Item -LiteralPath $TempDir -Recurse -Force
  }
}

Write-Host "Responsive image export complete: $OutputDir"
