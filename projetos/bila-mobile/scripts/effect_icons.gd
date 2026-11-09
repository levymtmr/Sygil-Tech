extends RefCounted

const COLORS = [Color("8de1be"), Color("c499ef"), Color("efab59"), Color("89bdff"), Color("ff9988"), Color("f49ce2"), Color("6de8e8"), Color("ff744d"), Color("d5ef70")]

static func draw_icon(item: CanvasItem, action: int, center: Vector2, size_px: float, color: Color) -> void:
    var s := size_px / 24.0
    var width := maxf(2, 3 * s)
    var points := PackedVector2Array()
    match action:
        0:
            points = PackedVector2Array([Vector2(-9, 6), Vector2(6, -9)])
        1:
            points = PackedVector2Array([Vector2(-9, 8), Vector2(-9, -1), Vector2(-5, -6), Vector2(5, -6)])
        2:
            points = PackedVector2Array([Vector2(-10, 6), Vector2(-8, 0), Vector2(-5, -6), Vector2(-2, 0), Vector2(0, 6), Vector2(3, 0), Vector2(6, -4), Vector2(10, 6)])
        3:
            points = PackedVector2Array([Vector2(-7, -3), Vector2(-5, -9), Vector2(5, -9), Vector2(7, -3), Vector2(10, 8), Vector2(-10, 8), Vector2(-7, -3)])
        4:
            points = PackedVector2Array([Vector2(0, -10), Vector2(7, -7), Vector2(10, 0), Vector2(7, 7), Vector2(0, 10), Vector2(-7, 7), Vector2(-10, 0), Vector2(-7, -7), Vector2(0, -10)])
        5:
            points = PackedVector2Array([Vector2(-10, 0), Vector2(10, 0), Vector2(3, -7), Vector2(10, 0), Vector2(3, 7)])
        6:
            points = PackedVector2Array([Vector2(-8, -8), Vector2(-8, 4), Vector2(-4, 9), Vector2(4, 9), Vector2(8, 4), Vector2(8, -8)])
        7:
            points = PackedVector2Array([Vector2(0, -11), Vector2(3, -4), Vector2(10, -7), Vector2(5, 0), Vector2(11, 5), Vector2(3, 5), Vector2(0, 11), Vector2(-3, 4), Vector2(-10, 7), Vector2(-5, 0), Vector2(-10, -5), Vector2(-3, -4), Vector2(0, -11)])
        8:
            points = PackedVector2Array([Vector2(-10, 8), Vector2(0, -8), Vector2(10, 8), Vector2(10, -8)])
    for i in range(points.size()): points[i] = center + points[i] * s
    item.draw_polyline(points, Color("211e34"), width + 3 * s)
    item.draw_polyline(points, color, width)
    if action <= 1:
        var tip := center + Vector2(6, -9) * s if action == 0 else center + Vector2(5, -6) * s
        var arrow := PackedVector2Array([tip + Vector2(-6, 0) * s, tip, tip + Vector2(0, 6) * s]) if action == 0 else PackedVector2Array([tip + Vector2(-4, -4) * s, tip, tip + Vector2(-4, 4) * s])
        item.draw_polyline(arrow, color, width)
    elif action == 2:
        item.draw_line(center + Vector2(-10, 10) * s, center + Vector2(10, 10) * s, color, maxf(1, s))
    elif action == 4:
        item.draw_line(center - Vector2(4, 0) * s, center + Vector2(4, 0) * s, color, 2 * s)
        item.draw_line(center - Vector2(0, 4) * s, center + Vector2(0, 4) * s, color, 2 * s)
    elif action == 3:
        item.draw_rect(Rect2(center + Vector2(-3, 0) * s, Vector2(6, 4) * s), color)

static func draw_target(item: CanvasItem, center: Vector2, size_px: float, color: Color) -> void:
    var r := size_px * 0.5
    item.draw_circle(center, r * 0.48, color)
    for direction in [Vector2.LEFT, Vector2.RIGHT, Vector2.UP, Vector2.DOWN]:
        item.draw_line(center + direction * r * 0.72, center + direction * r * 1.08, color, 2)
