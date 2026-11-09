#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/tools/godot_env.sh"
# No arguments: play in a portrait desktop window. --editor: open in Godot.
exec "$BILA_GODOT" --path "$BILA_ROOT" "$@"
