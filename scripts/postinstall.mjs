// postinstall 生命周期脚本：npm install -g 完成时直接弹出"选择 agent"菜单
// 交互终端 → 显示菜单（选择并自动安装）；非交互环境（CI / pnpm 等）→ 打印提示，跳过。
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

console.log('')
console.log('🧑‍💻 easy-git 安装完成！现在选择要安装到哪些 agent：')
console.log('')

if (process.stdin.isTTY) {
  const res = spawnSync(process.execPath, [resolve(pkgRoot, 'bin', 'easy-git.mjs'), 'install'], { stdio: 'inherit' })
  if (res.status !== 0) {
    console.log('')
    console.log('（选择未完成。之后随时运行 easy-git install，或首次运行 easy-git 重新选择。）')
  }
} else {
  console.log('（当前不是交互终端，跳过选择菜单。')
  console.log('  稍后运行 easy-git install 选择要装的 agent，或直接 easy-git status 开始使用。）')
  console.log('')
}
