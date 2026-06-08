$root = Split-Path $PSScriptRoot -Parent
$largeDir = Join-Path (Split-Path $root -Parent) ".1.网站-大文件"
$limit = 25MB

Write-Host "大文件目录（上传 GitHub Releases）：" -ForegroundColor Yellow
Write-Host "  $largeDir"
if (Test-Path $largeDir) {
    Get-ChildItem $largeDir -File | ForEach-Object {
        $mb = [math]::Round($_.Length / 1MB, 1)
        Write-Host "  $mb MB  $($_.Name)"
    }
} else {
    Write-Host "  （目录不存在）"
}

Write-Host ""
Write-Host "网站内 25MB 及以下（可跟网页一起上传）：" -ForegroundColor Green
Get-ChildItem $root -Recurse -File -Include *.exe,*.apk,*.zip,*.bat | Where-Object {
    $_.FullName -notmatch '\\\.git\\' -and $_.Length -le $limit -and $_.Length -gt 0
} | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length + 1)
    $mb = if ($_.Length -lt 1MB) { "$([math]::Round($_.Length/1KB,1)) KB" } else { "$([math]::Round($_.Length/1MB,1)) MB" }
    Write-Host "  $mb  $rel"
}
