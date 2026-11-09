extends SceneTree
var errors := 0
func _initialize() -> void:
    _run.call_deferred()
func check(ok: bool, message: String) -> void:
    if ok: print("PASS: ", message)
    else:
        push_error("FAIL: " + message)
        errors += 1
func steps(count: int) -> void:
    for i in range(count): await physics_frame
func teleport(ball: RigidBody2D, at: Vector2) -> void:
    ball.position = at
    PhysicsServer2D.body_set_state(ball.get_rid(), PhysicsServer2D.BODY_STATE_TRANSFORM, Transform2D(0, at))
func _run() -> void:
    var game = load("res://main.tscn").instantiate()
    root.add_child(game)
    game.front_end.player_name = ""
    game.front_end.start_game(game.GameMode.DESTRUCTION)
    check(game.front_end.screen == "profile" and game.front_end.requested_mode == game.GameMode.DESTRUCTION, "Destruction choice survives registration prompt")
    game.front_end.player_name = "Destruction QA"
    game.front_end.start_game()
    check(game._is_destruction() and game.balls.size() == 32 and game.shots == 8 and game.goal == 180, "Destruction starts with thirty-two two-hit marbles, eight shots and cumulative 180 goal")
    check(game.obstacles.size() >= 1 and game.obstacles.size() <= 3 and game.balls.all(func(b): return b.destructible), "Destruction uses variable obstacles and destructible targets")
    check(not game.quest_active and game.hand_expanded, "Destruction starts with hidden deck awaiting a card")
    check(game.rain_pending and not game.rain_active and game.balls.all(func(b): return not b.visible and b.freeze), "Targets remain hidden and frozen until opening card is confirmed")
    var planned: Array[Vector2] = []
    var varied := true
    for ball in game.balls:
        varied = varied and game.world_board.grow(-45).has_point(ball.position) and ball.position.distance_to(game.HOME) >= 160
        for previous in planned: varied = varied and previous.distance_to(ball.position) >= 60
        planned.append(ball.position)
    check(varied, "Random landing positions respect field edges, player spawn and other marbles")
    game._use_card(0)
    game._advance_feedback(1.0)
    check(not game.rain_active and game.opening_focus, "Opening focus and hidden field remain until card confirmation")
    game._confirm_roll()
    check(game.rain_active and not game.opening_focus and game.shots == 8, "Confirming first card starts rain without consuming a shot")
    game._begin_aim(game.shooter.position, 0)
    game._launch(Vector2(0, -100))
    check(not game.aiming and game.phase == game.Phase.AIMING and game.shots == 8, "Player cannot aim or launch while targets are falling")
    await steps(80)
    check(game.rain_active and game.balls.any(func(b): return b.visible and b.drop_height > 0), "Staggered falling animation shows marbles descending above landing points")
    game.front_end.show_main()
    var paused_rain: float = game.rain_elapsed
    await process_frame
    await process_frame
    check(game.rain_elapsed == paused_rain, "Menu pause preserves falling animation timing")
    game.front_end.resume_game()
    await steps(230)
    check(not game.rain_active and not game.rain_pending and game.balls.all(func(b): return b.visible and b.drop_height == 0 and b.hits_taken == 0), "Rain completes with all marbles landed and no free damage")
    check(game.score == 0 and game.shots == 8, "Landing scatter gives no points and spends no shots")
    var spread := false
    for i in range(planned.size()):
        if game.balls[i].position.distance_to(planned[i]) > 10: spread = true
    check(spread, "Landing impulses physically spread marbles before play starts")
    var target = game.balls[0]
    teleport(target, Vector2(80, 350))
    await steps(3)
    check(not target.captured and game.score == 0, "Leaving old triangle area does not score or destroy in Destruction")
    game.set_physics_process(false)
    for ball in game.balls:
        if ball != target:
            ball.freeze = true
            ball.collision_layer = 0
            ball.collision_mask = 0
    var clear_terrain: Array[Dictionary] = []
    game.shooter.terrain = clear_terrain
    target.terrain = clear_terrain
    game._set_quest(0, "TEST")
    teleport(target, Vector2(360, 700))
    teleport(game.shooter, Vector2(360, 800))
    await steps(2)
    game.current_action = game.Action.STRAIGHT
    game._launch(Vector2(0, -80))
    await steps(30)
    check(target.hits_taken == 1 and not target.captured and game.score == 0, "First real physics collision cracks target without awarding points")
    game._destruction_impact(target, game.shooter)
    check(target.hits_taken == 1, "Duplicate callback from same collision cannot inflict second hit")
    game._collision(game.walls, target)
    check(target.hits_taken == 1, "Wall collision cannot damage target")
    game._finish_shot()
    game.clock_time += 1.0
    teleport(game.shooter, target.position + Vector2(0, 100))
    await steps(2)
    game._launch(Vector2(0, -80))
    await steps(32)
    check(target.hits_taken == 2 and target.captured and game.score == 60, "Second real physics impact bursts target and pays mission score once")
    game._destruction_impact(game.shooter, target)
    check(game.score == 60, "Destroyed target cannot pay twice")
    var first = game.balls[1]
    var second = game.balls[2]
    first.linear_velocity = Vector2(200, 0)
    second.linear_velocity = Vector2(-200, 0)
    game._destruction_impact(first, second)
    check(first.hits_taken == 1 and second.hits_taken == 1, "Marble-to-marble collision damages both and permits chain reactions")
    game.score = game.goal
    game._finish_shot()
    check(game.phase == game.Phase.REWARD, "Reaching Destruction target unlocks next level")
    game._next_round()
    check(game.stage == 2 and game.balls.size() == 36 and game.goal == 480 and game.score == 180, "Next level raises target and marble count while preserving score")
    check(not game.quest_active and game.stock == [1, 1, 1] and game.hand_expanded and game.rain_pending and game.balls.all(func(b): return not b.visible), "Next level refills and opens hidden deck")
    game.stage = 3
    game._start_round()
    game.score = game.goal
    game._check_round_goal()
    check(game.phase == game.Phase.REWARD, "Destruction does not finish at classic third round")
    game._next_round()
    check(game.stage == 4 and game.goal == 1440, "Destruction supports levels beyond three with increasing cumulative goals")
    game.stage = 20
    game._start_round()
    check(game.balls.size() == 56 and game.shots == 12, "Late-level marble and shot counts stay capped for mobile")
    game.front_end.start_game(game.GameMode.CLASSIC)
    check(game._is_destruction() and game.balls.size() == 32 and game.goal == 180, "New game always starts the sole Destruction mode")
    game.queue_free()
    await process_frame
    print("DESTRUCTION RESULT: ", "ALL TESTS PASSED" if errors == 0 else "%d FAILURES" % errors)
    quit(0 if errors == 0 else 1)
