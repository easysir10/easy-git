# 🎬 easy-git Plugin Demo Document

[![version](https://img.shields.io/badge/version-0.6.1-blue)]() [![license](https://img.shields.io/badge/license-MIT-green)]() [![beginner](https://img.shields.io/badge/beginner--friendly-ff69b4)]()

> The beginner-friendly Git assistant — someone who has never used Git or a command line can do everything through plain-language conversation.

- Version: 0.6.1
- Repository: https://github.com/easysir10/easy-git
- Works with: GitLab / GitHub / Gitee — any Git hosting platform
- Installation: see [../docs/install-dsh.md](../docs/install-dsh.md) (two steps: `dsh plugin --profile web add` + register in `cordis.patch.yml`)

> **Note for international users:** the plugin's built-in reply prompts are currently in Chinese (localization is planned).
> The dialogue examples below are translated into English so the *flow* is easy to follow.

---

## 1. What problem does it solve

Meet **Alex** — a complete Git beginner. He used to hear words like "commit, push, rebase" and was lost.
With this plugin, he only needs to **speak plain language**:

| What he means | What he says | What the assistant does |
| --- | --- | --- |
| Check on my code | "Check my git status" | Health check: branch / identity / changes / conflicts / sync state |
| First time, no idea which platform | (asked automatically) "Which platform do you use?" | Remembers it, guides accordingly from then on |
| Start a project | "Turn this folder into a repository" | Runs `git init` |
| Finished editing | "Commit for me" | Shows a preview list → commits |
| Want it on the server | "Push" | Uploads to the remote repository |
| A colleague changed code | "Pull" | Merges the new code in |
| Conflict happened | "There's a conflict" | Lists conflicted files + 3-choice guided resolution |

**There is not a single command-line command and not a single folder path for the user to type.**

---

## 2. Complete demo flow (from zero to productive)

Presented as "You say → Assistant replies".

### Step 1: First health check + platform selection

> You say: **Check my git status**

The assistant runs the health check:

```
✅ Git is installed (version 2.45.1).
But this folder is not a Git repository yet.

Next, you can:
1️⃣ Pull an existing project from GitHub/GitLab → send me the repository URL, I'll download it for you.
2️⃣ Turn this folder into a repository → tell me, I'll initialize it for you.

🔰 First time using Git? Please tell me which platform you use: ① GitHub  ② GitLab  ③ Gitee  ④ Other
(Tell me your choice and I'll remember it — every step from now on follows that platform.)
```

> You say: **I use GitLab**

The assistant saves the platform and shows GitLab-specific guidance:

```
✅ Saved: you use GitLab. All Git guidance will follow GitLab's steps from now on.

GitLab quick start:
• Create a repository: New project → Create blank project
• Get the clone URL: click the Clone button, copy the HTTPS link
• Generate an access token: Settings → Access tokens (check write_repository)

(If you switch platforms later, just say "switch to GitHub" and it's done.)
```

> 💡 If your repository already has a remote URL (e.g. `github.com`), the assistant **auto-detects** the platform — no manual selection needed.

### Step 2: Initial setup

> You say: **Turn this folder into a repository**

The assistant runs `git init` (default branch `main`, matching GitLab/GitHub):

```
✅ Initialized this folder as a Git repository (default branch main).
✅ All set! You're ready to use Git: send me a repository URL to pull code,
   or tell me "commit" to save your changes.
```

> 💡 If your name and email were set before, the assistant reuses them. If not, it simply asks
> "What's your name and email?" and writes them into the global config for you.

### Step 3: Write code + commit

You create a `README.md` and say:

> You say: **Commit for me**

The assistant **previews** what will be committed — never commits blind:

```
✏️ This commit will include 1 file:
   • 🆕 NEW (not yet tracked by Git)  README.md

A commit = taking a "snapshot" of this batch of changes, so you can roll back later
or upload it to the remote repository.
Please tell me in one sentence what changed (keep it simple, e.g. "fixed the login button")
```

> You say: **Added a readme file**

The assistant commits:

```
✅ Committed!

Message: Added a readme file
 README.md | 1 +
 1 file changed, 1 insertion(+)

Next: upload this commit to the remote repository? Tell me "push" and I'll take care of it.
```

> 💡 Don't know what to write? Just say "you pick a message for me" — the assistant drafts one and asks "is this OK?" before committing.

### Step 4: Bind remote + push

> You say: **The repository URL is https://gitlab.com/alex/demo.git, bind it**

The assistant binds the remote (`origin`). Then:

> You say: **Push**

First push automatically sets the upstream branch:

```
✅ Pushed! Your code is now on the remote repository — colleagues / merge requests can see it.
```

> 💡 Push rejected (someone else pushed first)? The assistant says: "Pull to merge their changes first, then push again."
> 💡 Authentication failed? The assistant tells you exactly where to create an access token on your platform and how to use it.

### Step 5: Pull (a colleague changed code)

> You say: **Pull**

The assistant runs `git pull` (merge style — never rewrites your own commits):

```
✅ Pull complete! You now have everyone's latest commits.
```

### Step 6: Resolve a conflict (the important one)

This time you and a colleague edited **the same line of the same file** — a conflict. The assistant reassures you first:

```
⚠️ Pull hit a conflict: your change and someone else's collided, and Git can't tell which to keep.

Don't worry, this is normal. Use the conflict tool and I'll guide you through the choices.
```

Then it lists the conflicted files and gives you three choices:

```
⚠️ 1 file is in conflict:
   • hello.txt

What a conflict is: you and a colleague both changed the same spot in the same file,
so Git keeps both versions and lets you decide.

Your choices (tell me which one):
① Keep my version — use your local copy (good when this file is mostly yours)
② Keep their version — use the other person's / remote copy (good for lock files,
   build artifacts, auto-generated files)
③ Edit it manually — keep parts of both (recommended for normal code where both
   sides made important changes)
   (Manual flow: pick "show" to open the conflict content → you edit the file →
    tell me "I'm done" and I'll mark it resolved)
```

> You say: **② keep theirs** (because it's a lock file)

```
✅ hello.txt kept the other person's version

🎉 All conflicts resolved! Now commit: tell me "commit" and I'll save this merge as one version.
```

> You say: **Commit**

The merge is complete. That's all it takes to resolve a conflict.

### Step 7: Daily health check

> You say: **Health check**

```
📋 Your current Git status:

• Current branch: main
• Your name (author shown on commits): Alex
• Your email (contact shown on commits): alex@example.com
• Remote: origin	https://gitlab.com/alex/demo.git (fetch)
• Guidance platform: GitLab (say "switch to xxx" anytime to change)
• vs remote: fully in sync (local and server code are identical)

✏️ No uncommitted changes right now.
```

---

## 3. Platform-mismatch auto reminder (new in v0.2.3)

If the "guidance platform" and the "remote repository" don't match (e.g. guidance is GitLab but the remote is GitHub), the health check reminds you automatically:

```
⚠️ Your remote looks like GitHub, but the current guidance platform is GitLab — they don't match.
   Switch guidance to GitHub? Just say "switch to GitHub".
```

One sentence, no commands.

---

## 4. Beginner-friendly design (safety rails)

| Scenario | What the assistant does |
| --- | --- |
| Conflicts not yet resolved | Blocks commit / pull / push until resolved |
| A merge is in progress | Auto-detects (MERGE_HEAD etc.), prompts "one commit left to finish" |
| Commit without name/email | Friendly prompt, sets it up for you — no raw English errors dumped on you |
| A command fails | Technical errors stay with the assistant — **never shown to scare you** |
| Unsure where to run | Uses your current workspace — **you never type a path** |
| Jargon (branch / merge / remote) | Explains in one sentence the first time it appears |

---

## 5. FAQ

**Q: I can't use the command line. Is this for me?**
A: Absolutely. You only need to talk, choose, paste links, and click website buttons.

**Q: What if I switch platforms?**
A: Say "switch to GitHub" or "switch to GitLab" — done, instantly.

**Q: Can I use it for many projects on one machine?**
A: Yes. Each repository is handled independently — health check, commit, pull, push don't interfere.

**Q: Could my code go to the wrong place?**
A: No. It confirms the remote before pushing; you provide the URL, the assistant never guesses.

---

*This plugin makes Git easy for everyone. Issues and suggestions are welcome in the repository.*
