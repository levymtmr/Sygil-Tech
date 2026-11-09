extends SceneTree

const Marble = preload("res://scripts/marble.gd")
var errors := 0

func _initialize() -> void:
    _run.call_deferred()

func check(ok: bool, message: String) -> void:
    if ok: print("PASS: ", message)
    else:
        push_error("FAIL: " + message)
        errors += 1

func make_ball(terrain: Array[Dictionary], jumping: bool = false, origin: Vector2 = Vector2.ZERO) -> RigidBody2D:
    var ball := Marble.new()
    ball.position = origin
    ball.shooter = true
    ball.terrain = terrain
    root.add_child(ball)
    ball.start_hops(jumping)
    return ball

func wait_steps(count: int) -> void:
    for i in range(count): await physics_frame

func _run() -> void:
    var sand: Array[Dictionary] = [{"kind": "sand", "p": Vector2(150, 0), "extent": Vector2(110, 55)}]
    var normal = make_ball([], false, Vector2(0, 200))
    var sandy = make_ball(sand)
    await wait_steps(2)
    normal.linear_velocity = Vector2(1200, 0)
    sandy.linear_velocity = Vector2(1200, 0)
    await wait_steps(48)
    check(sandy.position.x < normal.position.x - 60 and sandy.linear_velocity.length() < normal.linear_velocity.length(), "Sand mound physically reduces speed and travel distance")
    normal.free()
    sandy.free()
    var hole: Array[Dictionary] = [{"kind": "hole", "p": Vector2(110, 0), "radius": 46.0}]
    var caught = make_ball(hole)
    await wait_steps(2)
    caught.linear_velocity = Vector2(1200, 0)
    await wait_steps(38)
    check(caught.trapped and caught.position.distance_to(hole[0].p) < 1 and caught.linear_velocity.length() < 1, "Hole catches a fast ground shot at its center")
    caught.release_trap()
    caught.sleeping = false
    caught.linear_velocity = Vector2(1000, 0)
    await wait_steps(34)
    check(not caught.trapped and caught.position.x > 210 and caught.ignored_hole == -1, "Next launch can leave hole and clears escape immunity after exit")
    caught.linear_velocity = Vector2(-1200, 0)
    await wait_steps(36)
    check(caught.trapped, "Returning to a hole after escaping can trap marble again")
    caught.free()
    var jumper = make_ball(hole, true)
    await wait_steps(2)
    jumper.linear_velocity = Vector2(1200, 0)
    await wait_steps(30)
    check(not jumper.trapped and jumper.position.x > 180, "Hopping shot passes over hole while airborne")
    jumper.free()
    var sand_jumper = make_ball(sand, true)
    await wait_steps(2)
    sand_jumper.linear_velocity = Vector2(1200, 0)
    await wait_steps(28)
    check(not sand_jumper.on_sand and sand_jumper.position.x > 200, "Hopping shot ignores sand friction while above mound")
    sand_jumper.free()
    var game = load("res://main.tscn").instantiate()
    root.add_child(game)
    game.front_end.player_name = "Obstacles QA"
    game.front_end.start_game()
    game._advance_feedback(1.0)
    game._confirm_roll()
    var valid_layouts := true
    var distinct: Dictionary = {}
    var compositions: Dictionary = {}
    var regions: Dictionary = {}
    var count_total := 0
    var triples := 0
    for sample in range(500):
        game._make_obstacles()
        var sands := 0
        var holes := 0
        valid_layouts = valid_layouts and game.obstacles.size() >= 1 and game.obstacles.size() <= 3
        count_total += game.obstacles.size()
        if game.obstacles.size() == 3: triples += 1
        for i in range(game.obstacles.size()):
            var obstacle: Dictionary = game.obstacles[i]
            if obstacle.kind == "sand": sands += 1
            else: holes += 1
            var relative: Vector2 = (obstacle.p - game.world_board.position) / game.world_board.size
            regions["%d:%d" % [int(relative.x * 4), int(relative.y * 4)]] = true
            var extent: Vector2 = game._obstacle_footprint(obstacle)
            valid_layouts = valid_layouts and obstacle.p.distance_to(game.HOME) >= 160
            valid_layouts = valid_layouts and game.world_board.encloses(Rect2(obstacle.p - extent, extent * 2))
            for j in range(i):
                var other: Dictionary = game.obstacles[j]
                var spacing: Vector2 = extent + game._obstacle_footprint(other) + Vector2.ONE * 64
                var difference: Vector2 = (obstacle.p - other.p).abs()
                valid_layouts = valid_layouts and (difference.x >= spacing.x or difference.y >= spacing.y)
        valid_layouts = valid_layouts and sands <= 2 and holes <= 2
        compositions["%d:%d" % [sands, holes]] = true
        distinct[str(game.obstacles)] = true
    check(valid_layouts, "500 varied layouts keep one to three hazards, safe spawn, arena bounds and room between footprints")
    check(regions.size() >= 14, "Obstacle distribution spans top, bottom and both sides of visible arena")
    check(distinct.size() > 450, "Obstacle positions vary across round draws")
    check(compositions.has("1:0") and compositions.has("0:1"), "Rounds can contain only one mound or only one hole")
    check(compositions.has("2:0") and compositions.has("0:2") and compositions.has("1:1"), "Layouts include two mounds, two holes and mixed pairs")
    check(triples > 0 and triples < 100 and float(count_total) / 500 < 2.1, "Three-hazard layouts stay rare and overall density remains low")
    # Isolate trap-flow physics from the random composition.
    game.obstacles.assign([{"kind": "hole", "p": Vector2(480, 960), "radius": 46.0}])
    game.shooter.terrain = game.obstacles
    var pit: Vector2 = game.obstacles[0].p
    var stable: Array = game.obstacles.duplicate(true)
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.obstacles == stable, "Next shot keeps same obstacle layout within the round")
    var start: Vector2 = pit + Vector2(0, 80)
    game.shooter.position = start
    PhysicsServer2D.body_set_state(game.shooter.get_rid(), PhysicsServer2D.BODY_STATE_TRANSFORM, Transform2D(0, start))
    await wait_steps(2)
    game.current_action = game.Action.STRAIGHT
    game._set_quest(0, "TESTE")
    game._launch(Vector2(0, -65))
    await wait_steps(140)
    check(game.shooter.trapped and game.phase == game.Phase.AIMING and game.shots == 7, "Real game finishes trapped shot once and retains marble in hole")
    check(game.shooter.position.distance_to(pit) < 1 and game.score == 0, "Trap preserves world position without granting points")
    game._advance_feedback(1.0)
    game._confirm_roll()
    game.current_action = game.Action.STRAIGHT
    game._launch(Vector2(110, 0))
    await wait_steps(32)
    check(not game.shooter.trapped and game.shooter.position.x > pit.x + 90 and game.shots == 6, "Next player shot escapes hole normally and spends one shot")
    game._finish_shot()
    game.queue_free()
    await process_frame
    print("OBSTACLES RESULT: ", "ALL TESTS PASSED" if errors == 0 else "%d FAILURES" % errors)
    quit(0 if errors == 0 else 1)
