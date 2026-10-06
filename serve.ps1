$ErrorActionPreference = 'Stop'
$port = 3010
$root = Join-Path $PSScriptRoot 'dist'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.wasm' = 'application/wasm'
  '.data' = 'application/octet-stream'
  '.png' = 'image/png'
  '.jpg' = 'image/jpeg'
  '.gif' = 'image/gif'
  '.svg' = 'image/svg+xml'
  '.ico' = 'image/x-icon'
}

try {
  $listener.Start()
  Write-Host ''
  Write-Host '  ============================================'
  Write-Host '     NutriShop est pret !'
  Write-Host '  ============================================'
  Write-Host ''
  Write-Host "  Adresse : http://localhost:$port"
  Write-Host ''
  Write-Host '  Ne fermez pas cette fenetre pendant'
  Write-Host '  l utilisation de l application.'
  Write-Host ''
  Start-Process "http://localhost:$port/?version=20261006"

  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath)
    if ($requestPath -eq '/') { $requestPath = '/index.html' }
    $relativePath = $requestPath.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
    $filePath = [IO.Path]::GetFullPath((Join-Path $root $relativePath))
    $rootPath = [IO.Path]::GetFullPath($root)

    if (-not $filePath.StartsWith($rootPath, [StringComparison]::OrdinalIgnoreCase)) {
      $context.Response.StatusCode = 403
      $context.Response.Close()
      continue
    }

    if (-not (Test-Path $filePath -PathType Leaf) -and [IO.Path]::GetExtension($filePath) -eq '') {
      $filePath = Join-Path $root 'index.html'
    }

    if (Test-Path $filePath -PathType Leaf) {
      $bytes = [IO.File]::ReadAllBytes($filePath)
      $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
      $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
      $context.Response.ContentType = $contentType
      $context.Response.Headers.Add('Cache-Control', 'no-store, no-cache, must-revalidate')
      $context.Response.Headers.Add('Pragma', 'no-cache')
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $context.Response.StatusCode = 404
    }
    $context.Response.Close()
  }
} catch {
  Write-Host ''
  Write-Host "ERREUR : $($_.Exception.Message)" -ForegroundColor Red
  Write-Host 'Essayez de fermer une ancienne fenetre NutriShop, puis relancez ce fichier.'
  Read-Host 'Appuyez sur Entree pour fermer'
} finally {
  if ($listener.IsListening) { $listener.Stop() }
  $listener.Close()
}
