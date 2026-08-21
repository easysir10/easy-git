---
name: easy-git-install
description: 一键安装 easy-git（新手友好的 git 助手）。当用户说“安装 easy-git / 装 git 助手 / 把 git 助手装上”时使用。给用户当前 agent 安装 skill/斜杠命令，或装进 DSH。把用户当新手，安装过程中不要让用户输入命令或填路径。
---

# easy-git 安装 Skill（agent 自装）

> 目标：让任何 agent 在**不打扰用户**的前提下，把 easy-git 装好——给你自己所在的 agent 装，或装进 DSH。

## 仓库地址（自装入口）

```
https://github.com/easysir10/easy-git
```

## 给当前 agent 自装（推荐，一条命令）

克隆或直接让当前 agent 执行以下命令（你作为 agent 自己执行，用户只需看着）：

```bash
npx -y github:easysir10/easy-git
```

npx 会自动下载 easy-git 并**弹出"选择要安装的 agent"菜单**（↑↓ 移动 · 空格 勾选 · 回车 确认）：
勾选你所在的 agent（Claude Code / Cursor / Codex / Qoder / QoderCN / Gemini CLI 等）或 `a` 全装，
装好后对应目录里就有 `easy-git` 的 skill / 斜杠命令 / rules，agent 重启后生效。

> 想常驻为命令：`npm install -g github:easysir10/easy-git`（Windows 偶发符号链接问题，改用
> `npm install -g https://codeload.github.com/easysir10/easy-git/tar.gz/refs/heads/main`）。

## 单独装进 DSH（DeepSeek Harness）

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

- DSH：安装后运行 `dsh plugin --profile web list`（或检查 profile 的 package.json）确认依赖已加入；提醒用户重启 dsh。
- 其他 agent：检查对应目录（`~/.claude/`、`~/.cursor/`、`~/.codex/`、`~/.qoder/` 等）里出现了 `easy-git` 相关文件；提醒用户重启该 agent。
- 全程中文大白话：告诉用户“装好了，重启一下就能用了”，不要报原始报错。

## 安全注意

- 脚本只做安装相关的事：装 pnpm、`dsh plugin add`、改 `cordis.patch.yml`、写各 agent 的 skill/rules 目录；不触碰其他文件。
- 不要以管理员身份强制运行；普通用户权限即可（dsh 装在用户目录）。
