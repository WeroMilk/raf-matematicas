# Script para hacer push a https://github.com/WeroMilk/raf_est
# Ejecutar en PowerShell desde la carpeta del proyecto:
#   .\push-to-github.ps1

$ErrorActionPreference = "Stop"
$git = "C:\Program Files\Git\bin\git.exe"
if (-not (Test-Path $git)) { $git = "git.exe" }
Set-Location $PSScriptRoot

$lock = Join-Path .git "index.lock"
if (Test-Path $lock) {
    Remove-Item $lock -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

& $git add -A
$status = & $git status --porcelain
if ($status) {
    & $git commit -m "RAF Matemáticas E.S.T. - Next.js PWA"
}
& $git branch -M main
$remote = & $git remote get-url origin 2>$null
if (-not $remote) {
    & $git remote add origin https://github.com/WeroMilk/raf_est.git
}
& $git push -u origin main

Write-Host "Listo. Repositorio: https://github.com/WeroMilk/raf_est" -ForegroundColor Green
