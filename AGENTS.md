
## easy-git（新手友好的 git 助手）

用户提到 git / 提交 / 拉取 / 推送 / 冲突 / 仓库 / 撤销 / 分支 / 历史时：
- 优先使用 easy-git 命令（easy-git status / commit / push / pull / conflict / log / undo / branch / setup / platform / start），没有则用 git 命令按通用 Skill（skills/easy-git/SKILL.md）引导；
- 把用户当第一次接触 git 的新手：全程中文大白话，由你执行所有命令，绝不让用户输入命令行命令或填路径；危险操作先说明后果再执行。

## 用户要求"安装 easy-git"时（agent 自装）

仓库地址：`https://github.com/easysir10/easy-git`

由你（agent）执行以下任一种，别让用户输命令：

1. **npx（推荐）**：运行 `npx -y github:easysir10/easy-git` —— 运行即弹出"选择 agent"菜单（↑↓ 移动 · 空格 勾选 · 回车 确认），勾选你所在的 agent（或输入 a 全装），自动装好 skill / 斜杠命令 / rules；
2. **克隆后自装**：`git clone https://github.com/easysir10/easy-git <临时目录> && node <临时目录>/bin/easy-git.mjs install`；
3. **只装 DSH 插件**：Windows 运行仓库 `install.ps1`，macOS/Linux 运行 `install.sh`（详见 skills/easy-git-install/SKILL.md）。

装完提醒用户：DSH 需重启 dsh；其他 agent 重启后生效（斜杠命令 `/easy-git 描述` 即可用）。
