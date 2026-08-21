# CLI 方式（零依赖命令行）

> 不用 DSH 也能用。适合任何 agent 通过"执行命令"调用，也适合人类在终端直接用。

## 安装

```bash
# 全局安装（推荐）
npm install -g github:easysir10/easy-git
easy-git --version        # 应显示 v0.5.0
```

```bash
# 或仓库内直接跑（零依赖，只要有 node）
git clone https://github.com/easysir10/easy-git.git
cd easy-git
node bin/easy-git.mjs --version
```

## 命令速查

| 命令 | 作用 |
| --- | --- |
| `easy-git install [dsh,codex,claude,cursor,agents\|all]` | 🎯 交互式安装器：选择要装的 agent（也可免交互直接指定） |
| `easy-git status [目录]` | 🔍 体检 |
| `easy-git start [目录]` | 🎯 "开始使用"引导进度 |
| `easy-git platform [github\|gitlab\|gitee\|other]` | 🌍 查看/设置平台 |
| `easy-git setup [目录] [--name X] [--email Y] [--init] [--remote URL]` | ⚙️ 首次配置 |
| `easy-git commit [目录] [-m "说明"]` | 📸 提交（不带 -m 会交互询问） |
| `easy-git push [目录]` | ☁️ 推送 |
| `easy-git pull [目录] [--remote URL] [--branch NAME]` | ⬇️ 拉取/克隆 |
| `easy-git conflict [目录] [list\|mine\|theirs\|show\|manual] [文件]` | ⚔️ 冲突解决 |
| `easy-git log [目录] [-n 10]` | 📜 提交历史 |
| `easy-git undo [目录] [--confirm]` | ↩️ 撤销上一次提交（保留代码） |
| `easy-git branch [目录] [list\|create NAME\|switch NAME\|merge NAME]` | 🌿 分支管理 |

> 所有输出为中文大白话；退出码 0=成功，1=需要用户处理。

## 交互式安装器（`easy-git install`）

装好 CLI 后运行，按菜单勾选要装的目标，自动完成安装：

```
🎯 要把 easy-git 安装到哪些 agent？
  1. DSH 插件（web profile，工具方式）
  2. Codex（斜杠命令 /easy-git + 描述）
  3. Claude Code（skill）
  4. Cursor（rules）
  5. 当前项目 AGENTS.md（通用）
输入序号（如 1,3 或 a）：
```

多选：`1,3`；全装：`a`；免交互：`easy-git install dsh,codex` 或 `easy-git install all`。

## 相关

- [install-dsh.md](install-dsh.md)（DSH 插件方式）
- [use-skill.md](use-skill.md)（通用 Skill 方式）
- [codex-usage.md](codex-usage.md)（Codex 斜杠命令）
