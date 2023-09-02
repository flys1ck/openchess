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

#: Colima check.
colima_version_check:
	@if [ "$(shell echo `colima version | head -n1 | cut -d" " -f3`)" != "0.5.4" ]; then echo "Install colima 0.5.4. Aborting."; exit 1; fi

#: Reinstall Colima.
colima_reinstall: colima_uninstall preflight_check
	@echo "\nReinstalled Colima!"

#: Start Colima.
colima_start: colima_version_check
	colima start --cpu 4 --memory 8 --kubernetes --kubernetes-disable="" --dns 1.1.1.1 --dns 8.8.8.8 --network-address

#: Stop Colima.
colima_stop:
	colima stop

#: Delete Colima.
colima_delete:
	colima delete -f
	rm -rf ~/.colima ~/.lima

#: Uninstall Colima.
colima_uninstall: colima_delete
	brew remove colima lima

#: Start docker-compose services
docker_compose_up:
	docker-compose up -d

#: Start the container stack.
up: colima_start docker_compose_up

#: Start dev environment.
dev: up
	pnpm tauri dev
