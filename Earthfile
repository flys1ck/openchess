VERSION 0.7
FROM node:18-bookworm-slim
WORKDIR /openchess

prepare:
    # update
    RUN apt-get update -y --allow-releaseinfo-change && apt-get upgrade -y && apt-get autoremove -y
    # install tauri deps
    RUN apt-get install libwebkit2gtk-4.0-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev -y
    # install rust
    # use /root as default home for rust binaries
    ENV HOME="/root"
    # prevent cargo being stuck on updating crates.io index
    ENV CARGO_REGISTRIES_CRATES_IO_PROTOCOL="sparse"
    RUN curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    ENV PATH="$HOME/.cargo/bin:${PATH}"
    # install tauri-cli
    RUN cargo install tauri-cli
    # install bun
    RUN apt-get install unzip
    RUN curl -fsSL https://bun.sh/install | bash
    ENV PATH="$HOME/.bun/bin:${PATH}"

build:
    FROM +prepare
    COPY package.json bun.lockb .
    RUN bun install --frozen-lockfile
    COPY --dir src src-tauri scripts public .
    COPY index.html tsconfig*.json vite.config.ts tailwind.config.cjs postcss.config.cjs .
    RUN bun run scripts/generateTargetTriple.ts
    # FIXME: can't run with bun, throws SIGKILL
    RUN cargo tauri build --verbose

build-all-platforms:
    BUILD --platform=linux/amd64 +build
