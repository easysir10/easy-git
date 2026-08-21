<div align="center">

# 🧑‍💻 easy-git

**Beginner-Friendly Git Assistant** — zero command line, plain-language guidance for everything Git

[![version](https://img.shields.io/badge/version-0.3.1-blue)]()
[![license](https://img.shields.io/badge/license-MIT-green)]()
[![platform](https://img.shields.io/badge/platform-DSH-orange)]()
[![beginner](https://img.shields.io/badge/beginner--friendly-ff69b4)]()
[![docs](https://img.shields.io/badge/docs-English%20%7C%20%E4%B8%AD%E6%96%87-lightgrey)]()

🌐 [English](README.en.md) · [简体中文](README.md) ｜ 📖 [Demo](DEMO.en.md) ｜ 🧩 [Universal Skill](skills/README.md)

</div>

---

## ✨ What is this

> [!TIP]
> **You don't need a single command-line command** — hand all Git operations to the assistant and talk in plain language.

- 🧩 A **standard DSH plugin** (Cordis plugin package) that wraps Git into a beginner-friendly assistant
- 🌍 Works with **GitLab / GitHub / Gitee** — any Git hosting platform
- 📦 The same logic also ships as a **universal Skill** for Claude Code, Cursor, and other agents

### 🎯 Highlights

- 🧭 **First-run onboarding**: pick a platform → set identity → init/clone, step by step
- 🛡️ **Safety rails**: commit/push blocked while conflicts are unresolved; merges in progress are auto-detected; technical errors never shown to you
- 🌐 **Platform-tailored**: GitHub / GitLab / Gitee each get their own repo-creation, clone-URL and token steps
- ✂️ **No paths, no commands**: you never type a folder path; jargon is always explained

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

## 🚀 Quick start (DSH)

### 🤖 One-sentence install (recommended: let an agent do it)

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

## 📚 Documentation

| Doc | What it is |
| --- | --- |
| [DEMO.en.md](DEMO.en.md) | English demo: the complete guided flow |
| [DEMO.md](DEMO.md) | 中文演示：小白全流程对话剧本 |
| [skills/README.md](skills/README.md) | Universal Skill: install into Claude Code / Cursor / Codex, etc. |
| [skills/easy-git/SKILL.md](skills/easy-git/SKILL.md) | The Skill itself (framework-agnostic, works with any agent) |

## 🛠️ Run from source / develop

```bash
git clone https://github.com/easysir10/easy-git.git
cd easy-git
npm install   # or pnpm install (resolves peerDependencies)
```

`lib/index.js` is the plugin itself: an ESM module exporting the standard Cordis plugin `{ name, inject, apply }`,
registering the eleven tools via `ctx.tools.register(defineTool(...))`.

## ⚙️ Implementation highlights

- **Spawns `git.exe` directly** (`ctx.subprocess`) — no shell involved, so no quoting/escaping problems; the Git path resolves via PATH → common install locations
- **Built-in timeouts & cancellation** (`ctx.timer` + `terminate()` + `exec.signal`)
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
