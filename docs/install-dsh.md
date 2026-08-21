# DSH 插件方式（DeepSeek Harness）

> 在 DSH 里把 easy-git 作为**插件**使用：注册 11 个新手友好工具，对助手说"提交/拉取/推送/解决冲突/看下 git 现状"即可。

## 安装（任选一种）

### 方式 A：交互式安装器（推荐）

```bash
npm install -g github:easysir10/easy-git
```

安装完成后会自动弹出选择菜单（选 1 = DSH 插件，或输入 `a` 全部安装）；之后随时 `easy-git install` 重选。

### 方式 B：一句话让 agent 装

把这句话发给你的 DSH 助手（或其他 agent）：

> **"帮我安装 easy-git 插件：运行 https://github.com/easysir10/easy-git 仓库的安装脚本（Windows 用 install.ps1，macOS/Linux 用 install.sh），装完告诉我怎么重启。"**

### 方式 C：手动安装（了解原理用）

> [!IMPORTANT]
> 先安装 pnpm（`dsh plugin` 的下载器）：`npm install -g pnpm`

```bash
# 1️⃣ 安装插件到 profile
dsh plugin --profile web add github:easysir10/easy-git
```

```yaml
# 2️⃣ 登记到启动清单：编辑 $DSH_HOME/profiles/web/cordis.patch.yml
- insert:
    - id: git-beginner-helper
      name: '@easysir10/easy-git'
```

## 生效与更新

> [!NOTE]
> - 装完**重启 dsh** 生效。
> - 以后更新：说"**更新插件**"，助手执行 `dsh plugin --profile web update @easysir10/easy-git`，然后重启 dsh。
> - 想固定版本：依赖写成 `github:easysir10/easy-git#<commit-sha>`。

## 使用方式（工具）

装好后，对 DSH 助手说话即可，11 个工具自动匹配：

| 你说 | 助手用的工具 |
| --- | --- |
| 看下 git 现状 / 体检 | `git_beginner_status` |
| 开始用 git | `git_beginner_start` |
| 我用 GitHub / 换成 GitLab | `git_beginner_platform` |
| 帮我提交 | `git_beginner_commit` |
| 推送 | `git_beginner_push` |
| 拉取 / 克隆 | `git_beginner_pull` |
| 有冲突 | `git_beginner_conflict` |
| 看看提交历史 | `git_beginner_log` |
| 撤销上次提交 | `git_beginner_undo` |
| 开个新分支 / 切分支 / 合并 | `git_beginner_branch` |
| 初始化 / 设置名字邮箱 | `git_beginner_setup` |

## 回到导航

- [README](../README.md)（选择使用方式）
- [安装 Skill](../skills/easy-git-install/SKILL.md)（让 agent 自动安装）
