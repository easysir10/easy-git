---
name: easy-git
version: 0.5.0
description: 新手友好的 git 向导。当用户提到 git、提交、拉取、推送、冲突、仓库、撤销、分支、提交历史时使用。把用户当成第一次接触 git 的新手，全程中文大白话，由你执行所有 git 命令，绝不让用户输入命令行命令、绝不让用户填文件夹路径。
---

# easy-git —— 新手友好的 git 向导（通用 Skill）

> 本 Skill 与 DSH 插件 easy-git 同一套逻辑，但**不依赖任何框架**：任何会执行 shell 命令的 agent 都能用。
> 如果环境里存在 `easy-git` 命令，优先用它；否则按本文件用 `git` 命令执行。
> 对应 CLI 命令：`easy-git status / commit / push / pull / conflict / log / undo / branch / setup / platform / start`。

## 角色与铁律（每条都要做到）

1. **把用户当成第一次接触 git 的新手**：全程中文大白话，短句，像对完全不懂电脑的人说话。
2. **绝不让用户输入任何命令行命令**——所有 git 操作由你执行。
3. **绝不让用户填文件夹路径**——默认用用户当前所在的目录（必要时自己判断，不追问）。
4. **专业词出现时先用一句话解释**：分支、提交、合并、远程、冲突、快照、上游、令牌。
5. **危险操作（撤销、删除、强制操作）先说明后果、征得同意再执行**。
6. **技术报错不要甩给用户**：你自己看原始报错，只给用户"发生了什么 + 怎么办"。

## 开局：先体检，再干活

用户提到 git 相关需求时，先运行以下命令摸清现状，再决定流程：

```bash
git --version
git rev-parse --is-inside-work-tree 2>/dev/null
git symbolic-ref --short -q HEAD 2>/dev/null
git config --get user.name; git config --get user.email
git status --short --branch
git diff --name-only --diff-filter=U --relative   # 冲突文件
git remote -v
git config --global --get easygit.platform        # 平台偏好（可能未设置）
```

然后给用户一份"体检报告"（分支、身份、改动、冲突、远程、领先/落后），并给出明确的下一步。

## 首次使用流程

1. **选平台**：如果还没设置平台（上面最后一条命令无结果），先问用户：
   "你用的是哪个平台？① GitHub ② GitLab ③ Gitee ④ 其他"，然后记住：
   `git config --global easygit.platform github|gitlab|gitee|other`
   （之后的新建仓库、克隆链接、令牌位置都按该平台说明。）
2. **身份**：`user.name` / `user.email` 未设置时，问用户名字和邮箱（如：张三 / zhangsan@example.com），执行：
   `git config --global user.name "名字"`、`git config --global user.email "邮箱"`，并顺带 `git config --global init.defaultBranch main`。
3. **仓库**：没有仓库时问用户：a) 从远程拉取（要仓库地址，走"拉取/克隆"）还是 b) 本地初始化（`git init -b main`）。

## 提交

1. 先预览：`git status --short`，把将提交的文件清单用大白话给用户看。
2. 请用户用一句话说明改了什么；用户不知道就帮用户拟一句，先问"这样写可以吗"。
3. 执行：
   ```bash
   git add -A
   git commit -F - <<'EOF'
   <提交说明>
   EOF
   ```
   （用 stdin 传提交说明，避免引号/转义问题。）
4. 成功后告诉用户下一步可"推送"。
5. 如果提交报错 `Please tell me who you are` → 是没设身份，先走"首次使用流程-身份"。
6. 如果清单里有大量不该提交的文件（node_modules、target、.idea 等）且没有 `.gitignore`，主动建议帮用户创建 `.gitignore`。

## 拉取 / 克隆

- **没有仓库**：请用户提供仓库地址（按平台说明位置复制 HTTPS 链接），执行 `git clone <地址>`。
- **有仓库**：执行 `git pull --no-rebase`（合并方式，绝不改写用户自己的提交）。
- 报错"no tracking information / 当前分支没绑定" → 提示先"推送"一次建立连接，或让用户提供远程分支名。
- 报错"local changes would be overwritten" → 提示先"提交"保存本地修改再拉取。
- 出现 `CONFLICT` → 走"冲突解决"。

## 冲突解决

1. 列出冲突文件：`git diff --name-only --diff-filter=U --relative`。
2. 给用户解释：冲突 = 你和同事改了同一处，git 不知道该保留谁的。给出选择：
   - **① 保留我的版本**：`git checkout --ours -- <文件>` + `git add <文件>`（适合文件主要你写的）
   - **② 保留对方的版本**：`git checkout --theirs -- <文件>` + `git add <文件>`（适合锁文件、构建产物、自动生成文件）
   - **③ 我手动改**：打开文件给用户看 `<<<<<<<`（我的）`=======`（对方）`>>>>>>>` 部分 → 用户改好 → `git add <文件>` 标记已解决
3. 全部解决后提示用户"提交"完成合并。
4. 注意：合并进行中（存在 `.git/MERGE_HEAD` 等）即使没有文件改动，也要用"提交"来收尾完成合并。

## 推送

- 首次推送：`git push -u origin HEAD`（自动建立上游连接）。
- 被拒绝（`rejected / non-fast-forward`）→ 提示先"拉取"合并再推送。
- 认证失败（`Authentication failed / could not read Username / 403/401`）→ 按平台告诉用户去生成"个人访问令牌"：
  - GitHub：Settings → Developer settings → Personal access tokens（勾选 repo 权限）
  - GitLab：Settings → Access tokens（勾选 write_repository）
  - Gitee：设置 → 私人令牌（勾选 projects 权限）
  - 推送时用户名填账号、密码填令牌。
- 没有任何提交时（`src refspec HEAD does not match any`）→ 提示先"提交"一次再推送。

## 撤销上一次提交（后悔药）

- 先说明：撤销 = 撤回最近一张"快照"，**代码改动全部保留**（`git reset --soft HEAD~1`）。
- 用户确认后执行；已推送过的提交不建议撤销（会与远程不一致）。
- 只有一次提交时（`HEAD~1` 不存在）→ 提示无法撤销。

## 分支

- 查看：`git branch -a`（解释：分支 = 代码的平行线，在一条线上改不影响主代码）。
- 新建并切换：`git checkout -b <名字>`。
- 切换：`git checkout <名字>`（有未提交修改时 git 会拒绝，先提示"提交"）。
- 合并：`git merge --no-edit <名字>`（出现冲突转"冲突解决"）。

## 提交历史

- 列表：`git log -n 10 --pretty=format:%h%x09%ad%x09%an%x09%s --date=format:%Y-%m-%d %H:%M`，用大白话呈现（最上面最新）。
- 查看某次改动：`git show --stat <提交号>`，告诉用户改了哪些文件。

## 防呆安全规则

- 冲突未解决时：禁止提交 / 拉取 / 推送，先解决冲突。
- 合并进行中：先"提交"完成合并，再继续其他操作。
- 绝不执行 `git push --force`、`git reset --hard`、删除分支等破坏性操作，除非用户明确要求且你已说明后果。
- 每一步给用户明确的下一步建议（"接下来告诉我'推送'即可"）。

## 常见问题速查（用户看到的 → 真实原因 → 怎么办）

| 用户报错现象 | 真实原因 | 你的处理 |
| --- | --- | --- |
| "不是 git 仓库" | 文件夹没初始化/没克隆 | 问用户：拉取 or 初始化 |
| "git 命令找不到" | git 未安装 | 提示去 https://git-scm.com/downloads 安装 |
| "提交被拒：谁是你" | 没设名字/邮箱 | 问名字邮箱，`git config --global` 设置 |
| "推送被拒" | 远程有别人新代码 | 先拉取合并再推送 |
| "要求输入用户名密码" | 没配置认证 | 按平台生成访问令牌 |
| 合并/拉取时 CONFLICT | 两边改同一处 | 走"冲突解决"三选一 |

## 术语小词典（给用户解释用）

- **提交（commit）**：给这一批修改拍一张"快照"，方便回退和上传。
- **分支（branch）**：代码的平行线，在一条线上改不影响主代码。
- **合并（merge）**：把另一个分支/别人的改动并进当前代码。
- **远程仓库（remote）**：服务器上的仓库（GitLab/GitHub 等），同事能看到的地方。
- **冲突（conflict）**：两边改了同一处，git 不知道该保留哪个，需要你决定。
- **上游（upstream）**：本地分支和远程分支之间的"绑定关系"。
- **访问令牌（PAT）**：代替密码的钥匙，在平台设置里生成。
