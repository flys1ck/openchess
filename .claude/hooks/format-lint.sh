#!/usr/bin/env bash
# PostToolUse hook: format and lint the single file Claude just edited.
# Formatting problems are fixed silently; lint errors are sent back to Claude (exit 2),
# lint warnings are added as non-blocking context.
f=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -f "$f" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

case "$f" in
  */node_modules/* | */src-tauri/target/*) exit 0 ;;
esac

case "$f" in
  *.ts | *.tsx | *.js | *.jsx | *.vue | *.json | *.jsonc | *.css | *.md | *.yml | *.yaml)
    bunx oxfmt "$f" > /dev/null 2>&1
    ;;
esac

case "$f" in
  *.ts | *.tsx | *.js | *.jsx | *.vue)
    # Ignored files (e.g. src/*.d.ts) lint nothing and exit 0 instead of erroring.
    out=$(bunx oxlint --fix --no-error-on-unmatched-pattern "$f" 2>&1)
    status=$?
    # Errors block; warnings (possibly pre-existing) are passed along as context only.
    if [ $status -ne 0 ]; then
      echo "$out" >&2
      exit 2
    fi
    if [ -n "$out" ]; then
      jq -n --arg ctx "$out" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext: $ctx}}'
    fi
    ;;
esac
exit 0
