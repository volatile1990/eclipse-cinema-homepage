param(
  [string]$PortalApp = "portal-app",
  [string]$Destination = "portal"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Split-Path -Parent $PSScriptRoot)).Path
$sourceRoot = (Resolve-Path (Join-Path $repoRoot "$PortalApp\dist")).Path
$targetRoot = (Resolve-Path (Join-Path $repoRoot $Destination)).Path
$notFoundPath = Join-Path $repoRoot "404.html"
$serviceWorkerPath = Join-Path $targetRoot "sw.js"
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

function Assert-ExactPath {
  param(
    [string]$Actual,
    [string]$Expected,
    [string]$Label
  )

  $resolvedActual = [System.IO.Path]::GetFullPath($Actual).TrimEnd('\', '/')
  $resolvedExpected = [System.IO.Path]::GetFullPath($Expected).TrimEnd('\', '/')
  if (-not $resolvedActual.Equals($resolvedExpected, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "$Label resolved outside the expected workspace location: $resolvedActual"
  }
}

Assert-ExactPath $sourceRoot (Join-Path $repoRoot "portal-app\dist") "Portal export"
Assert-ExactPath $targetRoot (Join-Path $repoRoot "portal") "Portal destination"

$sourceIndexPath = Join-Path $sourceRoot "index.html"
if (-not (Test-Path -LiteralPath $sourceIndexPath -PathType Leaf)) {
  throw "Missing Expo web export: $sourceIndexPath. Run npm run export:web in portal-app first."
}
if (-not (Test-Path -LiteralPath $notFoundPath -PathType Leaf)) {
  throw "Missing root 404 page: $notFoundPath"
}
if (-not (Test-Path -LiteralPath $serviceWorkerPath -PathType Leaf)) {
  throw "Missing portal service worker: $serviceWorkerPath"
}

$indexHtml = [System.IO.File]::ReadAllText($sourceIndexPath)
$bundleMatch = [regex]::Match(
  $indexHtml,
  '/portal/_expo/static/js/web/entry-([a-f0-9]+)\.js',
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)
if (-not $bundleMatch.Success) {
  throw "Could not locate the hashed Expo entry bundle in dist/index.html."
}

$bundleHash = $bundleMatch.Groups[1].Value.ToLowerInvariant()
$bundleWebPath = $bundleMatch.Value
$bundleDiskPath = Join-Path $sourceRoot ($bundleWebPath.Substring('/portal/'.Length).Replace('/', '\'))
if (-not (Test-Path -LiteralPath $bundleDiskPath -PathType Leaf)) {
  throw "The bundle referenced by dist/index.html does not exist: $bundleDiskPath"
}

# Only generated subtrees are replaced. Manifest, icon and service worker are
# maintained by this repository and deliberately survive the Expo export.
foreach ($generatedName in @("_expo", "assets")) {
  $generatedTarget = Join-Path $targetRoot $generatedName
  Assert-ExactPath $generatedTarget (Join-Path $repoRoot "portal\$generatedName") "Generated portal subtree"
  if (Test-Path -LiteralPath $generatedTarget) {
    Remove-Item -LiteralPath $generatedTarget -Recurse -Force
  }
}

Get-ChildItem -LiteralPath $sourceRoot -Force | Where-Object { $_.Name -ne "index.html" } | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $targetRoot -Recurse -Force
}

$targetIndexPath = Join-Path $targetRoot "index.html"
[System.IO.File]::WriteAllText($targetIndexPath, $indexHtml, $utf8NoBom)

# GitHub Pages returns its root 404 document for unknown SPA routes. Static
# aliases give all stable portal routes a real 200 response on a first visit;
# data-dependent routes continue to use the 404 SPA fallback.
$staticRoutes = @(
  "login",
  "register",
  "forgot-password",
  "auth/callback",
  "auth/reset-password",
  "membership-status",
  "profile",
  "notifications",
  "registrations",
  "suggestions",
  "movies",
  "screenings",
  "admin",
  "admin/members",
  "admin/screenings",
  "admin/screenings/new",
  "admin/suggestions"
)

foreach ($route in $staticRoutes) {
  $routeDirectory = Join-Path $targetRoot $route
  $fullRouteDirectory = [System.IO.Path]::GetFullPath($routeDirectory)
  $targetPrefix = $targetRoot.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
  if (-not $fullRouteDirectory.StartsWith($targetPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Static route resolved outside the portal destination: $route"
  }
  New-Item -ItemType Directory -Path $routeDirectory -Force | Out-Null
  [System.IO.File]::WriteAllText((Join-Path $routeDirectory "index.html"), $indexHtml, $utf8NoBom)
}

# Keep the extensionless OAuth callback URL compatible with Pages' historical
# callback.html deployment as well as directory-index routing.
$legacyCallbackPath = Join-Path $targetRoot "auth\callback.html"
[System.IO.File]::WriteAllText($legacyCallbackPath, $indexHtml, $utf8NoBom)

$notFoundHtml = [System.IO.File]::ReadAllText($notFoundPath)
$updatedNotFound = [regex]::Replace(
  $notFoundHtml,
  '/portal/_expo/static/js/web/entry-[a-f0-9]+\.js',
  $bundleWebPath,
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)
if ($updatedNotFound -notmatch [regex]::Escape($bundleWebPath)) {
  throw "Failed to update the portal bundle path in 404.html."
}
[System.IO.File]::WriteAllText($notFoundPath, $updatedNotFound, $utf8NoBom)

$serviceWorker = [System.IO.File]::ReadAllText($serviceWorkerPath)
$serviceWorker = [regex]::Replace(
  $serviceWorker,
  '(?<=\$\{CACHE_PREFIX\})[a-f0-9]+',
  $bundleHash,
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)
$serviceWorker = [regex]::Replace(
  $serviceWorker,
  '/portal/_expo/static/js/web/entry-[a-f0-9]+\.js',
  $bundleWebPath,
  [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)
if ($serviceWorker -notmatch [regex]::Escape($bundleWebPath)) {
  throw "Failed to update the portal bundle path in portal/sw.js."
}
[System.IO.File]::WriteAllText($serviceWorkerPath, $serviceWorker, $utf8NoBom)

Write-Host "Portal export synchronized."
Write-Host "Bundle: $bundleWebPath"
Write-Host "Static route aliases: $($staticRoutes.Count)"
