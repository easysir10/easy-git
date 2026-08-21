# 其他 agent：Codex / Claude Code / Cursor / Qoder / QoderCN 等

> 在 **DSH 之外**的常见 agent 里使用 easy-git：通过统一安装器勾选目标，自动装好 **Skill**（自包含说明文件）和 **`/easy-git` 斜杠命令**，
> agent 读了就会按新手友好的方式引导你完成所有 git 操作。

## Skill 是什么

`skills/easy-git/SKILL.md` 是一份自包含文件，定义了：

- **角色要求**：把用户当新手、全程中文大白话、由 agent 执行所有命令、不让用户输命令/填路径
- **完整流程**：体检 / 首次引导（平台 → 身份 → 仓库）/ 提交 / 拉取 / 推送 / 冲突三选一 / 撤销 / 分支 / 历史
- **防呆规则**：冲突未解决禁止提交推送、危险操作先确认、技术报错不外露
- **术语词典**：分支 / 合并 / 上游 / 令牌 等大白话解释

> Skill 会优先调用 `easy-git` 命令（见文末命令速查）；没有命令时直接用 git 命令，效果一致。

## 斜杠命令 `/easy-git` 是什么

在支持自定义斜杠命令的 agent（**Codex / Claude Code / Cursor / Qoder / QoderCN**）里，
安装后会生成一条命令：在对话框输入 `/easy-git 描述`（例如 `/easy-git 帮我提交并推送`），
agent 会按 easy-git 的规则为你完成对应的 git 操作——和 DSH 里"直接说"体验一致。

## 一键安装（推荐）

```bash
npm install -g https://codeload.github.com/easysir10/easy-git/tar.gz/refs/heads/main
```

**安装完成的那一刻，会自动弹出"选择要安装的 agent"菜单**——勾选 Codex / Claude Code / Cursor / Qoder / QoderCN 等（或输入 `a` 全装），自动装好 skill + 斜杠命令；之后随时 `easy-git install` 重选。

## 装到常见 agent（手动方式，了解用）

| Agent | 怎么装 |
| --- | --- |
| **Claude Code** | skill：复制 `skills/easy-git` 到 `~/.claude/skills/easy-git/`；斜杠命令：复制 [codex/easy-git.md](../codex/easy-git.md) 到 `~/.claude/commands/easy-git.md` |
| **Codex** | skill：复制到 `~/.codex/skills/easy-git/`；斜杠命令：复制到 `~/.codex/commands/easy-git.md`（模板见 [codex/easy-git.md](../codex/easy-git.md)），之后输入 `/easy-git 描述` |
| **Cursor** | rules：复制 `skills/easy-git/SKILL.md` 到 `~/.cursor/rules/easy-git.mdc`；斜杠命令：复制 [command/easy-git.md](../command/easy-git.md) 到 `~/.cursor/commands/easy-git.md` |
| **Qoder** | skill：复制到 `~/.qoder/skills/easy-git/`；斜杠命令：复制 [command/easy-git.md](../command/easy-git.md) 到 `~/.qoder/commands/easy-git.md` |
| **QoderCN** | skill：复制到 `~/.qoder-cn/skills/easy-git/`；斜杠命令：复制 [command/easy-git.md](../command/easy-git.md) 到 `~/.qoder-cn/commands/easy-git.md` |
| **Gemini CLI / OpenCode / Zed / Trae 等** | 统一用**通用 AGENTS.md**：在安装菜单勾选第 7 项，或把 `SKILL.md` 内容追加到项目 `AGENTS.md`（这些 agent 都读它） |
| **其他任何 agent** | 把 `SKILL.md` 内容追加到仓库的 `AGENTS.md`，或直接粘贴到系统提示 |

> 两种模板的区别：`codex/easy-git.md` 带 frontmatter（Codex / Claude Code 支持），
> `command/easy-git.md` 是纯 Markdown（Cursor / Qoder / QoderCN 的斜杠命令不接受 frontmatter）。安装器会自动选对。

## easy-git 命令速查（Skill 会优先调用）

| 命令 | 作用 |
| --- | --- |
| `easy-git status` | 体检 |
| `easy-git start` | "开始使用"引导 |
| `easy-git platform github\|gitlab\|gitee\|other` | 记住平台 |
| `easy-git setup [--name X] [--email Y] [--init] [--remote URL]` | 首次配置 |
| `easy-git commit -m "说明"` | 提交 |
| `easy-git push` / `easy-git pull [--remote URL]` | 推送 / 拉取克隆 |
| `easy-git conflict [list\|mine\|theirs\|show\|manual]` | 冲突解决 |
| `easy-git log` / `easy-git undo --confirm` / `easy-git branch ...` | 历史 / 撤销 / 分支 |

## 相关

- [install-dsh.md](install-dsh.md)（DSH 插件用法）
- [README](../README.md)（返回主页）
- [skills/README.md](../skills/README.md)（Skill 目录）
