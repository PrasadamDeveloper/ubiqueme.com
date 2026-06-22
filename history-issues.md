# Git History Recovery — Post-Mortem

> **Incident date:** 2026-06-13
> **Repository:** ShykanDev/ubiqueme.com
> **Affected commit:** `f5992534dbbbf21281c073b4b6bf3933b6ada967`

---

## Context: What happened

An AI agent (Cline) was tasked with pushing two UI layout files (`HomeLayout.vue` and `UserDashoardLayout.vue`) to GitHub. The workflow went wrong in two critical steps:

### Step 1 — `git init` in an existing project

The local `ubiqueme.com/` folder did not have a `.git` directory (it was a fresh working copy, possibly from a backup or a new machine). The agent ran:

```bash
git init
```

This created a brand new, empty git repository in a folder that was **not** a clone of the remote — it had no connection to the existing 3-month history on GitHub.

### Step 2 — `git push --force`

After initializing locally, the agent added only the 2 layout files, committed, added the remote, and pushed:

```bash
git push -u origin main --force
```

The output showed:
```
+ f599253...09938d7 main -> main (forced update)
```

This **replaced** the remote `main` branch entirely. The `f599253` commit (with its full history tree) became a **dangling object** on GitHub — no branch or tag referenced it anymore. The remote only had the single new commit with 2 files.

---

## The recovery: How it was fixed

The assumption was that the history was "lost forever" and the only option was GitHub Support. **This was wrong.**

### Key insight

**GitHub does not immediately garbage-collect commits.** Even after a force-push overwrites a branch, the old commits remain as orphaned/dangling objects on the server for a period of time (typically 30-90 days). They can be fetched directly by their hash.

### Recovery steps

```bash
# 1. Fetch the lost commit by its hash
#    GitHub still has the object even though no branch points to it.
git fetch origin f5992534dbbbf21281c073b4b6bf3933b6ada967

# 2. Create a branch from the recovered commit
#    This recreates the entire old branch with full 3-month history.
git checkout -b mi-historial-real FETCH_HEAD

# 3. Switch back to main (which has the new UI redesign)
git checkout main

# 4. Merge histories
#    --allow-unrelated-histories is needed because the two branches
#    share no common ancestor (one was initialized from scratch).
git merge mi-historial-real --allow-unrelated-histories

# 5. Resolve conflicts
#    Files that conflict (e.g., .gitignore, scripts) should be resolved
#    with --theirs to keep the newer versions from main.
git checkout --theirs -- .gitignore scripts/
git add .
git commit -m "merge: restore full project history from orphan commit"

# 6. Rename the combined branch and push without --force
git branch -M main
git push origin main
```

### Result

The remote now has:
- **Full 3-month commit history** from the recovered `f599253` tree
- **UI redesign** from the `09938d7` commit merged on top
- **No history gaps** — the merge preserves both lineages

---

## Recommendations to prevent this

### For developers / AI agents

1. **Never use `--force` / `--force-with-lease` without explicit human approval.** Even then, prefer alternatives.

2. **Never `git init` in a directory linked to a remote.** If you need to set up git, always `git clone` the remote first, then copy your changes in.

3. **Always inspect git state before any operation:**
   ```bash
   git remote -v          # check if remote exists
   git log --oneline -5   # check local history
   git status             # check working tree
   ```

4. **If push is rejected**, do NOT force. Do:
   ```bash
   git pull --rebase origin main
   git push origin main
   ```

### Recovery protocol (if history is accidentally force-pushed)

1. **Do not panic.** The history is very likely still on GitHub's server.
2. **Get the lost commit hash** from the force-push output: `+ <old>...<new> main -> main (forced update)`
3. **Fetch it:**
   ```bash
   git fetch origin <old-commit-hash>
   git checkout -b recovery-branch FETCH_HEAD
   ```
4. **Merge it back:**
   ```bash
   git checkout main
   git merge recovery-branch --allow-unrelated-histories
   ```
5. **Resolve conflicts** (prefer the newer versions with `--theirs` or `--ours`)
6. **Push without force:**
   ```bash
   git push origin main
   ```

### If fetch by hash fails

- Try `git fetch origin` first (to get all refs)
- If still unreachable, the commit may have been garbage-collected. In that case, GitHub Support can restore it from their internal snapshots (they retain force-push overwrites for limited time).
- Always have a local backup strategy (e.g., `git bundle create backup.bundle --all`) before destructive operations.

---

## Lessons learned

| Mistake | Correct approach |
|---------|-----------------|
| `git init` in folder with remote history | `git clone <url>` instead |
| `git push --force` without checking state | `git pull --rebase` first |
| Assuming history is "lost forever" | Try `git fetch origin <hash>` — GitHub retains dangling commits |
| Reaching for "call GitHub support" first | Exhaust server-side fetch options first |

**Guard rule:** A force-push overwrite is recoverable if you have the old commit hash. Always try fetching the orphan commit before any other recovery path.