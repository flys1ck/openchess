VERSION 0.7
FROM ubuntu:22.04
WORKDIR /openchess

# switch to earthly, once it supports multi-platform builds on MacOS and Windows
prepare:
    # install apt deps
    ENV DEBIAN_FRONTEND="noninteractive"
    RUN apt-get update -y --allow-releaseinfo-change && \
        apt-get upgrade -y && \
        apt-get autoremove -y && \
        apt-get install libwebkit2gtk-4.0-dev build-essential ca-certificates gnupg curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev unzip -y && \
        rm -rf /var/lib/apt/lists/*
    # install node
    RUN mkdir -p /etc/apt/keyrings
    RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    ENV NODE_MAJOR="18"
    RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
    RUN apt-get update -y && apt-get install nodejs -y
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
