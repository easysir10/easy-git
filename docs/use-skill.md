# 其他 agent：Codex / Claude Code / Cursor / Qoder / QoderCN 等

> 在 **DSH 之外**的常见 agent 里使用 easy-git：安装器自动装好 **Skill**（自包含说明文件）和 **`/easy-git` 斜杠命令**，
> agent 读了就会按新手友好的方式引导你完成所有 git 操作。

## Skill 是什么

`skills/easy-git/SKILL.md` 是一份自包含文件，定义了：

- **角色要求**：把用户当新手、全程中文大白话、由 agent 执行所有命令、不让用户输命令/填路径
- **完整流程**：体检 / 首次引导（平台 → 身份 → 仓库）/ 提交 / 拉取 / 推送 / 冲突三选一 / 撤销 / 分支 / 历史
- **防呆规则**：冲突未解决禁止提交推送、危险操作先确认、技术报错不外露
- **术语词典**：分支 / 合并 / 上游 / 令牌 等大白话解释

## 斜杠命令 `/easy-git`

在支持自定义斜杠命令的 agent（**Codex / Claude Code / Cursor / Qoder / QoderCN**）里，
安装后输入 `/easy-git 描述`（例如 `/easy-git 帮我提交并推送`），agent 会按 easy-git 的规则完成对应操作。

## 一键安装（推荐：npx）

```bash
npx -y github:easysir10/easy-git
```

**运行即弹出"选择要安装的 agent"菜单**——勾选 Codex / Claude Code / Cursor / Qoder / QoderCN 等（或输入 `a` 全装），自动装好 skill + 斜杠命令；以后想重选，再运行一次即可。

> **让 agent 自己装**：把仓库地址 `https://github.com/easysir10/easy-git` 告诉任意 agent，让它执行上面的命令即可；
> 或克隆仓库后运行 `node bin/easy-git.mjs install`。

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
- [skills/README.md](../skills/README.md)（Skill 目录与各 agent 手动安装）
- [README](../README.md)（返回主页）
