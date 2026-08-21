#!/usr/bin/env node
/**
 * easy-git —— 新手友好的 git 助手（命令行版）
 * ============================================
 * 零依赖、跨平台。任何 agent 都能通过"执行命令"调用，人类也能在终端直接用。
 *
 * 用法：
 *   easy-git status [目录]                         体检
 *   easy-git start [目录]                          "开始使用"引导进度
 *   easy-git platform [github|gitlab|gitee|other] 查看/设置平台
 *   easy-git setup [目录] [--name X] [--email Y] [--init] [--remote URL]
 *   easy-git commit [目录] [-m "说明"]             提交（不带 -m 会交互询问）
 *   easy-git push [目录]
 *   easy-git pull [目录] [--remote URL] [--branch NAME]
 *   easy-git conflict [目录] [list|mine|theirs|show|manual] [文件]
 *   easy-git log [目录] [-n 10]
 *   easy-git undo [目录] [--confirm]
 *   easy-git branch [目录] [list|create NAME|switch NAME|merge NAME]
 *   easy-git help | --version
 *
 * 所有输出为中文大白话；退出码 0=成功，1=需要用户处理/友好错误。
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import readline from 'node:readline'
import {
  PLATFORM_INFO, cap, collectFacts, friendlyChange, gitRun,
  guardEnv, inferPlatformFromRemote, readPlatform, savePlatform, statusReport,
} from '../src/core.js'

const VERSION = '0.4.0'

// ---------- 参数解析 ----------
function parse(argv) {
  const opts = {}
  const positional = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-m' || a === '-n' || a === '--name' || a === '--email' || a === '--remote' || a === '--branch' || a === '--file') {
      opts[a.replace(/^-+/, '')] = argv[++i]
    } else if (a === '--init' || a === '--confirm' || a === '--version' || a === '-v') {
      opts[a.replace(/^-+/, '')] = true
    } else if (a.startsWith('--')) {
      opts[a.slice(2)] = argv[++i]
    } else {
      positional.push(a)
    }
  }
  return { opts, positional }
}

const ask = (question) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  rl.question(question, (a) => { rl.close(); resolve(a.trim()) })
})

function out(text, code = 0) {
  console.log(text)
  process.exit(code)
}

function usage() {
  console.log(`easy-git v${VERSION} —— 新手友好的 git 助手（命令行版）
零依赖、跨平台，任何 agent 都能调用，人类也能在终端直接用。

用法：
  easy-git status [目录]                            体检
  easy-git start [目录]                             "开始使用"引导进度
  easy-git platform [github|gitlab|gitee|other]     查看/设置平台
  easy-git setup [目录] [--name X] [--email Y] [--init] [--remote URL]
  easy-git commit [目录] [-m "说明"]                提交（不带 -m 会交互询问）
  easy-git push [目录]                             上传到远程
  easy-git pull [目录] [--remote URL] [--branch NAME]  拉取/克隆
  easy-git conflict [目录] [list|mine|theirs|show|manual] [文件]
  easy-git log [目录] [-n 10]                      提交历史
  easy-git undo [目录] [--confirm]                 撤销上一次提交（保留代码）
  easy-git branch [目录] [list|create NAME|switch NAME|merge NAME]
  easy-git help | --version
`)
}

const REMOTE_RE = /^(https?:\/\/|git@|ssh:\/\/)/i

// ---------- 各命令 ----------
async function cmdStatus(dir) {
  const f = await collectFacts(dir)
  out(statusReport(f, dir))
}

async function cmdStart(dir) {
  const f = await collectFacts(dir)
  const plat = await readPlatform()
  const done = []
  const todo = []
  if (plat) done.push('✅ ① 平台：你用的是' + PLATFORM_INFO[plat].name)
  else todo.push('① 平台：还没选（用 easy-git platform github|gitlab|gitee|other 设置）')
  if (f.gitInstalled && f.userName && f.userEmail) done.push('✅ ② 身份：名字（' + f.userName + '）和邮箱已设置')
  else if (f.gitInstalled) todo.push('② 身份：名字/邮箱还没设置（用 easy-git setup --name 张三 --email zhangsan@example.com）')
  else todo.push('② 身份：git 还没安装（先安装 https://git-scm.com/downloads）')
  if (f.isRepo) done.push('✅ ③ 仓库：当前目录已经是 git 仓库')
  else todo.push('③ 仓库：还没有（easy-git pull 拉取，或 easy-git setup --init 初始化）')
  const lines = ['🎯 开始使用 git —— 进度报告：', '']
  lines.push(...done, ...todo, '')
  lines.push(todo.length ? '下一步：先完成最上面那个 ⬜ 步骤。' : '🎉 配置全齐了！改代码后 easy-git commit，上传说 easy-git push。')
  out(lines.join('\n'))
}

async function cmdPlatform(value) {
  if (!value) {
    const cur = await readPlatform()
    out('📌 当前记录的代码托管平台：' + (cur ? PLATFORM_INFO[cur].name : '还没设置') +
      '\n\n设置方式：easy-git platform github|gitlab|gitee|other')
  }
  if (!PLATFORM_INFO[value]) out('❌ 平台值应为 github / gitlab / gitee / other。', 1)
  const ok = await savePlatform(value)
  if (!ok) out('❌ 保存平台设置失败（git 没安装或全局配置不可写）。', 1)
  out('✅ 已记住：你使用' + PLATFORM_INFO[value].name + '。之后所有引导都按它来。')
}

async function cmdSetup(dir, opts) {
  const f = await collectFacts(dir)
  if (!f.gitInstalled) out(guardEnv(f, false).text, 1)
  const lines = []
  let ok = true
  if (opts.name) {
    const r = await gitRun({ args: ['config', '--global', 'user.name', opts.name], cwd: dir })
    lines.push((r.exitCode === 0 ? '✅ ' : '❌ ') + '已把全局用户名设置为：' + opts.name)
    if (r.exitCode !== 0) ok = false
  }
  if (opts.email) {
    const r = await gitRun({ args: ['config', '--global', 'user.email', opts.email], cwd: dir })
    lines.push((r.exitCode === 0 ? '✅ ' : '❌ ') + '已把全局邮箱设置为：' + opts.email)
    if (r.exitCode !== 0) ok = false
  }
  if (opts.name || opts.email) {
    await gitRun({ args: ['config', '--global', 'init.defaultBranch', 'main'], cwd: dir })
  }
  if (opts.init) {
    const inside = await gitRun({ args: ['rev-parse', '--is-inside-work-tree'], cwd: dir })
    if (inside.exitCode === 0 && inside.stdout.trim() === 'true') {
      lines.push('ℹ️ 当前目录已经是一个 git 仓库了。')
    } else {
      const init = await gitRun({ args: ['init', '-b', 'main'], cwd: dir })
      if (init.exitCode === 0) lines.push('✅ 已把当前目录初始化为 git 仓库（默认分支 main）。')
      else {
        const init2 = await gitRun({ args: ['init'], cwd: dir })
        if (init2.exitCode === 0) {
          await gitRun({ args: ['symbolic-ref', 'HEAD', 'refs/heads/main'], cwd: dir })
          lines.push('✅ 已把当前目录初始化为 git 仓库（默认分支 main）。')
        } else { ok = false; lines.push('❌ 初始化失败：' + cap(init2.stderr, 300)) }
      }
    }
  }
  if (opts.remote) {
    if (!REMOTE_RE.test(opts.remote)) {
      ok = false
      lines.push('❌ 这个地址看起来不像仓库地址（应以 https:// 或 git@ 开头）。请重新复制克隆链接。')
    } else {
      const rem = await gitRun({ args: ['remote', 'get-url', 'origin'], cwd: dir })
      if (rem.exitCode === 0) lines.push('ℹ️ 已经绑定过远程地址：' + rem.stdout.trim() + '（保持不变）。')
      else {
        const add = await gitRun({ args: ['remote', 'add', 'origin', opts.remote], cwd: dir })
        if (add.exitCode === 0) lines.push('✅ 已绑定远程仓库地址：' + opts.remote)
        else { ok = false; lines.push('❌ 绑定远程地址失败：' + cap(add.stderr, 300)) }
      }
    }
  }
  if (!opts.name && !opts.email && !opts.init && !opts.remote) {
    out('ℹ️ 这次没有做任何修改。可用参数：\n  --name 张三\n  --email zhangsan@example.com\n  --init（初始化仓库）\n  --remote https://github.com/xxx/yyy.git', 1)
  }
  lines.push('', '✅ 配置完成！要拉代码用 easy-git pull，要保存修改用 easy-git commit。')
  out(lines.join('\n'), ok ? 0 : 1)
}

async function cmdCommit(dir, opts) {
  const f = await collectFacts(dir)
  const g = guardEnv(f)
  if (g) out(g.text, 1)
  if (f.conflicts.length) out('⚠️ 还有 ' + f.conflicts.length + ' 个文件冲突没解决，先解决冲突才能提交。\n' + f.conflicts.map((c) => '   • ' + c).join('\n') + '\n\n请用 easy-git conflict 解决。', 1)
  if (!f.changes.length && !f.merging) out('ℹ️ 现在没有需要提交的修改。', 0)
  let message = opts.m
  if (!message) {
    const lines = []
    if (f.changes.length) {
      lines.push('✏️ 本次将提交 ' + f.changes.length + ' 个文件：')
      for (const c of f.changes.slice(0, 50)) lines.push('   • ' + friendlyChange(c))
      if (f.changes.length > 50) lines.push('   …还有 ' + (f.changes.length - 50) + ' 个')
    }
    if (f.merging) lines.push('⚠️ 当前正在合并中：即使清单是空的，也需要一个提交来正式完成合并。')
    lines.push('')
    console.log(lines.join('\n'))
    message = await ask('请用一句话说明改了什么（例如：修复了登录按钮点不动的问题）：')
    if (!message) out('没有提交说明，已取消。', 1)
  }
  if (f.changes.length) {
    const add = await gitRun({ args: ['add', '-A'], cwd: dir })
    if (add.exitCode !== 0) out('❌ 暂存修改失败：' + cap(add.stderr, 500), 1)
  }
  const commit = await gitRun({ args: ['commit', '-F', '-'], stdin: message + '\n', cwd: dir })
  if (commit.exitCode === 0) {
    const stat = await gitRun({ args: ['log', '-1', '--stat', '--oneline'], cwd: dir })
    out('✅ 提交成功！\n\n提交说明：' + message + '\n\n' + cap(stat.stdout, 1500) + '\n\n下一步：上传到远程用 easy-git push。')
  }
  if (/Please tell me who you are|user\.name|user\.email/i.test((commit.stderr || '') + (commit.stdout || ''))) {
    out('❌ 提交失败：你还没设置自己的名字和邮箱。\n\n用 easy-git setup --name 张三 --email zhangsan@example.com 设置，然后重新提交。', 1)
  }
  out('❌ 提交失败：\n【技术报错，助手自己看，不用给用户看】\n' + cap((commit.stderr || '') + (commit.stdout || ''), 800), 1)
}

async function cmdPush(dir) {
  const f = await collectFacts(dir)
  const g = guardEnv(f)
  if (g) out(g.text, 1)
  if (!f.hasCommits) out('ℹ️ 你还没有提交过任何代码，所以没有东西可以推送。\n\n先 easy-git commit 保存第一个“快照”，再推送。', 1)
  if (f.conflicts.length) out('⚠️ 还有 ' + f.conflicts.length + ' 个文件冲突没解决，先解决冲突再推送。', 1)
  if (f.merging) out('⚠️ 当前正在合并中（还没完成）。先 easy-git commit 完成合并，再推送。', 1)
  if (!f.remotes.length) out('❌ 还没绑定远程仓库地址。\n\n用 easy-git setup --remote <克隆链接> 绑定，或先 easy-git pull 从远程拉一个项目。', 1)
  const pushArgs = f.hasUpstream ? ['push'] : ['push', '-u', 'origin', 'HEAD']
  const r = await gitRun({ args: pushArgs, cwd: dir, timeoutMs: 600000 })
  const text = (r.stdout || '') + (r.stderr || '')
  if (r.exitCode === 0) out('✅ 推送成功！你的代码已经上传到远程仓库。\n\n' + cap(text, 600))
  if (r.timedOut) out('⏱️ 推送超时，可能是网络慢或需要登录。稍后再试。', 1)
  if (/rejected|non-fast-forward|fetch first|have diverged/i.test(text)) {
    out('⚠️ 推送被拒绝了：远程仓库有别人新提交的代码。\n\n先 easy-git pull 把别人的代码合并进来，再重新推送。', 1)
  }
  if (/Authentication failed|could not read Username|could not read Password|access denied|403|401|Invalid username or password/i.test(text)) {
    const plat = PLATFORM_INFO[await readPlatform()] || null
    out('❌ 登录/权限验证没通过。\n\n用 HTTPS 方式：' + (plat ? '去' + plat.name + '生成“个人访问令牌”（' + plat.tokenHint + '），推送时用户名填账号、密码填令牌' : '在对应平台生成“个人访问令牌”，推送时用户名填账号、密码填令牌') + '；\n也可以配置 SSH 密钥。', 1)
  }
  out('❌ 推送失败：\n【技术报错，助手自己看，不用给用户看】\n' + cap(text, 1000), 1)
}

async function cmdPull(dir, opts) {
  const f = await collectFacts(dir)
  const g = guardEnv(f, false)
  if (g) out(g.text, 1)
  if (!f.isRepo) {
    if (!opts.remote) out('ℹ️ 当前目录还不是 git 仓库，需要仓库地址才能把代码拉下来。\n\n用法：easy-git pull --remote <克隆链接>', 1)
    if (!REMOTE_RE.test(opts.remote)) out('❌ 这个地址看起来不像仓库地址（应以 https:// 或 git@ 开头）。', 1)
    const r = await gitRun({ args: ['clone', opts.remote], cwd: dir, timeoutMs: 600000 })
    if (r.exitCode === 0) out('✅ 克隆成功！代码已经下载到本地。\n\n以后改完代码用 easy-git commit，上传用 easy-git push。')
    out('❌ 克隆失败。\n' + (r.timedOut ? '超时了，可能是网络太慢，稍后再试。' : '常见原因：地址写错 / 项目私有需要访问令牌（生成位置：' + ((PLATFORM_INFO[await readPlatform()] || PLATFORM_INFO.other).tokenHint) + '）') + '\n【技术报错，助手自己看，不用给用户看】\n' + cap((r.stderr || '') + (r.stdout || ''), 800), 1)
  }
  if (f.conflicts.length) out('⚠️ 当前有 ' + f.conflicts.length + ' 个文件还没解决冲突，先解决冲突再拉取。', 1)
  if (f.merging) out('⚠️ 当前正在合并中（还没完成）。先 easy-git commit 完成合并，再拉取。', 1)
  if (!f.remotes.length) out('❌ 当前仓库还没绑定远程地址。\n\n用 easy-git setup --remote <克隆链接> 绑定后再拉取。', 1)
  if (!f.hasUpstream && !opts.branch) {
    out('ℹ️ 当前分支（' + f.branch + '）还没和远程建立连接。\n\n先 easy-git push 一次建立连接，或用 easy-git pull --branch <远程分支名> 指定。', 1)
  }
  const pullArgs = ['pull', '--no-rebase']
  if (opts.branch) pullArgs.push('origin', opts.branch)
  const r = await gitRun({ args: pullArgs, cwd: dir, timeoutMs: 600000 })
  const text = (r.stdout || '') + (r.stderr || '')
  if (r.exitCode === 0) out('✅ 拉取完成！你已经拿到了别人最新提交的代码。\n\n' + cap(text, 600))
  if (/CONFLICT|Automatic merge failed|conflict/i.test(text)) {
    out('⚠️ 拉取时出现了冲突：你和别人的修改撞在了一起。\n\n别担心，这很正常。用 easy-git conflict，一步步选择怎么处理。', 1)
  }
  if (/local changes would be overwritten|Your local changes would be overwritten/i.test(text)) {
    out('⚠️ 拉取失败：你本地还有没保存（提交）的修改。\n\n先 easy-git commit 保存，再重新拉取。', 1)
  }
  if (r.timedOut) out('⏱️ 拉取超时了，可能是网络慢或需要登录。稍后再试。', 1)
  out('❌ 拉取失败：\n【技术报错，助手自己看，不用给用户看】\n' + cap(text, 1000), 1)
}

async function cmdConflict(dir, args) {
  const f = await collectFacts(dir)
  const g = guardEnv(f)
  if (g) out(g.text, 1)
  const action = args[0] || 'list'
  const file = args[1]
  if (!f.conflicts.length) out('🎉 目前没有冲突，一切正常！')
  if (action === 'list') {
    const lines = ['⚠️ 有 ' + f.conflicts.length + ' 个文件发生了冲突：']
    for (const c of f.conflicts) lines.push('   • ' + c)
    lines.push('', '什么是冲突：你和同事都改了同一个文件的同一个地方，git 不知道该保留哪个。', '',
      '几种选择（easy-git conflict <选项>）：',
      '  mine       ① 保留我的版本',
      '  theirs     ② 保留对方的版本（适合锁文件、构建产物）',
      '  show <文件> ③ 查看冲突内容',
      '  manual     我手动改好了，标记为已解决')
    out(lines.join('\n'))
  }
  if (action === 'show') {
    const target = file || f.conflicts[0]
    const d = await gitRun({ args: ['diff', '--', target], cwd: dir })
    if (d.exitCode === 0 && d.stdout.trim()) {
      out('文件 ' + target + ' 的冲突内容（<<<<<<< 我的版本 ======= 对方版本 >>>>>>>）：\n' + cap(d.stdout, 6000))
    }
    try {
      const content = readFileSync(resolve(dir, target), 'utf8')
      out('文件 ' + target + ' 的内容（含 <<<<<<< 标记部分）：\n' + cap(content, 6000))
    } catch (e) {
      out('无法读取 ' + target + '：' + ((e && e.message) || String(e)), 1)
    }
  }
  const manual = action === 'manual'
  const ours = action === 'mine'
  const theirs = action === 'theirs'
  if (manual || ours || theirs) {
    const files = file ? [file] : f.conflicts
    const lines = []
    let ok = true
    for (const fl of files) {
      const co = manual ? { exitCode: 0 } : await gitRun({ args: ['checkout', ours ? '--ours' : '--theirs', '--', fl], cwd: dir })
      const add = await gitRun({ args: ['add', '--', fl], cwd: dir })
      if (co.exitCode === 0 && add.exitCode === 0) {
        lines.push('✅ ' + fl + (manual ? ' 已标记为已解决（保留你手动改好的内容）' : (ours ? ' 已保留你的版本' : ' 已保留对方的版本')))
      } else {
        ok = false
        lines.push('❌ ' + fl + ' 处理失败：' + cap((co.stderr || '') + (add.stderr || ''), 300))
      }
    }
    const f2 = await collectFacts(dir)
    if (ok && !f2.conflicts.length) lines.push('', '🎉 所有冲突都解决好了！现在可以 easy-git commit 完成合并。')
    else if (ok) lines.push('', '还有 ' + f2.conflicts.length + ' 个文件冲突没处理。')
    out(lines.join('\n'), ok ? 0 : 1)
  }
  out('未知的操作：' + action + '（可选 list / mine / theirs / show / manual）', 1)
}

async function cmdLog(dir, opts) {
  const f = await collectFacts(dir)
  const g = guardEnv(f)
  if (g) out(g.text, 1)
  if (!f.hasCommits) out('📜 这个仓库还没有任何提交。先 easy-git commit 一次，就有了第一条历史。')
  const n = Math.max(1, Math.min(parseInt(opts.n, 10) || 10, 50))
  const log = await gitRun({ args: ['log', '-n', String(n), '--pretty=format:%h%x1f%ad%x1f%an%x1f%s', '--date=format:%Y-%m-%d %H:%M'], cwd: dir })
  if (log.exitCode !== 0) out('❌ 查看历史失败：\n' + cap(log.stderr, 500), 1)
  const lines = []
  for (const line of clean(log.stdout)) {
    const p = line.split('\x1f')
    if (p.length >= 4) lines.push('• ' + p[1] + '　' + p[3] + '（' + p[2] + '）')
    else lines.push('• ' + line)
  }
  out('📜 最近 ' + lines.length + ' 次提交（最上面是最新）：\n\n' + lines.join('\n') + '\n\n想看某次改了哪些文件，用 easy-git log 后告诉我提交号，或直接 git show。')
}

async function cmdUndo(dir, opts) {
  const f = await collectFacts(dir)
  const g = guardEnv(f)
  if (g) out(g.text, 1)
  if (f.merging) out('⚠️ 当前正在合并中，不能撤销。先 easy-git commit 完成合并。', 1)
  if (!f.hasCommits) out('ℹ️ 还没有任何提交可以撤销。')
  const cnt = await gitRun({ args: ['rev-list', '--count', 'HEAD'], cwd: dir })
  const total = cnt.exitCode === 0 ? parseInt(cnt.stdout.trim(), 10) : 0
  if (total <= 1) out('ℹ️ 这是你的第一个提交，没有更早的可以撤销。', 1)
  if (!opts.confirm) {
    let text = '⚠️ 撤销上一次提交 = 把最近这张“快照”撤掉，你改的代码一个都不会丢（回到提交前状态）。'
    if (f.hasUpstream) text += '\n\n⚠️ 你的仓库连着远程：如果上次提交已推送，撤销后本地会落后远程，不建议。'
    text += '\n\n确认要撤销吗？加 --confirm 执行，例如：easy-git undo --confirm'
    out(text, 1)
  }
  const r = await gitRun({ args: ['reset', '--soft', 'HEAD~1'], cwd: dir })
  if (r.exitCode !== 0) out('❌ 撤销失败：\n' + cap(r.stderr, 500), 1)
  const last = await gitRun({ args: ['log', '-1', '--pretty=format:%s'], cwd: dir })
  out('✅ 已撤销上一次提交（“' + (last.exitCode === 0 ? last.stdout.trim() : '') + '”）。\n\n代码改动都还在，改好后再 easy-git commit。')
}

async function cmdBranch(dir, args) {
  const f = await collectFacts(dir)
  const g = guardEnv(f)
  if (g) out(g.text, 1)
  if (f.merging || f.conflicts.length) out('⚠️ 当前有冲突或合并还没完成，先处理完再动分支。', 1)
  const action = args[0] || 'list'
  const name = args[1]
  if (action === 'list') {
    const br = await gitRun({ args: ['branch', '-a'], cwd: dir })
    const lines = ['🌿 当前分支：' + f.branch, '', '分支 = 代码的平行线，在一条线上改，不影响主代码（main）。', '']
    if (br.exitCode === 0 && br.stdout.trim()) {
      lines.push('所有分支（带 * 的是你现在的）：')
      for (const l of br.stdout.split(/\r?\n/)) { const t = l.trim(); if (t) lines.push('  ' + t) }
    } else lines.push('（目前只有 main 一个分支）')
    lines.push('', 'easy-git branch create <名字>  新建并切换', 'easy-git branch switch <名字>  切换', 'easy-git branch merge <名字>   把另一个分支合并进来')
    out(lines.join('\n'))
  }
  if (!name) out('需要提供分支名：easy-git branch ' + action + ' <分支名>', 1)
  if (action === 'create') {
    const chk = await gitRun({ args: ['checkout', '-b', name], cwd: dir })
    if (chk.exitCode === 0) out('✅ 已新建分支“' + name + '”并切过去了（从当前代码出发）。\n\n随便改，不影响 main。改完 easy-git commit、push，之后可 merge 回 main。')
    if (/already exists/i.test(chk.stderr)) out('❌ 叫“' + name + '”的分支已经存在了。', 1)
    out('❌ 新建分支失败：\n' + cap(chk.stderr, 500), 1)
  }
  if (action === 'switch') {
    const chk = await gitRun({ args: ['checkout', name], cwd: dir })
    if (chk.exitCode === 0) out('✅ 已切换到分支“' + name + '”。')
    if (/local changes|overwritten|overwrite/i.test(chk.stderr)) out('⚠️ 你还有没提交的修改，先 easy-git commit 再切换。', 1)
    out('❌ 找不到叫“' + name + '”的分支。可以 easy-git branch create ' + name + '。', 1)
  }
  if (action === 'merge') {
    const mg = await gitRun({ args: ['merge', '--no-edit', name], cwd: dir, timeoutMs: 120000 })
    const text = (mg.stdout || '') + (mg.stderr || '')
    if (mg.exitCode === 0) out('✅ 已把“' + name + '”的改动合并进当前分支（' + f.branch + '）。\n\n' + cap(text, 500))
    if (/CONFLICT|Automatic merge failed|conflict/i.test(text)) out('⚠️ 合并时出现了冲突。别担心，这很正常。用 easy-git conflict 一步步选。', 1)
    out('❌ 合并失败：\n' + cap(text, 800), 1)
  }
  out('未知操作：' + action + '（可选 list / create / switch / merge）', 1)
}

const clean = (s) => String(s == null ? '' : s).split(/\r?\n/).map((x) => x.trim()).filter(Boolean)

// ---------- 主入口 ----------
async function main() {
  const argv = process.argv.slice(2)
  if (!argv.length || argv[0] === 'help' || argv[0] === '-h' || argv[0] === '--help') { usage(); return }
  if (argv[0] === '--version' || argv[0] === '-v') { console.log('easy-git v' + VERSION); return }
  const cmd = argv.shift()
  const { opts, positional } = parse(argv)
  const dir = positional[0] || process.cwd()
  try {
    switch (cmd) {
      case 'status': return await cmdStatus(dir)
      case 'start': return await cmdStart(dir)
      case 'platform': return await cmdPlatform(positional[0])
      case 'setup': return await cmdSetup(dir, opts)
      case 'commit': return await cmdCommit(dir, opts)
      case 'push': return await cmdPush(dir)
      case 'pull': return await cmdPull(dir, opts)
      case 'conflict': return await cmdConflict(dir, positional.slice(1))
      case 'log': return await cmdLog(dir, opts)
      case 'undo': return await cmdUndo(dir, opts)
      case 'branch': return await cmdBranch(dir, positional.slice(1))
      default: usage(); console.log('\n未知命令：' + cmd); process.exit(1)
    }
  } catch (err) {
    console.error('执行出错：' + ((err && err.message) || String(err)))
    process.exit(2)
  }
}

main()
