<div align="center">

# 🧑‍💻 easy-git

**新手友好的 Git 助手** —— 零命令行、全程大白话，带你完成所有 git 操作

[![version](https://img.shields.io/badge/version-0.5.0-blue)]()
[![license](https://img.shields.io/badge/license-MIT-green)]()
[![beginner](https://img.shields.io/badge/beginner--friendly-ff69b4)]()
[![docs](https://img.shields.io/badge/docs-%E4%B8%AD%E6%96%87%20%7C%20English-lightgrey)]()

🌐 [简体中文](README.md) · [English](README.en.md)

</div>

---

**easy-git 只有两种使用方式，选一个就行**：

- 🟦 **方式一：DSH 插件** —— 在 DeepSeek Harness 里用（11 个新手友好工具）
- 🧩 **方式二：通用 Skill** —— 在 Codex / Claude Code / Cursor / QoderCN 等其他 agent 里直接用

**你不需要会任何命令行命令** —— 兼容 GitLab / GitHub / Gitee 等一切 git 托管平台。

## 🧭 选哪种方式？

| 你的场景 | 方式 | 入口 |
| --- | --- | --- |
| 🟦 用 **DSH**（DeepSeek Harness） | 方式一：DSH 插件 | [install-dsh.md](docs/install-dsh.md) |
| 🧩 用 **Codex / Claude Code / Cursor / QoderCN** 等其他 agent | 方式二：通用 Skill | [use-skill.md](docs/use-skill.md) |

> [!TIP]
> 装好 CLI 后，**第一次运行 `easy-git` 会自动弹出"选择要安装的 agent"菜单**（也可随时 `easy-git install` 重选，或 `easy-git install all` 全装）。

## 🎯 核心亮点

- 🧭 **首次自动引导**：选平台 → 设身份 → 初始化/克隆，一步步带你
- 🛡️ **防呆设计**：冲突未解决禁止提交/推送；合并进行中自动识别；技术报错不外露
- 🌐 **平台定制**：GitHub / GitLab / Gitee 各自的新建仓库、克隆链接、令牌步骤
- ✂️ **零路径零命令**：不用填文件夹路径，专业词出现必解释

## 📚 文档导航

| 文档 | 说明 |
| --- | --- |
| [install-dsh.md](docs/install-dsh.md) | 🟦 方式一：DSH 插件安装与使用 |
| [use-skill.md](docs/use-skill.md) | 🧩 方式二：通用 Skill（各 agent 安装 + 命令速查） |
| [demo-zh.md](docs/demo-zh.md) / [demo-en.md](docs/demo-en.md) | 👀 演示：小白全流程对话剧本 |
| [development.md](docs/development.md) | 🛠️ 开发指南：结构 / 约定 / 测试 / 发布 |
| [CHANGELOG.md](CHANGELOG.md) | 📋 更新日志（0.1 → 0.5） |
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

完全能。你只需要：说话、做选择、贴链接、点网页按钮。
</details>

<details>
<summary>换平台了怎么办？</summary>

直接说“改成 GitHub”或“改成 GitLab”，一次生效。
</details>

<details>
<summary>DSH 插件怎么更新？</summary>

说“更新插件”，助手执行更新命令；然后重启 dsh 生效。详见 [install-dsh.md](docs/install-dsh.md)。
</details>

## 📄 License

MIT
