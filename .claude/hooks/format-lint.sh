#!/usr/bin/env bash
# PostToolUse hook: format and lint the single file Claude just edited.
# Formatting problems are fixed silently; lint findings are sent back to Claude (exit 2).
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
    out=$(bunx oxlint --fix "$f" 2>&1)
    if [ -n "$out" ]; then
      echo "$out" >&2
      exit 2
    fi
    ;;
esac
exit 0
