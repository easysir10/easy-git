# 在 Codex 中使用 easy-git（斜杠命令）

Codex（桌面端 / CLI）支持**自定义斜杠命令**：装好 CLI 后，放一个命令文件，就能输入
`/easy-git <描述>` 来使用新手友好的 git 助手。

## 一、安装 CLI（一次）

```bash
npm install -g github:easysir10/easy-git
easy-git --version   # 验证：应显示 v0.5.0
```

> 💡 也可以直接用安装器一步到位：`easy-git install` 按菜单选择 Codex（或输入 `a` 全部安装），
> 会自动把斜杠命令文件放到 `~/.codex/commands/`，无需手动复制。

## 二、放置斜杠命令文件

把仓库里的 [codex/easy-git.md](../codex/easy-git.md) 复制到：

| 平台 | 路径 |
| --- | --- |
| Windows | `C:\Users\<你的用户名>\.codex\commands\easy-git.md` |
| macOS / Linux | `~/.codex/commands/easy-git.md` |

（PowerShell 一键复制：`Copy-Item codex\easy-git.md "$env:USERPROFILE\.codex\commands\easy-git.md"`）

> 也可以把命令文件放到项目的 `.codex/commands/` 下，只对该项目生效。

## 三、使用方式

**在 Codex 界面 / 交互式命令行里**直接输入：

```
/easy-git 帮我提交
/easy-git 看下提交历史
/easy-git 有冲突了
/easy-git 推送到远程
/easy-git 开个新分支叫 feature-1
/easy-git 开始用 git
```

斜杠命令会把你描述的内容（`$ARGUMENTS`）交给 easy-git 向导，由 Codex 自动执行对应命令并全程大白话引导你。

**纯命令行（不进 Codex 交互界面）**：斜杠命令只在 Codex 内部生效；在普通终端直接用 CLI 命令：

```bash
easy-git status            # 体检
easy-git commit -m "说明"   # 提交
easy-git log               # 历史
```

## 四、常见问题

- **输入 /easy-git 没反应**：确认命令文件在 `~/.codex/commands/easy-git.md`，并**重启 Codex**（桌面端重开窗口，CLI 重新进入）。
- **提示 easy-git 命令不存在**：先 `npm install -g github:easysir10/easy-git` 安装，再重试。
- **想在其他 agent 用**：用通用 Skill（见 [skills/README.md](../skills/README.md)），原理相同。

## 五、相关

- 命令文件内容即提示词模板，可自行增删规则（`codex/easy-git.md`）。
- 通用 Skill 与 CLI 共用同一套逻辑与平台偏好（`git config --global easygit.platform`）。
