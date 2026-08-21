# easy-git —— 傻瓜式 git 新手助手（DSH 插件）

> 📖 演示文档：**[DEMO.md](DEMO.md)**（中文）· **[DEMO.en.md](DEMO.en.md)**（English）

一个**标准 DSH 插件**（Cordis 插件包），把 git 操作包装成傻瓜式向导，面向完全不会使用 git 的用户。
**你不需要会任何命令行命令**——全程大白话问答，助手替你执行所有操作。
主要场景是 GitLab / GitHub，兼容 Gitee 等一切基于 git 的托管平台。

## 提供的工具

| 工具 | 作用 |
| --- | --- |
| `git_beginner_platform` | 第一次使用时确定平台（GitHub / GitLab / Gitee / 其他），记住后所有引导都按该平台定制 |
| `git_beginner_status` | “体检”：git 是否安装、是否仓库、当前分支、用户名/邮箱、改动清单、冲突、合并中状态、远程地址、领先/落后远程 |
| `git_beginner_setup` | 第一次使用时的初始化：设全局名字/邮箱、默认分支 main、初始化仓库、绑定远程地址 |
| `git_beginner_pull` | 克隆（无仓库时）/ 拉取（`git pull --no-rebase` 合并方式，绝不改写用户自己的提交） |
| `git_beginner_conflict` | 冲突向导：列冲突文件 → 选择（保留我的 / 保留对方的 / 手动改）→ 自动解决、展示内容或标记手动改完 |
| `git_beginner_commit` | 先预览将提交的文件清单，请用户用一句话说明改动，再执行 `git add -A` + `git commit` |
| `git_beginner_push` | 上传到远程；首次自动 `-u origin HEAD`；被拒绝提示先拉取；认证失败给通俗说明 |

## 首次使用流程（对小白友好）

1. 第一次问助手“看下 git 现状”，助手会先让你选**平台**：GitHub / GitLab / Gitee / 其他；
2. 选好后（或用 `git_beginner_platform` 保存），之后所有步骤（新建仓库、克隆链接、访问令牌等）都会按这个平台一步步引导；
3. 如果你的仓库已经有远程地址，助手会**自动识别**平台，无需再选；想换平台直接说“改成 GitLab”即可。
4. 如果“引导平台”和“远程仓库”对不上（例如引导是 GitLab 但远程是 GitHub），体检时会**自动提醒**，说一句“改成 GitHub”就能切换。

## 安装（对使用 dsh 的人）

从本 git 仓库安装到你的 dsh profile（以 `web` 为例；`headless` 或其他 profile 同理）：

```bash
# 1) 把插件装进 profile（等价于在 profile 目录执行 pnpm add）
dsh plugin --profile web add github:easysir10/easy-git

# 2) 在 profile 的补丁文件里启用插件行
#    编辑 $DSH_HOME/profiles/web/cordis.patch.yml，加上：
#    - insert:
#        - id: git-beginner-helper
#          name: '@easysir10/easy-git'
```

然后**重启 dsh**（插件在启动时随组合树挂载）。之后只要对助手说
“帮我提交 / 拉取 / 推送 / 解决冲突 / 看下 git 现状”，助手就会走这套傻瓜式流程。

> 提示：
> - 也可以改 `$DSH_HOME/cordis.patch.yml`（home 级补丁，优先级更高），写法相同。
> - 想固定版本可以加 commit 引用，如 `github:easysir10/easy-git#main` 或 `#<commit-sha>`。
> - 认证方式（HTTPS 令牌 / SSH 密钥）由各用户在自己机器上自行配置，插件不代管凭据。

## 从源码运行 / 开发

```bash
git clone https://github.com/easysir10/easy-git.git
cd easy-git
npm install    # 或 pnpm install（解析 peerDependencies）
```

`lib/index.js` 是插件本体：ESM 模块，导出 `{ name, inject, apply }` 标准 Cordis 插件，
通过 `ctx.tools.register(defineTool(...))` 注册六个工具。

## 实现要点

- **直接 spawn `git.exe`**（`ctx.subprocess`），不经过任何 shell，彻底避免引号/转义问题；
  git 路径按 PATH → 常见安装目录兜底解析，兼容任何 git 安装。
- 自带超时（`ctx.timer` + `terminate()`）与取消（`exec.signal`）。
- 防呆设计：冲突未解决时禁止提交/拉取/推送；检测 `MERGE_HEAD`/`CHERRY_PICK_HEAD`/`REBASE_HEAD`，
  合并进行中即使没有文件改动也能用“提交”收尾。
- 所有提示均为中文大白话，把用户当完全不懂 git 的人来引导。

## License

MIT
