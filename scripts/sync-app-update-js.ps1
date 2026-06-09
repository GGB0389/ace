param(
    [string]$JsonPath = (Join-Path $PSScriptRoot "..\..\..\牛逼启动器\server\app-update.json")
)

if (-not (Test-Path $JsonPath)) {
    $JsonPath = "e:\共享文件\.1.牛逼启动器\server\app-update.json"
}

& "e:\共享文件\.1.牛逼启动器\scripts\sync-app-update-js.ps1" -JsonPath $JsonPath
