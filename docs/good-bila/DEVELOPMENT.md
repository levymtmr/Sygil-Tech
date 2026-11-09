# Good Bila · development

**Documented version:** 0.22.0 · **Status:** playable prototype · **Updated:** November 9, 2026.

[Presentation and how to play](README.md) · [Support and partnerships](SUPPORT.md) · [Code and technical setup](../../projetos/bila-mobile/README.md)

## Implemented

| Area | Current state |
|---|---|
| Game mode | Destruction, without a triangle, with cumulative score targets and level progression. |
| Cards | An 11-card collection; three randomly drawn per level, without deck building. |
| Physics | Two hits to destroy a target, chain collisions, and nine effects. |
| Field | An opening rain of 32–56 marbles, random layouts, and varied obstacles. |
| Interface | Collapsible hand, power gauge, icons, colors, and state-specific animations. |
| Run loop | Points, objectives, multiplier, limited shots, and a game over summary. |
| Platform | Android test APK for ARM32/ARM64 and desktop execution in Godot. |
| Local data and audio | Nickname, settings, best score, original music, and separate volume controls. |
| Language | English menus, gameplay, cards, results, documentation, and screenshots. |

## Validation

Version 0.21.0 passed **192 checks in the current automated suite**, plus touch validation in a 432 × 960 window. The suite covers card dealing, profile migration, marble rain, effects, terrain, scoring, and retry. A sample of 500 hands confirmed that every card can appear, with no repeated card within one hand. Version 0.22.0 reruns this suite for the English-language interface.

Presentation screenshots come from the prototype running in Godot. This does not replace a test campaign across different physical devices. Earlier versions were tested on Android by the creator; wider device compatibility remains a priority.

## Next priorities

- [ ] Gather player feedback and identify difficulty and comprehension patterns.
- [ ] Tune progression, effect combinations, and the cost of changing cards.
- [ ] Expand Android device testing across resolutions and performance levels.
- [ ] Refine visual feedback, audio, and accessibility options.
- [ ] Establish quality criteria for a wider release.

Priorities may change based on testing. No commercial release date has been announced.

## Prototype limitations

An active run exists only for the current session; there is no persistent campaign or mid-run save. There is no multiplayer, online account, store, advertising, or integrated payments. The installer is a test build, and the game is not on Google Play.

The aim preview accounts for movement and terrain but does not simulate the entire future chain of collisions, attraction, explosions, and rebounds. Effects and balancing remain subject to change.

## Follow or contribute

Use the [feedback form](https://github.com/levymtmr/Sygil-Tech/issues/new?template=good-bila-feedback.yml) or [support / partnership form](https://github.com/levymtmr/Sygil-Tech/issues/new?template=good-bila-support.yml). Public builds are available from [repository Releases](https://github.com/levymtmr/Sygil-Tech/releases).
