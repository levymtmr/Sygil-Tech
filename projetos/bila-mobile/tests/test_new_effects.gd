extends SceneTree
var game: Node
var errors := 0
func _initialize() -> void: _run.call_deferred()
func check(ok: bool, label: String) -> void:
    if ok: print("PASS: ", label)
    else:
        push_error("FAIL: " + label)
        errors += 1
func steps(count: int) -> void:
    for i in range(count): await physics_frame
func place(ball: RigidBody2D, at: Vector2) -> void:
    ball.position = at
    PhysicsServer2D.body_set_state(ball.get_rid(), PhysicsServer2D.BODY_STATE_TRANSFORM, Transform2D(0, at))
func setup() -> void:
    if game.phase == game.Phase.ROLLING: game._finish_shot()
    game._restart()
    game.rain_pending = false
    game.opening_focus = false
    game._set_quest(0, "TEST")
    var empty: Array[Dictionary] = []
    game.shooter.terrain = empty
    for ball in game.balls:
        ball.visible = true
        ball.terrain = empty
        ball.collision_layer = 0
        ball.collision_mask = 0
func _run() -> void:
    game = load("res://main.tscn").instantiate()
    root.add_child(game)
    game.front_end.player_name = "Effects QA"
    game.front_end.start_game()
    check(game._is_destruction() and game.game_mode == game.GameMode.DESTRUCTION, "Default game is Destruction")
    var has_old_mode := false
    for child in game.front_end.panel.get_children():
        if child is Button and child.text == "DESTRUCTION": has_old_mode = true
    check(not has_old_mode, "Menu has no redundant mode-selection button")
    check(game.CARD_NAMES.size() == 11 and game.CARD_COLORS.size() == 11, "Eleven effects have names and shared player/icon colors")
    check(is_equal_approx(game._shot_velocity(Vector2(0, -170), game.Action.STRAIGHT).length(), 1836), "Base maximum force remains 1836")
    setup()
    game.hand_missions.assign([6, 7, 8])
    game._refresh_ui()
    game._use_card(game.hand_missions.find(6))
    check(game.current_action == game.Action.GIANT and game.shooter.radius == 56 and game.shooter.get_child(0).shape.radius == 56, "Giant card enlarges visible body and collision shape before launch")
    game._advance_feedback(1)
    game._confirm_roll()
    game._advance_rain(3)
    game._launch(Vector2(0, -60))
    check(is_equal_approx(game.shooter.mass, 6.0), "Giant shot has greater physical mass")
    game._finish_shot()
    check(game.shooter.radius == 56, "Giant size remains while that card stays active")
    setup()
    var previous_radius: float = game.shooter.radius
    game.current_action = game.Action.PIERCING
    for i in range(3):
        var target = game.balls[i]
        place(target, Vector2(360, 700 + i * 100))
        target.collision_layer = 1
        target.collision_mask = 3
    place(game.shooter, Vector2(360, 1000))
    await steps(2)
    game._launch(Vector2(0, -120))
    await steps(54)
    check(game.shooter.collision_layer == 0 and game.shooter.collision_mask == 2 and game.shooter.radius == 18, "Piercing body is smaller and ignores physical target collisions")
    check(game.balls[0].hits_taken == 1 and game.balls[1].hits_taken == 1 and game.balls[2].hits_taken == 1, "Piercing physically crosses and damages multiple targets once each")
    game._advance_special(0.01)
    check(game.balls[0].hits_taken == 1, "Piercing cannot repeat free damage on same target during one shot")
    setup()
    game.current_action = game.Action.MAGNET
    place(game.shooter, Vector2(360, 950))
    var attracted = game.balls[0]
    place(attracted, Vector2(460, 950))
    await steps(2)
    game._launch(Vector2(0, -80))
    attracted.linear_velocity = Vector2.ZERO
    game._advance_special(0.1)
    check(attracted.linear_velocity.x < 0 and attracted.hits_taken == 0, "Magnet pulls nearby target toward player without awarding damage directly")
    setup()
    game.current_action = game.Action.EXPLOSIVE
    for i in range(3):
        var target = game.balls[i]
        place(target, Vector2(360 if i == 0 else (440 if i == 1 else 950), 700))
        target.collision_layer = 1
        target.collision_mask = 3
    place(game.shooter, Vector2(360, 800))
    await steps(2)
    game._launch(Vector2(0, -100))
    await steps(24)
    check(game.blast_used and game.balls[1].hits_taken >= 1 and game.balls[2].hits_taken == 0, "First explosive collision causes bounded area damage and leaves far targets intact")
    setup()
    game.active_action = game.Action.HEAVY
    game.shooter.linear_velocity = Vector2(200, 0)
    game._destruction_impact(game.shooter, game.balls[0])
    check(game.balls[0].captured, "Heavy impact destroys a fresh two-hit target")
    check(game._shot_velocity(Vector2(0, -170), game.Action.HEAVY).length() < 1836, "Heavy preserves reduced launch range")
    setup()
    for i in range(game.balls.size()): place(game.balls[i], Vector2(2000 + i * 60, 2000))
    place(game.balls[0], Vector2(400, 700))
    place(game.balls[1], Vector2(560, 700))
    place(game.balls[2], Vector2(800, 700))
    await steps(2)
    game.balls[1].freeze = false
    game._explode(Vector2(360, 700))
    await steps(2)
    check(game.balls[0].captured and game.balls[1].hits_taken == 1 and game.balls[1].linear_velocity.x > 0 and game.balls[2].hits_taken == 0, "Blast destroys center, cracks and scatters outer targets, respects radius")
    setup()
    game.active_action = game.Action.GIANT
    game.shooter.set_size(56)
    place(game.shooter, Vector2(360, 800))
    for i in range(game.balls.size()): place(game.balls[i], Vector2(2000 + i * 60, 2000))
    place(game.balls[0], Vector2(300, 750))
    place(game.balls[1], Vector2(420, 750))
    place(game.balls[2], Vector2(500, 750))
    await steps(2)
    game.last_shooter_position = Vector2(360, 700)
    game._advance_special(0.01)
    game._advance_special(0.01)
    check(game.balls[0].hits_taken == 1 and game.balls[1].hits_taken == 1 and game.balls[2].hits_taken == 0, "Giant wide sweep hits both sides once and respects its boundary")
    setup()
    game.active_action = game.Action.FROST
    game.shooter.linear_velocity = Vector2(300, 0)
    game.balls[0].linear_velocity = Vector2(100, 0)
    game._destruction_impact(game.shooter, game.balls[0])
    check(game.balls[0].frost_remaining > 2 and game.balls[0].linear_velocity.length() <= 25, "Frost slows struck target and activates ice animation")
    game.balls[0].advance_visuals(3)
    check(game.balls[0].frost_remaining == 0, "Frost status expires")
    setup()
    for i in range(game.balls.size()): place(game.balls[i], Vector2(2000 + i * 60, 2000))
    for i in range(5): place(game.balls[i], Vector2(200 + i * 150, 700))
    await steps(2)
    game.active_action = game.Action.LIGHTNING
    game.shooter.linear_velocity = Vector2(300, 0)
    game._destruction_impact(game.shooter, game.balls[0])
    check(game.balls[0].hits_taken == 1 and game.balls[3].hits_taken == 1 and game.balls[4].hits_taken == 0 and game.lightning_arcs.size() == 3, "Lightning chains through four distinct targets with visible arcs")
    game._advance_feedback(1)
    check(game.lightning_arcs.is_empty(), "Lightning arcs expire")
    setup()
    game.active_action = game.Action.REPULSOR
    place(game.shooter, Vector2(360, 700))
    place(game.balls[0], Vector2(460, 700))
    await steps(2)
    game.shooter.linear_velocity = Vector2(200, 0)
    game.balls[0].linear_velocity = Vector2.ZERO
    game._advance_special(0.1)
    check(game.balls[0].linear_velocity.x > 0 and game.balls[0].hits_taken == 0, "Repulsor pushes outward without free damage")
    setup()
    game.current_action = game.Action.RICOCHET
    place(game.shooter, Vector2(game.world_board.end.x - 100, 1000))
    await steps(2)
    game._launch(Vector2(100, 0))
    await steps(30)
    check(game.shooter.linear_velocity.x < 0 and is_equal_approx(game.shooter.physics_material_override.bounce, 0.98), "Ricochet physically rebounds from arena wall with high restitution")
    game._finish_shot()
    check(is_equal_approx(game.shooter.physics_material_override.bounce, 0.72) and game.shooter.collision_mask == 3, "Shot end resets special collision settings")
    setup()
    game.goal = 100000
    var expected := 0
    for color in range(2):
        game._set_quest(color, "TEST")
        var factor: int = game.score_multiplier
        for ball in game.balls:
            if ball.color_index == color:
                game._capture(ball)
                expected += 60 * factor
        game._finish_shot()
        check(game.score == expected and game.score_multiplier == color + 2, "Consecutive complete missions preserve cumulative score and next-shot multiplier")
    game._set_quest(3, "TEST")
    game._capture(game.balls[2])
    game._finish_shot()
    check(game.score_multiplier == 1 and game.score == expected + 15, "Off-objective payout stays low and breaks streak")
    game.queue_free()
    await process_frame
    print("NEW EFFECTS RESULT: ", "ALL TESTS PASSED" if errors == 0 else "%d FAILURES" % errors)
    quit(0 if errors == 0 else 1)
