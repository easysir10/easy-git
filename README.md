<div align="center">

# 🧑‍💻 easy-git

**新手友好的 Git 助手** —— 一条命令安装，选择要用的 agent，自动装好

[![version](https://img.shields.io/badge/version-0.6.3-blue)]()
[![license](https://img.shields.io/badge/license-MIT-green)]()
[![beginner](https://img.shields.io/badge/beginner--friendly-ff69b4)]()

🌐 [简体中文](README.md) · [English](README.en.md)

</div>

---

**easy-git 让 git 对新手友好**：你不需要会任何命令行命令，兼容 GitLab / GitHub / Gitee 等一切 git 托管平台。
安装只有一条命令，要装到哪些 agent（**包含 DSH**）由你在菜单里勾选。

## 🚀 安装

```bash
npx -y github:easysir10/easy-git
```

**运行即弹出选择菜单**（↑↓ 移动 · 空格 勾选 · 回车 确认），选完自动装好；以后想重选，再运行一次即可：

```
🎯 选择要安装的 agent（↑↓ 移动 · 空格 勾选 · 回车 确认 · a 全选 · q 取消）
  ➜ ☐ 1. DSH 插件（DeepSeek Harness）
    ☐ 2. Codex（skill + /easy-git 斜杠命令）
    ☐ 3. Claude Code（skill + /easy-git 斜杠命令）
    ☐ 4. Cursor（rules + /easy-git 斜杠命令）
    ☐ 5. Qoder（skill + /easy-git 斜杠命令）
    ☐ 6. QoderCN（skill + /easy-git 斜杠命令）
    ☑ 7. 通用 AGENTS.md（Gemini CLI / OpenCode / Zed / Trae 等）
（回车确认，自动安装；也可按数字切换勾选）
```

> **让 agent 自己装**：把仓库地址 `https://github.com/easysir10/easy-git` 告诉任意 agent，让它执行上面的命令即可。
>
> **其他安装方式**：网络慢用 tarball 直链 `npx -y https://codeload.github.com/easysir10/easy-git/tar.gz/refs/heads/main`；想常驻为命令 `npm install -g https://codeload.github.com/easysir10/easy-git/tar.gz/refs/heads/main`；非交互环境（CI）自动跳过菜单，之后运行 `easy-git install` 或首次运行 `easy-git` 再选。

## 装完在哪里怎么用

| 你在哪用 | 装完怎么用 | 详情 |
| --- | --- | --- |
| 🟦 **DSH**（DeepSeek Harness） | 对助手说"提交 / 拉取 / 推送 / 解决冲突 / 看下 git 现状" | [install-dsh.md](docs/install-dsh.md) |
| 🟠 **Codex / Claude Code** | 输入 `/easy-git 描述`（skill 也会自动生效） | [use-skill.md](docs/use-skill.md) |
| 🟪 **Cursor / Qoder / QoderCN** | 输入 `/easy-git 描述`（rules / skill 也会自动生效） | [use-skill.md](docs/use-skill.md) |

## 🎯 核心亮点

- 🧭 **首次自动引导**：选平台 → 设身份 → 初始化/克隆，一步步带你
- 🛡️ **防呆设计**：冲突未解决禁止提交/推送；合并进行中自动识别；技术报错不外露
- 🌐 **平台定制**：GitHub / GitLab / Gitee 各自的新建仓库、克隆链接、令牌步骤
- ✂️ **零路径零命令**：不用填文件夹路径，专业词出现必解释

## 📚 文档

| 文档 | 说明 |
| --- | --- |
| [install-dsh.md](docs/install-dsh.md) | 🟦 DSH 插件：用法（11 个工具）与更新 |
| [use-skill.md](docs/use-skill.md) | 🧩 其他 agent：Codex / Claude Code / Cursor / Qoder / QoderCN |
| [development.md](docs/development.md) | 🛠️ 开发指南：结构 / 约定 / 测试 / 发布 |
| [CHANGELOG.md](CHANGELOG.md) | 📋 更新日志 |
| [skills/README.md](skills/README.md) | 🧩 Skill 目录与说明 |
| [AGENTS.md](AGENTS.md) | 🤖 通用 agent 引导（进仓库即生效） |

## ❓ 常见问题

<details>
<summary>我不会命令行，能用吗？</summary>

完全能。安装也只要一条命令（复制粘贴即可），之后你只需要：说话、做选择、贴链接、点网页按钮。
</details>

<details>
<summary>装完想换/补装 agent 怎么办？</summary>

运行 `easy-git install` 重新勾选，或 `easy-git install all` 全部安装。
</details>

## 📄 License

MIT
