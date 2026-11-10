extends Node2D

const EffectIcons = preload("res://scripts/effect_icons.gd")
const FONT = preload("res://assets/pixelify-regular.tres")
const BOLD = preload("res://assets/pixelify-bold.tres")
const INK = Color("211e34")
const CREAM = Color("fff0cf")
const MUTED = Color("bcb0ce")
const MINT = Color("8de1be")
var game: Node2D
var hud: bool = false

func _draw() -> void:
	if not is_instance_valid(game): return
	if hud: _draw_hud()
	else: _draw_world()

func _text(caption: String, at: Vector2, size_px: int, color: Color = CREAM, bold: bool = false) -> void:
	draw_string(BOLD if bold else FONT, at, caption, HORIZONTAL_ALIGNMENT_LEFT, -1, size_px, color)

func _center(caption: String, at: Vector2, size_px: int, color: Color = CREAM, bold: bool = false) -> void:
	var font: Font = BOLD if bold else FONT
	var width := font.get_string_size(caption, HORIZONTAL_ALIGNMENT_LEFT, -1, size_px).x
	_text(caption, at - Vector2(width / 2, 0), size_px, color, bold)

func _panel(rect: Rect2, color: Color, edge: Color, border: int = 2) -> void:
	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.border_color = edge
	style.set_border_width_all(border)
	style.set_corner_radius_all(12)
	draw_style_box(style, rect)

func _draw_hud() -> void:
	var height: float = game.layout_height
	if game.focus_amount > 0:
		var field: Rect2 = game.board_screen
		field.position -= Vector2((game.view_size.x - 720) / 2, game.safe_top)
		draw_rect(field.grow(6), Color(0.045, 0.035, 0.075, game.focus_amount * 0.70))
	var boxes := [Rect2(40, 20, 180, 80), Rect2(232, 20, 256, 80), Rect2(500, 20, 180, 80)]
	for i in range(boxes.size()):
		_panel(boxes[i], INK, MINT if i == 1 and game.score_flash > 0 else Color("51455f"), 3 if i == 1 and game.score_flash > 0 else 2)
	_center("DESTRUCTION" if game._is_destruction() else "ROUND", Vector2(130, 44), 14, MUTED, true)
	_center(str(game.stage) if game._is_destruction() else "%d / 3" % game.stage, Vector2(130, 79), 27, CREAM, true)
	_center("TOTAL / TARGET", Vector2(334, 44), 13, MUTED, true)
	var mult_color := Color("ffe18a") if game.score_multiplier > 1 else MUTED
	_panel(Rect2(420, 25, 58, 28), mult_color.darkened(0.78), mult_color, 2)
	_center("x%d" % game.score_multiplier, Vector2(449, 46), 19 + int(game.multiplier_flash * 3), mult_color, true)
	_center("%d / %d" % [int(round(game.displayed_score)), game.goal], Vector2(360, 79), 29 + int(game.score_flash * 12), MINT, true)
	draw_rect(Rect2(250, 91, 220, 4), Color("40364c"))
	draw_rect(Rect2(250, 91, 220 * clampf(game.displayed_score / game.goal, 0, 1), 4), MINT)
	_center("SHOTS", Vector2(590, 44), 14, MUTED, true)
	_center(str(game.shots), Vector2(590, 79), 30, Color("ffd795"), true)
	var tint: Color = game.COLOR_TINTS[game.quest_color] if game.quest_active else MUTED
	var complete: bool = game.quest_active and game.quest_target > 0 and game.quest_progress >= game.quest_target
	# Compact mission ribbon leaves the arena in focus.
	_panel(Rect2(40, 112, 640, 64), INK.lerp(tint.darkened(0.8), game.mission_flash), Color("51455f"), 1)
	draw_rect(Rect2(40, 121, 4, 46), tint)
	EffectIcons.draw_target(self, Vector2(67, 142), 24, tint)
	if game.quest_active: EffectIcons.draw_icon(self, game.current_action, Vector2(453, 145), 24, game.CARD_COLORS[game.current_action])
	_text("DRAW A CARD" if not game.quest_active else ("OBJECTIVE" if not complete else "DONE!"), Vector2(88, 136), 14, MUTED, true)
	_text("REVEAL YOUR OBJECTIVE" if not game.quest_active else ("%s • NO TARGETS" % game.COLOR_NAMES[game.quest_color] if game.quest_target == 0 else "%s  %d/%d" % [game.COLOR_NAMES[game.quest_color], game.quest_progress, game.quest_target]), Vector2(88, 158), 22, tint, true)
	var factor: int = game.shot_multiplier if game.phase == game.Phase.ROLLING else game.score_multiplier
	_center("STRAIGHT" if not game.quest_active else "+%d / MARBLE" % (game.TARGET_POINTS * factor), Vector2(566, 151), 23, tint, true)
	var progress := clampf(float(game.quest_progress) / maxf(1, game.quest_target), 0, 1)
	draw_rect(Rect2(48, 172, 624 * progress, 3), tint)
	if game.aiming and game.quest_active and game.phase == game.Phase.AIMING and not game.roll_confirm_pending and not game.rain_active:
		_draw_power_meter()
	var action: int = game.active_action if game.phase == game.Phase.ROLLING else (game.roll_display_action if game.roll_remaining > 0 else game.current_action)
	var accent: Color = game.CARD_COLORS[action]
	_panel(Rect2(40, height - 236, 640, 38), INK, accent)
	EffectIcons.draw_icon(self, action, Vector2(200, height - 218), 24, accent)
	_center("MARBLE RAIN…" if game.rain_active else ("REVEALING…" if game.roll_remaining > 0 else game.CARD_NAMES[action]), Vector2(360, height - 210), 18, accent, true)
	if game.roll_remaining > 0:
		draw_rect(Rect2(52, height - 201, 616 * (1.0 - game.roll_remaining / game.ROLL_DURATION), 2), accent)
	if game.empty_deck_notice > 0:
		var alpha := minf(1, game.empty_deck_notice / 0.35)
		var toast_y := 208.0 + maxf(0, 0.2 - (2.4 - game.empty_deck_notice)) * 40
		_panel(Rect2(124, toast_y, 472, 40), Color(0.13, 0.11, 0.2, alpha * 0.94), Color(0.65, 0.55, 0.75, alpha), 1)
		_center("NO CARDS LEFT • New hand next round", Vector2(360, toast_y + 26), 17, Color(0.92, 0.86, 0.78, alpha), true)
	if game.roll_confirm_pending and game.phase == game.Phase.AIMING:
		_draw_roll()
	_draw_score_effects()

func _draw_power_meter() -> void:
	# Stable horizontal gauge above the start of the trajectory.
	var power := clampf(game.aim_vector.length() / 170.0, 0, 1)
	var transform_to_hud: Transform2D = get_global_transform_with_canvas().affine_inverse() * game.world_view.get_global_transform_with_canvas()
	var origin: Vector2 = transform_to_hud * game.shooter.position
	var direction: Vector2 = game.aim_vector.normalized()
	if direction == Vector2.ZERO: direction = Vector2.UP
	var center := origin + direction * 60 + Vector2(0, -28)
	var field: Rect2 = game.board_screen
	field.position -= Vector2((game.view_size.x - 720) / 2, game.safe_top)
	center.x = clampf(center.x, field.position.x + 76, field.end.x - 76)
	center.y = clampf(center.y, field.position.y + 36, field.end.y - 20)
	if power >= 0.98:
		center += Vector2(sin(game.clock_time * 79) * 2.2, cos(game.clock_time * 63) * 1.5)
	var box := Rect2(center - Vector2(68, 0), Vector2(136, 14))
	var effect: Color = game.CARD_COLORS[game.current_action]
	var danger := clampf((power - 0.88) / 0.12, 0, 1)
	var tint := effect.lightened(power * 0.25).lerp(Color("ff5353"), danger)
	draw_rect(box.grow(3), Color("20182b"))
	draw_rect(box, effect.darkened(0.78))
	draw_rect(Rect2(box.position, Vector2(box.size.x * power, box.size.y)), tint)
	if power > 0:
		draw_rect(Rect2(box.position, Vector2(box.size.x * power, 3)), tint.lightened(0.55))
	for tick in range(1, 5):
		var x := box.position.x + box.size.x * tick / 5.0
		draw_line(Vector2(x, box.position.y + 2), Vector2(x, box.end.y - 2), Color("30263b"), 2)
	var marker := Vector2(box.position.x + box.size.x * power, box.position.y)
	draw_colored_polygon(PackedVector2Array([marker + Vector2(-4, -5), marker + Vector2(4, -5), marker + Vector2(0, -1)]), Color("fff8e5"))
	var caption := "%d%%" % roundi(power * 100)
	var label_at := Vector2(center.x - BOLD.get_string_size(caption, HORIZONTAL_ALIGNMENT_LEFT, -1, 21).x / 2, box.position.y - 10)
	draw_string_outline(BOLD, label_at, caption, HORIZONTAL_ALIGNMENT_LEFT, -1, 21, 4, INK)
	draw_string(BOLD, label_at, caption, HORIZONTAL_ALIGNMENT_LEFT, -1, 21, CREAM)
	if power >= 0.98:
		var pulse := 0.25 + 0.25 * sin(game.clock_time * 8)
		draw_rect(box.grow(5), Color(tint, pulse), false, 2)

func _draw_roll() -> void:
	var rolling: bool = game.roll_remaining > 0
	var action: int = game.roll_display_action if rolling else game.current_action
	var tint: Color = game.CARD_COLORS[action]
	var y: float = game.board_screen.get_center().y - game.safe_top
	var wobble: float = sin(game.clock_time * 45) * 2 if rolling else 0
	_panel(Rect2(96, y - 100 + wobble, 528, 244), Color("211b33"), tint, 4)
	_center("REVEALING CARD…" if rolling else "CARD REVEALED", Vector2(360, y - 48 + wobble), 18, MUTED, true)
	EffectIcons.draw_icon(self, action, Vector2(172, y - 14 + wobble), 42, tint)
	_center(game.CARD_NAMES[action], Vector2(360, y - 4 + wobble), 32, tint, true)
	_center("%s • +%d/MARBLE" % [game.COLOR_NAMES[game.quest_color], game.TARGET_POINTS * game.score_multiplier] if not rolling else "…", Vector2(360, y + 35), 18, MUTED)

func _draw_world() -> void:
	_panel(game.world_board.grow(10), Color("6b3c2d"), Color("4f3541"))
	draw_rect(game.world_board, Color("b4653e"))
	for speck in game.dirt:
		draw_rect(Rect2(speck.p, Vector2(speck.s, 2)), Color("c87547") if speck.light else Color("a55a3b"))
	_draw_obstacles()
	if not game._is_destruction():
		draw_colored_polygon(game.TRIANGLE, Color(0.96, 0.65, 0.34, 0.055))
		for i in range(3):
			var a: Vector2 = game.TRIANGLE[i]
			var b: Vector2 = game.TRIANGLE[(i + 1) % 3]
			draw_line(a + Vector2(0, 2), b + Vector2(0, 2), Color("774b39"), 7)
			draw_line(a, b, Color("f6dfb4"), 4)
			var along := a.distance_to(b)
			for j in range(int(along / 8)):
				var point := a.lerp(b, float(j) / (along / 8))
				draw_rect(Rect2(point + Vector2(sin(j * 3) * 2, cos(j * 7) * 2), Vector2(2, 2)), Color("fff1cf"))
	for arc in game.lightning_arcs:
		var color := Color(1, 0.94, 0.55, clampf(arc.life * 4, 0, 1))
		draw_polyline(arc.points, Color("443154"), 8, true)
		draw_polyline(arc.points, color, 4, true)
	var trail_color: Color = game.CARD_COLORS[game.active_action]
	for i in range(1, game.motion_trail.size()):
		var first: Dictionary = game.motion_trail[i - 1]
		var second: Dictionary = game.motion_trail[i]
		var color := Color(trail_color, clampf(second.life / 0.36 * 0.6, 0, 0.6))
		draw_line(first.p, second.p, color, 5 * second.life / 0.36 + 1, true)
	for ring in game.impact_rings:
		var t: float = 1.0 - ring.life / ring.duration
		var color: Color = ring.color
		color.a = (1.0 - t) * 0.85
		draw_arc(ring.p, 8 + ring.radius * t, 0, TAU, 40, color, 4 * (1.0 - t) + 1, true)
	for ball in game.balls:
		if game.quest_active and ball.visible and ball.drop_height <= 0 and not ball.captured and ball.color_index == game.quest_color:
			draw_arc(ball.position, ball.radius + 10, 0, TAU, 40, game.COLOR_TINTS[game.quest_color], 4)
	draw_arc(game.HOME, 31, 0, TAU, 40, Color(1, 0.9, 0.7, 0.22), 2)
	if not game.rain_active and game.quest_active and game.phase == game.Phase.AIMING and not game.roll_confirm_pending and is_instance_valid(game.shooter):
		var origin: Vector2 = game.shooter.position
		var pulse: float = 0.35 + sin(game.clock_time * 3.0) * 0.12
		draw_arc(origin, 42, 0, TAU, 48, Color(0.9, 0.98, 0.8, pulse), 2)
		if game.aiming and game.aim_vector.length() >= 15:
			if game.show_trajectory:
				var preview: PackedVector2Array = game._aim_preview()
				var previous := origin
				var last_direction := Vector2.UP
				var last_point := origin
				for i in range(preview.size()):
					var point := preview[i]
					if not game.world_board.grow(-15).has_point(point): break
					var tint: Color = game.CARD_COLORS[game.current_action].lightened(0.28)
					draw_line(previous, point, Color("32263e"), 15, true)
					draw_line(previous, point, tint, 8, true)
					if i % 8 == 0: draw_circle(point, 6, Color("fff8dc"))
					if game.current_action == game.Action.BOUNCE and i in [22, 54, 86]:
						draw_arc(point, 18, 0, TAU, 24, Color("ffe18a"), 4, true)
					last_direction = (point - previous).normalized()
					last_point = point
					previous = point
				if last_point.distance_to(origin) > 20:
					var side := last_direction.orthogonal()
					var arrow := PackedVector2Array([last_point + last_direction * 18, last_point - last_direction * 12 + side * 13, last_point - last_direction * 12 - side * 13])
					draw_colored_polygon(arrow, Color("fff8dc"))
			draw_line(origin, origin - game.aim_vector, Color("fff2d5"), 5, true)
		elif game.clock_time < 5.0:
			_center("↓ PULL BACK", origin + Vector2(0, -50), 22, CREAM, true)
	for effect in game.particles:
		var color: Color = effect.color
		color.a = clampf(effect.life * 3, 0, 1)
		draw_rect(Rect2(effect.p, Vector2(4, 4)), color)

func _draw_score_effects() -> void:
	# HUD coordinates keep awards readable even with the distant camera.
	for mote in game.score_motes:
		var elapsed: float = mote.duration - mote.life
		if elapsed < mote.delay: continue
		var t := clampf((elapsed - mote.delay) / 0.75, 0, 1)
		var start: Vector2 = mote["from"]
		var target := Vector2(360, 77)
		var control := Vector2(start.x + mote.bend, start.y - 150)
		var point := start.bezier_interpolate(control, target + Vector2(mote.bend, 80), target, t)
		var color: Color = mote.color
		color.a = sin(t * PI)
		draw_circle(point, 8, Color(color, color.a * 0.18))
		draw_rect(Rect2(point - Vector2(3, 3), Vector2(6, 6)), color)
	for floater in game.floaters:
		var age: float = floater.duration - floater.life
		var fade := clampf(floater.life / 0.4, 0, 1)
		var pop := 1.0
		if age < 0.12:
			pop = lerpf(0.45, 1.22, age / 0.12)
		elif age < 0.26:
			pop = lerpf(1.22, 1.0, (age - 0.12) / 0.14)
		var at: Vector2 = get_global_transform_with_canvas().affine_inverse() * game.world_view.get_global_transform_with_canvas() * floater.p
		at.x = clampf(at.x, 170, 550)
		at.y = clampf(at.y, 240, game.layout_height - 260)
		var color: Color = floater.color
		color.a = fade
		var size_px := int((54 if floater.important else 36) * pop) if floater.points else int(floater["size"] * pop)
		var width := BOLD.get_string_size(floater.text, HORIZONTAL_ALIGNMENT_LEFT, -1, size_px).x
		if width > 610:
			size_px = int(size_px * 610 / width)
			width = BOLD.get_string_size(floater.text, HORIZONTAL_ALIGNMENT_LEFT, -1, size_px).x
		var baseline := at - Vector2(width / 2, 0)
		draw_string_outline(BOLD, baseline + Vector2(0, 4), floater.text, HORIZONTAL_ALIGNMENT_LEFT, -1, size_px, 10, Color(0.08, 0.05, 0.12, fade * 0.65))
		draw_string_outline(BOLD, baseline, floater.text, HORIZONTAL_ALIGNMENT_LEFT, -1, size_px, 7, Color(0.12, 0.08, 0.16, fade))
		draw_string(BOLD, baseline, floater.text, HORIZONTAL_ALIGNMENT_LEFT, -1, size_px, color.lerp(Color(1, 1, 1, fade), maxf(0, 1 - age / 0.18)))
		if floater.detail != "":
			var detail_at := at + Vector2(0, 26)
			var detail_width := BOLD.get_string_size(floater.detail, HORIZONTAL_ALIGNMENT_LEFT, -1, 21).x
			detail_at.x -= detail_width / 2
			draw_string_outline(BOLD, detail_at, floater.detail, HORIZONTAL_ALIGNMENT_LEFT, -1, 21, 5, Color(0.12, 0.08, 0.16, fade))
			draw_string(BOLD, detail_at, floater.detail, HORIZONTAL_ALIGNMENT_LEFT, -1, 21, Color(1, 0.94, 0.81, fade))
		if floater.important and age < 0.45:
			for i in range(8):
				var direction := Vector2.from_angle(i * TAU / 8)
				var radius: float = 28 + age * 115
				draw_line(at + Vector2(0, -16) + direction * radius, at + Vector2(0, -16) + direction * (radius + 9), Color(color, (1 - age / 0.45) * fade), 3)

func _pixel_ellipse(at: Vector2, extent: Vector2, color: Color) -> void:
	var step := 8.0
	for row in range(-int(extent.y / step), int(extent.y / step) + 1):
		var y := row * step
		var ratio := y / extent.y
		var half_width := floorf(sqrt(maxf(0, 1 - ratio * ratio)) * extent.x / step) * step
		if half_width > 0: draw_rect(Rect2(at + Vector2(-half_width, y), Vector2(half_width * 2, step)), color)

func _draw_obstacles() -> void:
	for obstacle in game.obstacles:
		var at: Vector2 = obstacle.p
		if obstacle.kind == "sand":
			var extent: Vector2 = obstacle.extent
			_pixel_ellipse(at + Vector2(8, 13), extent + Vector2(8, 0), Color("874b32"))
			_pixel_ellipse(at, extent, Color("c68a49"))
			_pixel_ellipse(at + Vector2(-8, -9), extent * Vector2(0.88, 0.80), Color("dca455"))
			_pixel_ellipse(at + Vector2(-15, -17), extent * Vector2(0.60, 0.48), Color("e9bd71"))
			draw_rect(Rect2(at + Vector2(-49, -23), Vector2(40, 8)), Color("f4d48b"))
			draw_rect(Rect2(at + Vector2(-9, -31), Vector2(32, 8)), Color("f4d48b"))
			draw_rect(Rect2(at + Vector2(18, 9), Vector2(42, 8)), Color("b37b40"))
			draw_rect(Rect2(at + Vector2(50, 17), Vector2(24, 8)), Color("b37b40"))
			for i in range(18):
				var offset := Vector2(sin(i * 8.7) * 86, cos(i * 6.1) * 38)
				draw_rect(Rect2(at + offset.snapped(Vector2(8, 8)), Vector2(4, 4)), Color("edc77b") if i % 2 == 0 else Color("b98044"))
		else:
			var radius: float = obstacle.radius
			_pixel_ellipse(at + Vector2(4, 9), Vector2(radius + 12, radius * 0.74), Color("824930"))
			_pixel_ellipse(at, Vector2(radius + 6, radius * 0.75), Color("d59654"))
			_pixel_ellipse(at + Vector2(0, 4), Vector2(radius, radius * 0.68), Color("5d3731"))
			_pixel_ellipse(at + Vector2(0, 7), Vector2(radius - 9, radius * 0.48), Color("29202b"))
			draw_rect(Rect2(at + Vector2(-27, -27), Vector2(24, 8)), Color("edbd78"))
			draw_rect(Rect2(at + Vector2(12, 28), Vector2(16, 8)), Color("a36b40"))
