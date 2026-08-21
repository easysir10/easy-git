# 🧩 通用 Skill：easy-git（跨 agent 使用）

[![version](https://img.shields.io/badge/version-0.5.0-blue)]() [![framework](https://img.shields.io/badge/framework-agnostic-green)]()

`easy-git/SKILL.md` 是**框架无关**的新手友好 git 向导：任何会执行 shell 命令的 agent 都能用，
不需要 DSH，不依赖任何特定插件系统。同一份文件，按下面方式装进不同 agent。

## 安装到各 agent

| 目标 | 怎么装 |
| --- | --- |
| **Claude Code** | 把 `easy-git` 文件夹复制到项目的 `.claude/skills/easy-git/`（或全局 `~/.claude/skills/easy-git/`），Claude Code 会自动识别 frontmatter（name/description）并按需加载 |
| **Cursor** | 把 `SKILL.md` 内容存为 `.cursor/rules/easy-git.mdc`（规则触发时生效）；或在对话中直接说"按 easy-git 的方式帮我处理 git"并贴入要点 |
| **Codex CLI / OpenCode / Zed 等** | 把 `SKILL.md` 内容追加到仓库的 `AGENTS.md`（这些 agent 启动时自动读取） |
| **其他任何 agent** | 直接把 `SKILL.md` 全文粘贴到它的系统提示 / 项目说明里即可——文件内容自包含，无外部依赖 |

## 通用说明

- Skill 是**引导层**：它定义"把用户当新手、流程怎么走、安全规则"，实际命令由 agent 执行。
- 环境里有 `easy-git` **CLI**（仓库 `bin/easy-git.mjs`，零依赖）时，Skill 会优先调用它；没有就用内置的 git 命令，效果一致。
- 与 DSH 插件**共用同一套偏好**（平台存在 `git config --global easygit.platform`），同一台机器两个方案混用也不冲突。

## 目录

```
skills/
├── easy-git/
│   └── SKILL.md    ← 通用 Skill 本体（YAML frontmatter + 完整引导流程 + 安全规则 + 术语词典）
└── easy-git-install/
    └── SKILL.md    ← 安装 Skill（让 agent 自动安装插件）
```

## 相关文档

- [README](../README.md) —— 项目入口与导航（安装 / CLI / 文档导航）
- [CHANGELOG](../CHANGELOG.md) —— 更新日志
- [docs/development.md](../docs/development.md) —— 开发指南
