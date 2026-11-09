extends SceneTree

var game: Node
var errors: int = 0

func _initialize() -> void:
    _run.call_deferred()

func check(ok: bool, message: String) -> void:
    if ok: print("PASS: ", message)
    else:
        push_error("FAIL: " + message)
        errors += 1

func _button(caption: String) -> Button:
    for child in game.front_end.panel.get_children():
        if child is Button and child.visible and not child.is_queued_for_deletion() and child.text == caption: return child
    return null

func _touch(point: Vector2, pressed: bool, index: int = 0) -> void:
    var event := InputEventScreenTouch.new()
    event.index = index
    event.position = root.get_final_transform() * point
    event.pressed = pressed
    Input.parse_input_event(event)
    Input.flush_buffered_events()

func _tap(point: Vector2) -> void:
    _touch(point, true)
    await process_frame
    _touch(point, false)
    await process_frame

func _pull_card(card: Button) -> void:
    var point: Vector2 = card.get_global_transform_with_canvas() * Vector2(card.size.x / 2, 24)
    var before_y: float = card.position.y
    _touch(point, true)
    await process_frame
    var drag := InputEventScreenDrag.new()
    drag.index = 0
    drag.position = root.get_final_transform() * (point - Vector2(0, 105))
    drag.relative = root.get_final_transform().basis_xform(Vector2(0, -105))
    Input.parse_input_event(drag)
    Input.flush_buffered_events()
    await process_frame
    check(card.position.y < before_y - 40, "Native upward pull visibly lifts the chosen card")
    _touch(point - Vector2(0, 105), false)
    await process_frame
    await process_frame

func _run() -> void:
    game = load("res://main.tscn").instantiate()
    root.add_child(game)
    await process_frame
    await process_frame
    var start := _button("START")
    check(start != null, "Main menu exposes Start button")
    print("INPUT CONFIG: emulate mouse=", Input.is_emulating_mouse_from_touch(), " viewport=", root.get_visible_rect(), " final=", root.get_final_transform())
    await _tap(start.get_global_rect().get_center())
    check(game.front_end.screen == "profile", "Android-style touch opens registration through real input pipeline")
    if game.front_end.screen != "profile":
        paused = false
        game.queue_free()
        await process_frame
        quit(1)
        return
    await _tap(game.front_end.name_input.get_global_rect().get_center())
    check(game.front_end.name_input.has_focus(), "Touch focuses registration field for Android keyboard")
    game.front_end.name_input.text = "Touch Player"
    await _tap(_button("SAVE & PLAY").get_global_rect().get_center())
    check(not game.front_end.is_open() and not paused, "Touch saves registration and starts game")
    check(not game.quest_active and game.current_action == game.Action.STRAIGHT, "Native game starts with no objective and straight movement")
    await _tap(game._world_to_screen(game.shooter.position))
    check(not game.aiming and game.shots == 8, "Native aim is blocked until first objective card is drawn")
    var first: Button = game.card_buttons[0]
    await _pull_card(first)
    check(game.quest_active and game._hand_size() == 2 and game.current_action == game.CARD_ACTIONS[game.hand_missions[0]], "Native first draw reveals objective and effect from own deck")
    await create_timer(0.85, true).timeout
    await process_frame
    check(game.roll_confirm_pending and game.roll_confirm_button.visible, "Finished movement roll waits for player acknowledgement")
    var shots_before_confirmation: int = game.shots
    await _tap(game._world_to_screen(game.shooter.position))
    check(not game.aiming and game.shots == shots_before_confirmation, "Touching arena before acknowledgement cannot aim or launch")
    await _tap(game.roll_confirm_button.get_global_transform_with_canvas() * (game.roll_confirm_button.size / 2))
    check(not game.roll_confirm_pending and not game.aiming and game.shots == shots_before_confirmation, "Native touch confirms roll without starting a drag or spending a shot")
    await create_timer(2.4, true).timeout
    var rolls: int = game.effect_roll_count
    var screen_origin: Vector2 = game._world_to_screen(game.shooter.position)
    var before: int = game.shots
    _touch(screen_origin, true)
    await process_frame
    check(game.aiming and game.pointer_id == 0, "Native touch starts aim with its own finger ID")
    var drag := InputEventScreenDrag.new()
    drag.index = 0
    drag.position = root.get_final_transform() * (screen_origin + Vector2(0, 110))
    drag.relative = root.get_final_transform().basis_xform(Vector2(0, 110))
    Input.parse_input_event(drag)
    Input.flush_buffered_events()
    await process_frame
    check(game.aim_vector.length() > 80, "Native drag updates launch force")
    _touch(screen_origin + Vector2(0, 110), false)
    await process_frame
    check(game.shots == before - 1 and game.phase == game.Phase.ROLLING, "Touch release launches exactly once")
    check(game._hand_size() == 2 and game.effect_roll_count == rolls, "Emulated mouse does not duplicate touch action or spend cards")
    game._finish_shot()
    await create_timer(0.85, true).timeout
    await process_frame
    check(not game.roll_confirm_pending and game.effect_roll_count == rolls, "Keeping card does not reroll effect after shot")
    var card: Button = game.card_buttons[1]
    var card_center: Vector2 = card.get_global_transform_with_canvas() * (card.size / 2)
    check(card.position.y > game.layout_height - 180, "Remaining cards stay folded low after the first draw")
    await _pull_card(card)
    check(game._hand_size() == 1 and game.card_drawn_this_shot, "Touch reveals a card through actual GUI handling")
    await _tap(game.menu_button.get_global_transform_with_canvas() * (game.menu_button.size / 2))
    check(game.front_end.screen == "main", "Folded cards cannot intercept native Menu button")
    await process_frame
    await _tap(_button("OPTIONS").get_global_rect().get_center())
    check(game.front_end.screen == "options", "Touch opens Options while gameplay is paused")
    var sliders: Array[HSlider] = []
    for child in game.front_end.panel.get_children():
        if child is HSlider and child.visible: sliders.append(child)
    var slider := sliders[0]
    var slider_start := slider.get_global_rect().position + Vector2(slider.size.x * 0.2, slider.size.y * 0.5)
    var slider_end := slider.get_global_rect().position + Vector2(slider.size.x * 0.9, slider.size.y * 0.5)
    _touch(slider_start, true)
    await process_frame
    var slider_drag := InputEventScreenDrag.new()
    slider_drag.index = 0
    slider_drag.position = root.get_final_transform() * slider_end
    slider_drag.relative = root.get_final_transform().basis_xform(slider_end - slider_start)
    Input.parse_input_event(slider_drag)
    Input.flush_buffered_events()
    await process_frame
    _touch(slider_end, false)
    await process_frame
    check(game.volume_percent >= 80, "Native touch and drag adjust volume slider")
    var effects_before: float = game.volume_percent
    var music_slider := sliders[1]
    await _tap(music_slider.get_global_rect().position + Vector2(music_slider.size.x * 0.25, music_slider.size.y * 0.5))
    check(game.music_volume_percent < 45 and game.volume_percent == effects_before, "Touch adjusts music volume without changing effects")
    await _tap(_button("Background music").get_global_rect().get_center())
    check(not game.music_enabled, "Touch can mute background music")
    await _tap(_button("BACK").get_global_rect().get_center())
    check(game.front_end.screen == "main", "Touch Back returns to main menu")
    var saved_hand: Array = game.hand_missions.duplicate()
    await _tap(_button("CARD COLLECTION").get_global_rect().get_center())
    check(game.front_end.screen == "collection", "Native menu opens collection instead of deck builder")
    var scroll: ScrollContainer
    for child in game.front_end.panel.get_children():
        if child is ScrollContainer: scroll = child
    var first_collection_card: Button = scroll.get_child(0).get_child(0)
    await _tap(first_collection_card.get_global_rect().get_center())
    check(game.front_end.screen == "card" and game.hand_missions == saved_hand, "Native collection inspection cannot select or replace hand cards")
    await _tap(_button("BACK TO COLLECTION").get_global_rect().get_center())
    await _tap(_button("BACK").get_global_rect().get_center())
    check(game.front_end.screen == "main", "Native collection Back returns to main menu")
    DirAccess.remove_absolute(ProjectSettings.globalize_path(game.front_end.storage_path))
    paused = false
    await _tap(_button("NEW RUN").get_global_rect().get_center())
    check(game._is_destruction() and game.balls.size() == 32 and not game.front_end.is_open(), "Native menu starts Destruction mode")
    await _pull_card(game.card_buttons[0])
    await create_timer(0.85, true).timeout
    await _tap(game.roll_confirm_button.get_global_transform_with_canvas() * (game.roll_confirm_button.size / 2))
    check(game.rain_active, "Native opening card confirmation starts marble rain")
    var shooter_point: Vector2 = game._world_to_screen(game.shooter.position)
    _touch(shooter_point, true)
    await process_frame
    _touch(shooter_point, false)
    await process_frame
    check(not game.aiming and game.shots == 8, "Native touch cannot spend a shot during marble rain")
    await _tap(game.menu_button.get_global_transform_with_canvas() * (game.menu_button.size / 2))
    await _tap(_button("NEW RUN").get_global_rect().get_center())
    check(game._is_destruction() and game.balls.size() == 32, "Native new game keeps sole Destruction mode")
    game.shots = 0
    game.goal = 10000
    game._finish_shot()
    check(game.phase == game.Phase.LOST and game.overlay.visible, "Game over displays after failed run")
    var retry: Button
    for child in game.overlay.get_children():
        if child is Button and child.text == "TRY AGAIN": retry = child
    await _tap(retry.get_global_transform_with_canvas() * (retry.size / 2))
    check(game.phase == game.Phase.AIMING and game.score == 0 and not game.overlay.visible, "Native game-over retry starts fresh hidden-card run")
    game.queue_free()
    await process_frame
    print("MOBILE INPUT RESULT: ", "ALL TESTS PASSED" if errors == 0 else "%d FAILURES" % errors)
    quit(0 if errors == 0 else 1)
