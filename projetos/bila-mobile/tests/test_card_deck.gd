extends SceneTree

var errors := 0
func _initialize() -> void:
    _run.call_deferred()

func check(ok: bool, message: String) -> void:
    if ok: print("PASS: ", message)
    else:
        push_error("FAIL: " + message)
        errors += 1

func _run() -> void:
    var game = load("res://main.tscn").instantiate()
    root.add_child(game)
    game.front_end.player_name = "Card QA"
    game.front_end.start_game()
    for color in range(game.CARD_ACTIONS.size()):
        game._restart()
        game.hand_missions.assign([color, (color + 1) % game.CARD_ACTIONS.size(), (color + 2) % game.CARD_ACTIONS.size()])
        game._refresh_ui()
        var slot: int = game.hand_missions.find(color)
        game._use_card(slot)
        check(game.quest_color == game.CARD_TARGETS[color] and game.current_action == game.CARD_ACTIONS[color] and game._hand_size() == 2, "Deck card %d reveals its fixed objective/effect and consumes one card" % color)
        game._advance_feedback(1.0)
        game._confirm_roll()
        if game.rain_active: game._advance_rain(3.0)
        var movement: int = game.current_action
        var draws: int = game.effect_roll_count
        game._launch(Vector2(0, -30))
        game._use_card((slot + 1) % 3)
        check(game._hand_size() == 2 and game.current_action == movement, "Card %d cannot be changed during a shot" % color)
        game._finish_shot()
        check(game.quest_color == game.CARD_TARGETS[color] and game.current_action == movement and game.effect_roll_count == draws and not game.roll_confirm_pending, "Keeping card %d preserves objective and movement without a new draw" % color)
        var next: int = (slot + 1) % 3
        var next_color: int = game.hand_missions[next]
        game._use_card(next)
        game._advance_feedback(1.0)
        game._confirm_roll()
        if game.rain_active: game._advance_rain(3.0)
        check(game.quest_color == game.CARD_TARGETS[next_color] and game.current_action == game.CARD_ACTIONS[next_color] and game._hand_size() == 1, "Spending another card replaces both active objective and movement")
        var right = game.balls[game.CARD_TARGETS[next_color]]
        var wrong = game.balls[(game.CARD_TARGETS[next_color] + 1) % 6]
        game._capture(wrong)
        check(game.score == 5, "Off-objective marble still pays only five base points")
        game._capture(right)
        check(game.score == 65, "Card objective marble pays sixty base points")
        game.goal = 65
        game._finish_shot()
        game._next_round()
        check(game.stage == 2 and not game.quest_active and game.current_action == game.Action.STRAIGHT and game.stock == [1, 1, 1] and game.score == 65, "Next round refills hidden deck, clears objective, restores straight movement and keeps score")
    game._restart()
    for slot in range(3):
        game._use_card(slot)
        if slot == 2:
            check(game.empty_deck_pending and game.empty_deck_notice == 0, "Last card queues notification until card confirmation")
        game._advance_feedback(1.0)
        game._confirm_roll()
        if game.rain_active: game._advance_rain(3.0)
        if slot < 2:
            game._launch(Vector2(0, -30))
            game._finish_shot()
    check(game.empty_deck_notice > 0 and not game.empty_deck_pending, "Last-card confirmation shows one temporary empty-deck notice")
    game._advance_feedback(3.0)
    game._refresh_ui()
    check(game.empty_deck_notice == 0, "Empty-deck notification expires and refresh cannot bring it back")
    game._restart()
    check(game.empty_deck_notice == 0 and not game.empty_deck_pending, "New round clears empty-deck notification state")
    game.queue_free()
    await process_frame
    print("CARD DECK RESULT: ", "ALL TESTS PASSED" if errors == 0 else "%d FAILURES" % errors)
    quit(0 if errors == 0 else 1)
