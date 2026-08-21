# 其他 agent：Codex / Claude Code / Cursor / QoderCN 等

> 在 **DSH 之外**的常见 agent 里使用 easy-git：通过统一安装器勾选目标，自动装好 **Skill**（自包含说明文件），
> agent 读了就会按新手友好的方式引导你完成所有 git 操作。

## Skill 是什么

`skills/easy-git/SKILL.md` 是一份自包含文件，定义了：

- **角色要求**：把用户当新手、全程中文大白话、由 agent 执行所有命令、不让用户输命令/填路径
- **完整流程**：体检 / 首次引导（平台 → 身份 → 仓库）/ 提交 / 拉取 / 推送 / 冲突三选一 / 撤销 / 分支 / 历史
- **防呆规则**：冲突未解决禁止提交推送、危险操作先确认、技术报错不外露
- **术语词典**：分支 / 合并 / 上游 / 令牌 等大白话解释

> Skill 会优先调用 `easy-git` 命令（见文末命令速查）；没有命令时直接用 git 命令，效果一致。

## 一键安装（推荐）

```bash
npm install -g github:easysir10/easy-git
```

**安装完成的那一刻，会自动弹出"选择要安装的 agent"菜单**——勾选 Codex / Claude Code / Cursor 等（或输入 `a` 全装），自动装好；之后随时 `easy-git install` 重选。

## 装到常见 agent（手动方式，了解用）

| Agent | 怎么装 |
| --- | --- |
| **Claude Code** | 复制 `skills/easy-git` 到 `~/.claude/skills/easy-git/`（或项目 `.claude/skills/easy-git/`），自动识别 |
| **Codex** | 方式①：复制到 `~/.codex/skills/easy-git/`；方式②：斜杠命令文件放到 `~/.codex/commands/easy-git.md`（模板见 [codex/easy-git.md](../codex/easy-git.md)），之后输入 `/easy-git 描述` |
| **Cursor** | 复制到 `~/.cursor/rules/easy-git.mdc`（或项目 `.cursor/rules/`） |
| **Qoder / QoderCN** | 复制到对应 agent 的 skills / rules 目录（与 Claude Code 类似）；或把 `SKILL.md` 内容粘贴进它的项目说明 |
| **其他任何 agent** | 把 `SKILL.md` 内容追加到仓库的 `AGENTS.md`，或直接粘贴到系统提示 |

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
