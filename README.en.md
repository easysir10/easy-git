<div align="center">

# 🧑‍💻 easy-git

**Beginner-Friendly Git Assistant** — one install command, pick your agents, done

[![version](https://img.shields.io/badge/version-0.5.0-blue)]()
[![license](https://img.shields.io/badge/license-MIT-green)]()
[![beginner](https://img.shields.io/badge/beginner--friendly-ff69b4)]()
[![docs](https://img.shields.io/badge/docs-English%20%7C%20%E4%B8%AD%E6%96%87-lightgrey)]()

🌐 [English](README.en.md) · [简体中文](README.md)

</div>

---

**easy-git makes Git beginner-friendly**: you don't need a single command-line command; it works with GitLab / GitHub / Gitee — any Git hosting platform.
Installation is one command, and you pick which agents to install for (**including DSH**) from a menu.

## 🚀 Install (one command, done)

```bash
npm install -g github:easysir10/easy-git
```

**The moment the install finishes, a menu pops up automatically** — check the agents you want, and it installs them:

```
🧑‍💻 easy-git installed! Choose which agents to install for:
  1. DSH plugin (DeepSeek Harness)
  2. Codex (skill + /easy-git slash command)
  3. Claude Code (skill)
  4. Cursor (rules)
  5. AGENTS.md for the current project (universal)
Enter numbers (e.g. 1,3 or a): a    ← a = install everything
```

> [!NOTE]
> - In non-interactive environments (CI etc.) the menu is skipped: run `easy-git install` later, or **the first time you run `easy-git` it will show the menu**.
> - Re-pick anytime: `easy-git install`; install everything: `easy-git install all`.

## Where & how to use it

| You use | After install | Guide |
| --- | --- | --- |
| 🟦 **DSH** (DeepSeek Harness) | Tell the assistant "commit / pull / push / resolve conflicts / check my git status" | [install-dsh.md](docs/install-dsh.md) |
| 🟠 **Codex** | Type `/easy-git description` (skill also activates) | [use-skill.md](docs/use-skill.md) |
| 🟪 **Claude Code / Cursor / QoderCN** etc. | skill / rules activate automatically | [use-skill.md](docs/use-skill.md) |

> Agents you didn't check are simply untouched — you can add them anytime.

## 🎯 Highlights

- 🧭 **First-run onboarding**: pick a platform → set identity → init/clone, step by step
- 🛡️ **Safety rails**: commit/push blocked while conflicts are unresolved; merges in progress are auto-detected; technical errors never shown to you
- 🌐 **Platform-tailored**: GitHub / GitLab / Gitee each get their own repo-creation, clone-URL and token steps
- ✂️ **No paths, no commands**: you never type a folder path; jargon is always explained

## 📚 Documentation

| Doc | What it is |
| --- | --- |
| [install-dsh.md](docs/install-dsh.md) | 🟦 DSH plugin: usage (11 tools) & update |
| [use-skill.md](docs/use-skill.md) | 🧩 Other agents: Codex / Claude Code / Cursor / QoderCN |
| [demo-en.md](docs/demo-en.md) / [demo-zh.md](docs/demo-zh.md) | 👀 Demo: the complete guided flow |
| [development.md](docs/development.md) | 🛠️ Development: structure / conventions / testing / release |
| [CHANGELOG.md](CHANGELOG.md) | 📋 Changelog (0.1 → 0.5) |
| [skills/README.md](skills/README.md) | 🧩 Skill docs & directory |
| [README.md](README.md) | 🌐 简体中文版 |
| [AGENTS.md](AGENTS.md) | 🤖 Universal agent guidance (active in this repo) |

## ⚙️ Implementation highlights

- **Spawns `git.exe` directly** (no shell involved) — no quoting/escaping problems; the Git path resolves via PATH → common install locations
- **Built-in timeouts & cancellation**; commit messages go through stdin (`git commit -F -`)
- **Safety rails**: commit/pull/push blocked while conflicts are unresolved; detects `MERGE_HEAD`/`CHERRY_PICK_HEAD`/`REBASE_HEAD`, so an in-progress merge can be finished with a commit
- **Plain Chinese prompts** that treat the user as a complete Git beginner

## ❓ FAQ

<details>
<summary>I can't use the command line. Is this for me?</summary>

Absolutely. Even installing is just one copy-paste command; after that you only need to talk, choose, paste links, and click website buttons.
</details>

<details>
<summary>What if I switch platforms?</summary>

Say "switch to GitHub" or "switch to GitLab" — done, instantly.
</details>

<details>
<summary>How do I add / change agents after install?</summary>

Run `easy-git install` and re-pick, or `easy-git install all`.
</details>

## 📄 License

MIT
