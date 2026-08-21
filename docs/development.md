# 开发指南（Development）

> 给想改这个项目的人：结构、约定、本地运行、测试、发布。

## 一、项目结构

```
easy-git/
├── lib/index.js              DSH 插件本体（Cordis 插件，11 个工具，注册到 ctx.tools）
├── src/core.js               CLI 核心：git 执行 / 体检 / 平台（无框架依赖）
├── bin/easy-git.mjs          CLI 入口（零依赖：11 个命令 + install 交互式安装器）
├── skills/
│   ├── easy-git/SKILL.md            通用 Skill（任何 agent 的新手 git 向导）
│   └── easy-git-install/SKILL.md    安装 Skill（让 agent 自动安装）
├── codex/easy-git.md         Codex 斜杠命令模板（/easy-git + 描述）
├── AGENTS.md                 通用 agent 引导（easy-git install 也会生成）
├── install.ps1 / install.sh  一键安装脚本
├── docs/
│   ├── demo-zh.md / demo-en.md     演示文档（对话剧本）
│   ├── development.md              本文档
│   └── codex-usage.md              Codex 使用指南（斜杠命令）
├── CHANGELOG.md              更新日志
└── README.md / README.en.md  入口与导航
```

**三种形态的关系**：同一套逻辑，三种入口——

| 形态 | 载体 | 适用 |
| --- | --- | --- |
| DSH 插件 | `lib/index.js` | DSH 内使用（工具方式） |
| 通用 Skill | `skills/easy-git/SKILL.md` | Claude Code / Cursor 等其他 agent |
| CLI | `bin/easy-git.mjs` + `src/core.js` | 任何 agent 的"执行命令" + 人类终端 |

理想演进：`lib/index.js` 最终复用 `src/core.js`（当前为控制风险保持独立，见"已知事项"）。

## 二、本地运行

```bash
git clone https://github.com/easysir10/easy-git.git
cd easy-git
npm install    # 或 pnpm install（解析 peerDependencies）

# 插件冒烟测试（用 node_modules 链接解析 @deepseek-ai/dsh-tools）
node --input-type=module -e "
const reg = [];
const m = await import('./lib/index.js');
m.apply({ get(){return undefined}, tools:{ register(d){reg.push(d); return ()=>{}} }});
console.log('工具数:', reg.length);
"

# CLI 直接用
node bin/easy-git.mjs status .
node bin/easy-git.mjs commit -m "测试提交"
```

## 三、编码约定

1. **纯 JS / ESM**：不使用 TypeScript、JSX、import 之外的构建；`lib/index.js` 是 Cordis 插件（导出 `{ name, inject, apply }`）。
2. **中文注释与提示**：所有用户可见文案为中文大白话；**禁用"傻瓜式/小白"等词**，用"新手友好/新手"。
3. **编码**：源文件 UTF-8 **无 BOM**；**例外：`install.ps1` 必须 UTF-8 带 BOM**（Windows PowerShell 5.1 否则把中文读乱码导致解析失败）。
4. **命令行安全**：git 一律**直接 spawn**（不经 shell），提交说明走 stdin（`git commit -F -`），避免引号/转义问题。
5. **防呆规则**：冲突未解决禁止提交/拉取/推送；危险操作（撤销/强制）先确认；技术报错不外露。
6. **平台偏好**：存 `git config --global easygit.platform`（与插件/Skill/CLI 共用）。

## 四、测试要点

- 改插件后：跑上面的冒烟测试（确认工具注册数）。
- 改 CLI 后：在临时目录跑全流程（init → commit → log → undo → push 无远程提示）。
- 路径断言：`git status --short` 的"状态码+空格+路径"**不能 trim 行首空格**，否则路径首字符被吞（踩过坑）。

## 五、发布流程

1. 改 `package.json` 的 `version`（`0.x.0` 加功能，`0.x.y` 修问题）。
2. 更新 `CHANGELOG.md` 顶部加条目。
3. 同步文档：README（含版本徽章）、DEMO 里的版本号。
4. 提交并推送（`git push`）。
5. 让用户更新：说"更新插件" → `dsh plugin --profile web update @easysir10/easy-git` → 重启 dsh。

## 六、已知事项

- `lib/index.js` 与 `src/core.js` 逻辑同源但暂未合并（避免影响运行中的插件）；后续可抽取共享核心。
- CLI 的 `gitRun` 超时用 `child.kill()` 终止直接子进程（git 派生的 ssh 等辅助进程可能残留，可接受）。
- 插件内置提示语目前为中文（英文提示语规划中；文档已双语）。
