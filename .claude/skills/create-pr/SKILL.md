---
name: create-pr
description: Create or open a GitHub pull request with a concise description. Use this whenever the user asks to open, create, raise, submit or push a PR (or "pull request"), asks to write or rewrite a PR description, or when work on a branch is finished and the next step is `gh pr create`. Run it before `gh pr create`, even if the user doesn't mention a description.
allowed-tools:
  - Bash(git status:*)
  - Bash(git fetch:*)
  - Bash(git log:*)
  - Bash(git diff:*)
  - Bash(git branch:*)
  - Bash(git push:*)
  - Bash(gh pr:*)
  - Read
---

# Create a pull request

This is a solo repo: nobody else reviews or tests the PR. The description is a short record of what changed, so keep it small and skip anything that only exists to guide a reviewer or tester.

## 1. Pre-flight

- Run `git status`. If there are uncommitted changes, ask whether to commit them first; don't silently leave them out of the PR.
- If on `main`, create a branch first. Follow the branch naming rule in `AGENTS.md`.
- Run `bun run fmt`, `bun run lint` and `bun run types:check` if they haven't passed since the last edit, and fix failures before opening the PR.

## 2. Decide the scope, then gather the changes

The scope is whatever the user named: "the last commit", a commit range, specific commits, or, when they named nothing, the whole branch. Describe only that scope. Widening it to the whole branch would put unrelated work in the description, and narrowing it silently would hide commits the PR will really contain.

Always compare against the remote base, because local `main` is often stale in this repo and diffing against it drags in already-merged work:

```bash
git fetch origin main
git log origin/main..HEAD --format='%h %s%n%b'      # whole branch
git diff origin/main...HEAD --stat
git diff origin/main...HEAD
# a named scope instead: git show <sha>, or git diff <a>..<b>
```

If the named scope is narrower than `origin/main..HEAD`, tell the user in your reply: the PR created from this branch also contains the other commits, and isolating one would need its own branch.

Skip generated files (lockfiles, `src/database.d.ts` regenerations) when summarising, but mention a regeneration if a migration was added. If `gh pr list --head <branch> --state all` shows the branch already has a PR, update it with `gh pr edit` rather than opening a second one.

## 3. Write the body

The body is a one-sentence reason for the change followed by bullets. No headings: with a single section there is nothing to label. No test plan and no notes-for-reviewers section either.

```markdown
<one sentence: why this change exists>

- <bullet>
- <bullet>

Closes #<number>
```

Add the `Closes #<number>` line only when the work has a GitHub issue; skip it otherwise rather than guessing a number. End the body with the attribution line given in the session's system reminder, if one is present.

Fewer bullets read better, so aim for the smallest number that still covers each distinct change (three or four is typical).

- Start every bullet with a past-tense verb: Added, Removed, Fixed, Replaced, Updated, Extracted.
- Name components or features ("the games browser", "study forms"), not file paths.
- Group related file changes into one meaningful bullet.
- Skip noise such as import reordering or linter auto-fixes, unless that is the point of the PR.

## 4. Title

Use Conventional Commits: `type(scope): plain-language outcome`, for example `fix(app): promotion picker lines up when the board is flipped`. Describe the user-visible result, not the code change, and keep it under about 70 characters.

- Types: `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `chore`.
- Scopes: `app` (Vue + Tauri desktop app), `browser-extension`, `ci`, `deps`. Omit the scope for changes that span several.

## 5. Publish

Asking for a PR is the go-ahead, so push and create it without asking again, then reply with the PR URL, the title and the body. Pass the body with `--body-file` (written to the scratchpad directory), because inline `--body` mangles backticks and newlines. If the branch already has a PR, use `gh pr edit` instead (see step 2).
