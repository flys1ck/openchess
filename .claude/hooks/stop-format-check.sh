#!/usr/bin/env bash
# Stop hook: catch unformatted files the per-file PostToolUse hook never saw
# (created via Bash: cp, mv, heredocs, codegen). Check-only, never edits files.
# Blocks the stop once (exit 2) so Claude can format the listed files; a second
# stop in a row (stop_hook_active) is always allowed, so this cannot loop.
input=$(cat)
[ "$(echo "$input" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0
# CLAUDE_PROJECT_DIR points at the main checkout even in a worktree session; check the session's own checkout.
cd "$(echo "$input" | jq -r '.cwd // empty')" 2>/dev/null || cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 0

files=$({ git diff --name-only HEAD; git ls-files --others --exclude-standard; } 2>/dev/null | sort -u |
  grep -E '\.(ts|tsx|js|jsx|vue|json|jsonc|css|md|yml|yaml)$' |
  grep -vE '(^|/)(node_modules|target)/' |
  while IFS= read -r f; do [ -f "$f" ] && echo "$f"; done)
[ -z "$files" ] && exit 0

# shellcheck disable=SC2086
if ! out=$(echo "$files" | tr '\n' '\0' | xargs -0 bunx oxfmt --check --no-error-on-unmatched-pattern 2>&1); then
  {
    echo "Unformatted files (CI runs fmt:check). Run \`bunx oxfmt <file>\` on each, then finish:"
    echo "$out"
  } >&2
  exit 2
fi
exit 0
