# Git 新手助手（git-beginner-helper）

一个 DSH 动态插件（Host 端），把 git 操作包装成**傻瓜式向导**，面向完全不会使用 git 的用户，主要场景是 GitLab，兼容 GitHub / Gitee 等一切基于 git 的托管平台。

## 提供的工具

| 工具 | 作用 |
| --- | --- |
| `git_beginner_status` | “体检”：git 是否安装、是否仓库、当前分支、用户名/邮箱、改动清单、冲突、合并中状态、远程地址、领先/落后远程 |
| `git_beginner_setup` | 第一次使用时的初始化：设全局名字/邮箱、默认分支 main、初始化仓库、绑定远程地址 |
| `git_beginner_pull` | 克隆（无仓库时）/ 拉取（`git pull --no-rebase` 合并方式，绝不改写用户自己的提交） |
| `git_beginner_conflict` | 冲突向导：列冲突文件 → 三个选择（保留我的 / 保留对方的 / 手动改）→ 自动解决或展示冲突内容 |
| `git_beginner_commit` | 先预览将提交的文件清单，请用户用一句话说明改动，再执行 `git add -A` + `git commit` |
| `git_beginner_push` | 上传到远程；首次自动 `-u origin HEAD`；被拒绝提示先拉取；认证失败教 GitLab 个人访问令牌 |

## 使用方法

- 本仓库中 `git-beginner-helper.js` 的内容就是插件的 `code.host` 函数体：
  在 DSH 会话中通过 `cordis_define` 创建动态插件时，把它整体粘贴到 `code.host` 字段即可运行。
- 运行后，只要对助手说“帮我提交 / 拉取 / 推送 / 解决冲突 / 看下 git 现状”，助手就会走这套傻瓜式流程。

## 实现要点

- **直接 spawn `git.exe`**（`subprocess` 服务），不经过任何 shell，彻底避免引号/转义问题；git 路径按 PATH → 常见安装目录兜底解析，兼容任何 git 安装。
- 自带超时（`timer` 服务 + `terminate()`）与取消（`exec.signal`）。
- 防呆设计：冲突未解决时禁止提交/拉取/推送；检测 `MERGE_HEAD`/`CHERRY_PICK_HEAD`/`REBASE_HEAD`，合并进行中即使没有文件改动也能用“提交”收尾。
- 所有提示均为中文大白话，把用户当完全不懂 git 的人来引导。
