param(
    [string]$RemoteUrl = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Host "未检测到 Git，请先安装：https://git-scm.com/download/win" -ForegroundColor Red
    Write-Host "安装后重新打开终端，再运行本脚本。"
    exit 1
}

if (-not (Test-Path ".git")) {
    git init
    Write-Host "已初始化 Git 仓库"
} else {
    Write-Host "仓库已存在，跳过 git init"
}

git add .
git status --short

git diff --cached --quiet
$staged = $LASTEXITCODE -ne 0
if ($staged) {
    git commit -m "初始化 ACE游戏管家下载站" -m "网页代码；exe/apk 由 .gitignore 排除，部署时用 pack-deploy.ps1 打包上传。"
    Write-Host "已创建首次提交" -ForegroundColor Green
} else {
    Write-Host "没有需要提交的变更"
}

if ($RemoteUrl) {
    git remote get-url origin 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        git remote add origin $RemoteUrl
        Write-Host "已添加远程仓库: $RemoteUrl"
    } else {
        Write-Host "远程 origin 已存在"
    }
    git branch -M main
    git push -u origin main
    Write-Host "已推送到远程仓库" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "下一步（GitHub 示例）："
    Write-Host "  1. 在 GitHub 新建空仓库（不要勾选 README）"
    Write-Host "  2. 运行："
    Write-Host '     .\scripts\init-git.ps1 -RemoteUrl "https://github.com/你的用户名/仓库名.git"'
    Write-Host ""
    Write-Host "部署含 exe/apk 的完整站："
    Write-Host "     .\scripts\pack-deploy.ps1"
}
