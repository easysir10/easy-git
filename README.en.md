<div align="center">

# 🧑‍💻 easy-git

**Beginner-Friendly Git Assistant** — zero command line, plain-language guidance for everything Git

[![version](https://img.shields.io/badge/version-0.4.0-blue)]()
[![license](https://img.shields.io/badge/license-MIT-green)]()
[![platform](https://img.shields.io/badge/platform-DSH-orange)]()
[![cli](https://img.shields.io/badge/CLI-zero--dep-brightgreen)]()
[![beginner](https://img.shields.io/badge/beginner--friendly-ff69b4)]()
[![docs](https://img.shields.io/badge/docs-English%20%7C%20%E4%B8%AD%E6%96%87-lightgrey)]()

🌐 [English](README.en.md) · [简体中文](README.md)

</div>

---

**One logic, three entry points**: DSH plugin (tools) · Universal Skill (other agents) · Zero-dependency CLI (any agent + humans in a terminal).

## ✨ What is this

> [!TIP]
> **You don't need a single command-line command** — hand all Git operations to the assistant and talk in plain language.

- 🧩 **DSH plugin**: standard Cordis plugin package registering 11 beginner-friendly tools
- 💻 **CLI**: zero-dependency, cross-platform — callable by any agent's "run command", or by humans in a terminal
- 🧩 **Universal Skill**: framework-agnostic guidance for Claude Code / Cursor / any agent
- 🌍 Works with **GitLab / GitHub / Gitee** — any Git hosting platform

## 🎯 Highlights

- 🧭 **First-run onboarding**: pick a platform → set identity → init/clone, step by step
- 🛡️ **Safety rails**: commit/push blocked while conflicts are unresolved; merges in progress are auto-detected; technical errors never shown to you
- 🌐 **Platform-tailored**: GitHub / GitLab / Gitee each get their own repo-creation, clone-URL and token steps
- ✂️ **No paths, no commands**: you never type a folder path; jargon is always explained

## 🚀 Quick start (DSH users)

### 🎯 Interactive installer (pick the agents, recommended)

Install the CLI first, then run the installer and pick from the menu (DSH plugin / Codex / Claude Code / Cursor / universal AGENTS.md):

```bash
npm install -g github:easysir10/easy-git
easy-git install        # interactive menu (multi-select, a = all)
easy-git install dsh,codex   # or specify directly
```

When it says "✅ installed", restart the relevant app as prompted.

### 🤖 One-sentence install (let an agent do it)

> Send this to your agent (DSH / Claude Code / Cursor …) and let it handle the rest:
>
> **"Install the easy-git plugin for me: run the install script from the https://github.com/easysir10/easy-git repo (install.ps1 on Windows, install.sh on macOS/Linux), then tell me how to restart."**

Or run the script yourself:

```powershell
# Windows: download and run the install script
Invoke-WebRequest -Uri https://raw.githubusercontent.com/easysir10/easy-git/main/install.ps1 -OutFile install.ps1
powershell -ExecutionPolicy Bypass -File install.ps1
```

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/easysir10/easy-git/main/install.sh -o install.sh && bash install.sh
```

The script handles everything: **install pnpm → install the plugin → register the startup list**. All you need afterward is to **restart dsh**.

### 📋 Manual install (to understand how it works)

> [!IMPORTANT]
> Install pnpm first (the downloader behind `dsh plugin`): `npm install -g pnpm`

```bash
# 1️⃣ Install the plugin into your profile
dsh plugin --profile web add github:easysir10/easy-git
```

```yaml
# 2️⃣ Enable it in the startup list: edit $DSH_HOME/profiles/web/cordis.patch.yml
- insert:
    - id: git-beginner-helper
      name: '@easysir10/easy-git'
```

> [!NOTE]
> **Restart dsh** after editing. Then just tell the assistant "commit / pull / push / resolve conflicts / check my git status".
> To update later, say "**update the plugin**" and the assistant runs `dsh plugin --profile web update @easysir10/easy-git` for you.

## 🗺️ First-use flow

1. Say "**check my git status**" — the assistant first asks you to pick a **platform** (GitHub / GitLab / Gitee / other);
2. Every later step (create repo, clone URL, access token) follows that platform;
3. If your repository already has a remote URL, the platform is **auto-detected** — no need to choose; switch anytime by saying "switch to GitLab";
4. If the guidance platform and the remote don't match, the health check **reminds you automatically** — one sentence to switch.

## 🧰 Provided tools (11)

| Tool | What it does |
| --- | --- |
| `git_beginner_start` | 🎯 "Get started with Git" onboarding: checks progress (platform → identity → repo) and tells you the next step |
| `git_beginner_platform` | 🌍 Picks the platform (GitHub / GitLab / Gitee / other); all guidance is then tailored to it |
| `git_beginner_status` | 🔍 Health check: Git installed?, branch, identity, changes, conflicts, merge-in-progress, remote, ahead/behind |
| `git_beginner_setup` | ⚙️ First-time setup: global name/email, default branch `main`, init a repo, bind a remote |
| `git_beginner_commit` | 📸 Commit: preview the list first → one-sentence summary → save a "snapshot" |
| `git_beginner_push` | ☁️ Push: upload to remote; rejected → pull first; auth failure → plain-language guidance |
| `git_beginner_pull` | ⬇️ Pull / clone: merge style — never rewrites your own commits |
| `git_beginner_conflict` | ⚔️ Conflict wizard: list conflicted files → choose (keep mine / keep theirs / manual) |
| `git_beginner_log` | 📜 Read commit history (time, author, message) |
| `git_beginner_undo` | ↩️ Undo the last commit while keeping your code (with confirmation) |
| `git_beginner_branch` | 🌿 Branch management: list / create / switch / merge |

## 💻 CLI (zero-dependency command line)

**No DSH required** — the same logic as the plugin (plain Chinese + safety rails), perfect for agents like Claude Code / Cursor to call via their "run command" ability, and for humans in a terminal:

```bash
# Run straight from the repo (zero deps, just needs node)
node bin/easy-git.mjs status          # health check
node bin/easy-git.mjs commit -m "msg" # commit
node bin/easy-git.mjs conflict        # resolve conflicts
node bin/easy-git.mjs log             # history
```

```bash
# Install globally, then use the easy-git command
npm install -g github:easysir10/easy-git
easy-git status
```

> Full command reference is at the top of [bin/easy-git.mjs](bin/easy-git.mjs); the universal Skill already prefers calling it.

## 🧩 Universal Skill (other agents)

Framework-agnostic beginner Git guidance, usable by any agent that can run commands (Claude Code / Cursor / Codex …):

- How to install: [skills/README.md](skills/README.md)
- The Skill itself: [skills/easy-git/SKILL.md](skills/easy-git/SKILL.md)
- Install Skill (let an agent install the plugin): [skills/easy-git-install/SKILL.md](skills/easy-git-install/SKILL.md)

## 📚 Documentation

| Doc | What it is |
| --- | --- |
| [README.md](README.md) | 简体中文版 |
| [docs/demo-en.md](docs/demo-en.md) | English demo: the complete guided flow |
| [docs/demo-zh.md](docs/demo-zh.md) | 中文演示：小白全流程对话剧本 |
| [docs/development.md](docs/development.md) | Development guide: structure / conventions / testing / release |
| [docs/codex-usage.md](docs/codex-usage.md) | Codex slash-command usage guide (/easy-git + description) |
| [CHANGELOG.md](CHANGELOG.md) | Changelog (0.1 → 0.4) |
| [skills/README.md](skills/README.md) | Universal Skill install guide |

## 🛠️ Run from source / develop

```bash
git clone https://github.com/easysir10/easy-git.git
cd easy-git
npm install   # or pnpm install (resolves peerDependencies)
```

`lib/index.js` is the plugin itself (ESM, standard Cordis plugin `{ name, inject, apply }`, 11 tools);
`src/core.js` + `bin/easy-git.mjs` are the CLI. Conventions and the release flow live in **[docs/development.md](docs/development.md)**.

## ⚙️ Implementation highlights

- **Spawns `git.exe` directly** (no shell involved) — no quoting/escaping problems; the Git path resolves via PATH → common install locations
- **Built-in timeouts & cancellation**; commit messages go through stdin (`git commit -F -`)
- **Safety rails**: commit/pull/push blocked while conflicts are unresolved; detects `MERGE_HEAD`/`CHERRY_PICK_HEAD`/`REBASE_HEAD`, so an in-progress merge can be finished with a commit
- **Plain Chinese prompts** that treat the user as a complete Git beginner

## ❓ FAQ

<details>
<summary>I can't use the command line. Is this for me?</summary>

Absolutely. You only need to talk, choose, paste links, and click website buttons.
</details>

<details>
<summary>What if I switch platforms?</summary>

Say "switch to GitHub" or "switch to GitLab" — done, instantly.
</details>

<details>
<summary>How do I update the plugin?</summary>

Say "update the plugin" and the assistant runs the update command; then restart dsh. See "Quick start" above.
</details>

## 📄 License

MIT
