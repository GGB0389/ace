param(
    [string]$OutName = "ace-site-deploy.zip"
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$out = Join-Path $root $OutName

if (Test-Path $out) { Remove-Item $out -Force }

$exclude = @(".git", $OutName)

Push-Location $root
try {
    $items = Get-ChildItem -Force | Where-Object { $exclude -notcontains $_.Name }
    Compress-Archive -Path ($items | ForEach-Object { $_.FullName }) -DestinationPath $out -CompressionLevel Optimal
    $mb = [math]::Round((Get-Item $out).Length / 1MB, 1)
    Write-Host "已打包: $out ($mb MB)"
    Write-Host ""
    Write-Host "上传到 Cloudflare Pages："
    Write-Host "  控制台 → Workers 和 Pages → 你的项目 → 上传资产（Upload）"
    Write-Host ""
    Write-Host "或解压后 FTP / 网盘 / 服务器整目录部署。"
    Write-Host ""
    Write-Host "注意：超过 25MB 的文件在 ..\.1.网站-大文件\，部署到服务器时需一并复制进去。"
} finally {
    Pop-Location
}
