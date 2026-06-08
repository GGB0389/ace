$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
Write-Host "本地预览: http://127.0.0.1:8080"
Write-Host "目录: $root"
python -m http.server 8080
