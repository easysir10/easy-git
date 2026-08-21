# 更新日志（Changelog）

本项目版本演进记录。版本号语义：`0.x.0` 加功能，`0.x.y` 修问题/完善细节。

## 0.6.3（2026-08-21）

- 🔴 修复：DSH 安装不再依赖全局 `dsh` 命令——很多机器 dsh 是通过 `npx @deepseek-ai/dsh` 运行的（PATH 里没有 `dsh`），此前安装器直接调 `dsh plugin add` 会报"dsh 不是内部或外部命令"。现在探测不到 `dsh` 命令时自动改为**直接操作 DSH profile**（写 `package.json` 依赖 + `pnpm install` + 登记 `cordis.patch.yml`，与 `dsh plugin add` 等价）；`install.ps1` / `install.sh` 同步修复

## 0.6.2（2026-08-21）

- 🔴 修复：**npx 无参数运行不再只看帮助**——之前已装过的机器上 `npx -y github:easysir10/easy-git` 因安装标记存在而只显示帮助文本、不弹菜单；现在检测 npx 环境（包在 `_npx` 缓存目录），**npx 方式每次运行都弹"选 agent"菜单**（可随时重跑重选），全局安装方式保持"首次弹菜单、之后显示帮助"

## 0.6.1（2026-08-21）

- 🆕 **npx 安装方式**：`npx -y github:easysir10/easy-git` 一条命令，无需全局安装，首次运行自动弹"选 agent"菜单（网络慢可用 `npx -y https://codeload.github.com/easysir10/easy-git/tar.gz/refs/heads/main`）
- 🆕 **agent 自装**：仓库地址 `https://github.com/easysir10/easy-git` 可直接交给任何 agent（Claude Code / Cursor / Codex / Qoder / Gemini CLI 等）自行安装；`AGENTS.md`、`skills/easy-git-install/SKILL.md`、README 与 docs 全部补充"agent 自装"指引
- ✏️ CLI 帮助（`easy-git help`）补充三种安装方式说明

## 0.6.0（2026-08-21）

- 🆕 **所有 agent 支持 `/easy-git 描述` 斜杠命令**（与 Codex 一致）：Claude Code（`~/.claude/commands/`）、Cursor（`~/.cursor/commands/`）、Qoder（`~/.qoder/commands/`）、QoderCN（`~/.qoder-cn/commands/`），安装器勾选即自动装好
- 🆕 新增纯 Markdown 斜杠命令模板 `command/easy-git.md`：Cursor / Qoder / QoderCN 的斜杠命令不接受 frontmatter，与带 frontmatter 的 `codex/easy-git.md`（Codex / Claude Code 用）区分，安装器自动选对模板
- ✏️ 安装菜单标签更新：Claude Code / Cursor / Qoder / QoderCN 均标注"skill/rules + /easy-git 斜杠命令"
- 🔴 修复：`package.json` 的 `files` 字段补全 `scripts` / `skills` / `codex` / `command`（此前漏了这些目录，npm 从 GitHub 安装时会缺 postinstall 脚本和资源）
- 🔴 修复：一键安装命令改为 **GitHub tarball 直链**（`https://codeload.github.com/easysir10/easy-git/tar.gz/refs/heads/main`）——个别 Windows 环境下 npm 对 `github:` 源走符号链接（Junction）导致安装失败；短写 `npm install -g github:easysir10/easy-git` 仍可用

## 0.5.0（2026-08-21）

- 🆕 新增**交互式安装器**：`easy-git install` 复选框菜单（↑↓ 移动 · 空格 勾选 · 回车 确认 · a 全选 · q 取消），支持 7 个目标：DSH 插件 / Codex / Claude Code / Cursor / Qoder / QoderCN / 通用 AGENTS.md（Gemini CLI、OpenCode、Zed、Trae 等）
- 🆕 安装体验：**`npm install -g` 完成时直接弹出"选择 agent"菜单**（postinstall 脚本；非交互环境自动跳过，稍后 `easy-git install` 或首次运行再选）；prepare 脚本打印引导提示
- 🆕 Codex 斜杠命令：`/easy-git + 描述`（命令模板 `codex/easy-git.md`，安装器自动放入 `~/.codex/commands/`）
- 🆕 仓库自带 `AGENTS.md`：任何 agent 进仓库即获得新手 git 引导
- 📚 文档体系梳理：明确**只有两种使用方式**（DSH 插件 / 通用 Skill），各一份独立指南（`install-dsh` / `use-skill`），README 改为选路中枢，演示归入 `docs/`，新增 `CHANGELOG.md` 与 `docs/development.md`

## 0.4.0（2026-08-21）

- 🆕 新增**零依赖 CLI**：`bin/easy-git.mjs` + `src/core.js`，11 个命令（status / start / platform / setup / commit / push / pull / conflict / log / undo / branch），任何 agent 都能通过"执行命令"调用，人类也能在终端直接用
- 🧩 通用 Skill 更新：环境里有 `easy-git` 命令时优先调用它
- 📦 package.json 增加 `bin` 与 `exports.core`
- 后续完善（`0f38ac1`）：CLI 体检显示引导平台与不一致提醒；拉取支持 `--remote` 绑定；conflict 支持 `--file`；修复 `git status --short` 路径首字符被吞的 bug（插件 + CLI 同步修）；守卫文案统一；Skill 补充 CLI 命令映射

## 0.3.1（2026-08-21）

- 🛠️ git 未安装时所有工具统一友好提示（不再误报"不是仓库"或"保存失败"）

## 0.3.0（2026-08-21）

- 🔴 修复：空仓库推送报错、无上游分支拉取报错、克隆失败提示平台化、远程地址格式校验
- 🆕 新增 4 个工具：`git_beginner_log`（历史）、`git_beginner_undo`（撤销）、`git_beginner_branch`（分支）、`git_beginner_start`（开始引导）
- 🟡 提交预览时自动建议 `.gitignore`

## 0.2.4（2026-08-21）

- 📝 文档双语化：README 新增英文版，语言切换时演示文档同步切换
- ✏️ 去除"傻瓜式/小白"等措辞，改为更友好表述

## 0.2.3（2026-08-21）

- 🆕 体检时自动提醒"引导平台与远程仓库不一致"，说一句即可切换

## 0.2.2（2026-08-21）

- ✏️ 全流程小白化审查：术语白话化、领先/落后解释、技术报错不外露、提交缺身份友好提示、工具说明加"新手人设"约束

## 0.2.1（2026-08-21）

- 🆕 冲突手动改完可标记已解决（`manual`），补全手动解决闭环

## 0.2.0（2026-08-21）

- 🆕 新增 `git_beginner_platform`：首次使用时确定平台（GitHub / GitLab / Gitee / 其他），所有引导按平台定制；有远程地址时自动识别平台

## 0.1.x（2026-08-21）

- 🎉 首个版本：从会话内动态插件重构为**标准 DSH 插件包**（npm 包 + `cordis.patch.yml` 登记）
- 核心 6 工具：status / setup / pull / conflict / commit / push
- 直接 spawn `git.exe`（不经 shell，无转义问题）；冲突/合并防呆
- 文档与演示文档、GitHub 仓库绑定、一键安装脚本（install.ps1 / install.sh）、安装 Skill
