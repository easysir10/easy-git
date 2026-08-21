<div align="center">

# 🧑‍💻 easy-git

**新手友好的 Git 助手** —— 一条命令安装，选择要用的 agent，自动装好

[![version](https://img.shields.io/badge/version-0.6.3-blue)]()
[![license](https://img.shields.io/badge/license-MIT-green)]()
[![beginner](https://img.shields.io/badge/beginner--friendly-ff69b4)]()
[![docs](https://img.shields.io/badge/docs-%E4%B8%AD%E6%96%87%20%7C%20English-lightgrey)]()

🌐 [简体中文](README.md) · [English](README.en.md)

</div>

---

**easy-git 让 git 对新手友好**：你不需要会任何命令行命令，兼容 GitLab / GitHub / Gitee 等一切 git 托管平台。
安装只有一条命令，要装到哪些 agent（**包含 DSH**）由你在菜单里勾选。

## 🚀 安装（npx 一条命令，一步到位）

```bash
npx -y github:easysir10/easy-git
```

> ① 不用预先装任何东西，npx 自动下载并运行 easy-git（想常驻为命令可再执行 `npm install -g https://codeload.github.com/easysir10/easy-git/tar.gz/refs/heads/main`）。
> ② 网络较慢时用 tarball 直链代替：`npx -y https://codeload.github.com/easysir10/easy-git/tar.gz/refs/heads/main`。

**运行即弹出选择菜单**（↑↓ 移动 · 空格 勾选 · 回车 确认），选完自动装好；以后想重选，再运行一次即可：

```
🎯 选择要安装的 agent（↑↓ 移动 · 空格 勾选 · 回车 确认 · a 全选 · q 取消）
  ➜ ☐ 1. DSH 插件（DeepSeek Harness）
    ☐ 2. Codex（skill + /easy-git 斜杠命令）
    ☐ 3. Claude Code（skill + /easy-git 斜杠命令）
    ☑ 4. Cursor（rules + /easy-git 斜杠命令）     ← 空格勾选
    ☐ 5. Qoder（skill + /easy-git 斜杠命令）
    ☐ 6. QoderCN（skill + /easy-git 斜杠命令）
    ☑ 7. 通用 AGENTS.md（Gemini CLI / OpenCode / Zed / Trae 等）
（回车确认，自动安装；也可按数字切换勾选）
```

> [!NOTE]
> - **agent 自己安装**：把仓库地址 `https://github.com/easysir10/easy-git` 告诉任何 agent（Claude Code / Cursor / Codex / Qoder / Gemini CLI 等），让它执行上面的安装命令即可；或让它克隆仓库后运行 `node bin/easy-git.mjs install`。
> - 非交互环境（CI 等）自动跳过菜单：稍后运行 `easy-git install` 重选，或**首次运行 `easy-git` 也会弹**。
> - 随时重选：`easy-git install`；全装：`easy-git install all`。

## 装完在哪里怎么用

| 你在哪用 | 装完怎么用 | 详情 |
| --- | --- | --- |
| 🟦 **DSH**（DeepSeek Harness） | 对助手说"提交 / 拉取 / 推送 / 解决冲突 / 看下 git 现状" | [install-dsh.md](docs/install-dsh.md) |
| 🟠 **Codex / Claude Code** | 输入 `/easy-git 描述`（skill 也会自动生效） | [use-skill.md](docs/use-skill.md) |
| 🟪 **Cursor / Qoder / QoderCN** | 输入 `/easy-git 描述`（rules / skill 也会自动生效） | [use-skill.md](docs/use-skill.md) |

> 都装上了也不用管：菜单里没勾的 agent 不受影响，随时可以补装。

## 🎯 核心亮点

- 🧭 **首次自动引导**：选平台 → 设身份 → 初始化/克隆，一步步带你
- 🛡️ **防呆设计**：冲突未解决禁止提交/推送；合并进行中自动识别；技术报错不外露
- 🌐 **平台定制**：GitHub / GitLab / Gitee 各自的新建仓库、克隆链接、令牌步骤
- ✂️ **零路径零命令**：不用填文件夹路径，专业词出现必解释

## 📚 文档导航

| 文档 | 说明 |
| --- | --- |
| [install-dsh.md](docs/install-dsh.md) | 🟦 DSH 插件：用法（11 个工具）与更新 |
| [use-skill.md](docs/use-skill.md) | 🧩 其他 agent：Codex / Claude Code / Cursor / QoderCN |
| [demo-zh.md](docs/demo-zh.md) / [demo-en.md](docs/demo-en.md) | 👀 演示：小白全流程对话剧本 |
| [development.md](docs/development.md) | 🛠️ 开发指南：结构 / 约定 / 测试 / 发布 |
| [CHANGELOG.md](CHANGELOG.md) | 📋 更新日志（0.1 → 0.6） |
| [skills/README.md](skills/README.md) | 🧩 Skill 目录与说明 |
| [README.en.md](README.en.md) | 🌐 English version |
| [AGENTS.md](AGENTS.md) | 🤖 通用 agent 引导（进仓库即生效） |

## ⚙️ 实现要点

- **直接 spawn `git.exe`**（不经任何 shell），彻底避免引号/转义问题；git 路径按 PATH → 常见安装目录兜底
- **自带超时与取消**；提交说明走 stdin（`git commit -F -`）
- **防呆设计**：冲突未解决禁止提交/拉取/推送；检测 `MERGE_HEAD`/`CHERRY_PICK_HEAD`/`REBASE_HEAD`，合并进行中也能用提交收尾
- **全中文大白话**，把用户当成第一次接触 git 的新手

## ❓ 常见问题

<details>
<summary>我不会命令行，能用吗？</summary>

完全能。安装也只要一条命令（复制粘贴即可），之后你只需要：说话、做选择、贴链接、点网页按钮。
</details>

<details>
<summary>换平台了怎么办？</summary>

直接说“改成 GitHub”或“改成 GitLab”，一次生效。
</details>

<details>
<summary>装完想换/补装 agent 怎么办？</summary>

运行 `easy-git install` 重新勾选，或 `easy-git install all` 全部安装。
</details>

## 📄 License

MIT
