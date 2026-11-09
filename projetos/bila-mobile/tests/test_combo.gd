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

func reset_stage(number: int = 1) -> void:
    if game.phase == game.Phase.ROLLING: game._finish_shot()
    game._restart()
    if number != 1:
        game.stage = number
        game._start_round()
    game._advance_feedback(1.0)
    game._confirm_roll()

func shot(color: int, indices: Array[int]) -> void:
    game._set_quest(color, "TESTE")
    game.current_action = game.Action.STRAIGHT
    if not game.quest_active: game._set_quest(0, "TESTE")
    game._launch(Vector2(0, -30))
    for index in indices: game._capture(game.balls[index])
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()

func _run() -> void:
    game = load("res://main.tscn").instantiate()
    root.add_child(game)
    game.front_end.player_name = "Combo QA"
    game.front_end.start_game()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.score == 0 and game.score_multiplier == 1, "Run starts with zero balance and x1")
    shot(0, [0])
    check(game.score == 60 and game.mission_streak == 1 and game.score_multiplier == 2, "First clean mission pays x1 and unlocks x2 for next shot")
    var missions: int = game.completed_missions
    game._finish_shot()
    check(game.mission_streak == 1 and game.score_multiplier == 2 and game.completed_missions == missions, "Mission completion cannot increase streak twice")
    game._next_round()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.stage == 2 and game.score == 60 and game.total_score == 60 and game.round_start_score == 60, "Stage transition retains cumulative balance without duplication")
    check(game.score_multiplier == 2 and game.mission_streak == 1, "Multiplier and mission streak carry between stages")
    shot(2, [2])
    check(game.score == 180 and game.score_multiplier == 3, "Next clean mission pays 60 times 2 then unlocks x3")
    shot(3, [3])
    check(game.score == 360 and game.score_multiplier == 4 and game.mission_streak == 3, "Third clean mission pays 60 times 3 then unlocks x4")
    game._next_round()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.score == 360 and game.goal == 600, "Final stage retains points against cumulative 600 target")
    var before: int = game.score
    if not game.quest_active: game._set_quest(0, "TESTE")
    game._launch(Vector2(0, -30))
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.score == before and game.score_multiplier == 4 and game.mission_streak == 3, "Positioning shot without captures preserves streak")
    reset_stage(2)
    game.mission_streak = 2
    game.score_multiplier = 3
    shot(0, [0])
    check(game.score == 180 and game.quest_progress == 1 and game.score_multiplier == 3, "Partial mission earns current multiplier without incrementing streak")
    game._use_card(game.hand_missions.find(1))
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.score == 180 and game.score_multiplier == 1 and game.mission_streak == 0, "Abandoning partial mission resets future multiplier but preserves earned points")
    reset_stage(2)
    game.mission_streak = 2
    game.score_multiplier = 3
    game._use_card(0)
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.score_multiplier == 3 and game.mission_streak == 2, "Changing an unstarted mission preserves successful sequence")
    for correct_first in [true, false]:
        reset_stage()
        game.mission_streak = 2
        game.score_multiplier = 3
        game._set_quest(0, "TESTE")
        game.current_action = game.Action.STRAIGHT
        if not game.quest_active: game._set_quest(0, "TESTE")
        game._launch(Vector2(0, -30))
        if correct_first:
            game._capture(game.balls[0])
            game._capture(game.balls[1])
        else:
            game._capture(game.balls[1])
            game._capture(game.balls[0])
        check(game.score == 195 and game.score_multiplier == 3, "All captures in same shot use fixed starting multiplier, order=%s" % correct_first)
        game._finish_shot()
        game._advance_feedback(1.0)
        game._confirm_roll()
        check(game.score == 195 and game.mission_streak == 0 and game.score_multiplier == 1, "Wrong color resets next-shot multiplier regardless of capture order=%s" % correct_first)
    reset_stage(2)
    game.mission_streak = 1
    game.score_multiplier = 2
    shot(0, [0, 6])
    check(game.score == 240 and game.completed_missions == 1 and game.mission_streak == 2 and game.score_multiplier == 3, "Two targets completing one mission grant one streak increment")
    reset_stage()
    game.score = 750
    game._finish_shot()
    game._advance_feedback(1.0)
    game._confirm_roll()
    game._next_round()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.score == 750 and game.phase == game.Phase.REWARD, "Surplus balance can satisfy following cumulative target")
    game._next_round()
    game._advance_feedback(1.0)
    game._confirm_roll()
    check(game.phase == game.Phase.WON and game.score == 750, "Carried surplus can finish final target without extra scoring")
    reset_stage()
    check(game.score == 0 and game.score_multiplier == 1 and game.mission_streak == 0 and game.completed_missions == 0, "New run clears cumulative balance and streak")
    game._set_quest(0, "TESTE")
    game._capture(game.balls[0])
    check(game.floaters.any(func(f): return f.points and f.text == "+60") and game.score_motes.size() == 5, "Mission award creates readable popup and five score particles")
    game._physics_process(2.0)
    check(game.floaters.is_empty() and game.score_motes.is_empty(), "Award popup and particles expire independently without stale indices")
    check(game.score == 60, "Visual award effects do not change earned score")
    game.queue_free()
    await process_frame
    print("COMBO RESULT: ", "ALL TESTS PASSED" if errors == 0 else "%d FAILURES" % errors)
    quit(0 if errors == 0 else 1)
