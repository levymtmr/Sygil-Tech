extends SceneTree

var errors: int = 0

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
    await create_timer(0.45, true).timeout
    check(paused and game.music.playing and game.music.get_playback_position() > 0.05, "Music actually plays while menu pauses the game")
    game.front_end.set_music_volume(0)
    check(game.music.stream_paused, "Zero music volume pauses playback")
    game.front_end.set_music_volume(55)
    check(not game.music.stream_paused and game.music.playing, "Increasing music volume resumes playback")
    game._notification(Node.NOTIFICATION_APPLICATION_PAUSED)
    check(game.music.stream_paused, "Sending app to background pauses music")
    game._notification(Node.NOTIFICATION_APPLICATION_RESUMED)
    check(not game.music.stream_paused, "Returning to app resumes music")
    game.front_end.set_music(false)
    check(game.music.stream_paused, "Music toggle mutes actual player")
    game.front_end.set_music(true)
    check(not game.music.stream_paused, "Music toggle restores actual player")
    paused = false
    game.queue_free()
    await process_frame
    print("MUSIC PLAYBACK RESULT: ", "ALL TESTS PASSED" if errors == 0 else "%d FAILURES" % errors)
    quit(0 if errors == 0 else 1)
