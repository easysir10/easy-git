# easy-git 插件一键安装脚本（Windows / PowerShell）
#
# 用法（任选其一）：
#   powershell -ExecutionPolicy Bypass -File install.ps1                     # 默认安装到 web profile
#   powershell -ExecutionPolicy Bypass -File install.ps1 -ProfileName headless
#
# 自动完成：① 确保 pnpm ② dsh plugin add ③ 登记到 cordis.patch.yml
# 最后一步由用户手动：重启 dsh。

param(
  [string]$ProfileName = 'web'
)
$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '== easy-git 插件安装 ==' -ForegroundColor Cyan
Write-Host ''

$DshHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE '.dsh' }
$ProfileDir = Join-Path $DshHome "profiles\$ProfileName"
if (-not (Test-Path $ProfileDir)) {
  Write-Error "找不到 profile 目录：$ProfileDir。请先启动过一次 dsh（profile $ProfileName）再安装。"
  exit 1
}

# ① 确保 pnpm（dsh plugin 的下载器）
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host '[1/3] 检测到 pnpm 未安装，正在安装 pnpm ...' -ForegroundColor Yellow
  npm install -g pnpm
  if ($LASTEXITCODE -ne 0) { Write-Error 'pnpm 安装失败，请先安装 Node.js/npm（https://nodejs.org）。'; exit 1 }
} else {
  Write-Host ("[1/3] pnpm 已就绪：v" + (pnpm --version)) -ForegroundColor Green
}

# ② 安装插件到 profile
Write-Host "[2/3] 安装插件到 profile '$ProfileName' ..." -ForegroundColor Yellow
dsh plugin --profile $ProfileName add github:easysir10/easy-git
if ($LASTEXITCODE -ne 0) { Write-Error 'dsh plugin add 失败。'; exit 1 }

# ③ 登记到 cordis.patch.yml（已有则跳过；文件是 [] 则替换成插件行）
Write-Host '[3/3] 登记到启动清单 ...' -ForegroundColor Yellow
$Patch = Join-Path $ProfileDir 'cordis.patch.yml'
$Block = "`n- insert:`n    - id: git-beginner-helper`n      name: '@easysir10/easy-git'`n"
if (-not (Test-Path $Patch)) {
  $Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Patch, $Block, $Utf8NoBom)
  Write-Host '     已创建 cordis.patch.yml 并登记插件行。' -ForegroundColor Green
} else {
  $Content = [string](Get-Content $Patch -Raw -ErrorAction SilentlyContinue)
  if ($Content -match 'git-beginner-helper') {
    Write-Host '     cordis.patch.yml 已有该插件行，跳过。' -ForegroundColor Green
  } else {
    $Content = $Content -replace '(?m)^\s*\[\]\s*$', ''
    $Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Patch, $Content.TrimEnd() + $Block, $Utf8NoBom)
    Write-Host '     已把插件行登记进 cordis.patch.yml。' -ForegroundColor Green
  }
}

Write-Host ''
Write-Host '✅ 安装完成！' -ForegroundColor Green
Write-Host '   最后一步：重启 dsh（关掉重新打开）。'
Write-Host '   重启后对助手说：帮我提交 / 拉取 / 推送 / 解决冲突 / 看下 git 现状'
Write-Host ''
