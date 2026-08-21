# 更新日志（Changelog）

本项目版本演进记录。版本号语义：`0.x.0` 加功能，`0.x.y` 修问题/完善细节。

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
