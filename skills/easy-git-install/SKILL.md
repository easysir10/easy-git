---
name: easy-git-install
description: 一键安装 easy-git 插件（DSH）。当用户说“安装 easy-git 插件 / 装 git 助手 / 把 git 助手装上”时使用。自动完成：确保 pnpm → dsh plugin add → 登记 cordis.patch.yml → 提示用户重启 dsh。把用户当新手，安装过程中不要让用户输入命令或填路径。
---

# easy-git 插件安装 Skill

> 目标：让任何 agent 在**不打扰用户**的前提下，把 easy-git 插件装进 dsh。

## 安装步骤（agent 自己执行，用户只做最后一步重启）

1. **判断平台**：
   - Windows → 运行仓库里的 `install.ps1`
   - macOS / Linux → 运行仓库里的 `install.sh`
2. **下载脚本并执行**（示例：Windows PowerShell）：
   ```powershell
   Invoke-WebRequest -Uri https://raw.githubusercontent.com/easysir10/easy-git/main/install.ps1 -OutFile install.ps1
   powershell -ExecutionPolicy Bypass -File install.ps1
   ```
   （macOS / Linux：`curl -fsSL https://raw.githubusercontent.com/easysir10/easy-git/main/install.sh -o install.sh && bash install.sh`）
3. **脚本会自动完成**：
   - ① 检查 pnpm，没有就装（`npm install -g pnpm`）
   - ② `dsh plugin --profile <profile> add github:easysir10/easy-git`
   - ③ 把插件行登记进 `$DSH_HOME/profiles/<profile>/cordis.patch.yml`（已登记则跳过）
4. **最后一步必须由用户手动**：告诉用户“**请重启 dsh**（关掉重新打开）”，并解释原因：“插件在 dsh 启动时加载，重启后生效。”

## 如果脚本不可用（没网络 / 被拒绝）

按以下步骤手动执行（同样由 agent 完成，别让用户输命令）：

```bash
# ① pnpm
npm install -g pnpm

# ② 安装插件
dsh plugin --profile web add github:easysir10/easy-git

# ③ 登记到 $DSH_HOME/profiles/web/cordis.patch.yml（追加或替换 []）
- insert:
    - id: git-beginner-helper
      name: '@easysir10/easy-git'
```

## 验证与收尾

- 安装后可以运行 `dsh plugin --profile web list`（或检查 profile 的 package.json）确认依赖已加入。
- 提醒用户重启 dsh；重启后建议用户说“开始用 git”体验引导。
- 全程中文大白话：告诉用户“装好了，重启一下就能用了”，不要报原始报错。

## 安全注意

- 脚本只做三件事：装 pnpm、`dsh plugin add`、改 `cordis.patch.yml`；不触碰其他文件。
- 不要以管理员身份强制运行；普通用户权限即可（dsh 装在用户目录）。
