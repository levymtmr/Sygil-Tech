#!/usr/bin/env bash
set -euo pipefail
source "$(dirname -- "${BASH_SOURCE[0]}")/godot_env.sh"
if [[ ! -f "$BILA_ROOT/.tools/templates/4.4.1.stable/android_debug.apk" || ! -x "$BILA_ROOT/.tools/jdk/bin/java" ]]; then
    echo 'Preparing local Android tools (first run requires internet)...'
    python3 "$BILA_ROOT/tools/setup_android.py"
    source "$BILA_ROOT/tools/godot_env.sh"
fi
if [[ "$("$BILA_GODOT" --version)" != 4.4.1.* ]]; then
    echo 'The APK uses template 4.4.1. Run tools/setup_android.py to get the matching engine.' >&2
    exit 1
fi
export JAVA_HOME="$BILA_ROOT/.tools/jdk"
export ANDROID_HOME="$BILA_ROOT/.tools/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
export XDG_CONFIG_HOME="$BILA_ROOT/.tools/config"
export XDG_CACHE_HOME="$BILA_ROOT/.tools/cache"
export XDG_DATA_HOME="$BILA_ROOT/.tools/data"
export GODOT_ANDROID_KEYSTORE_DEBUG_PATH="$BILA_ROOT/.tools/debug.keystore"
export GODOT_ANDROID_KEYSTORE_DEBUG_USER=androiddebugkey
export GODOT_ANDROID_KEYSTORE_DEBUG_PASSWORD=android
mkdir -p "$BILA_ROOT/build" "$XDG_CONFIG_HOME" "$XDG_CACHE_HOME" "$XDG_DATA_HOME"
"$BILA_GODOT" --headless --path "$BILA_ROOT" --editor --import --quit
"$BILA_GODOT" --headless --path "$BILA_ROOT" --export-debug Android "$BILA_ROOT/build/bila-piloto.apk"
"$ANDROID_HOME/build-tools/34.0.0/apksigner" verify "$BILA_ROOT/build/bila-piloto.apk"
echo "APK ready: $BILA_ROOT/build/bila-piloto.apk"
