# 🧩 通用 Skill：easy-git（跨 agent 使用）

`easy-git/SKILL.md` 是**框架无关**的新手友好 git 向导：任何会执行 shell 命令的 agent 都能用，不需要 DSH、不依赖特定插件系统。

## 安装到各 agent

> 推荐直接用安装器：`npx -y github:easysir10/easy-git`，运行即弹菜单勾选 agent，自动装好 skill + `/easy-git` 斜杠命令。详见 [docs/use-skill.md](../docs/use-skill.md)。

| 目标 | 怎么装 |
| --- | --- |
| **Claude Code** | skill → `~/.claude/skills/easy-git/`；斜杠命令 → `~/.claude/commands/easy-git.md`（模板 [codex/easy-git.md](../codex/easy-git.md)） |
| **Codex** | skill → `~/.codex/skills/easy-git/`；斜杠命令 → `~/.codex/commands/easy-git.md`（模板 [codex/easy-git.md](../codex/easy-git.md)） |
| **Cursor** | rules → `~/.cursor/rules/easy-git.mdc`；斜杠命令 → `~/.cursor/commands/easy-git.md`（模板 [command/easy-git.md](../command/easy-git.md)） |
| **Qoder / QoderCN** | skill → `~/.qoder/skills/easy-git/`（QoderCN 用 `~/.qoder-cn/skills/`）；斜杠命令 → `~/.qoder/commands/easy-git.md`（QoderCN 用 `~/.qoder-cn/commands/`，模板 [command/easy-git.md](../command/easy-git.md)） |
| **Gemini CLI / OpenCode / Zed 等** | 把 `SKILL.md` 内容追加到项目 `AGENTS.md` |
| **其他任何 agent** | 把 `SKILL.md` 全文粘贴到系统提示 / 项目说明 |

> 模板区别：`codex/easy-git.md` 带 frontmatter（Codex / Claude Code 支持）；`command/easy-git.md` 纯 Markdown（Cursor / Qoder / QoderCN 不接受 frontmatter）。安装器会自动选对。

## 通用说明

- Skill 是**引导层**：定义"把用户当新手、流程怎么走、安全规则"，实际命令由 agent 执行。
- 环境里有 `easy-git` CLI 时 Skill 优先调用它；没有就用内置 git 命令，效果一致。
- 与 DSH 插件共用同一套偏好（平台存于 `git config --global easygit.platform`），混用不冲突。

## 目录

```
skills/
├── easy-git/SKILL.md            ← 通用 Skill 本体
└── easy-git-install/SKILL.md    ← 安装 Skill（让 agent 自动安装）
```
