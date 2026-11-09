#!/usr/bin/env bash
# Sourced by the launch/build scripts. Does not modify the user's shell.
BILA_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -n "${GODOT_BIN:-}" ]]; then
    BILA_GODOT="$GODOT_BIN"
elif [[ -x "$BILA_ROOT/.tools/godot4" ]]; then
    BILA_GODOT="$BILA_ROOT/.tools/godot4"
elif command -v godot4 >/dev/null; then
    BILA_GODOT="$(command -v godot4)"
elif command -v godot-dotnet >/dev/null; then
    BILA_GODOT="$(command -v godot-dotnet)"
else
    echo 'Godot 4 not found. Install Godot 4.4.1 or set GODOT_BIN.' >&2
    exit 1
fi
if [[ "$("$BILA_GODOT" --version)" != 4.* ]]; then
    echo 'This project requires Godot 4 or Godot 4 .NET, not Godot 3.1.' >&2
    exit 1
fi
