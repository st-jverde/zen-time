#!/usr/bin/env bash
# Netlify and other CI images may have wasm-pack (or not) but no Rust toolchain.
set -euo pipefail
export PATH="${HOME}/.cargo/bin:${PATH}"

if ! command -v rustup >/dev/null 2>&1; then
  curl https://sh.rustup.rs -sSf | sh -s -- -y
  export PATH="${HOME}/.cargo/bin:${PATH}"
fi

rustup default stable
rustup target add wasm32-unknown-unknown

if ! command -v wasm-pack >/dev/null 2>&1; then
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi
