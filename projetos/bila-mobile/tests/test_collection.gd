extends SceneTree
var errors := 0
func _initialize() -> void: _run.call_deferred()
func check(ok: bool, message: String) -> void:
    if ok: print("PASS: ", message)
    else:
        push_error("FAIL: " + message)
        errors += 1
func _run() -> void:
    var game = load("res://main.tscn").instantiate()
    root.add_child(game)
    game.front_end.player_name = "Collection QA"
    game.front_end.start_game()
    var frequency: Dictionary = {}
    var valid := true
    for sample in range(500):
        game._deal_hand()
        var unique: Dictionary = {}
        for card_id in game.hand_missions:
            valid = valid and card_id >= 0 and card_id < game.CARD_ACTIONS.size()
            unique[card_id] = true
            frequency[card_id] = int(frequency.get(card_id, 0)) + 1
        valid = valid and unique.size() == 3
    check(valid, "500 hands contain three distinct valid cards from full collection")
    check(frequency.size() == 11, "Every collection card including all new effects can appear")
    var balanced := true
    for count in frequency.values(): balanced = balanced and count > 65 and count < 210
    check(balanced, "Random dealing does not restrict collection to legacy starter cards")
    game._restart()
    check(game.card_buttons.all(func(c): return c.face_down) and not game.quest_active, "Random opening hand keeps all three identities hidden")
    var hand: Array = game.hand_missions.duplicate()
    game.front_end.show_collection()
    check(game.front_end.screen == "collection" and paused, "Collection opens as paused read-only gallery")
    var gallery_count := 0
    for child in game.front_end.panel.get_children():
        if child is ScrollContainer: gallery_count = child.get_child(0).get_child_count()
    check(gallery_count == 11, "Gallery shows all eleven cards")
    game.front_end._show_card_info(9)
    check(game.front_end.screen == "card" and game.hand_missions == hand, "Inspecting card details cannot modify current hand")
    game.front_end._back()
    check(game.front_end.screen == "collection", "Card detail Back returns to collection")
    game.front_end.resume_game()
    var old_storage: String = game.front_end.storage_path
    game.front_end.storage_path = "user://collection-migration-test.cfg"
    var legacy := ConfigFile.new()
    legacy.set_value("player", "name", "Legado")
    legacy.set_value("deck", "order", [0, 1, 2])
    legacy.set_value("options", "volume", 37)
    legacy.save(game.front_end.storage_path)
    game.front_end._load_profile()
    game.front_end._apply_settings()
    check(game.front_end.player_name == "Legado" and game.volume_percent == 37 and game.hand_missions == hand, "Legacy profile preserves player/options without imposing old deck")
    game.front_end._save_profile()
    var saved := ConfigFile.new()
    saved.load(game.front_end.storage_path)
    check(not saved.has_section("deck"), "Profile no longer writes a buildable deck")
    DirAccess.remove_absolute(ProjectSettings.globalize_path(game.front_end.storage_path))
    game.front_end.storage_path = old_storage
    game._use_card(0)
    check(game.run_cards_used == 1, "Revealed card updates run summary counter")
    game._advance_feedback(1)
    game._confirm_roll()
    game._advance_rain(3)
    game._capture(game.balls[0])
    check(game.run_destroyed == 1, "Destroyed marble updates run summary counter once")
    game.shots = 0
    game.goal = 10000
    game._finish_shot()
    check(game.phase == game.Phase.LOST and game.overlay.visible, "Failed goal opens dedicated game-over overlay")
    var retry: Button
    for child in game.overlay.get_children():
        if child is Button and child.text == "TRY AGAIN": retry = child
    check(retry != null, "Game over exposes prominent retry action")
    retry.pressed.emit()
    check(game.stage == 1 and game.score == 0 and game.run_destroyed == 0 and game.run_cards_used == 0 and not game.overlay.visible, "Retry creates fresh run and clears result statistics")
    game.queue_free()
    await process_frame
    print("COLLECTION RESULT: ", "ALL TESTS PASSED" if errors == 0 else "%d FAILURES" % errors)
    quit(0 if errors == 0 else 1)
