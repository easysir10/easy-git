<div align="center">

# 🧑‍💻 easy-git

**新手友好的 Git 助手** —— 零命令行、全程大白话，带你完成所有 git 操作

[![version](https://img.shields.io/badge/version-0.4.0-blue)]()
[![license](https://img.shields.io/badge/license-MIT-green)]()
[![platform](https://img.shields.io/badge/platform-DSH-orange)]()
[![cli](https://img.shields.io/badge/CLI-zero--dep-brightgreen)]()
[![beginner](https://img.shields.io/badge/beginner--friendly-ff69b4)]()
[![docs](https://img.shields.io/badge/docs-%E4%B8%AD%E6%96%87%20%7C%20English-lightgrey)]()

🌐 [简体中文](README.md) · [English](README.en.md)

</div>

---

**easy-git 用一套逻辑提供三种入口**：DSH 插件（工具方式）· 通用 Skill（其他 agent）· 零依赖 CLI（任何 agent + 人类终端）。

## ✨ 这是什么

> [!TIP]
> **你不需要会任何命令行命令** —— 把所有 git 操作交给助手，用大白话对话就行。

- 🧩 **DSH 插件**：标准 Cordis 插件包，注册 11 个新手友好工具
- 💻 **CLI**：零依赖、跨平台，任何 agent 都能通过"执行命令"调用，人类也能在终端直接用
- 🧩 **通用 Skill**：框架无关的引导说明，Claude Code / Cursor 等任何 agent 都能用
- 🌍 兼容 **GitLab / GitHub / Gitee** 等一切 git 托管平台

## 🎯 核心亮点

- 🧭 **首次自动引导**：选平台 → 设身份 → 初始化/克隆，一步步带你
- 🛡️ **防呆设计**：冲突未解决禁止提交/推送；合并进行中自动识别；技术报错不外露
- 🌐 **平台定制**：GitHub / GitLab / Gitee 各自的新建仓库、克隆链接、令牌步骤
- ✂️ **零路径零命令**：不用填文件夹路径，专业词出现必解释

## 🚀 快速开始（DSH 用户）

### 🤖 一句话安装（推荐：让 agent 自己装）

> 把这句话发给你的 agent（DSH / Claude Code / Cursor…），剩下的它来做：
>
> **"帮我安装 easy-git 插件：运行 https://github.com/easysir10/easy-git 仓库的安装脚本（Windows 用 install.ps1，macOS/Linux 用 install.sh），装完告诉我怎么重启。"**

也可以自己跑脚本：

```powershell
# Windows：下载并运行安装脚本
Invoke-WebRequest -Uri https://raw.githubusercontent.com/easysir10/easy-git/main/install.ps1 -OutFile install.ps1
powershell -ExecutionPolicy Bypass -File install.ps1
```

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/easysir10/easy-git/main/install.sh -o install.sh && bash install.sh
```

脚本自动完成：**装 pnpm → 装插件 → 登记启动清单**，装完你只需要**重启 dsh**。

### 📋 手动安装（了解原理用）

> [!IMPORTANT]
> 先安装 pnpm（`dsh plugin` 的下载器）：`npm install -g pnpm`

```bash
# 1️⃣ 安装插件到 profile
dsh plugin --profile web add github:easysir10/easy-git
```

```yaml
# 2️⃣ 登记到启动清单：编辑 $DSH_HOME/profiles/web/cordis.patch.yml
- insert:
    - id: git-beginner-helper
      name: '@easysir10/easy-git'
```

> [!NOTE]
> 改完**重启 dsh** 生效。之后对助手说“帮我提交 / 拉取 / 推送 / 解决冲突 / 看下 git 现状”即可。
> 以后更新：直接说“**更新插件**”，助手帮你执行 `dsh plugin --profile web update @easysir10/easy-git`。

## 🗺️ 首次使用流程

1. 说“**看下 git 现状**”，助手先让你选**平台**（GitHub / GitLab / Gitee / 其他）；
2. 之后所有步骤（新建仓库、克隆链接、访问令牌）都按该平台引导；
3. 仓库已有远程地址时，助手**自动识别**平台，无需再选；换平台说“改成 GitLab”即可；
4. “引导平台”和“远程仓库”不一致时，体检会**自动提醒**，说一句就切换。

## 🧰 提供的工具（11 个）

| 工具 | 作用 |
| --- | --- |
| `git_beginner_start` | 🎯 “开始使用 git”引导：检查进度（平台 → 身份 → 仓库）并提示下一步 |
| `git_beginner_platform` | 🌍 确定平台（GitHub / GitLab / Gitee / 其他），之后所有引导按该平台定制 |
| `git_beginner_status` | 🔍 体检：git 是否安装、分支、身份、改动、冲突、合并中、远程、领先/落后 |
| `git_beginner_setup` | ⚙️ 首次配置：全局名字/邮箱、默认分支 main、初始化仓库、绑定远程 |
| `git_beginner_commit` | 📸 提交：先预览清单 → 一句话说明 → 保存“快照” |
| `git_beginner_push` | ☁️ 推送：上传到远程；被拒绝提示先拉取；认证失败给通俗指引 |
| `git_beginner_pull` | ⬇️ 拉取/克隆：合并方式，绝不改写你的提交 |
| `git_beginner_conflict` | ⚔️ 冲突向导：列冲突文件 → 三选一（留我的 / 留对方的 / 手动改） |
| `git_beginner_log` | 📜 查看提交历史（时间、作者、说明） |
| `git_beginner_undo` | ↩️ 撤销上一次提交但保留代码（后悔药，带确认） |
| `git_beginner_branch` | 🌿 分支管理：查看 / 新建 / 切换 / 合并 |

## 💻 CLI（零依赖命令行版）

**不用 DSH 也能用** —— 与插件同一套逻辑（友好中文 + 防呆），适合任何 agent 通过"执行命令"调用，人类也能在终端直接用：

```bash
# 仓库内直接跑（零依赖，只要有 node）
node bin/easy-git.mjs status          # 体检
node bin/easy-git.mjs commit -m "说明" # 提交
node bin/easy-git.mjs conflict        # 解决冲突
node bin/easy-git.mjs log             # 提交历史
```

```bash
# 全局安装后直接用 easy-git 命令
npm install -g github:easysir10/easy-git
easy-git status
```

> 完整命令见 [bin/easy-git.mjs](bin/easy-git.mjs) 顶部的用法说明；通用 Skill 已默认优先调用它。

## 🧩 通用 Skill（其他 agent）

不依赖 DSH 的新手 git 向导说明，任何会执行命令的 agent 都能用（Claude Code / Cursor / Codex…）：

- 使用说明：[skills/README.md](skills/README.md)
- Skill 本体：[skills/easy-git/SKILL.md](skills/easy-git/SKILL.md)
- 安装 Skill（让 agent 自动装插件）：[skills/easy-git-install/SKILL.md](skills/easy-git-install/SKILL.md)

## 📚 文档导航

| 文档 | 说明 |
| --- | --- |
| [README.en.md](README.en.md) | English version |
| [docs/demo-zh.md](docs/demo-zh.md) | 中文演示：小白全流程对话剧本 |
| [docs/demo-en.md](docs/demo-en.md) | English demo：完整的引导流程 |
| [docs/development.md](docs/development.md) | 开发指南：结构 / 约定 / 测试 / 发布 |
| [CHANGELOG.md](CHANGELOG.md) | 更新日志（0.1 → 0.4） |
| [skills/README.md](skills/README.md) | 通用 Skill 安装说明 |

## 🛠️ 从源码开发

```bash
git clone https://github.com/easysir10/easy-git.git
cd easy-git
npm install   # 或 pnpm install（解析 peerDependencies）
```

`lib/index.js` 是插件本体（ESM，导出标准 Cordis 插件 `{ name, inject, apply }`，注册 11 个工具）；
`src/core.js` + `bin/easy-git.mjs` 是 CLI。开发约定与发布流程见 **[docs/development.md](docs/development.md)**。

## ⚙️ 实现要点

- **直接 spawn `git.exe`**（不经任何 shell），彻底避免引号/转义问题；git 路径按 PATH → 常见安装目录兜底
- **自带超时与取消**；提交说明走 stdin（`git commit -F -`）
- **防呆设计**：冲突未解决禁止提交/拉取/推送；检测 `MERGE_HEAD`/`CHERRY_PICK_HEAD`/`REBASE_HEAD`，合并进行中也能用提交收尾
- **全中文大白话**，把用户当成第一次接触 git 的新手

## ❓ 常见问题

<details>
<summary>我不会命令行，能用吗？</summary>

完全能。你只需要：说话、做选择、贴链接、点网页按钮。
</details>

<details>
<summary>换平台了怎么办？</summary>

直接说“改成 GitHub”或“改成 GitLab”，一次生效。
</details>

<details>
<summary>插件怎么更新？</summary>

说“更新插件”，助手执行更新命令；然后重启 dsh 生效。详见上方“快速开始”。
</details>

## 📄 License

MIT
