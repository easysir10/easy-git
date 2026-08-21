/**
 * easy-git 核心操作（CLI 与插件共用逻辑，无框架依赖）
 * ====================================================
 * 用 Node 自带 child_process 直接 spawn git，不经过任何 shell。
 * 所有输出均为中文大白话，把用户当成第一次接触 git 的新手。
 */
import { spawn } from 'node:child_process'
import { accessSync } from 'node:fs'

// ---------- 平台信息 ----------
export const PLATFORM_INFO = {
  github: { name: 'GitHub', newRepo: '右上角 + → New repository（不要勾选自动生成 README）', cloneHint: '点 Code 按钮复制 HTTPS 链接', tokenHint: 'Settings → Developer settings → Personal access tokens（勾选 repo 权限）' },
  gitlab: { name: 'GitLab', newRepo: 'New project → Create blank project', cloneHint: '点 Clone 按钮复制 HTTPS 链接', tokenHint: 'Settings → Access tokens（勾选 write_repository）' },
  gitee: { name: 'Gitee', newRepo: '右上角 + → 新建仓库', cloneHint: '点“克隆/下载”复制 HTTPS 链接', tokenHint: '设置 → 私人令牌（勾选 projects 权限）' },
  other: { name: '代码托管平台', newRepo: '在平台里新建一个空仓库（不要勾选自动生成 README）', cloneHint: '点 Clone/克隆 按钮复制 HTTPS 链接', tokenHint: '在平台设置里生成“个人访问令牌”（勾选仓库读写权限）' },
}

// ---------- 文本工具 ----------
export const cap = (s, n) => {
  const str = String(s == null ? '' : s)
  return str.length <= n ? str : str.slice(0, n) + '\n…（内容太长，已截断）'
}

export const cleanLines = (s) => String(s == null ? '' : s).split(/\r?\n/).map((x) => x.trim()).filter(Boolean)

// ---------- 找到 git 可执行文件 ----------
let cachedGitPath = ''
export async function resolveGit() {
  if (cachedGitPath) return cachedGitPath
  const candidates = [
    'git',
    'C:\\Program Files\\Git\\cmd\\git.exe',
    'C:\\Program Files\\Git\\bin\\git.exe',
    'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
    '/usr/bin/git',
    '/usr/local/bin/git',
  ]
  for (const c of candidates) {
    const isPath = c.includes('\\') || c.includes('/')
    try {
      if (isPath) accessSync(c)
      cachedGitPath = c
      return c
    } catch (e) { /* 继续试下一个 */ }
  }
  return ''
}

// ---------- 执行 git 命令（直接 spawn，无 shell，无转义问题） ----------
export async function gitRun({ args = [], cwd = process.cwd(), stdin, timeoutMs = 0, stdoutMax = 400000 }) {
  const git = await resolveGit()
  if (!git) {
    return { exitCode: -1, stdout: '', stderr: '这台电脑上没找到 git，请先安装 https://git-scm.com/downloads 后再试。', timedOut: false }
  }
  const fullArgs = ['-c', 'color.ui=false', '-c', 'core.quotepath=false', ...args.map(String)]
  return new Promise((resolve) => {
    let child
    try {
      child = spawn(git, fullArgs, { cwd, stdio: ['pipe', 'pipe', 'pipe'] })
    } catch (err) {
      return resolve({ exitCode: -2, stdout: '', stderr: '启动 git 失败：' + (err && err.message || String(err)), timedOut: false })
    }
    let out = ''
    let err = ''
    let timedOut = false
    const timer = timeoutMs > 0 ? setTimeout(() => { timedOut = true; try { child.kill() } catch (e) { /* ignore */ } }, timeoutMs) : null
    child.stdout.on('data', (d) => { out += d; if (out.length > stdoutMax) out = out.slice(-stdoutMax) })
    child.stderr.on('data', (d) => { err += d; if (err.length > 300000) err = err.slice(-300000) })
    child.on('error', (e) => { if (timer) clearTimeout(timer); resolve({ exitCode: -2, stdout: out, stderr: '启动 git 失败：' + e.message, timedOut }) })
    child.on('close', (code) => { if (timer) clearTimeout(timer); resolve({ exitCode: code, stdout: out, stderr: err, timedOut }) })
    if (stdin != null) {
      child.stdin.on('error', () => {})
      child.stdin.write(stdin)
      child.stdin.end()
    } else {
      child.stdin.end()
    }
  })
}

// ---------- 平台偏好（存在 git 全局配置 easygit.platform） ----------
export async function readPlatform() {
  const r = await gitRun({ args: ['config', '--global', '--get', 'easygit.platform'] })
  const v = r.exitCode === 0 ? r.stdout.trim().toLowerCase() : ''
  return PLATFORM_INFO[v] ? v : ''
}

export async function savePlatform(value) {
  const r = await gitRun({ args: ['config', '--global', 'easygit.platform', value] })
  return r.exitCode === 0
}

export function inferPlatformFromRemote(remoteLine) {
  if (!remoteLine) return ''
  const m = /(?:https?:\/\/|git@)([^\/:]+)/.exec(remoteLine)
  const host = m ? m[1].toLowerCase() : ''
  if (host.includes('github')) return 'github'
  if (host.includes('gitlab')) return 'gitlab'
  if (host.includes('gitee')) return 'gitee'
  return host ? 'other' : ''
}

// ---------- 一次体检：收集仓库关键事实 ----------
export async function collectFacts(cwd) {
  const f = {
    gitInstalled: false, gitVersion: '', isRepo: false, branch: '',
    userName: '', userEmail: '', ahead: 0, behind: 0,
    changes: [], conflicts: [], remotes: [], merging: false,
    hasCommits: false, hasUpstream: false, hasGitignore: false,
  }
  const ver = await gitRun({ args: ['--version'], cwd })
  if (ver.exitCode !== 0) return f
  f.gitInstalled = true
  const vm = /git version (\d+)\.(\d+)\.(\d+)/.exec(ver.stdout.trim())
  f.gitVersion = vm ? vm[1] + '.' + vm[2] + '.' + vm[3] : '?'
  const inside = await gitRun({ args: ['rev-parse', '--is-inside-work-tree'], cwd })
  if (inside.exitCode !== 0 || inside.stdout.trim() !== 'true') return f
  f.isRepo = true
  const branch = await gitRun({ args: ['symbolic-ref', '--short', '-q', 'HEAD'], cwd })
  f.branch = branch.exitCode === 0 && branch.stdout.trim() ? branch.stdout.trim() : '（游离状态，不在任何分支上）'
  const name = await gitRun({ args: ['config', '--get', 'user.name'], cwd })
  const email = await gitRun({ args: ['config', '--get', 'user.email'], cwd })
  f.userName = name.exitCode === 0 ? name.stdout.trim() : ''
  f.userEmail = email.exitCode === 0 ? email.stdout.trim() : ''
  const st = await gitRun({ args: ['status', '--short', '--branch'], cwd })
  const lines = cleanLines(st.stdout)
  const head = lines.shift() || ''
  const ab = /\[ahead (\d+)(?:, behind (\d+))?\]/.exec(head)
  if (ab) { f.ahead = +ab[1]; f.behind = ab[2] ? +ab[2] : 0 }
  f.changes = lines
  const unmerged = await gitRun({ args: ['diff', '--name-only', '--diff-filter=U', '--relative'], cwd })
  f.conflicts = unmerged.exitCode === 0 ? cleanLines(unmerged.stdout) : []
  const remote = await gitRun({ args: ['remote', '-v'], cwd })
  f.remotes = remote.exitCode === 0 ? cleanLines(remote.stdout) : []
  const mh = await gitRun({ args: ['rev-parse', '-q', '--verify', 'MERGE_HEAD'], cwd })
  f.merging = mh.exitCode === 0
  if (!f.merging) {
    const cp = await gitRun({ args: ['rev-parse', '-q', '--verify', 'CHERRY_PICK_HEAD'], cwd })
    f.merging = cp.exitCode === 0
  }
  if (!f.merging) {
    const rb = await gitRun({ args: ['rev-parse', '-q', '--verify', 'REBASE_HEAD'], cwd })
    f.merging = rb.exitCode === 0
  }
  const hd = await gitRun({ args: ['rev-parse', '-q', '--verify', 'HEAD'], cwd })
  f.hasCommits = hd.exitCode === 0
  const up = await gitRun({ args: ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], cwd })
  f.hasUpstream = up.exitCode === 0
  const gi = await gitRun({ args: ['check-ignore', '.gitignore'], cwd })
  f.hasGitignore = gi.exitCode === 0 || f.changes.some((c) => c.includes('.gitignore'))
  return f
}

// ---------- 常用守卫 ----------
export const GIT_MISSING = '❌ 这台电脑上还没安装 git。先安装：https://git-scm.com/downloads（一路“下一步”即可），装好后再试。'

export function guardEnv(f, needRepo = true) {
  if (!f.gitInstalled) return { ok: false, text: GIT_MISSING }
  if (needRepo && !f.isRepo) return { ok: false, text: '当前文件夹还不是 git 仓库，先初始化或拉取再说。' }
  return null
}

// ---------- 友好展示 ----------
export function friendlyChange(line) {
  const code = String(line).slice(0, 2)
  const rest = String(line).slice(3)
  if (/^\?\?/.test(code)) return '🆕 新增（还没加入 git）  ' + rest
  if (/^A/.test(code)) return '🆕 新增  ' + rest
  if (/^D/.test(code)) return '🗑️ 删除  ' + rest
  if (/^R/.test(code)) return '🔀 重命名  ' + rest
  if (/^U/.test(code)) return '⚠️ 冲突  ' + rest
  return '✏️ 修改  ' + rest
}

// ---------- 体检报告 ----------
export function statusReport(f, cwdName) {
  const out = []
  out.push('📋 你当前 git 的情况（体检报告）：')
  out.push('')
  out.push('• 检查目录：' + cwdName)
  if (!f.gitInstalled) {
    out.push('❌ 这台电脑上还没安装 git。')
    out.push('   怎么办：去 https://git-scm.com/downloads 下载安装（一路点“下一步”即可），装好后再看。')
    return out.join('\n')
  }
  if (!f.isRepo) {
    out.push('• 当前目录还不是一个 git 仓库。')
    out.push('')
    out.push('可以选：')
    out.push('1️⃣ 从 GitHub/GitLab 等平台拉一个现成的项目 → 用 easy-git pull 并提供仓库地址')
    out.push('2️⃣ 把当前文件夹变成仓库 → 用 easy-git setup --init')
    return out.join('\n')
  }
  out.push('• 当前分支：' + f.branch)
  out.push('• 你的名字（提交时显示的作者名）：' + (f.userName || '❌ 还没设置'))
  out.push('• 你的邮箱（提交时显示的联系方式）：' + (f.userEmail || '❌ 还没设置'))
  if (f.remotes.length) out.push('• 远程仓库：' + f.remotes[0])
  else out.push('• 远程仓库：❌ 还没设置（还没连上远程平台）')
  if (f.ahead || f.behind) {
    out.push('• 和远程对比：本地领先 ' + f.ahead + ' 个提交，落后 ' + f.behind + ' 个提交')
    if (f.ahead > 0) out.push('   （领先 = 你本地有还没上传的“快照”，说“推送”就能传上去）')
    if (f.behind > 0) out.push('   （落后 = 服务器上有别人新传的“快照”你还没下载，说“拉取”就能拿下来）')
  } else out.push('• 和远程对比：完全同步（本地和服务器上的代码一模一样）')
  out.push('')
  if (f.merging) {
    out.push('⚠️ 当前正处于“合并”进行中：另一个分支/别人的代码正在合并进来。')
    if (f.conflicts.length) out.push('   还有冲突没解决完，见下面的冲突清单。')
    else out.push('   冲突已经解决，还差最后一步“提交”来正式完成合并。')
    out.push('')
  }
  if (f.conflicts.length) {
    out.push('⚠️ 有 ' + f.conflicts.length + ' 个文件存在冲突，需要先解决：')
    for (const c of f.conflicts) out.push('   • ' + c)
    out.push('')
    out.push('下一步：用 easy-git conflict 解决冲突。')
  } else if (f.changes.length) {
    out.push('✏️ 有 ' + f.changes.length + ' 个文件被改过（还没提交）：')
    for (const c of f.changes.slice(0, 30)) out.push('   • ' + friendlyChange(c))
    if (f.changes.length > 30) out.push('   …还有 ' + (f.changes.length - 30) + ' 个')
    out.push('')
    out.push('下一步：要保存这些修改用 easy-git commit；要拉别人的代码用 easy-git pull。')
  } else if (!f.merging) {
    out.push('✏️ 当前没有任何未提交的修改。')
  }
  if (!f.userName || !f.userEmail) {
    out.push('')
    out.push('⚠️ 你的名字或邮箱还没设置，提交时会报错。用 easy-git setup --name 张三 --email zhangsan@example.com 设置。')
  }
  return out.join('\n')
}
