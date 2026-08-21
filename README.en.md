# easy-git — Foolproof Git Assistant (DSH Plugin)

🌐 Language: English (this page) · [简体中文](README.md)

> 📖 Demo documents: **[DEMO.en.md](DEMO.en.md)** (English) · **[DEMO.md](DEMO.md)** (中文)

A **standard DSH plugin** (Cordis plugin package) that wraps Git operations into a foolproof,
plain-language assistant for people who have never used Git.
**You don't need a single command-line command** — everything is done for you through Q&A in plain language.
Works with GitLab / GitHub and any Git hosting platform (Gitee, etc.).

> **Note:** the plugin's built-in prompts are currently in Chinese (localization is planned).
> The demo documents are translated so the flow is easy to follow.

## Provided tools

| Tool | What it does |
| --- | --- |
| `git_beginner_platform` | Determines the platform on first use (GitHub / GitLab / Gitee / other); all guidance is then tailored to that platform |
| `git_beginner_status` | "Health check": Git installed?, is this a repo, current branch, name/email, change list, conflicts, merge-in-progress, remote URL, ahead/behind |
| `git_beginner_setup` | First-time setup: global name/email, default branch `main`, init a repo, bind a remote URL |
| `git_beginner_pull` | Clone (no repo yet) / pull (`git pull --no-rebase`, merge style — never rewrites your own commits) |
| `git_beginner_conflict` | Conflict wizard: list conflicted files → choose (keep mine / keep theirs / manual) → auto-resolve, show content, or mark manually-resolved files |
| `git_beginner_commit` | Previews the file list first, asks you for a one-sentence summary, then runs `git add -A` + `git commit` |
| `git_beginner_push` | Uploads to remote; first push auto-sets the upstream (`-u origin HEAD`); rejected → suggests pulling first; auth failure → plain-language explanation |

## First-use flow (beginner friendly)

1. The first time you say "check my git status", the assistant asks you to pick a **platform**: GitHub / GitLab / Gitee / other;
2. Once chosen (or saved with `git_beginner_platform`), every later step (create repo, clone URL, access token, etc.) follows that platform;
3. If your repository already has a remote URL, the assistant **auto-detects** the platform — no need to choose; switch anytime by saying "switch to GitLab";
4. If the "guidance platform" and the "remote repository" don't match (e.g. guidance is GitLab but the remote is GitHub), the health check **reminds you automatically** — say "switch to GitHub" and it's done.

## Installation (for dsh users)

Install from this Git repository into your dsh profile (`web` below; `headless` or other profiles are the same):

```bash
# 1) Install the plugin into the profile (equivalent to `pnpm add` in the profile dir)
dsh plugin --profile web add github:easysir10/easy-git

# 2) Enable the plugin row in the profile's patch file
#    Edit $DSH_HOME/profiles/web/cordis.patch.yml, add:
#    - insert:
#        - id: git-beginner-helper
#          name: '@easysir10/easy-git'
```

Then **restart dsh** (plugins mount with the composition at startup). After that, just tell the assistant
"commit / pull / push / resolve conflicts / check my git status" and it walks you through everything.

> Tips:
> - You can also use `$DSH_HOME/cordis.patch.yml` (home-level patch, higher priority) with the same syntax.
> - To pin a version, add a commit reference, e.g. `github:easysir10/easy-git#main` or `#<commit-sha>`.
> - Authentication (HTTPS token / SSH key) is configured by each user on their own machine; the plugin does not manage credentials.

## Run from source / develop

```bash
git clone https://github.com/easysir10/easy-git.git
cd easy-git
npm install    # or pnpm install (resolves peerDependencies)
```

`lib/index.js` is the plugin itself: an ESM module exporting the standard Cordis plugin `{ name, inject, apply }`,
registering the seven tools via `ctx.tools.register(defineTool(...))`.

## Implementation highlights

- **Spawns `git.exe` directly** (`ctx.subprocess`) — no shell involved, so no quoting/escaping problems;
  the Git path resolves via PATH → common install locations, compatible with any Git installation.
- Built-in timeouts (`ctx.timer` + `terminate()`) and cancellation (`exec.signal`).
- Foolproof design: commit/pull/push are blocked while conflicts are unresolved; detects `MERGE_HEAD`/`CHERRY_PICK_HEAD`/`REBASE_HEAD`,
  so an in-progress merge can be finished with a commit even when there are no file changes.
- All prompts are plain Chinese, guiding the user as if they know nothing about Git.

## License

MIT
