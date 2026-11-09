#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/godot_env.sh"
export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$BILA_ROOT/.tools/test-config}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$BILA_ROOT/.tools/test-cache}"
export XDG_DATA_HOME="${XDG_DATA_HOME:-$BILA_ROOT/.tools/test-data}"
mkdir -p "$XDG_CONFIG_HOME" "$XDG_CACHE_HOME" "$XDG_DATA_HOME"
"$BILA_GODOT" --headless --path "$BILA_ROOT" --editor --import --quit
"$BILA_GODOT" --headless --path "$BILA_ROOT" --script res://tests/test_obstacles.gd -- --test
"$BILA_GODOT" --headless --path "$BILA_ROOT" --script res://tests/test_card_deck.gd -- --test
"$BILA_GODOT" --headless --path "$BILA_ROOT" --script res://tests/test_destruction.gd -- --test
"$BILA_GODOT" --headless --path "$BILA_ROOT" --script res://tests/test_new_effects.gd -- --test
"$BILA_GODOT" --headless --path "$BILA_ROOT" --script res://tests/test_collection.gd -- --test
exec "$BILA_GODOT" --headless --path "$BILA_ROOT" --script res://tests/test_mobile_input.gd -- --test
