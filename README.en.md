<div align="center">

# 🧑‍💻 easy-git

**Beginner-Friendly Git Assistant** — one install command, pick your agents, done

[![version](https://img.shields.io/badge/version-0.6.3-blue)]()
[![license](https://img.shields.io/badge/license-MIT-green)]()
[![beginner](https://img.shields.io/badge/beginner--friendly-ff69b4)]()

🌐 [English](README.en.md) · [简体中文](README.md)

</div>

---

**easy-git makes Git beginner-friendly**: you don't need a single command-line command; it works with GitLab / GitHub / Gitee — any Git hosting platform.
Installation is one command, and you pick which agents to install for (**including DSH**) from a menu.

## 🚀 Install

```bash
npx -y github:easysir10/easy-git
```

**Running it pops up a selection menu** (↑↓ move · Space toggle · Enter confirm) — pick and it installs; re-run anytime to re-pick:

```
🎯 Choose which agents to install for (↑↓ move · Space toggle · Enter confirm · a all · q cancel)
  ➜ ☐ 1. DSH plugin (DeepSeek Harness)
    ☐ 2. Codex (skill + /easy-git slash command)
    ☐ 3. Claude Code (skill + /easy-git slash command)
    ☐ 4. Cursor (rules + /easy-git slash command)
    ☐ 5. Qoder (skill + /easy-git slash command)
    ☐ 6. QoderCN (skill + /easy-git slash command)
    ☑ 7. Universal AGENTS.md (Gemini CLI / OpenCode / Zed / Trae etc.)
(Enter to confirm and install; number keys also toggle)
```

> **Let an agent install it**: give any agent the repo URL `https://github.com/easysir10/easy-git` and ask it to run the command above.
>
> **Other ways**: on slow networks use `npx -y https://codeload.github.com/easysir10/easy-git/tar.gz/refs/heads/main`; to keep it as a permanent command run `npm install -g https://codeload.github.com/easysir10/easy-git/tar.gz/refs/heads/main`; in non-interactive environments (CI) the menu is skipped — run `easy-git install` or the first `easy-git` run later.

## Where & how to use it

| You use | After install | Guide |
| --- | --- | --- |
| 🟦 **DSH** (DeepSeek Harness) | Tell the assistant "commit / pull / push / resolve conflicts / check my git status" | [install-dsh.md](docs/install-dsh.md) |
| 🟠 **Codex / Claude Code** | Type `/easy-git description` (skill also activates) | [use-skill.md](docs/use-skill.md) |
| 🟪 **Cursor / Qoder / QoderCN** | Type `/easy-git description` (rules / skill also activate) | [use-skill.md](docs/use-skill.md) |

## 🎯 Highlights

- 🧭 **First-run onboarding**: pick a platform → set identity → init/clone, step by step
- 🛡️ **Safety rails**: commit/push blocked while conflicts are unresolved; merges in progress are auto-detected; technical errors never shown to you
- 🌐 **Platform-tailored**: GitHub / GitLab / Gitee each get their own repo-creation, clone-URL and token steps
- ✂️ **No paths, no commands**: you never type a folder path; jargon is always explained

## 📚 Documentation

| Doc | What it is |
| --- | --- |
| [install-dsh.md](docs/install-dsh.md) | 🟦 DSH plugin: usage (11 tools) & update |
| [use-skill.md](docs/use-skill.md) | 🧩 Other agents: Codex / Claude Code / Cursor / Qoder / QoderCN |
| [development.md](docs/development.md) | 🛠️ Development: structure / conventions / testing / release |
| [CHANGELOG.md](CHANGELOG.md) | 📋 Changelog |
| [skills/README.md](skills/README.md) | 🧩 Skill docs & directory |
| [AGENTS.md](AGENTS.md) | 🤖 Universal agent guidance (active in this repo) |

## ❓ FAQ

<details>
<summary>I can't use the command line. Is this for me?</summary>

Absolutely. Even installing is just one copy-paste command; after that you only need to talk, choose, paste links, and click website buttons.
</details>

<details>
<summary>How do I add / change agents after install?</summary>

Run `easy-git install` and re-pick, or `easy-git install all`.
</details>

## 📄 License

MIT
