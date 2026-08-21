<div align="center">

# 🧑‍💻 easy-git

**Beginner-Friendly Git Assistant** — zero command line, plain-language guidance for everything Git

[![version](https://img.shields.io/badge/version-0.5.0-blue)]()
[![license](https://img.shields.io/badge/license-MIT-green)]()
[![beginner](https://img.shields.io/badge/beginner--friendly-ff69b4)]()
[![docs](https://img.shields.io/badge/docs-English%20%7C%20%E4%B8%AD%E6%96%87-lightgrey)]()

🌐 [English](README.en.md) · [简体中文](README.md)

</div>

---

**easy-git has exactly two ways to use it — pick one**:

- 🟦 **Way 1: DSH plugin** — inside DeepSeek Harness (11 beginner-friendly tools)
- 🧩 **Way 2: Universal Skill** — directly in Codex / Claude Code / Cursor / QoderCN and other agents

**You don't need a single command-line command** — works with GitLab / GitHub / Gitee — any Git hosting platform.

## 🧭 Which way?

| Your situation | Way | Guide |
| --- | --- | --- |
| 🟦 Using **DSH** (DeepSeek Harness) | Way 1: DSH plugin | [install-dsh.md](docs/install-dsh.md) |
| 🧩 Using **Codex / Claude Code / Cursor / QoderCN** or other agents | Way 2: Universal Skill | [use-skill.md](docs/use-skill.md) |

> [!TIP]
> [!TIP]
> `npm install -g github:easysir10/easy-git` **shows the "choose agents to install" menu right after the install finishes** — pick and it installs automatically; re-run `easy-git install` anytime, or `easy-git install all`.

## 🎯 Highlights

- 🧭 **First-run onboarding**: pick a platform → set identity → init/clone, step by step
- 🛡️ **Safety rails**: commit/push blocked while conflicts are unresolved; merges in progress are auto-detected; technical errors never shown to you
- 🌐 **Platform-tailored**: GitHub / GitLab / Gitee each get their own repo-creation, clone-URL and token steps
- ✂️ **No paths, no commands**: you never type a folder path; jargon is always explained

## 📚 Documentation

| Doc | What it is |
| --- | --- |
| [install-dsh.md](docs/install-dsh.md) | 🟦 Way 1: DSH plugin install & usage |
| [use-skill.md](docs/use-skill.md) | 🧩 Way 2: Universal Skill (per-agent install + command reference) |
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

Absolutely. You only need to talk, choose, paste links, and click website buttons.
</details>

<details>
<summary>What if I switch platforms?</summary>

Say "switch to GitHub" or "switch to GitLab" — done, instantly.
</details>

<details>
<summary>How do I update the DSH plugin?</summary>

Say "update the plugin" and the assistant runs the update command; then restart dsh. See [install-dsh.md](docs/install-dsh.md).
</details>

## 📄 License

MIT
