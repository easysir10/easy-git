/**
 * Git 新手助手（gitb-2 / pkg-7）
 * =============================
 * 本文件是 DSH 动态插件 cordis_define 的 code.host 函数体（async 函数体）。
 * 使用方式：把本文件内容整体粘贴到 DSH 动态插件定义的 code.host 字段即可运行。
 *
 * 功能：面向完全不会 git 的用户，提供傻瓜式向导工具：
 *   - git_beginner_status   体检：git 是否安装、是否仓库、分支、身份、改动、冲突、合并中、远程、领先/落后
 *   - git_beginner_setup    首次配置：全局名字/邮箱、默认分支 main、初始化仓库、绑定远程地址
 *   - git_beginner_pull     克隆（无仓库时）/ 拉取（git pull --no-rebase 合并，绝不改写用户提交）
 *   - git_beginner_conflict 冲突向导：列清单 → 保留我的 / 保留对方的 / 手动改 → 自动解决或展示内容
 *   - git_beginner_commit   先预览清单 → 用户一句话说明 → git add -A + git commit（消息走 stdin，无转义问题）
 *   - git_beginner_push     首次自动 -u origin HEAD；被拒绝提示先拉取；认证失败教 GitLab 个人访问令牌
 *
 * 实现要点：
 *   - 直接 spawn git.exe（subprocess 服务），不经过任何 shell，无转义/引号问题；
 *     git 路径按 PATH → 常见安装目录兜底解析。
 *   - 自带超时（timer 服务 + terminate）与取消（exec.signal）。
 *   - 冲突/合并中状态防呆：冲突未解决禁止提交/拉取/推送；合并进行中即使无文件改动也能用提交收尾。
 */
return {
  apply(ctx) {
    const sub = ctx.get('subprocess')
    const fsSvc = ctx.get('fs')
    const timer = ctx.get('timer')
    const sandboxPolicy = ctx.get('sandboxPolicy')

    // 默认工作目录：优先取 shell 执行器的默认 cwd（即本会话工作区），workspaceRoot 仅作兜底。
    // 注意：sandboxPolicy.workspaceRoot 在本部署里是用户主目录，绝不能直接拿来当 git 工作目录。
    let cachedDefaultWorkdir = ''
    async function resolveDefaultWorkdir() {
      if (cachedDefaultWorkdir) return cachedDefaultWorkdir
      const shellSvc = ctx.get('shell')
      if (shellSvc) {
        try {
          const spec = shellSvc.resolve({ command: ':' })
          if (spec && spec.workdir) { cachedDefaultWorkdir = spec.workdir; return cachedDefaultWorkdir }
        } catch (e) { /* 继续走兜底 */ }
      }
      cachedDefaultWorkdir = (sandboxPolicy && sandboxPolicy.workspaceRoot) || ''
      return cachedDefaultWorkdir
    }

    const NO_RUNNER = '❌ git 助手暂时无法在宿主上执行命令（缺少 subprocess 服务）。请稍后再试，或改用其他方式。'

    // ---------- 基础工具函数 ----------
    const cap = (s, n) => {
      const str = String(s == null ? '' : s)
      return str.length <= n ? str : str.slice(0, n) + '\n…（内容太长，已截断）'
    }
    const cleanLines = (s) => String(s == null ? '' : s).split(/\r?\n/).map((x) => x.trim()).filter(Boolean)

    // 找到 git 可执行文件（先按 PATH 找，再试常见安装路径）
    let cachedGitPath = ''
    async function gitExePath() {
      if (cachedGitPath) return cachedGitPath
      if (!sub) return ''
      const candidates = [
        'git',
        'C:\\Program Files\\Git\\cmd\\git.exe',
        'C:\\Program Files\\Git\\bin\\git.exe',
        'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
        '/usr/bin/git',
      ]
      for (const c of candidates) {
        try {
          const p = await sub.resolveExecutable(c)
          if (p) { cachedGitPath = p; return p }
        } catch (e) { /* 继续试下一个 */ }
      }
      return ''
    }

    // 直接 spawn git，不经过任何 shell，无转义问题
    async function gitRun(opts) {
      const gitPath = await gitExePath()
      if (!gitPath) {
        return { exitCode: -1, stdout: '', stderr: '这台电脑上没找到 git，请先安装 https://git-scm.com/downloads 后再试。', timedOut: false }
      }
      const argv = [gitPath, '-c', 'color.ui=false', '-c', 'core.quotepath=false']
      for (const a of opts.args) argv.push(String(a))
      const cwd = opts.workdir || await resolveDefaultWorkdir()
      if (!cwd) {
        return { exitCode: -3, stdout: '', stderr: '不知道在哪个文件夹里执行 git（缺少工作目录）。请指定 workdir。', timedOut: false }
      }
      const collect = (max) => ({ maxBytes: max, spill: { maxBytes: 64 * 1024 * 1024 } })
      const spec = {
        argv,
        cwd,
        stdio: {
          stdin: opts.stdin != null ? { data: opts.stdin } : 'ignore',
          stdout: collect(opts.stdoutMaxBytes || 300000),
          stderr: collect(300000),
        },
        graceMs: 3000,
        env: { NO_COLOR: '1', GIT_PAGER: 'cat', PAGER: 'cat' },
      }
      if (opts.signal) spec.signal = opts.signal
      let handle
      try {
        handle = sub.spawn(spec)
      } catch (err) {
        return { exitCode: -2, stdout: '', stderr: '启动 git 失败：' + ((err && err.message) || String(err)), timedOut: false }
      }
      const donePromise = handle.done
      let timedOut = false
      if (opts.timeoutMs && timer) {
        timedOut = await Promise.race([
          donePromise.then(() => false, () => false),
          timer.timeout(opts.timeoutMs).then(() => true),
        ])
        if (timedOut) {
          handle.terminate()
          await donePromise.catch(() => {})
        }
      } else {
        await donePromise.catch(() => {})
      }
      const outcome = await donePromise.then((o) => o, () => null)
      const collectRead = (reader) => {
        if (!reader) return ''
        try {
          const r = reader.readFrom(0)
          return r ? r.text : ''
        } catch (e) { return '' }
      }
      const out = handle.collected
      return {
        exitCode: outcome ? outcome.exitCode : -2,
        stdout: collectRead(out.stdout),
        stderr: collectRead(out.stderr),
        timedOut,
      }
    }

    async function safeGit(opts) {
      if (!sub) return { exitCode: -999, stdout: '', stderr: NO_RUNNER, timedOut: false }
      try {
        return await gitRun(opts)
      } catch (err) {
        return { exitCode: -999, stdout: '', stderr: '执行 git 命令时出错：' + ((err && err.message) || String(err)), timedOut: false }
      }
    }

    // 一次体检：收集仓库的关键事实
    async function collectFacts(workdir, signal) {
      const f = {
        gitInstalled: false, gitVersion: '', isRepo: false, branch: '',
        userName: '', userEmail: '', ahead: 0, behind: 0,
        changes: [], conflicts: [], remotes: [], merging: false,
      }
      const ver = await safeGit({ workdir, args: ['--version'], signal })
      if (ver.exitCode !== 0) return f
      f.gitInstalled = true
      const vm = /git version (\d+)\.(\d+)\.(\d+)/.exec(ver.stdout.trim())
      f.gitVersion = vm ? vm[1] + '.' + vm[2] + '.' + vm[3] : '?'
      const inside = await safeGit({ workdir, args: ['rev-parse', '--is-inside-work-tree'], signal })
      if (inside.exitCode !== 0 || inside.stdout.trim() !== 'true') return f
      f.isRepo = true
      const branch = await safeGit({ workdir, args: ['symbolic-ref', '--short', '-q', 'HEAD'], signal })
      f.branch = branch.exitCode === 0 && branch.stdout.trim() ? branch.stdout.trim() : '（游离状态，不在任何分支上）'
      const name = await safeGit({ workdir, args: ['config', '--get', 'user.name'], signal })
      const email = await safeGit({ workdir, args: ['config', '--get', 'user.email'], signal })
      f.userName = name.exitCode === 0 ? name.stdout.trim() : ''
      f.userEmail = email.exitCode === 0 ? email.stdout.trim() : ''
      const st = await safeGit({ workdir, args: ['status', '--short', '--branch'], stdoutMaxBytes: 300000, signal })
      const lines = cleanLines(st.stdout)
      const head = lines.shift() || ''
      const ab = /\[ahead (\d+)(?:, behind (\d+))?\]/.exec(head)
      if (ab) { f.ahead = +ab[1]; f.behind = ab[2] ? +ab[2] : 0 }
      f.changes = lines
      const unmerged = await safeGit({ workdir, args: ['diff', '--name-only', '--diff-filter=U', '--relative'], signal })
      f.conflicts = unmerged.exitCode === 0 ? cleanLines(unmerged.stdout) : []
      const remote = await safeGit({ workdir, args: ['remote', '-v'], signal })
      f.remotes = remote.exitCode === 0 ? cleanLines(remote.stdout) : []
      const mh = await safeGit({ workdir, args: ['rev-parse', '-q', '--verify', 'MERGE_HEAD'], signal })
      f.merging = mh.exitCode === 0
      if (!f.merging) {
        const cp = await safeGit({ workdir, args: ['rev-parse', '-q', '--verify', 'CHERRY_PICK_HEAD'], signal })
        f.merging = cp.exitCode === 0
      }
      if (!f.merging) {
        const rb = await safeGit({ workdir, args: ['rev-parse', '-q', '--verify', 'REBASE_HEAD'], signal })
        f.merging = rb.exitCode === 0
      }
      return f
    }

    function friendlyChange(line) {
      const code = String(line).slice(0, 2)
      const rest = String(line).slice(3)
      if (/^\?\?/.test(code)) return '🆕 新增（还没加入 git）  ' + rest
      if (/^A/.test(code)) return '🆕 新增  ' + rest
      if (/^D/.test(code)) return '🗑️ 删除  ' + rest
      if (/^R/.test(code)) return '🔀 重命名  ' + rest
      if (/^U/.test(code)) return '⚠️ 冲突  ' + rest
      return '✏️ 修改  ' + rest
    }

    async function showConflictFile(file, workdir, signal) {
      const d = await safeGit({ workdir, args: ['diff', '--', file], stdoutMaxBytes: 300000, signal })
      if (d.exitCode === 0 && d.stdout.trim()) {
        return '文件 ' + file + ' 的冲突内容（<<<<<<< 是“我的版本”，>>>>>>> 是“对方的版本”，中间 ======= 分隔）：\n' + cap(d.stdout, 6000)
      }
      if (fsSvc) {
        try {
          const target = await fsSvc.resolve(file, { cwd: workdir || undefined })
          const content = await fsSvc.readText(target, signal)
          const lines = content.split(/\r?\n/)
          const marks = []
          for (let i = 0; i < lines.length; i++) {
            if (/^(<<<<<<<|=======|>>>>>>>)/.test(lines[i])) marks.push(i)
          }
          if (marks.length) {
            const seen = new Set()
            const out = []
            for (const mi of marks) {
              const start = Math.max(0, mi - 4)
              const end = Math.min(lines.length, mi + 5)
              for (let i = start; i < end; i++) {
                if (!seen.has(i)) { seen.add(i); out.push(lines[i]) }
              }
              out.push('……')
            }
            return '文件 ' + file + ' 中冲突的位置（<<<<<<< 是“我的版本”，>>>>>>> 是“对方的版本”，中间 ======= 分隔）：\n' + cap(out.join('\n'), 6000)
          }
          return '文件 ' + file + ' 里没有冲突标记，内容如下（前 200 行）：\n' + cap(content, 6000)
        } catch (e) { /* 继续走下面的提示 */ }
      }
      return '无法直接显示 ' + file + ' 的内容。请用 read 工具打开这个文件，找到 <<<<<<< 和 >>>>>>> 标记的部分给用户解释。'
    }

    // ---------- 工具注册 ----------
    function defineTool(name, description, parameters, execute) {
      return harness.defineTool({
        name,
        description,
        parameters,
        output: {
          schema: {
            type: 'object',
            properties: { ok: { type: 'boolean' }, text: { type: 'string' } },
            additionalProperties: false,
          },
          render(args, value) {
            return [{ type: 'text', text: String(value.text) }]
          },
        },
        execute,
      })
    }

    const disposers = []

    disposers.push(harness.registerTool(ctx, defineTool(
      'git_beginner_status',
      '给完全不懂 git 的用户做“体检”：一次性检查 git 是否安装、当前文件夹是不是 git 仓库、在哪个分支、用户名和邮箱有没有设置、有哪些改动、有没有冲突、是否正在合并中、远程地址、领先/落后远程多少。用户提到 git/提交/拉取/推送/冲突/仓库时，先调用本工具摸清现状，再用大白话把结果讲给用户，并给出明确的下一步建议。',
      {
        type: 'object',
        properties: {
          workdir: { type: 'string', description: '要检查的文件夹路径（仓库所在目录）。不填就用当前工作目录。' },
        },
      },
      async (args, exec) => {
        const workdir = args.workdir || ''
        const f = await collectFacts(workdir, exec.signal)
        if (!f.gitInstalled) {
          return { ok: false, text: '❌ 这台电脑上还没有安装 git。\n\n怎么办：去 https://git-scm.com/downloads 下载安装（一路点“下一步”即可），装好后再让我帮你检查一遍。' }
        }
        if (!f.isRepo) {
          return { ok: true, text: '✅ git 已经装好了（版本 ' + f.gitVersion + '）。\n\n但当前文件夹还不是一个 git 仓库。\n\n接下来可以选：\n1️⃣ 从 GitLab 等平台拉一个现成的项目 → 把仓库地址发给我（项目页点 Clone，复制 HTTPS 链接），我用 git_beginner_pull 帮你下载。\n2️⃣ 把当前文件夹变成仓库 → 告诉我，我用 git_beginner_setup 帮你初始化。' }
        }
        const out = []
        out.push('📋 你当前 git 的情况（体检报告）：')
        out.push('')
        out.push('• 当前分支：' + f.branch)
        out.push('• 你的名字（user.name）：' + (f.userName || '❌ 还没设置'))
        out.push('• 你的邮箱（user.email）：' + (f.userEmail || '❌ 还没设置'))
        if (f.remotes.length) out.push('• 远程仓库：' + f.remotes[0])
        else out.push('• 远程仓库：❌ 还没设置（还没连上 GitLab）')
        if (f.ahead || f.behind) out.push('• 和远程对比：本地领先 ' + f.ahead + ' 个提交，落后 ' + f.behind + ' 个提交')
        else out.push('• 和远程对比：完全同步')
        out.push('')
        if (f.merging) {
          out.push('⚠️ 当前正处于“合并”进行中：另一个分支/别人的代码正在合并进来。')
          if (f.conflicts.length) out.push('   还有冲突没解决完，见下面的冲突清单。')
          else out.push('   冲突已经解决，还差最后一步“提交”来正式完成合并（告诉我“提交”即可）。')
          out.push('')
        }
        if (f.conflicts.length) {
          out.push('⚠️ 有 ' + f.conflicts.length + ' 个文件存在冲突，需要先解决：')
          for (const c of f.conflicts) out.push('   • ' + c)
          out.push('')
          out.push('下一步：告诉用户用 git_beginner_conflict 工具解决冲突。')
        } else if (f.changes.length) {
          out.push('✏️ 有 ' + f.changes.length + ' 个文件被改过（还没提交）：')
          for (const c of f.changes.slice(0, 30)) out.push('   • ' + friendlyChange(c))
          if (f.changes.length > 30) out.push('   …还有 ' + (f.changes.length - 30) + ' 个')
          out.push('')
          out.push('下一步：要保存这些修改就告诉用户“提交”（我会用 git_beginner_commit）；要先把别人的代码拉下来就告诉我“拉取”。')
        } else if (!f.merging) {
          out.push('✏️ 当前没有任何未提交的修改。')
        }
        if (!f.userName || !f.userEmail) {
          out.push('')
          out.push('⚠️ 你的名字或邮箱还没设置，提交时会报错。告诉我你的名字和邮箱（GitLab 注册时用的），我用 git_beginner_setup 帮你设置。')
        }
        return { ok: true, text: out.join('\n') }
      },
    )))

    disposers.push(harness.registerTool(ctx, defineTool(
      'git_beginner_setup',
      '第一次使用 git 时的初始化配置：设置你的名字和邮箱（写入全局配置，所有仓库都能用）、可选把当前文件夹初始化为 git 仓库、可选绑定 GitLab 等平台的仓库地址。执行前先把要做什么用大白话告诉用户并征得同意，再调用本工具。',
      {
        type: 'object',
        properties: {
          workdir: { type: 'string', description: '目标文件夹路径。不填就用当前工作目录。' },
          userName: { type: 'string', description: '用户的名字，例如“张三”。' },
          userEmail: { type: 'string', description: '用户的邮箱，例如 zhangsan@example.com（GitLab 注册邮箱）。' },
          initRepo: { type: 'boolean', description: '是否把当前文件夹初始化为 git 仓库（默认分支 main）。' },
          remoteUrl: { type: 'string', description: '远程仓库地址（GitLab 的 HTTPS 克隆链接），绑定为 origin。' },
        },
      },
      async (args, exec) => {
        const workdir = args.workdir || ''
        const out = []
        let ok = true
        const ver = await safeGit({ workdir, args: ['--version'], signal: exec.signal })
        if (ver.exitCode !== 0) {
          return { ok: false, text: '❌ 还没检测到 git，请先安装：https://git-scm.com/downloads ，装好后再来。' }
        }
        if (args.userName) {
          const r = await safeGit({ workdir, args: ['config', '--global', 'user.name', args.userName], signal: exec.signal })
          if (r.exitCode === 0) out.push('✅ 已把全局用户名设置为：' + args.userName)
          else { ok = false; out.push('❌ 设置用户名失败：' + cap(r.stderr, 300)) }
        }
        if (args.userEmail) {
          const r = await safeGit({ workdir, args: ['config', '--global', 'user.email', args.userEmail], signal: exec.signal })
          if (r.exitCode === 0) out.push('✅ 已把全局邮箱设置为：' + args.userEmail)
          else { ok = false; out.push('❌ 设置邮箱失败：' + cap(r.stderr, 300)) }
        }
        if (args.userName || args.userEmail) {
          const db = await safeGit({ workdir, args: ['config', '--global', 'init.defaultBranch', 'main'], signal: exec.signal })
          if (db.exitCode === 0) out.push('✅ 已把新建仓库的默认分支名设为 main（和 GitLab 默认一致，避免混乱）。')
        }
        if (args.initRepo) {
          const inside = await safeGit({ workdir, args: ['rev-parse', '--is-inside-work-tree'], signal: exec.signal })
          if (inside.exitCode === 0 && inside.stdout.trim() === 'true') {
            out.push('ℹ️ 当前文件夹已经是一个 git 仓库了，不需要重复初始化。')
          } else {
            const init = await safeGit({ workdir, args: ['init', '-b', 'main'], signal: exec.signal })
            if (init.exitCode === 0) {
              out.push('✅ 已把当前文件夹初始化为 git 仓库（默认分支 main）。')
            } else {
              const init2 = await safeGit({ workdir, args: ['init'], signal: exec.signal })
              if (init2.exitCode === 0) {
                await safeGit({ workdir, args: ['symbolic-ref', 'HEAD', 'refs/heads/main'], signal: exec.signal })
                out.push('✅ 已把当前文件夹初始化为 git 仓库（默认分支 main）。')
              } else {
                ok = false
                out.push('❌ 初始化失败：' + cap(init2.stderr, 300))
              }
            }
          }
        }
        if (args.remoteUrl) {
          const rem = await safeGit({ workdir, args: ['remote', 'get-url', 'origin'], signal: exec.signal })
          if (rem.exitCode === 0) {
            out.push('ℹ️ 已经绑定过远程地址：' + rem.stdout.trim() + '（保持不变）。')
          } else {
            const add = await safeGit({ workdir, args: ['remote', 'add', 'origin', args.remoteUrl], signal: exec.signal })
            if (add.exitCode === 0) out.push('✅ 已绑定远程仓库地址：' + args.remoteUrl)
            else { ok = false; out.push('❌ 绑定远程地址失败：' + cap(add.stderr, 300)) }
          }
        }
        if (!args.userName && !args.userEmail && !args.initRepo && !args.remoteUrl) {
          return { ok: false, text: 'ℹ️ 这次没有做任何修改。请告诉我：\n• 你的名字（例如：张三）\n• 你的邮箱（例如：zhangsan@example.com，GitLab 注册时用的）\n• 是否需要把当前文件夹初始化为 git 仓库\n• 远程仓库地址（可选，从 GitLab 项目页 Clone 复制 HTTPS 链接）' }
        }
        out.push('')
        out.push('✅ 配置完成！现在可以正式使用 git 了：要拉代码就把仓库地址发我，要保存修改就告诉我“提交”。')
        return { ok, text: out.join('\n') }
      },
    )))

    disposers.push(harness.registerTool(ctx, defineTool(
      'git_beginner_pull',
      '把代码拉到本地。两种情况：1) 当前文件夹还不是 git 仓库 → 需要用户提供 GitLab 等平台的仓库地址（HTTPS 克隆链接），工具会执行克隆；2) 已经是仓库 → 执行拉取（git pull --no-rebase 合并方式，绝不改写用户自己的提交）。出现冲突时提示改用 git_beginner_conflict。执行前向用户解释“拉取=把别人最新改的代码拿下来”。',
      {
        type: 'object',
        properties: {
          workdir: { type: 'string', description: '目标文件夹路径。不填就用当前工作目录。' },
          remoteUrl: { type: 'string', description: '仓库地址（HTTPS 克隆链接）。当前文件夹还不是仓库时必填。' },
          branch: { type: 'string', description: '可选：要拉取的远程分支名，不填就拉当前分支。' },
        },
      },
      async (args, exec) => {
        const workdir = args.workdir || ''
        const f = await collectFacts(workdir, exec.signal)
        if (!f.gitInstalled) return { ok: false, text: '❌ 还没检测到 git，请先安装后再试。' }
        if (!f.isRepo) {
          if (!args.remoteUrl) {
            return { ok: false, text: 'ℹ️ 当前文件夹还不是 git 仓库，需要先有仓库地址才能把代码拉下来。\n\n请去 GitLab（或其他代码托管平台）打开项目页面 → 点 Clone 按钮 → 复制 HTTPS 那一行的链接发给我。' }
          }
          const r = await safeGit({ workdir, args: ['clone', args.remoteUrl], timeoutMs: 600000, stdoutMaxBytes: 200000, signal: exec.signal })
          if (r.exitCode === 0) {
            let dir = ''
            const mm = /Cloning into '([^']+)'/.exec(r.stdout)
            if (mm) dir = mm[1]
            const name = (args.remoteUrl.split('/').pop() || '').replace(/\.git$/i, '')
            return { ok: true, text: '✅ 克隆成功！代码已经下载到本地。\n\n存放位置：' + (dir || name || '当前文件夹下的新目录') + '\n\n以后改完代码，告诉我“提交”，我会一步步帮你保存和上传。' }
          }
          const raw = cap((r.stderr || '') + (r.stdout || ''), 800)
          return { ok: false, text: '❌ 克隆失败。\n\n' + (r.timedOut ? '超时了，可能是网络太慢，稍后再试一次。' : '常见原因：\n1. 地址写错了（注意要以 https:// 开头）\n2. 项目是私有的，需要先登录/授权（GitLab 可以用“个人访问令牌”当密码，需要的话我可以教你）\n\n原始报错：\n' + raw) }
        }
        if (f.conflicts.length) {
          return { ok: false, text: '⚠️ 当前有 ' + f.conflicts.length + ' 个文件还没解决冲突，先解决冲突再拉取。\n冲突文件：\n' + f.conflicts.map((c) => '   • ' + c).join('\n') + '\n\n请用 git_beginner_conflict 工具解决。' }
        }
        if (f.merging) {
          return { ok: false, text: '⚠️ 当前正在合并中（还没完成）。先告诉我“提交”把这次合并完成，再拉取。' }
        }
        if (!f.remotes.length && args.remoteUrl) {
          const add = await safeGit({ workdir, args: ['remote', 'add', 'origin', args.remoteUrl], signal: exec.signal })
          if (add.exitCode !== 0) return { ok: false, text: '❌ 绑定远程地址失败：' + cap(add.stderr, 400) }
        }
        if (!f.remotes.length) {
          return { ok: false, text: '❌ 当前仓库还没绑定远程地址（GitLab）。请把仓库地址（HTTPS 克隆链接）发给我，我帮你绑定后再拉取。' }
        }
        const pullArgs = ['pull', '--no-rebase']
        if (args.branch) pullArgs.push('origin', args.branch)
        const r = await safeGit({ workdir, args: pullArgs, timeoutMs: 600000, stdoutMaxBytes: 300000, signal: exec.signal })
        const text = (r.stdout || '') + (r.stderr || '')
        if (r.exitCode === 0) {
          return { ok: true, text: '✅ 拉取完成！你已经拿到了别人最新提交的代码。\n\n' + cap(text, 600) }
        }
        if (/CONFLICT|Automatic merge failed|conflict/i.test(text)) {
          return { ok: false, text: '⚠️ 拉取时出现了冲突：你和别人的修改撞在了一起，git 不知道该保留哪个。\n\n别担心，这很正常。请用 git_beginner_conflict 工具，我会一步步带你选择怎么处理。\n\n原始信息：\n' + cap(text, 1500) }
        }
        if (/local changes would be overwritten|Your local changes would be overwritten|untracked working tree files would be overwritten/i.test(text)) {
          return { ok: false, text: '⚠️ 拉取失败：你本地还有没保存（提交）的修改，git 怕覆盖你的工作所以停了。\n\n解决：先把你现在的修改提交保存起来（告诉我“提交”），再重新拉取。\n\n原始报错：\n' + cap(text, 800) }
        }
        if (/no such ref was fetched|not a git repository|refspec|does not match any|remote HEAD refers|no matching branch/i.test(text)) {
          return { ok: false, text: '⚠️ 拉取失败：本地分支和远程分支对不上（比如远程默认分支是 main，本地却是 master，或反过来）。\n\n告诉我远程的分支名（在 GitLab 项目页左侧“分支”里可以看到），我用 git_beginner_pull 的 branch 参数帮你指定；或者告诉我“重新克隆”，我把代码重新下载一份。\n\n原始报错：\n' + cap(text, 800) }
        }
        if (r.timedOut) return { ok: false, text: '⏱️ 拉取超时了，可能是网络慢或需要登录授权。稍后再试，或检查网络。\n\n' + cap(text, 400) }
        return { ok: false, text: '❌ 拉取失败：\n\n' + cap(text, 1000) }
      },
    )))

    disposers.push(harness.registerTool(ctx, defineTool(
      'git_beginner_conflict',
      '解决“代码冲突”。冲突 = 你和同事改了同一个文件的同一处，git 不知道该保留谁的。先调用本工具查看冲突文件清单；然后向用户用大白话解释三个选择：①保留我的版本 ②保留对方的版本 ③手动改。用户选好后，把 choice 设为 mine/theirs 再次调用本工具自动解决，或选择 show 查看冲突内容后手动修改。建议：构建产物/锁文件/自动生成的文件 → 保留对方的；普通代码两边都改过 → 手动改最稳妥。',
      {
        type: 'object',
        properties: {
          workdir: { type: 'string', description: '仓库文件夹路径。不填就用当前工作目录。' },
          choice: { type: 'string', enum: ['mine', 'theirs', 'show'], description: 'mine=保留我的版本；theirs=保留对方的版本；show=显示某个文件的冲突内容给用户看。不填则只列出冲突清单和解释。' },
          file: { type: 'string', description: '可选：只处理这一个文件（show 时必填想要看的文件）。不填就处理全部冲突文件。' },
        },
      },
      async (args, exec) => {
        const workdir = args.workdir || ''
        const f = await collectFacts(workdir, exec.signal)
        if (!f.isRepo) return { ok: false, text: '当前文件夹还不是 git 仓库，先拉取或初始化再说。' }
        if (!f.conflicts.length) {
          return { ok: true, text: '🎉 目前没有冲突，一切正常！' }
        }
        if (!args.choice) {
          const out = []
          out.push('⚠️ 有 ' + f.conflicts.length + ' 个文件发生了冲突：')
          for (const c of f.conflicts) out.push('   • ' + c)
          out.push('')
          out.push('什么是冲突：你和同事都改了同一个文件的同一个地方，git 不知道听谁的，就先把两个版本都留给你决定。')
          out.push('')
          out.push('三个选择（先问用户选哪个，再告诉我）：')
          out.push('① 保留我的版本 —— 用你自己本地写的这一份（适合：这个文件主要是你写的、别人的改动不重要）')
          out.push('② 保留对方的版本 —— 用别人/远程的那一份（适合：构建产物、锁文件、自动生成的文件，谁的都是重新生成的）')
          out.push('③ 我手动改 —— 两个版本都要留一部分（推荐：普通代码，两边都改过重要内容）')
          out.push('')
          out.push('怎么选：如果是 .lock / 打包产物 / 自动生成的文件，选②最省事；如果是普通代码，选③最稳妥，我会把冲突的地方打开给你看。')
          return { ok: true, text: out.join('\n') }
        }
        if (args.choice === 'show') {
          const file = args.file || f.conflicts[0]
          const text = await showConflictFile(file, workdir, exec.signal)
          return { ok: true, text: text }
        }
        const files = args.file ? [args.file] : f.conflicts
        const ours = args.choice === 'mine'
        const out = []
        let allOk = true
        for (const file of files) {
          const co = await safeGit({ workdir, args: ['checkout', ours ? '--ours' : '--theirs', '--', file], signal: exec.signal })
          const add = await safeGit({ workdir, args: ['add', '--', file], signal: exec.signal })
          if (co.exitCode === 0 && add.exitCode === 0) {
            out.push('✅ ' + file + (ours ? ' 已保留你的版本' : ' 已保留对方的版本'))
          } else {
            allOk = false
            out.push('❌ ' + file + ' 处理失败：' + cap((co.stderr || '') + (add.stderr || ''), 300))
            out.push('   这种情况说明这个文件只有一边有内容（比如新增/删除冲突），建议改用手动改：告诉我“手动”，我会把内容打开给你看。')
          }
        }
        const f2 = await collectFacts(workdir, exec.signal)
        if (allOk && !f2.conflicts.length) {
          out.push('')
          out.push('🎉 所有冲突都解决好了！现在可以提交了：告诉用户“提交”，我会把这次合并保存成一个版本。')
        } else if (allOk) {
          out.push('')
          out.push('还有 ' + f2.conflicts.length + ' 个文件冲突没处理：' + f2.conflicts.join('、'))
          out.push('可以继续让我处理，或选 show 查看内容后手动改。')
        }
        return { ok: allOk, text: out.join('\n') }
      },
    )))

    disposers.push(harness.registerTool(ctx, defineTool(
      'git_beginner_commit',
      '把修改保存成一个“版本”（提交）。先调用本工具预览将要提交的文件清单，把清单用大白话告诉用户，并请用户用一句话说明改了什么；拿到那句话后把 message 传进来再次调用。内部执行 git add -A + git commit（提交说明通过标准输入写入，安全无转义问题）。若正在合并中且没有具体文件改动，仍会用提交来完成合并。',
      {
        type: 'object',
        properties: {
          workdir: { type: 'string', description: '仓库文件夹路径。不填就用当前工作目录。' },
          message: { type: 'string', description: '提交说明，一句话说清楚改了什么。第一次调用（预览）时不填；用户确认后第二次调用时填。' },
        },
      },
      async (args, exec) => {
        const workdir = args.workdir || ''
        const f = await collectFacts(workdir, exec.signal)
        if (!f.isRepo) return { ok: false, text: '当前文件夹还不是 git 仓库，先初始化或拉取再说。' }
        if (f.conflicts.length) {
          return { ok: false, text: '⚠️ 还有 ' + f.conflicts.length + ' 个文件冲突没解决，先解决冲突才能提交。\n' + f.conflicts.map((c) => '   • ' + c).join('\n') + '\n\n请用 git_beginner_conflict 工具。' }
        }
        if (!f.changes.length && !f.merging) {
          return { ok: true, text: 'ℹ️ 现在没有需要提交的修改。你可以先改代码，改完再告诉我“提交”。' }
        }
        if (!args.message) {
          const out = []
          if (f.changes.length) {
            out.push('✏️ 本次将提交 ' + f.changes.length + ' 个文件：')
            for (const c of f.changes.slice(0, 50)) out.push('   • ' + friendlyChange(c))
            if (f.changes.length > 50) out.push('   …还有 ' + (f.changes.length - 50) + ' 个')
          }
          if (f.merging) {
            out.push('⚠️ 当前正在合并中：即使文件清单是空的，也需要一个提交来正式完成合并。')
          }
          out.push('')
          out.push('提交 = 给这一批修改拍一张“快照”，方便以后回退、也方便上传到 GitLab。')
          out.push('')
          out.push('请让用户用一句话说明改了什么（越简单越好，例如：“修复了登录按钮点不动的问题”），然后把那句话作为 message 告诉我，我再执行提交。')
          return { ok: true, text: out.join('\n') }
        }
        if (f.changes.length) {
          const add = await safeGit({ workdir, args: ['add', '-A'], signal: exec.signal })
          if (add.exitCode !== 0) return { ok: false, text: '❌ 暂存修改失败：' + cap(add.stderr, 500) }
        }
        const commit = await safeGit({ workdir, args: ['commit', '-F', '-'], stdin: args.message + '\n', timeoutMs: 60000, signal: exec.signal })
        if (commit.exitCode === 0) {
          const stat = await safeGit({ workdir, args: ['log', '-1', '--stat', '--oneline'], stdoutMaxBytes: 100000, signal: exec.signal })
          return { ok: true, text: '✅ 提交成功！\n\n提交说明：' + args.message + '\n\n' + cap(stat.stdout, 1500) + '\n\n下一步：把这次提交上传到 GitLab？告诉用户“推送”，我来帮你。' }
        }
        return { ok: false, text: '❌ 提交失败：\n' + cap((commit.stderr || '') + (commit.stdout || ''), 800) }
      },
    )))

    disposers.push(harness.registerTool(ctx, defineTool(
      'git_beginner_push',
      '把本地提交上传到远程仓库（如 GitLab）。执行前向用户解释“推送=把你本地的版本上传到服务器，别人就能看到”。首次推送会自动设置上游分支（git push -u origin HEAD）。若被拒绝（远程有别人新提交的代码），提示先调用 git_beginner_pull 合并后再推送；若认证失败，给出 GitLab 个人访问令牌的通俗说明。',
      {
        type: 'object',
        properties: {
          workdir: { type: 'string', description: '仓库文件夹路径。不填就用当前工作目录。' },
        },
      },
      async (args, exec) => {
        const workdir = args.workdir || ''
        const f = await collectFacts(workdir, exec.signal)
        if (!f.isRepo) return { ok: false, text: '当前文件夹还不是 git 仓库，先拉取或初始化再说。' }
        if (f.conflicts.length) {
          return { ok: false, text: '⚠️ 还有 ' + f.conflicts.length + ' 个文件冲突没解决，先解决冲突再推送。请用 git_beginner_conflict 工具。' }
        }
        if (f.merging) {
          return { ok: false, text: '⚠️ 当前正在合并中（还没完成）。先告诉我“提交”把这次合并完成，再推送。' }
        }
        if (!f.remotes.length) {
          return { ok: false, text: '❌ 还没绑定远程仓库（GitLab 地址）。\n\n去 GitLab 新建一个空项目（或直接用已有的），复制它的 HTTPS 克隆链接发给我，我用 git_beginner_setup 帮你绑定。' }
        }
        const up = await safeGit({ workdir, args: ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], signal: exec.signal })
        const hasUpstream = up.exitCode === 0 && up.stdout.trim()
        const pushArgs = hasUpstream ? ['push'] : ['push', '-u', 'origin', 'HEAD']
        const r = await safeGit({ workdir, args: pushArgs, timeoutMs: 600000, stdoutMaxBytes: 300000, signal: exec.signal })
        const text = (r.stdout || '') + (r.stderr || '')
        if (r.exitCode === 0) {
          return { ok: true, text: '✅ 推送成功！你的代码已经上传到远程仓库，同事/合并请求里都能看到了。\n\n' + cap(text, 600) }
        }
        if (/rejected|non-fast-forward|fetch first|have diverged/i.test(text)) {
          return { ok: false, text: '⚠️ 推送被拒绝了：远程仓库有别人新提交的代码，git 不想覆盖它们。\n\n解决：先“拉取”把别人的代码合并进来（告诉我“拉取”），再重新推送。\n\n原始报错：\n' + cap(text, 800) }
        }
        if (/Authentication failed|could not read Username|could not read Password|access denied|403|401|Invalid username or password/i.test(text)) {
          return { ok: false, text: '❌ 登录/权限验证没通过。\n\n常见原因和解决办法：\n1. 用 HTTPS 方式：GitLab 现在不支持账号密码登录，需要在 GitLab 里生成“个人访问令牌（Personal Access Token）”，勾选 write_repository 权限；推送时用户名填你的账号、密码填令牌；\n2. 项目是私有的，而你没有该项目权限（找项目管理员加你）；\n3. 也可以改用 SSH 方式（需要配置 SSH 密钥，需要的话我可以一步步教你）。\n\n原始报错：\n' + cap(text, 800) }
        }
        if (r.timedOut) return { ok: false, text: '⏱️ 推送超时，可能是网络慢或需要登录。稍后再试。' }
        return { ok: false, text: '❌ 推送失败：\n' + cap(text, 1000) }
      },
    )))

    return () => {
      for (const d of disposers) {
        try { d() } catch (e) { /* 忽略回收错误 */ }
      }
    }
  },
}
