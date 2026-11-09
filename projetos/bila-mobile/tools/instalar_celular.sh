#!/usr/bin/env bash
set -euo pipefail
BILA_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ ! -f "$BILA_ROOT/build/bila-piloto.apk" ]]; then
    "$BILA_ROOT/tools/export_apk.sh"
fi
ADB="${ANDROID_HOME:-$BILA_ROOT/.tools/android-sdk}/platform-tools/adb"
if [[ ! -x "$ADB" ]]; then
    echo 'Run tools/setup_android.py to install adb.' >&2
    exit 1
fi
"$ADB" devices
"$ADB" "$@" install -r "$BILA_ROOT/build/bila-piloto.apk"
"$ADB" "$@" shell am start -n com.sygil.bilapiloto/com.godot.game.GodotApp
