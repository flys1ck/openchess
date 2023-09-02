.PHONY: up

bold := $(shell tput bold)
sgr0 := $(shell tput sgr0)

#: Show this help screen.
help:
	@grep -B1 -E "^[a-zA-Z0-9_-]+\:([^\=]|$$)" Makefile \
	| grep -v -- -- \
	| sed 'N;s/\n/###/' \
	| sed -n 's/^#: \(.*\)###\(.*\):.*/\2###\1/p' \
	| column -t  -s '###' \
	| sort

#: Start dev environment.
dev:
	pnpm tauri dev
