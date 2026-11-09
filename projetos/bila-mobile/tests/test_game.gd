extends SceneTree

var game: Node
var errors: int = 0

func _initialize() -> void:
    _run.call_deferred()

func check(condition: bool, message: String) -> void:
    if condition:
        print("PASS: ", message)
    else:
        push_error("FAIL: " + message)
        errors += 1

func _run() -> void:
    game = load("res://main.tscn").instantiate()
    root.add_child(game)
    var menu = game.front_end
    check(menu.is_open() and paused and menu.screen == "main", "Boot opens main menu with gameplay paused")
    menu.start_game()
    check(menu.screen == "profile" and paused, "Start asks for local registration when profile is missing")
    check(not menu.register_player(" ") and not menu.register_player("A"), "Registration rejects blank and short names")
    menu.name_input.text = "  Lévy  "
    menu._submit_profile()
    check(menu.player_name == "Lévy" and not paused and not menu.is_open(), "Saving valid registration starts game")
    var config := ConfigFile.new()
    check(config.load(menu.storage_path) == OK and config.get_value("player", "name") == "Lévy", "Registration persists in local profile file")
    menu.show_options()
    menu.set_sound(false)
    menu.set_volume(35)
    menu.set_trajectory(false)
    menu.set_music(false)
    menu.set_music_volume(25)
    check(not game.music_enabled and game.music_volume_percent == 25, "Music toggle and independent volume apply immediately")
    check(game.music.stream is AudioStreamWAV and game.music.stream.loop_mode == AudioStreamWAV.LOOP_FORWARD and game.music.stream.get_length() > 15, "Original music stream is loaded with a full-length loop")
    check(game.music.process_mode == Node.PROCESS_MODE_ALWAYS, "Background music remains active while menu pauses gameplay")
    check(is_equal_approx(game._shot_velocity(Vector2(0, -170), game.Action.STRAIGHT).length(), 1836.0), "Maximum launch velocity includes additional twenty percent strength")
    check(game._shot_velocity(Vector2(0, -170), game.Action.BOUNCE).y == -1836.0, "Hopping launch follows aim with full strength")
    check(not game.sound_enabled and game.volume_percent == 35 and not game.show_trajectory, "Options affect sound, volume and aiming trajectory")
    menu.player_name = ""
    menu.volume = 90
    menu.show_trajectory = true
    game.music_enabled = true
    game.music_volume_percent = 100
    menu._load_profile()
    menu._apply_settings()
    check(menu.player_name == "Lévy" and menu.volume == 35 and not menu.show_trajectory, "Profile and preferences survive reload from disk")
    check(not game.music_enabled and game.music_volume_percent == 25, "Music preferences survive reload independently of effects")
    check(not menu._valid_order([0, 0, 2]) and not menu._valid_order([0, 1]) and not menu._valid_order("bad"), "Deck rejects duplicates, missing cards and corrupt types")
    menu.show_deck()
    menu._select_deck_card(0)
    menu._move_card(1)
    check(menu.deck_order == [1, 0, 2] and game.deck_order == [1, 0, 2], "Deck manager changes actual order of hand")
    menu._reset_order()
    check(game.deck_order == [0, 1, 2], "Deck order can be restored")
    menu.show_exit()
    check(menu.screen == "exit" and paused, "Exit presents confirmation without ending game")
    menu._back()
    menu.resume_game()
    check(not paused and not menu.is_open(), "Continue closes menu and resumes gameplay")
    menu._notification(Node.NOTIFICATION_WM_CLOSE_REQUEST)
    check(menu.screen == "exit" and paused, "Desktop window close opens exit confirmation")
    menu._back()
    menu.resume_game()
    menu.set_trajectory(true)
    check(not game.quest_active and game.current_action == game.Action.STRAIGHT and not game.roll_confirm_pending, "Round starts without mission and with straight movement")
    check(game.card_buttons.all(func(card): return card.face_down and not card.disabled), "Own deck starts hidden and ready for first draw")
    game._begin_aim(game.shooter.position, 0)
    game._launch(Vector2(0, -170))
    check(not game.aiming and game.shots == 5, "First objective card is required before aiming or launching")
    game._use_card(0)
    check(game.quest_active and game.quest_color == game.hand_missions[0] and game.current_action == game.CARD_ACTIONS[game.quest_color], "First hidden card supplies its own objective and movement")
    var rolled: int = game.effect_roll_count
    var shots_before_roll: int = game.shots
    game._begin_aim(game.shooter.position, 0)
    game._use_card(0)
    game._launch(Vector2(0, -170))
    check(not game.aiming and game._hand_size() == 2 and game.shots == shots_before_roll, "Roll animation blocks aiming, card reveal and launch")
    game._advance_feedback(0.2)
    check(game.roll_remaining > 0 and game.roll_tick >= 0 and game.effect_roll_count == rolled, "Roll cycles visual choices without drawing another result")
    game._advance_feedback(0.5)
    check(game.roll_remaining == 0 and game.roll_display_action == game.current_action and game.roll_flash > 0, "Quick animation resolves to actual preselected movement")
    check(game.roll_confirm_pending and game.roll_confirm_button.visible and game.card_buttons.all(func(card): return card.disabled), "Roll result remains visible and cards locked until confirmation")
    game._advance_feedback(4.0)
    game._begin_aim(game.shooter.position, -1)
    game._launch(Vector2(0, -100))
    check(game.roll_confirm_pending and not game.aiming and game.shots == shots_before_roll, "Waiting for confirmation never times out and cannot spend a shot")
    game._confirm_roll()
    check(not game.roll_confirm_pending and not game.roll_confirm_button.visible and game.card_drawn_this_shot, "Confirmation dismisses result while preserving one-card-per-shot rule")
    game._restart()
    await physics_frame
    check(game.balls.size() == 6 and game.shots == 5 and game.goal == 60, "Round starts with five shots and strategic score goal")
    check(ProjectSettings.get_setting("display/window/stretch/aspect") == "expand", "Viewport expands to use full device aspect ratio")
    check(root.get_final_transform().origin.length() < 0.1, "Expanded viewport has no letterbox offset")
    check(game.world_zoom <= 0.52 and game.HOME.y > 1000, "Camera and starting distance are farther away")
    check(game.board_screen.has_point(game._world_to_screen(game.HOME)), "Distant shooter still starts inside visible arena")
    check(game.sound_button.position.y == game.layout_height - 64, "Bottom controls follow device height")
    check(game.board_screen.position.y == game.safe_top + 188, "Compact mission ribbon adds 104 logical pixels to arena")
    var restart_found := false
    for child in game.ui_layer.get_child(0).get_children():
        if child is Button and child.text == "RESTART": restart_found = true
    check(not restart_found, "Restart button removed from game HUD")
    check(game.effect_roll_count == 0 and game.current_action == game.Action.STRAIGHT, "First shot has no automatic effect draw")
    var composition: Array = game.hand_missions.duplicate()
    composition.sort()
    check(composition == [0, 1, 2] and game.stock == [1, 1, 1], "Hidden hand contains the configured mission colors")
    check(game.card_buttons.all(func(card): return card.face_down), "Mission cards are concealed")
    check(not game.quest_active and game.quest_target == 0, "No automatic objective is generated outside the deck")
    check(not game._fully_outside(Vector2(360, 500), 21), "Inside target does not score")
    check(not game._fully_outside(Vector2(360, 700), 21), "Partly crossing target does not score")
    check(game._fully_outside(Vector2(360, 720), 21), "Fully cleared target can score")
    game.shooter.position = Vector2(360, 500)
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.shooter.position == Vector2(360, 500), "Shooter stays inside triangle where it stopped")
    game.shooter.position = Vector2(360, 690)
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.shooter.position == Vector2(360, 690), "Shooter stays on chalk line where it stopped")
    var bottom_hud := Vector2(game.view_size.x / 2, game.safe_top + game.layout_height - 40)
    game.shooter.position = game._screen_to_world(Vector2(game.view_size.x / 2, game.board_screen.end.y - 25))
    game._begin_aim(game._screen_to_world(bottom_hud), 0)
    check(not game.aiming, "Touching HUD cannot grab shooter near arena edge")
    game.shooter.position = Vector2(80, 520)
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.shooter.position == Vector2(80, 520), "Shooter outside also keeps its exact position")
    var point := Vector2(180, 500)
    check(game._screen_to_world(game._world_to_screen(point)).distance_to(point) < 0.1, "Camera preserves touch mapping")
    game._restart()
    game._advance_feedback(1.0)
    game._confirm_roll()
    game.current_action = game.Action.STRAIGHT
    if not game.quest_active: game._set_quest(0, "TEST")
    game._launch(Vector2(0, -170))
    # This test isolates launch/pause physics from independently tested terrain.
    var clear_terrain: Array[Dictionary] = []
    game.shooter.terrain = clear_terrain
    var before_pause: Vector2 = game.shooter.position
    var rolls: int = game.effect_roll_count
    menu.show_main()
    await process_frame
    await process_frame
    check(game.shooter.position == before_pause and paused, "Menu freezes a moving shot")
    menu.resume_game()
    check(game.phase == game.Phase.ROLLING and game.effect_roll_count == rolls, "Resume does not redraw movement")
    for i in range(1400):
        await physics_frame
        if game.phase != game.Phase.ROLLING: break
    check(game.shooter.position.y < game.HOME.y - 250 and game.shooter.position != game.HOME, "Distant physical shot advances shooter without resetting it")
    game._restart()
    game._advance_feedback(1.0)
    game._confirm_roll()
    var target = game.balls[0]
    for ball in game.balls:
        if ball != target:
            ball.captured = true
            ball.freeze = true
            ball.collision_layer = 0
            ball.collision_mask = 0
            ball.visible = false
    target.position = Vector2(360, 650)
    game.shooter.position = Vector2(360, 590)
    game._set_quest(target.color_index, "TEST")
    game.current_action = game.Action.STRAIGHT
    await physics_frame
    if not game.quest_active: game._set_quest(0, "TEST")
    game._launch(Vector2(0, 80))
    for i in range(1400):
        await physics_frame
        if game.phase != game.Phase.ROLLING: break
    check(game.score == 60 and game.quest_progress == 1, "Real collision knocks quest target out and awards 60 points")
    game._restart()
    game._advance_feedback(1.0)
    game._confirm_roll()
    var card_color: int = game.hand_missions[0]
    var movement: int = game.current_action
    var drawn: int = game.effect_roll_count
    game._use_card(0)
    check(game.mission_flash > 0, "Mission change produces visible feedback")
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.quest_color == card_color and game.quest_origin == "CARD OBJECTIVE", "Revealed card changes active mission")
    check(game.current_action == game.CARD_ACTIONS[card_color] and game.effect_roll_count == drawn + 1, "Card changes objective and movement together")
    check(game.stock[0] == 0 and game._hand_size() == 2 and not game.card_buttons[0].face_down, "Card is spent and revealed immediately")
    game._use_card(1)
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.selected == 0 and game._hand_size() == 2, "One mission reveal per shot")
    game._begin_aim(game.shooter.position, 4)
    game._release_aim(game.shooter.position + Vector2(0, 5))
    check(game.shots == 5 and game.selected == 0 and game.quest_color == card_color, "Cancelled drag retains chosen mission without spending a shot")
    var hand_before: Array = game.hand_missions.duplicate()
    menu.show_deck()
    menu._select_deck_card(0)
    menu._replace_color(4)
    check(game.deck_order == [4, 1, 2] and game.hand_missions == hand_before, "Deck edits change next refill, not current concealed cards")
    menu._reset_order()
    menu.resume_game()
    if not game.quest_active: game._set_quest(0, "TEST")
    game._launch(Vector2(0, -30))
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.quest_color == card_color and game._hand_size() == 2, "Mission persists after shot without charging card again")
    game._use_card(1)
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.quest_color == game.hand_missions[1] and game.quest_color != card_color, "Next revealed card can change mission again")
    var wrong = game.balls[0]
    for ball in game.balls:
        if ball.color_index != game.quest_color:
            wrong = ball
            break
    game._capture(wrong)
    game._capture(wrong)
    check(game.score == 5 and game.quest_progress == 0, "Wrong color awards only 5 points and cannot score twice")
    var correct = game.balls[0]
    for ball in game.balls:
        if not ball.captured and ball.color_index == game.quest_color:
            correct = ball
            break
    game._capture(correct)
    check(game.score == 65 and game.quest_progress == 1 and game.quest_points == 60, "Current mission color awards 60 points instead of 5")
    game._capture(correct)
    check(game.score == 65, "Quest payout cannot be collected twice")
    check(game.score_flash > 0 and not game.impact_rings.is_empty() and not game.floaters.is_empty(), "Scoring produces pulses, floating numbers and HUD feedback")
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.phase == game.Phase.REWARD, "Mission points advance round once goal is met")
    game._next_round()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.stage == 2 and game.goal == 240 and game.stock == [1, 1, 1], "Next round raises cumulative goal and restores mission deck")
    check(game.score == 65 and game.total_score == 65, "Previous stage points remain in cumulative balance")
    check(game.card_buttons.all(func(card): return card.face_down) and game.quest_progress == 0, "New mission and concealed hand start next round")
    var unavailable: int = game.hand_missions[0]
    for ball in game.balls:
        if ball.color_index == unavailable: game._capture(ball)
    game._use_card(0)
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.quest_target == 0 and game.quest_color == unavailable and not game.quest_completed, "Exhausted card keeps its actual deck objective without inventing a replacement")
    game._restart()
    game._advance_feedback(1.0)
    game._confirm_roll()
    game.stage = 2
    game._start_round()
    game._advance_feedback(1.0)
    game._confirm_roll()
    game._set_quest(0, "TEST")
    game._capture(game.balls[1])
    game._capture(game.balls[0])
    game._capture(game.balls[6])
    check(game.score == 125 and game.quest_progress == 2 and game.quest_points == 120, "Multiple mission targets pay 60 each, other color only 5")
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.phase == game.Phase.AIMING and game.total_score == 125, "Cumulative second-stage goal requires more than 125 points")
    game._set_quest(2, "TEST")
    game._capture(game.balls[2])
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.score == 185 and game.score_multiplier == 2, "Clean mission enables multiplier for following points")
    game._set_quest(3, "TEST")
    game._capture(game.balls[3])
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.score == 305 and game.phase == game.Phase.REWARD, "Following mission uses multiplier and reaches cumulative goal")
    game._next_round()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.stage == 3 and game.goal == 600 and game.score == 305, "Final stage preserves score and uses higher cumulative goal")
    game._set_quest(5, "TEST")
    for ball in game.balls: game._capture(ball)
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.score == 590 and game.phase == game.Phase.LOST and game.score_multiplier == 1, "Wrong colors break streak and cannot brute-force final cumulative goal")
    game._restart()
    game._advance_feedback(1.0)
    game._confirm_roll()
    game.current_action = game.Action.CURVE
    if not game.quest_active: game._set_quest(0, "TEST")
    game._launch(Vector2(0, -120))
    await physics_frame
    for i in range(18): await physics_frame
    check(game.shooter.linear_velocity.x > 20, "Automatic curved movement still bends physical trajectory")
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    game.set_physics_process(false)
    game.shooter.terrain = clear_terrain
    await physics_frame
    await physics_frame
    game.shooter.position = game.HOME
    PhysicsServer2D.body_set_state(game.shooter.get_rid(), PhysicsServer2D.BODY_STATE_TRANSFORM, Transform2D(0, game.HOME))
    var hop_target = game.balls[0]
    hop_target.position = game.HOME + Vector2(0, -120)
    PhysicsServer2D.body_set_state(hop_target.get_rid(), PhysicsServer2D.BODY_STATE_TRANSFORM, Transform2D(0, game.HOME + Vector2(0, -120)))
    hop_target.linear_velocity = Vector2.ZERO
    await physics_frame
    await physics_frame
    game.current_action = game.Action.BOUNCE
    if not game.quest_active: game._set_quest(0, "TEST")
    game._launch(Vector2(0, -100))
    for i in range(28): await physics_frame
    check(game.shooter.airborne and game.shooter.hop_height > 12, "Hopping marble rises and disables target collisions while airborne")
    check(hop_target.linear_velocity.length() < 1 and game.shooter.position.y < hop_target.position.y, "Airborne marble physically passes over a target without pushing it")
    for i in range(18): await physics_frame
    check(not game.shooter.airborne and game.shooter.collision_layer == 1 and game.shooter.collision_mask == 3, "Landing restores target and wall collisions")
    hop_target.position = Vector2(360, 408)
    game.set_physics_process(true)
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    game._restart()
    game._advance_feedback(1.0)
    game._confirm_roll()
    game.current_action = game.Action.HEAVY
    if not game.quest_active: game._set_quest(0, "TEST")
    game._launch(Vector2(0, -100))
    check(is_equal_approx(game.shooter.mass, 2.8) and is_equal_approx(game.shooter.linear_damp, 2.3) and game.shooter.linear_velocity.y < 0, "Heavy shot has greater physical mass, stronger damping and follows aim")
    check(game._shot_velocity(Vector2(0, -170), game.Action.HEAVY).length() < 1836, "Heavy shot trades range for impact")
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.shooter.mass == 1.25 and game.shooter.hop_elapsed < 0 and not game.shooter.heavy, "Shot end clears movement-specific physics")
    game.stage = 3
    game._start_round()
    game._advance_feedback(1.0)
    game._confirm_roll()
    game.score = game.goal
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.phase == game.Phase.WON, "Final goal completes run")
    game._restart()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.total_score == 0 and game.effect_roll_count == 0 and not game.quest_active and game.quest_points == 0, "New run resets scores, quest and movement count")
    game.shots = 0
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.phase == game.Phase.LOST, "No shots below goal ends run")
    DirAccess.remove_absolute(ProjectSettings.globalize_path(menu.storage_path))
    game.queue_free()
    await process_frame
    print("RESULT: ", "ALL TESTS PASSED" if errors == 0 else "%d FAILURES" % errors)
    quit(0 if errors == 0 else 1)
