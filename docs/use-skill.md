# 通用 Skill 方式（其他 agent）

> 不依赖 DSH 的新手 git 向导：任何会执行 shell 命令的 agent（Claude Code / Cursor / Codex…）都能用。
> 环境里有 `easy-git` 命令时 Skill 会优先调用它；没有就用 git 命令，效果一致。

## Skill 是什么

一份自包含的说明文件（`skills/easy-git/SKILL.md`），定义：
- 角色要求：把用户当新手、全程中文大白话、由 agent 执行命令、不让用户输命令/填路径
- 完整流程：体检 / 首次引导（平台→身份→仓库）/ 提交 / 拉取 / 推送 / 冲突三选一 / 撤销 / 分支 / 历史
- 防呆规则与技术报错处理、术语词典

## 装到各 agent

| 目标 | 方法 |
| --- | --- |
| **Claude Code** | 复制 `skills/easy-git` 到项目的 `.claude/skills/easy-git/`（或全局 `~/.claude/skills/easy-git/`），自动识别 |
| **Cursor** | 复制到 `~/.cursor/rules/easy-git.mdc`（或项目 `.cursor/rules/`），rules 自动生效 |
| **Codex** | 用斜杠命令方式（见 [codex-usage.md](codex-usage.md)） |
| **其他 agent** | 把 `SKILL.md` 内容追加到仓库的 `AGENTS.md`，或直接粘贴到它的系统提示 |
| **一键搞定** | 装 CLI 后运行 `easy-git install`，按菜单选择（`a` 全装） |

## 安装 Skill（让 agent 自动装 DSH 插件）

`skills/easy-git-install/SKILL.md` 是另一个 skill：任何 agent 读了它，就能自动完成
"装 pnpm → `dsh plugin add` → 登记 cordis.patch.yml → 提示重启"，用户只做最后一步重启。

## 相关

- [README](../README.md)（选择使用方式）
- [install-cli.md](install-cli.md)（CLI 方式）
- [install-dsh.md](install-dsh.md)（DSH 插件方式）
