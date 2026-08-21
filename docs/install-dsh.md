# DSH 插件（DeepSeek Harness）

> 在 DSH 里把 easy-git 作为**插件**使用：注册 11 个新手友好工具，对助手说"提交/拉取/推送/解决冲突/看下 git 现状"即可。

## 安装（统一安装器里勾选 DSH 即可）

```bash
npx -y github:easysir10/easy-git
```

> 运行即弹出菜单，**选 1 = DSH 插件**（或输入 `a` 全部安装）；以后想重选，再运行一次即可。
> 安装器自动完成：装 pnpm（如缺）→ 安装插件依赖 → 登记 `cordis.patch.yml`。
> 有全局 `dsh` 命令时走 `dsh plugin add`；**没有 `dsh` 命令（dsh 常通过 npx 运行）时自动改为直接操作 DSH profile 目录**（等价于 dsh plugin add）。
>
> 让 agent 装：把仓库地址 `https://github.com/easysir10/easy-git` 告诉任意 agent，让它执行上面的命令即可。
>
> 想常驻为命令：`npm install -g github:easysir10/easy-git`（Windows 偶发符号链接问题，改用 `npm install -g https://codeload.github.com/easysir10/easy-git/tar.gz/refs/heads/main`）。

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
