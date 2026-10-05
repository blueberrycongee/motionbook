#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "$(uname -s)" != "Darwin" ]]; then echo "This target requires macOS and Xcode Command Line Tools. Linux cannot compile/run AppKit." >&2; exit 1; fi
mkdir -p .build
target="$(uname -m)-apple-macosx${PIP_MACOS_DEPLOYMENT_TARGET:-13.0}"
swiftc -target "$target" native/PiPReplica.swift -framework AppKit -framework QuartzCore -framework WebKit -framework CoreVideo -o .build/PiPReplica
exec .build/PiPReplica "$PWD"
