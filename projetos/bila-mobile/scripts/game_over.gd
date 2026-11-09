extends Node2D
const FONT = preload("res://assets/pixelify-bold.tres")
var game: Node
var elapsed := 0.0
func _process(delta: float) -> void:
    elapsed += delta
    modulate.a = minf(1, elapsed * 4)
    queue_redraw()
func text_center(caption: String, at: Vector2, size_px: int, color: Color) -> void:
    var width := FONT.get_string_size(caption, HORIZONTAL_ALIGNMENT_LEFT, -1, size_px).x
    draw_string(FONT, at - Vector2(width / 2, 0), caption, HORIZONTAL_ALIGNMENT_LEFT, -1, size_px, color)
func panel(box: Rect2, fill: Color, edge: Color) -> void:
    var style := StyleBoxFlat.new()
    style.bg_color = fill
    style.border_color = edge
    style.set_border_width_all(3)
    style.set_corner_radius_all(16)
    draw_style_box(style, box)
func _draw() -> void:
    if not is_instance_valid(game): return
    var red := Color("ff797c")
    var cream := Color("fff0cf")
    panel(Rect2(-8, 9, 616, 845), Color("100c1c"), Color("382439"))
    panel(Rect2(0, 0, 600, 840), Color("281e31"), red.darkened(0.4))
    for i in range(24):
        draw_rect(Rect2(22 + (i * 113) % 554, 22 + (i * 79) % 780, 3, 3), Color("503342"))
    text_center("YOUR RUN ENDS HERE", Vector2(300, 39), 18, Color("bca5b7"))
    text_center("GAME OVER", Vector2(302, 112), 74, Color("662d42"))
    text_center("GAME OVER", Vector2(300, 106), 74, red)
    var spread := minf(1, elapsed * 2) * 10
    var center := Vector2(300, 183)
    draw_circle(center + Vector2(0, 9), 43, Color("17111f"))
    draw_colored_polygon(PackedVector2Array([center + Vector2(-39 - spread, -19), center + Vector2(-8 - spread, -35), center + Vector2(-13 - spread, 1), center + Vector2(-37 - spread, 20)]), Color("df6f7a"))
    draw_colored_polygon(PackedVector2Array([center + Vector2(4, -35 - spread), center + Vector2(33, -20 - spread), center + Vector2(10, 2 - spread), center + Vector2(-8, -5 - spread)]), Color("ffae9f"))
    draw_colored_polygon(PackedVector2Array([center + Vector2(-6 + spread, 13), center + Vector2(37 + spread, -4), center + Vector2(30 + spread, 31), center + Vector2(2 + spread, 39)]), Color("a1476a"))
    text_center("FINAL SCORE", Vector2(300, 269), 20, Color("c5b4cd"))
    var count := roundi(game.score * (1 - pow(1 - minf(1, elapsed / 0.75), 3)))
    text_center(str(count), Vector2(300, 351), 86, cream)
    text_center("%d points short of the %d target" % [maxi(0, game.goal - game.score), game.goal], Vector2(300, 394), 22, red)
    draw_rect(Rect2(60, 415, 480, 7), Color("463047"))
    draw_rect(Rect2(60, 415, 480 * clampf(float(game.score) / maxf(1, game.goal), 0, 1), 7), red)
    var titles := ["LEVEL", "MARBLES", "CARDS"]
    var values := [game.stage, game.run_destroyed, game.run_cards_used]
    for i in range(3):
        var x := 36.0 + i * 180
        panel(Rect2(x, 461, 168, 96), Color("1d1728"), Color("59405c"))
        text_center(titles[i], Vector2(x + 84, 490), 17, Color("bca5b7"))
        text_center(str(values[i]), Vector2(x + 84, 536), 34, cream)
    text_center("NEW BEST!" if game.run_new_record else "BEST: %d" % game.best, Vector2(300, 608), 26, Color("ffe18a"))
