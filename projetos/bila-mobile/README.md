# Good Bila · prototype source 0.23.0

A 2D physics-and-cards marble game for Android, written in GDScript for **Godot 4.4.1**. The only game mode is Destruction: the first impact cracks a target and the second destroys it to award points. The interface and documentation are in English.

[**Presentation, screenshots, and how to play**](../../docs/good-bila/README.md) · [**Support / invest**](../../docs/good-bila/SUPPORT.md) · [**Development**](../../docs/good-bila/DEVELOPMENT.md) · [**Changes**](CHANGELOG.md)

## Run on desktop

Open `project.godot` in Godot 4.4.1 and press F5. Godot 3 is not supported. The .NET edition can also execute GDScript.

On Linux/macOS with Godot 4 in PATH:

```bash
cd projetos/bila-mobile
bash jogar.sh
```

To choose the executable explicitly:

```bash
GODOT_BIN=/path/to/godot4 bash jogar.sh
GODOT_BIN=/path/to/godot4 bash tools/testar.sh
```

The base logical resolution is 720 × 1280, expanding for taller screens and respecting Android safe areas. Use the mouse to press the player marble, pull back, and release. Cards support an upward drag or a tap.

## Export a test APK

The exporter uses **Godot engine and Android template 4.4.1**, JDK 17, and Android SDK 34. On Linux x86_64:

```bash
cd projetos/bila-mobile
python3 tools/setup_android.py
bash tools/export_apk.sh
```

Setup downloads official tools into `.tools/`, without changing the system's Godot installation. Output is `build/bila-piloto.apk`. To install on a connected device with USB debugging enabled:

```bash
bash tools/instalar_celular.sh
```

Tools and the development signing key stay local and must not be committed. Builds signed with different test keys cannot update one another: removing an earlier installation may be necessary. This is a prototype distribution rather than a store release.

## Verify

```bash
bash tools/testar.sh
```

The current suite covers random collection hands, physics, marble rain, terrain, effects, scoring, and native touch events. It uses dedicated test data. Historical classic-mode tests are not part of the current suite.

## Source layout

| Path | Responsibility |
|---|---|
| `scripts/game.gd` | Runs, cards, effect physics, scoring, terrain, and audio. |
| `scripts/marble.gd` | Rigid body, jumping, damage, and marble animations. |
| `scripts/presentation.gd` | Field, HUD, trajectory, and power gauge. |
| `scripts/front_end.gd` | Menus, collection, details, profile, and settings. |
| `scripts/hand_card.gd` | Cards, backs, and draw gestures. |
| `scripts/effect_icons.gd` | Shared effect icons and palette. |
| `scripts/game_over.gd` | Game over presentation and score animation. |
| `tests/` | Current suite and historical tests. |
| `tools/` | Local setup, testing, and Android export. |

Legacy local profile and save-directory names are retained internally to preserve existing player data.

## Resources and third-party licenses

Pixelify Sans is accompanied by `assets/PIXELIFY-LICENSE.txt`. Original music credits are in `assets/MUSIC-LICENSE.txt`. The marble atlas is a project resource. Commercial publishing and collaboration terms can be discussed through the [support page](../../docs/good-bila/SUPPORT.md).

## Publication

The showcase lives in `docs/good-bila/`. The `good-bila-release.yml` workflow prepares tools, runs the suite, exports the prototype, and publishes the APK as a prerelease. Secrets, caches, keys, local data, and previous builds stay outside Git.
