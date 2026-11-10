extends Node2D

const Marble = preload("res://scripts/marble.gd")
const FONT = preload("res://assets/pixelify-regular.tres")
const BOLD = preload("res://assets/pixelify-bold.tres")
const MUSIC = preload("res://assets/quintal-loop.wav")
const LAUNCH_SPEED = 10.8
const ATLAS = preload("res://assets/bilas-atlas.png")
const INK = Color("211e34")
const CREAM = Color("fff0cf")
const MUTED = Color("bcb0ce")
const MINT = Color("8de1be")
const TRIANGLE = [Vector2(360, 300), Vector2(130, 685), Vector2(590, 685)]
const HOME = Vector2(360, 1120)
const CAMERA_ZOOM = 0.52
const CAMERA_CENTER = Vector2(360, 710)
const Presentation = preload("res://scripts/presentation.gd")
const FrontEnd = preload("res://scripts/front_end.gd")
var front_end: CanvasLayer
var show_trajectory: bool = true
var volume_percent: float = 70.0
var music_enabled: bool = true
var music_volume_percent: float = 45.0
var music: AudioStreamPlayer
var app_in_background: bool = false
var view_size := Vector2(720, 1280)
var layout_height: float = 1280.0
var safe_top: float = 0.0
var safe_bottom: float = 0.0
var world_zoom: float = CAMERA_ZOOM
var board_screen := Rect2(16, 188, 688, 708)
var world_board := Rect2()
var ui_layer: CanvasLayer
var menu_button: Button
var walls: StaticBody2D
var world_view: Node2D
var hud_view: Node2D
var camera: Camera2D
const EffectIcons = preload("res://scripts/effect_icons.gd")
const CARD_COLORS = EffectIcons.COLORS
const HandCard = preload("res://scripts/hand_card.gd")
const CARD_NAMES = ["STRAIGHT", "FROST", "BOUNCING", "HEAVY", "GIANT", "PIERCING", "MAGNETIC", "EXPLOSIVE", "RICOCHET", "LIGHTNING", "REPULSOR"]
const CARD_HELP = ["Follows your aim", "Slows targets on impact", "Jumps over marbles while airborne", "Two damage on direct impact, shorter range", "Sweeps a wide path through nearby targets", "Passes through and hits each target", "Pulls nearby marbles", "Destroys the blast core and scatters nearby targets", "Stronger rebounds and longer range", "Chains one hit through up to four targets", "Pushes nearby marbles away while moving"]
enum Action { STRAIGHT, FROST, BOUNCE, HEAVY, GIANT, PIERCING, MAGNET, EXPLOSIVE, RICOCHET, LIGHTNING, REPULSOR }
const CARD_ACTIONS = [Action.STRAIGHT, Action.FROST, Action.BOUNCE, Action.HEAVY, Action.FROST, Action.HEAVY, Action.GIANT, Action.PIERCING, Action.MAGNET, Action.EXPLOSIVE, Action.RICOCHET, Action.LIGHTNING, Action.REPULSOR]
const CARD_TARGETS = [0, 1, 2, 3, 4, 5, 0, 2, 1, 3, 4, 2, 5]
var special_hits: Dictionary = {}
var blast_used: bool = false
var lightning_used: bool = false
var lightning_arcs: Array[Dictionary] = []
var last_shooter_position := Vector2.ZERO
enum GameMode { CLASSIC, DESTRUCTION }
var game_mode: GameMode = GameMode.DESTRUCTION
var hand_expanded: bool = true
var hand_toggle: Button
var hand_floor: ColorRect
var hand_tween: Tween
var damage_pairs: Dictionary = {}
var empty_deck_pending: bool = false
var empty_deck_notice: float = 0.0
var opening_focus: bool = true
var focus_amount: float = 1.0
var rain_pending: bool = false
var rain_active: bool = false
var rain_elapsed: float = 0.0
enum Phase { AIMING, ROLLING, REWARD, WON, LOST }

var phase: Phase = Phase.AIMING
var stage: int = 1
var score: int = 0
# Compatibility alias: there is a single cumulative score for the run.
var total_score: int:
	get:
		return score
	set(value):
		score = value
var round_start_score: int = 0
var mission_streak: int = 0
var score_multiplier: int = 1
var shot_multiplier: int = 1
var completed_missions: int = 0
var quest_completed: bool = false
var quest_completion_pending: bool = false
var shot_wrong_color: bool = false
var multiplier_flash: float = 0.0
var best: int = 0
var run_destroyed: int = 0
var run_cards_used: int = 0
var run_new_record: bool = false
var shots: int = 5
var goal: int = 60
var stock: Array[int] = [1, 1, 1]
var selected: int = -1
# Hand indices are concealed slots, not action IDs.
var hand_missions: Array[int] = [0, 1, 2]
var card_drawn_this_shot: bool = false
var effect_roll_count: int = 0
const ROLL_DURATION = 0.65
var roll_confirm_pending: bool = false
var roll_confirm_button: Button
var roll_remaining: float = 0.0
var roll_display_action: int = 0
var roll_tick: int = -1
var roll_flash: float = 0.0
var mission_flash: float = 0.0
var score_flash: float = 0.0
var displayed_score: float = 0.0
var camera_shake: float = 0.0
var impact_cooldown: float = 0.0
var motion_trail: Array[Dictionary] = []
var impact_rings: Array[Dictionary] = []
var trail_clock: float = 0.0
var card_tween: Tween
var fx_rng := RandomNumberGenerator.new()
const COLOR_NAMES = ["RED", "GREEN", "BLUE", "YELLOW", "PURPLE", "TURQUOISE"]
const COLOR_TINTS = [Color("ff8580"), Color("a1e87a"), Color("89bdff"), Color("ffe184"), Color("dba0ff"), Color("7ce6db")]
const BASE_POINTS = 5
const QUEST_BONUS = 55
const TARGET_POINTS = BASE_POINTS + QUEST_BONUS
const ROUND_GOALS = [60, 240, 600]
var quest_active: bool = false
var quest_color: int = 0
var quest_progress: int = 0
var quest_target: int = 1
var quest_points: int = 0
var quest_origin: String = "INITIAL OBJECTIVE"
var quest_switch_count: int = 0
var current_action: int = Action.STRAIGHT
var active_action: int = Action.STRAIGHT
var aiming: bool = false
var pointer_id: int = -99
var drag_position := Vector2.ZERO
var aim_vector := Vector2.ZERO
var shot_time: float = 0.0
var quiet_time: float = 0.0
var clock_time: float = 0.0
var shot_captures: int = 0
var shooter: BilaMarble
var balls: Array[BilaMarble] = []
var obstacles: Array[Dictionary] = []
var floaters: Array[Dictionary] = []
var score_motes: Array[Dictionary] = []
var particles: Array[Dictionary] = []
var dirt: Array[Dictionary] = []
var card_buttons: Array[Button] = []
var sound_button: Button
var overlay: Control
var status_label: Label
var sound_enabled: bool = true
var audio: AudioStreamPlayer
var audio_playback: AudioStreamGeneratorPlayback
var audio_cooldown: float = 0.0
var notes: Array[Dictionary] = []
var rng := RandomNumberGenerator.new()
var test_mode: bool = false

func _ready() -> void:
	test_mode = "--test" in OS.get_cmdline_user_args()
	camera = Camera2D.new()
	camera.zoom = Vector2.ONE * CAMERA_ZOOM
	add_child(camera)
	camera.make_current()
	_measure_layout()
	world_view = Presentation.new()
	world_view.game = self
	world_view.z_index = -10
	add_child(world_view)
	if test_mode:
		rng.seed = 65123
		fx_rng.seed = 1337
	else:
		rng.randomize()
		fx_rng.randomize()
	_make_dirt()
	_read_best()
	_make_walls()
	_build_ui()
	if not test_mode and DisplayServer.get_name() != "headless":
		_setup_audio()
	_setup_music()
	_start_round()
	front_end = FrontEnd.new()
	front_end.game = self
	add_child(front_end)
	_apply_ui_layout()
	get_viewport().size_changed.connect(_layout_changed)
	if "--screenshot" in OS.get_cmdline_user_args():
		_take_screenshot.call_deferred()

func _build_ui() -> void:
	ui_layer = CanvasLayer.new()
	add_child(ui_layer)
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui_layer.add_child(root)
	hud_view = Presentation.new()
	hud_view.game = self
	hud_view.hud = true
	root.add_child(hud_view)
	sound_button = _button("SOUND: ON", Rect2(40, 1218, 170, 44), Color("5e537a"), 18)
	sound_button.pressed.connect(func():
		front_end.set_sound(not sound_enabled))
	root.add_child(sound_button)
	menu_button = _button("MENU", Rect2(260, 1218, 160, 44), Color("5e537a"), 18)
	menu_button.pressed.connect(func(): front_end.show_main())
	root.add_child(menu_button)
	for i in range(3):
		var card := HandCard.new()
		card.mission_color = i
		card.size = Vector2(176, 204)
		card.pivot_offset = card.size / 2
		card.pressed.connect(_use_card.bind(i))
		root.add_child(card)
		card_buttons.append(card)
	hand_floor = ColorRect.new()
	hand_floor.color = Color("171525")
	hand_floor.mouse_filter = Control.MOUSE_FILTER_IGNORE
	hand_floor.z_index = 30
	root.add_child(hand_floor)
	hand_toggle = _button("CARDS", Rect2(250, 1080, 220, 38), Color("65577b"), 17)
	hand_toggle.z_index = 40
	hand_toggle.pressed.connect(func():
		hand_expanded = not hand_expanded
		_refresh_ui(true))
	root.add_child(hand_toggle)
	sound_button.z_index = 40
	menu_button.z_index = 40
	status_label = Label.new()
	status_label.position = Vector2(30, 946)
	status_label.size = Vector2(660, 24)
	status_label.visible = false
	status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	status_label.add_theme_font_override("font", FONT)
	status_label.add_theme_font_size_override("font_size", 15)
	status_label.add_theme_color_override("font_color", CREAM)
	root.add_child(status_label)
	roll_confirm_button = _button("CONTINUE", Rect2(170, 600, 380, 56), Color("ffe18a"), 24)
	roll_confirm_button.z_index = 50
	roll_confirm_button.visible = false
	roll_confirm_button.pressed.connect(_confirm_roll)
	root.add_child(roll_confirm_button)
	overlay = Control.new()
	overlay.z_index = 100
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.visible = false
	root.add_child(overlay)

func _button(caption: String, rect: Rect2, color: Color, font_size: int) -> Button:
	var b := Button.new()
	b.position = rect.position
	b.size = rect.size
	b.text = caption
	b.add_theme_font_override("font", BOLD)
	b.add_theme_font_size_override("font_size", font_size)
	b.add_theme_color_override("font_color", CREAM)
	b.add_theme_color_override("font_disabled_color", Color("8d819c"))
	for kind in ["normal", "hover", "pressed", "disabled", "focus"]:
		var style := StyleBoxFlat.new()
		style.bg_color = INK.lightened(0.08 if kind == "hover" else 0.02)
		style.border_color = color if kind != "disabled" else Color("514958")
		if kind == "pressed": style.bg_color = color.darkened(0.65)
		style.set_border_width_all(3 if kind != "focus" else 2)
		style.set_corner_radius_all(9)
		style.shadow_color = Color(0.0, 0.0, 0.0, 0.25)
		style.shadow_size = 3
		style.shadow_offset = Vector2(0, 4)
		b.add_theme_stylebox_override(kind, style)
	return b

func _measure_layout() -> void:
	view_size = get_viewport().get_visible_rect().size
	safe_top = 0.0
	safe_bottom = 0.0
	if OS.has_feature("android"):
		var safe := DisplayServer.get_display_safe_area()
		var physical := DisplayServer.window_get_size()
		if physical.y > 0 and safe.size.y > 0:
			safe_top = clampf(float(safe.position.y) / physical.y * view_size.y, 0, 90)
			safe_bottom = clampf(float(physical.y - safe.end.y) / physical.y * view_size.y, 0, 90)
	layout_height = view_size.y - safe_top - safe_bottom
	board_screen = Rect2(16, safe_top + 188, view_size.x - 32, maxf(280, layout_height - 438))
	world_zoom = minf(CAMERA_ZOOM, board_screen.size.y / 930.0)
	camera.zoom = Vector2.ONE * world_zoom
	camera.position = CAMERA_CENTER + (view_size / 2 - board_screen.get_center()) / world_zoom
	camera.force_update_scroll()
	world_board = Rect2(CAMERA_CENTER - board_screen.size / (2 * world_zoom), board_screen.size / world_zoom)

func _make_dirt() -> void:
	dirt.clear()
	var visual_rng := RandomNumberGenerator.new()
	visual_rng.seed = 65123
	for i in range(1800):
		dirt.append({"p": Vector2(visual_rng.randf_range(world_board.position.x + 8, world_board.end.x - 8), visual_rng.randf_range(world_board.position.y + 8, world_board.end.y - 8)), "s": visual_rng.randi_range(2, 6), "light": visual_rng.randf() > 0.55})

func _apply_ui_layout() -> void:
	ui_layer.offset = Vector2((view_size.x - 720) / 2, safe_top)
	roll_confirm_button.position = Vector2(170, board_screen.get_center().y - safe_top + 68)
	hand_floor.position = Vector2(-(view_size.x - 720) / 2, layout_height - 86)
	hand_floor.size = Vector2(view_size.x, 86)
	hand_toggle.position = Vector2(250, layout_height - 196)
	sound_button.position = Vector2(40, layout_height - 64)
	sound_button.size = Vector2(240, 48)
	menu_button.position = Vector2(440, layout_height - 64)
	menu_button.size = Vector2(240, 48)
	status_label.position = Vector2(30, layout_height - 334)
	_refresh_ui()
	if is_instance_valid(front_end): front_end.reflow()

func _layout_changed() -> void:
	_measure_layout()
	_make_dirt()
	_make_walls()
	_apply_ui_layout()
	world_view.queue_redraw()
	hud_view.queue_redraw()

func _make_walls() -> void:
	if is_instance_valid(walls):
		walls.collision_layer = 0
		walls.queue_free()
	walls = StaticBody2D.new()
	walls.collision_layer = 2
	add_child(walls)
	var b := world_board
	for rect in [Rect2(b.position - Vector2(16, 16), Vector2(b.size.x + 32, 16)), Rect2(Vector2(b.position.x - 16, b.end.y), Vector2(b.size.x + 32, 16)), Rect2(b.position - Vector2(16, 0), Vector2(16, b.size.y)), Rect2(Vector2(b.end.x, b.position.y), Vector2(16, b.size.y))]:
		var shape := CollisionShape2D.new()
		var box := RectangleShape2D.new()
		box.size = rect.size
		shape.shape = box
		shape.position = rect.get_center()
		walls.add_child(shape)

func _obstacle_footprint(obstacle: Dictionary) -> Vector2:
	return Vector2(120, 68) if obstacle.kind == "sand" else Vector2(58, 46)

func _is_destruction() -> bool:
	return true

func _destruction_goal(level: int) -> int:
	return 60 * level * (level + 2)

func _make_obstacles() -> void:
	# Most rounds have one or two hazards; three is a rare mixed layout.
	var roll := rng.randf()
	var wanted := 1 if roll < 0.45 else (2 if roll < 0.90 else 3)
	obstacles.clear()
	var sand_count := 0
	var hole_count := 0
	for slot in range(wanted):
		var kind := "sand" if rng.randf() < 0.5 else "hole"
		if sand_count >= 2: kind = "hole"
		if hole_count >= 2: kind = "sand"
		for attempt in range(100):
			var margin := Vector2(152, 100) if kind == "sand" else Vector2(90, 78)
			var area := Rect2(world_board.position + margin, world_board.size - margin * 2)
			var at := Vector2(rng.randf_range(area.position.x, area.end.x), rng.randf_range(area.position.y, area.end.y))
			at = at.snapped(Vector2(8, 8))
			var candidate: Dictionary = {"kind": kind, "p": at, "extent": Vector2(108, 55)} if kind == "sand" else {"kind": kind, "p": at, "radius": 46.0}
			var extent := _obstacle_footprint(candidate)
			if at.distance_to(HOME) < 160 or not world_board.encloses(Rect2(at - extent, extent * 2)): continue
			var clear := true
			if not _is_destruction():
				for spot in [Vector2(360, 408), Vector2(320, 482), Vector2(400, 482), Vector2(275, 566), Vector2(360, 566), Vector2(445, 566), Vector2(360, 628), Vector2(360, 346)]:
					if Rect2(at - extent - Vector2.ONE * 36, (extent + Vector2.ONE * 36) * 2).has_point(spot): clear = false
			for existing in obstacles:
				var spacing: Vector2 = extent + _obstacle_footprint(existing) + Vector2.ONE * 64
				var difference: Vector2 = (at - existing.p).abs()
				if difference.x < spacing.x and difference.y < spacing.y:
					clear = false
					break
			if not clear: continue
			obstacles.append(candidate)
			if kind == "sand": sand_count += 1
			else: hole_count += 1
			break
		# If a roomy position is unavailable, keep the smaller layout.

func _rain_position(placed: Array[Vector2]) -> Vector2:
	var area := world_board.grow(-80)
	var at := area.get_center()
	for attempt in range(300):
		at = Vector2(rng.randf_range(area.position.x, area.end.x), rng.randf_range(area.position.y, area.end.y))
		if at.distance_to(HOME) < 160: continue
		var clear := true
		for other in placed:
			if at.distance_to(other) < 60:
				clear = false
				break
		for obstacle in obstacles:
			var extent := _obstacle_footprint(obstacle) + Vector2.ONE * 35
			if Rect2(obstacle.p - extent, extent * 2).has_point(at): clear = false
		if clear: return at
	return at

func _start_rain() -> void:
	if not rain_pending or rain_active: return
	rain_pending = false
	rain_active = true
	rain_elapsed = 0.0
	for ball in balls:
		ball.drop_delay = fx_rng.randf_range(0, 0.85)
		ball.drop_start = maxf(700, ball.position.y - world_board.position.y + 180)
		ball.drop_height = ball.drop_start
		ball.dropping = true
		ball.visible = false
	_refresh_ui()

func _advance_rain(delta: float) -> void:
	if not rain_active: return
	rain_elapsed += delta
	for ball in balls:
		if not ball.dropping: continue
		var t := clampf((rain_elapsed - ball.drop_delay) / 0.62, 0, 1)
		ball.visible = rain_elapsed >= ball.drop_delay
		ball.drop_height = ball.drop_start * (1.0 - t * t)
		ball.queue_redraw()
		if t >= 1:
			ball.dropping = false
			ball.freeze = false
			ball.collision_layer = 1
			ball.collision_mask = 3
			ball.linear_velocity = Vector2.from_angle(fx_rng.randf_range(0, TAU)) * fx_rng.randf_range(55, 130)
			_burst(ball.position, Color("d7a16a"), 5)
			_pulse(ball.position, Color("d7a16a"), 0.2, 35)
			if audio_cooldown <= 0:
				_tone(160 + fx_rng.randf_range(0, 120), 0.025)
				audio_cooldown = 0.07
	if rain_elapsed >= 2.2:
		for ball in balls:
			ball.linear_velocity = Vector2.ZERO
			ball.freeze = true
		rain_active = false
		_refresh_ui()

func _terrain_hit(kind: String, at: Vector2) -> void:
	if kind == "hole":
		_floating("TRAPPED!", at + Vector2(0, -40), Color("e4bd96"))
		_pulse(at, Color("a97754"), 0.4, 65)
		_burst(at, Color("a97754"), 12)
		_tone(110, 0.10)
	else:
		_burst(at, Color("e6b26a"), 10)

func _deal_hand() -> void:
	var pool: Array[int] = []
	for card_id in range(CARD_ACTIONS.size()): pool.append(card_id)
	for i in range(pool.size() - 1, 0, -1):
		var other := rng.randi_range(0, i)
		var held := pool[i]
		pool[i] = pool[other]
		pool[other] = held
	hand_missions.assign(pool.slice(0, 3))

func _start_round() -> void:
	for ball in balls:
		ball.free()
	balls.clear()
	if is_instance_valid(shooter): shooter.free()
	for child in overlay.get_children(): child.queue_free()
	overlay.visible = false
	phase = Phase.AIMING
	_make_obstacles()
	empty_deck_pending = false
	empty_deck_notice = 0
	opening_focus = true
	focus_amount = 1.0
	rain_pending = _is_destruction()
	rain_active = false
	rain_elapsed = 0
	shots = 8 + mini(4, int(stage / 3)) if _is_destruction() else 5
	hand_expanded = true
	damage_pairs.clear()
	lightning_arcs.clear()
	round_start_score = score
	displayed_score = score
	shot_wrong_color = false
	shot_multiplier = score_multiplier
	score_flash = 0
	mission_flash = 0
	camera_shake = 0
	motion_trail.clear()
	impact_rings.clear()
	if is_instance_valid(card_tween): card_tween.kill()
	for card in card_buttons: card.scale = Vector2.ONE
	goal = _destruction_goal(stage) if _is_destruction() else ROUND_GOALS[stage - 1]
	stock = [1, 1, 1]
	_deal_hand()
	selected = -1
	card_drawn_this_shot = false
	current_action = Action.STRAIGHT
	roll_display_action = Action.STRAIGHT
	roll_remaining = 0
	roll_confirm_pending = false
	roll_flash = 0
	active_action = Action.STRAIGHT
	aiming = false
	pointer_id = -99
	floaters.clear()
	score_motes.clear()
	particles.clear()
	var spots := [Vector2(360, 408), Vector2(320, 482), Vector2(400, 482), Vector2(275, 566), Vector2(360, 566), Vector2(445, 566), Vector2(360, 628), Vector2(360, 346)]
	var target_count := mini(56, 28 + stage * 4) if _is_destruction() else 5 + stage
	var placed: Array[Vector2] = []
	for i in range(target_count):
		var ball: BilaMarble = Marble.new()
		ball.terrain = obstacles
		ball.terrain_hit.connect(_terrain_hit)
		ball.destructible = _is_destruction()
		ball.position = _rain_position(placed) if _is_destruction() else spots[i]
		placed.append(ball.position)
		if _is_destruction():
			ball.freeze = true
			ball.visible = false
			ball.collision_layer = 0
			ball.collision_mask = 0
		ball.color_index = i % 6
		ball.body_entered.connect(_collision.bind(ball))
		balls.append(ball)
		add_child(ball)
	_clear_quest()
	shooter = Marble.new()
	shooter.terrain = obstacles
	shooter.terrain_hit.connect(_terrain_hit)
	shooter.position = HOME
	shooter.color_index = 2
	shooter.radius = 25.0
	shooter.mass = 1.25
	shooter.shooter = true
	shooter.freeze = true
	shooter.body_entered.connect(_collision.bind(shooter))
	add_child(shooter)
	_refresh_ui()

func _refresh_ui(animate_hand: bool = false) -> void:
	if is_instance_valid(hand_tween): hand_tween.kill()
	if animate_hand: hand_tween = create_tween().set_parallel(true)
	hand_toggle.visible = not rain_active and quest_active and _hand_size() > 0 and phase == Phase.AIMING and not roll_confirm_pending
	hand_toggle.disabled = aiming or card_drawn_this_shot
	hand_toggle.text = ("HIDE CARDS" if hand_expanded else "↑ CARDS %d" % _hand_size())
	var hand: Array[int] = []
	for i in range(3):
		card_buttons[i].visible = stock[i] > 0 or selected == i
		card_buttons[i].disabled = phase != Phase.AIMING or rain_active or aiming or card_drawn_this_shot or roll_remaining > 0 or roll_confirm_pending
		card_buttons[i].mission_color = CARD_TARGETS[hand_missions[i]]
		card_buttons[i].movement_action = CARD_ACTIONS[hand_missions[i]]
		card_buttons[i].movement_name = CARD_NAMES[CARD_ACTIONS[hand_missions[i]]]
		card_buttons[i].face_down = selected != i
		card_buttons[i].chosen = selected == i
		card_buttons[i].selection_caption = "REVEALED"
		card_buttons[i].queue_redraw()
		if stock[i] > 0 or selected == i: hand.append(i)
	for slot in range(hand.size()):
		var index: int = hand[slot]
		var offset := float(slot) - (hand.size() - 1) / 2.0
		var angle := offset * 11.0
		var raised: bool = hand_expanded or (selected == index and roll_confirm_pending)
		var center := Vector2(360 + offset * 138, layout_height - (202 if raised else 50) + absf(offset) * 16)
		if selected == index: center.y -= 10
		var target: Vector2 = center - card_buttons[index].size / 2
		if animate_hand:
			hand_tween.tween_property(card_buttons[index], "position", target, 0.24).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
		else: card_buttons[index].position = target
		card_buttons[index].rotation_degrees = angle
		card_buttons[index].z_index = 10 if selected == index else slot
	# GUI hit testing follows sibling order, not z_index. Keep the visible
	# top card last for touch, and the modal overlay above the whole hand.
	var hand_root := card_buttons[0].get_parent()
	for index in hand:
		hand_root.move_child(card_buttons[index], -1)
	if selected >= 0:
		hand_root.move_child(card_buttons[selected], -1)
	for control in [hand_toggle, sound_button, menu_button, roll_confirm_button, overlay]:
		hand_root.move_child(control, -1)
	roll_confirm_button.visible = roll_confirm_pending and phase == Phase.AIMING
	roll_confirm_button.disabled = roll_remaining > 0
	if roll_confirm_pending and roll_remaining <= 0 and phase == Phase.AIMING:
		status_label.text = "Confirm the revealed card to prepare your shot."
	elif roll_remaining > 0 and phase == Phase.AIMING:
		status_label.text = "Revealing movement…"
	elif phase == Phase.ROLLING:
		status_label.text = "%s in motion • wait for the marbles to stop" % CARD_NAMES[active_action]
	elif selected >= 0:
		status_label.text = "New objective: %s • stays active until replaced or the level ends." % COLOR_NAMES[quest_color]
	elif multiplier_flash > 0 and mission_streak > 0:
		status_label.text = "STREAK %d • next points x%d • choose your objective." % [mission_streak, score_multiplier]
	elif not quest_active:
		status_label.text = "Draw a card to reveal your objective."
	elif quest_progress >= quest_target:
		status_label.text = "Objective complete • draw another card to score more points." if _hand_size() > 0 else "Objective complete • another color breaks your streak after scoring."
	else:
		status_label.text = "Keep this objective or draw a card to try another color."

func _effective_action() -> int:
	return current_action

func _hand_size() -> int:
	return stock[0] + stock[1] + stock[2]

func _roll_action(action: int) -> void:
	roll_confirm_pending = true
	current_action = action
	effect_roll_count += 1
	roll_remaining = ROLL_DURATION
	roll_display_action = (current_action + 1) % CARD_NAMES.size()
	roll_tick = -1
	roll_flash = 0

func _confirm_roll() -> void:
	if not roll_confirm_pending or roll_remaining > 0 or phase != Phase.AIMING: return
	roll_confirm_pending = false
	roll_flash = 0
	if empty_deck_pending:
		empty_deck_notice = 2.4
		empty_deck_pending = false
	opening_focus = false
	if rain_pending: _start_rain()
	_refresh_ui(true)

func _advance_feedback(delta: float) -> void:
	for i in range(lightning_arcs.size() - 1, -1, -1):
		lightning_arcs[i].life -= delta
		if lightning_arcs[i].life <= 0: lightning_arcs.remove_at(i)
	empty_deck_notice = maxf(0, empty_deck_notice - delta)
	focus_amount = move_toward(focus_amount, 1.0 if opening_focus else 0.0, delta * 4.0)
	roll_flash = maxf(0, roll_flash - delta)
	mission_flash = maxf(0, mission_flash - delta)
	score_flash = maxf(0, score_flash - delta)
	multiplier_flash = maxf(0, multiplier_flash - delta)
	impact_cooldown = maxf(0, impact_cooldown - delta)
	camera_shake = maxf(0, camera_shake - delta * 17)
	displayed_score = move_toward(displayed_score, score, maxf(120, absf(score - displayed_score) * 12) * delta)
	if roll_remaining > 0:
		roll_remaining = maxf(0, roll_remaining - delta)
		var progress := 1.0 - roll_remaining / ROLL_DURATION
		var step := int(floor(10 * pow(progress, 0.65)))
		if step != roll_tick:
			roll_tick = step
			roll_display_action = (current_action + 1 + step) % CARD_NAMES.size()
			_tone(420 + roll_display_action * 110, 0.025)
		if roll_remaining <= 0:
			roll_display_action = current_action
			roll_flash = 0.35
			_tone(780 + current_action * 100, 0.075)
			if is_instance_valid(shooter): _pulse(shooter.position, CARD_COLORS[current_action], 0.32, 80)
			_refresh_ui()
	if is_instance_valid(camera):
		camera.offset = Vector2(sin(clock_time * 71), cos(clock_time * 89)) * camera_shake / world_zoom if phase == Phase.ROLLING else Vector2.ZERO
	for ball in balls:
		ball.advance_visuals(delta)
	if is_instance_valid(shooter):
		shooter.effect_action = active_action if phase == Phase.ROLLING else current_action
		shooter.effect_active = quest_active
		shooter.charge = aim_vector.length() / 170 if aiming else 0.0
		shooter.advance_visuals(delta)
	for i in range(impact_rings.size() - 1, -1, -1):
		impact_rings[i].life -= delta
		if impact_rings[i].life <= 0: impact_rings.remove_at(i)
	for i in range(motion_trail.size() - 1, -1, -1):
		motion_trail[i].life -= delta
		if motion_trail[i].life <= 0: motion_trail.remove_at(i)
	if phase == Phase.ROLLING and is_instance_valid(shooter) and shooter.linear_velocity.length() > 70:
		trail_clock += delta
		if trail_clock >= 0.025:
			trail_clock = 0
			motion_trail.append({"p": shooter.position, "life": 0.36})
			if motion_trail.size() > 20: motion_trail.pop_front()

func _pulse(at: Vector2, color: Color, life: float = 0.3, radius: float = 100) -> void:
	impact_rings.append({"p": at, "color": color, "life": life, "duration": life, "radius": radius})
	if impact_rings.size() > 18: impact_rings.pop_front()

func _remaining_colors() -> Array[int]:
	var colors: Array[int] = []
	for ball in balls:
		if not ball.captured and not ball.color_index in colors: colors.append(ball.color_index)
	return colors

func _set_quest(color: int, origin: String) -> void:
	quest_active = true
	quest_color = color
	quest_origin = origin
	mission_flash = 0.5
	quest_target = 0
	for ball in balls:
		if not ball.captured and ball.color_index == color: quest_target += 1
	quest_progress = 0
	quest_completed = false
	quest_completion_pending = false

func _clear_quest() -> void:
	quest_active = false
	quest_color = 0
	quest_origin = ""
	quest_target = 0
	quest_progress = 0
	quest_completed = false
	quest_completion_pending = false
	quest_points = 0
	quest_switch_count = 0

func _use_card(index: int) -> void:
	if is_instance_valid(front_end) and front_end.is_open(): return
	if index < 0 or index >= 3 or phase != Phase.AIMING or aiming or stock[index] <= 0 or card_drawn_this_shot or roll_remaining > 0 or roll_confirm_pending: return
	# A card always retains its deck color, even when that color is exhausted.
	var card_id: int = hand_missions[index]
	var color: int = CARD_TARGETS[card_id]
	run_cards_used += 1
	stock[index] -= 1
	if _hand_size() == 0: empty_deck_pending = true
	selected = index
	card_drawn_this_shot = true
	hand_expanded = false
	quest_switch_count += 1
	if quest_progress > 0 and quest_progress < quest_target:
		_break_streak("OBJECTIVE ABANDONED")
	_set_quest(color, "CARD OBJECTIVE")
	_roll_action(CARD_ACTIONS[card_id])
	shooter.set_size(56.0 if current_action == Action.GIANT else (18.0 if current_action == Action.PIERCING else 25.0))
	_tone(500 + color * 70, 0.07)
	_refresh_ui(true)
	if is_instance_valid(card_tween): card_tween.kill()
	card_buttons[index].scale = Vector2(0.12, 1.0)
	card_tween = create_tween()
	card_tween.tween_property(card_buttons[index], "scale", Vector2.ONE, 0.22).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

func _shot_velocity(vector: Vector2, action: int) -> Vector2:
	var factor := 1.0
	if action == Action.HEAVY: factor = 0.82
	elif action == Action.GIANT: factor = 0.85
	elif action == Action.PIERCING: factor = 1.12
	return vector.limit_length(170.0) * LAUNCH_SPEED * factor

func _aim_preview() -> PackedVector2Array:
	var points := PackedVector2Array()
	var at := shooter.position
	var velocity := _shot_velocity(aim_vector, _effective_action())
	var step := 1.0 / 60.0
	var ignored: int = shooter.trap_index if shooter.trapped else shooter.ignored_hole
	for i in range(96):
		velocity *= 1.0 - (0.75 if _effective_action() == Action.RICOCHET else (2.3 if _effective_action() == Action.HEAVY else 1.8)) * step
		var flying: bool = _effective_action() == Action.BOUNCE and Marble.hop_height_at((i + 1) * step) > 12
		for index in range(obstacles.size()):
			var obstacle: Dictionary = obstacles[index]
			if obstacle.kind == "hole" and index == ignored:
				if at.distance_to(obstacle.p) > obstacle.radius + shooter.radius + 12: ignored = -1
				else: continue
			if flying: continue
			if obstacle.kind == "sand":
				var local: Vector2 = (at - obstacle.p) / obstacle.extent
				if local.length_squared() < 1: velocity *= exp(-4.2 * step)
			elif Geometry2D.get_closest_point_to_segment(obstacle.p, at, at + velocity * step).distance_to(obstacle.p) < obstacle.radius * 0.55:
				points.append(obstacle.p)
				return points
		at += velocity * step
		points.append(at)
	return points

func _notification(what: int) -> void:
	if what == NOTIFICATION_APPLICATION_PAUSED:
		app_in_background = true
		_apply_music_settings()
	elif what == NOTIFICATION_APPLICATION_RESUMED:
		app_in_background = false
		_apply_music_settings()
	if what == NOTIFICATION_APPLICATION_PAUSED or what == NOTIFICATION_WM_WINDOW_FOCUS_OUT:
		if aiming:
			aiming = false
			pointer_id = -99
			if is_instance_valid(status_label): _refresh_ui()

func _input(event: InputEvent) -> void:
	# Controls receive emulated mouse clicks; gameplay handles the native
	# finger event only, so the same touch cannot launch twice.
	if event is InputEventMouse and event.device == InputEvent.DEVICE_ID_EMULATION: return
	# Keep the active drag even if the finger is released over a UI button.
	if not aiming: return
	if event is InputEventScreenDrag and event.index == pointer_id:
		_update_aim(_screen_to_world(event.position))
		get_viewport().set_input_as_handled()
	elif event is InputEventScreenTouch and not event.pressed and event.index == pointer_id:
		if event.canceled:
			aiming = false
			pointer_id = -99
			_refresh_ui()
		else:
			_release_aim(_screen_to_world(event.position))
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseMotion and pointer_id == -1:
		_update_aim(_screen_to_world(event.position))
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and not event.pressed and pointer_id == -1:
		_release_aim(_screen_to_world(event.position))
		get_viewport().set_input_as_handled()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouse and event.device == InputEvent.DEVICE_ID_EMULATION: return
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		aiming = false
		selected = -1
		pointer_id = -99
		_refresh_ui()
	if phase != Phase.AIMING: return
	if event is InputEventScreenTouch:
		if event.pressed:
			_begin_aim(_screen_to_world(event.position), event.index)
		elif pointer_id == event.index:
			_release_aim(_screen_to_world(event.position))
	elif event is InputEventScreenDrag and aiming and pointer_id == event.index:
		_update_aim(_screen_to_world(event.position))
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if event.pressed:
			_begin_aim(_screen_to_world(event.position), -1)
		elif pointer_id == -1:
			_release_aim(_screen_to_world(event.position))
	elif event is InputEventMouseMotion and aiming and pointer_id == -1:
		_update_aim(_screen_to_world(event.position))

func _screen_to_world(at: Vector2) -> Vector2:
	return get_viewport().get_canvas_transform().affine_inverse() * at

func _world_to_screen(at: Vector2) -> Vector2:
	return get_viewport().get_canvas_transform() * at

func _begin_aim(at: Vector2, id: int) -> void:
	if is_instance_valid(front_end) and front_end.is_open(): return
	if not board_screen.has_point(_world_to_screen(at)): return
	if rain_active or not quest_active or aiming or roll_remaining > 0 or roll_confirm_pending or phase != Phase.AIMING or at.distance_to(shooter.position) > 100.0 / world_zoom: return
	aiming = true
	pointer_id = id
	_update_aim(at)
	_refresh_ui()

func _update_aim(at: Vector2) -> void:
	drag_position = at
	aim_vector = (shooter.position - at).limit_length(170.0)

func _release_aim(at: Vector2) -> void:
	if not aiming: return
	_update_aim(at)
	aiming = false
	pointer_id = -99
	if aim_vector.length() < 15.0:
		_refresh_ui()
		return
	_launch(aim_vector)

func _launch(vector: Vector2) -> void:
	if is_instance_valid(front_end) and front_end.is_open(): return
	if rain_active or not quest_active or phase != Phase.AIMING or shots <= 0 or roll_remaining > 0 or roll_confirm_pending: return
	active_action = _effective_action()
	selected = -1
	shots -= 1
	shot_captures = 0
	shot_multiplier = score_multiplier
	shot_wrong_color = false
	phase = Phase.ROLLING
	if _is_destruction():
		for ball in balls:
			if not ball.captured: ball.freeze = false
	shot_time = 0.0
	quiet_time = 0.0
	shooter.release_trap()
	shooter.freeze = false
	shooter.sleeping = false
	special_hits.clear()
	blast_used = false
	lightning_used = false
	last_shooter_position = shooter.position
	shooter.set_size(56.0 if active_action == Action.GIANT else (18.0 if active_action == Action.PIERCING else 25.0))
	shooter.mass = 2.8 if active_action == Action.HEAVY else 1.25
	shooter.linear_damp = 2.3 if active_action == Action.HEAVY else 1.8
	if active_action == Action.GIANT: shooter.mass = 6.0
	if active_action == Action.RICOCHET: shooter.linear_damp = 0.75
	shooter.physics_material_override.bounce = 0.98 if active_action == Action.RICOCHET else (0.25 if active_action == Action.GIANT else 0.72)
	shooter.heavy = active_action == Action.HEAVY
	shooter.start_hops(active_action == Action.BOUNCE)
	if active_action == Action.PIERCING:
		shooter.collision_layer = 0
		shooter.collision_mask = 2
	shooter.linear_velocity = _shot_velocity(vector, active_action)
	motion_trail.clear()
	trail_clock = 0
	_pulse(shooter.position, CARD_COLORS[active_action], 0.32, 110)
	_burst(shooter.position, CARD_COLORS[active_action], 18)
	camera_shake = 2.0
	shooter.hit_flash = 0.15
	_tone(160, 0.06)
	_tone(320, 0.045)
	_refresh_ui()

func _physics_process(delta: float) -> void:
	clock_time += delta
	audio_cooldown = maxf(0.0, audio_cooldown - delta)
	_advance_feedback(delta)
	_advance_rain(delta)
	if phase == Phase.ROLLING:
		shot_time += delta
		_advance_special(delta)
		var moving := shooter.linear_velocity.length() > 7.0
		for ball in balls:
			if ball.captured: continue
			if not _is_destruction() and _fully_outside(ball.position, ball.radius):
				_capture(ball)
			elif ball.linear_velocity.length() > 7.0:
				moving = true
		quiet_time = 0.0 if moving else quiet_time + delta
		if (shot_time > 0.35 and quiet_time > 0.25) or shot_time > 9.0:
			_finish_shot()
	for i in range(floaters.size() - 1, -1, -1):
		floaters[i].life -= delta
		floaters[i].p.y -= delta * 32.0
		if floaters[i].life <= 0: floaters.remove_at(i)
	for i in range(score_motes.size() - 1, -1, -1):
		score_motes[i].life -= delta
		if score_motes[i].life <= 0: score_motes.remove_at(i)
	for i in range(particles.size() - 1, -1, -1):
		particles[i].life -= delta
		particles[i].p += particles[i].v * delta
		particles[i].v *= pow(0.1, delta)
		if particles[i].life <= 0: particles.remove_at(i)
	world_view.queue_redraw()
	hud_view.queue_redraw()

func _fully_outside(at: Vector2, radius: float) -> bool:
	if Geometry2D.is_point_in_polygon(at, TRIANGLE): return false
	var nearest := INF
	for i in range(3):
		nearest = minf(nearest, at.distance_to(Geometry2D.get_closest_point_to_segment(at, TRIANGLE[i], TRIANGLE[(i + 1) % 3])))
	return nearest > radius + 2.0

func _capture(ball: BilaMarble) -> void:
	if ball.captured: return
	ball.captured = true
	run_destroyed += 1
	ball.set_deferred("freeze", true)
	ball.set_deferred("collision_layer", 0)
	ball.set_deferred("collision_mask", 0)
	ball.visible = false
	var matched: bool = quest_active and ball.color_index == quest_color
	var factor := shot_multiplier if phase == Phase.ROLLING else score_multiplier
	var base_value := TARGET_POINTS if matched else BASE_POINTS
	var value := base_value * factor
	if matched:
		quest_progress += 1
		quest_points += value
		if not quest_completed and quest_progress >= quest_target:
			quest_completed = true
			quest_completion_pending = true
			completed_missions += 1
	else:
		shot_wrong_color = true
	score += value
	shot_captures += 1
	var color: Color = COLOR_TINTS[quest_color] if matched else Color("cebdad")
	_floating("+%d" % value, ball.position, color, matched)
	floaters.back()["detail"] = "%d × %d" % [base_value, factor] if matched else "OTHER COLOR"
	floaters.back()["points"] = true
	var origin: Vector2 = hud_view.get_global_transform_with_canvas().affine_inverse() * world_view.get_global_transform_with_canvas() * ball.position
	for i in range(5 if matched else 2):
		score_motes.append({"from": origin, "life": 1.05 + i * 0.065, "duration": 1.05 + i * 0.065, "delay": 0.20 + i * 0.065, "color": color, "bend": (i - 2) * 20.0})
	while score_motes.size() > 40: score_motes.pop_front()
	_burst(ball.position, color, 28 if matched else 8)
	_pulse(ball.position, color, 0.5 if matched else 0.22, 150 if matched else 65)
	score_flash = 0.32
	if matched: mission_flash = 0.5
	if shot_captures == 2 or shot_captures == 3:
		_floating("%d MARBLES IN ONE SHOT!" % shot_captures, shooter.position + Vector2(0, -75), Color("ffdd8c"))
	_tone(650 + shot_captures * 110, 0.07)

func _break_streak(reason: String) -> void:
	if mission_streak > 0:
		_floating("%s • x1" % reason, shooter.position + Vector2(0, -70), Color("d6b8c3"))
		multiplier_flash = 0.5
	mission_streak = 0
	score_multiplier = 1

func _resolve_mission_streak() -> void:
	if shot_wrong_color:
		_break_streak("STREAK BROKEN")
	elif quest_completion_pending:
		mission_streak += 1
		score_multiplier = 1 + mission_streak
		multiplier_flash = 0.8
		mission_flash = 0.7
		_floating("STREAK %d! NEXT x%d" % [mission_streak, score_multiplier], shooter.position + Vector2(0, -75), Color("ffe18a"), true)
		_pulse(shooter.position, Color("ffe18a"), 0.6, 170)
		_tone(820, 0.08)
	quest_completion_pending = false
	shot_wrong_color = false

func _check_round_goal() -> bool:
	if score < goal: return false
	roll_remaining = 0
	roll_confirm_pending = false
	if not _is_destruction() and stage == 3:
		phase = Phase.WON
		_save_best()
		_show_result()
	else:
		phase = Phase.REWARD
		if _is_destruction(): _save_best()
		_show_reward()
	return true

func _finish_shot() -> void:
	for ball in balls:
		ball.linear_velocity = Vector2.ZERO
		ball.angular_velocity = 0
	shooter.freeze = true
	shooter.linear_velocity = Vector2.ZERO
	shooter.start_hops(false)
	shooter.set_size(56.0 if current_action == Action.GIANT else (18.0 if current_action == Action.PIERCING else 25.0))
	shooter.physics_material_override.bounce = 0.72
	shooter.heavy = false
	shooter.mass = 1.25
	shooter.linear_damp = 1.8
	camera_shake = 0
	camera.offset = Vector2.ZERO
	selected = -1
	card_drawn_this_shot = false
	aim_vector = Vector2.ZERO
	_resolve_mission_streak()
	if _check_round_goal():
		pass
	elif shots <= 0 or balls.all(func(ball): return ball.captured):
		phase = Phase.LOST
		_save_best()
		_show_result()
	else:
		phase = Phase.AIMING
	_refresh_ui()

func _restart() -> void:
	if phase == Phase.ROLLING: return
	stage = 1
	run_destroyed = 0
	run_cards_used = 0
	run_new_record = false
	_read_best()
	total_score = 0
	round_start_score = 0
	mission_streak = 0
	score_multiplier = 1
	shot_multiplier = 1
	completed_missions = 0
	multiplier_flash = 0
	effect_roll_count = 0
	stock = [1, 1, 1]
	_start_round()

func _clear_overlay() -> void:
	for child in overlay.get_children():
		overlay.remove_child(child)
		child.queue_free()
	overlay.visible = true
	var shade := ColorRect.new()
	shade.color = Color(0.035, 0.025, 0.065, 0.87)
	shade.position = Vector2(-(view_size.x - 720) / 2, -safe_top)
	shade.size = view_size
	overlay.add_child(shade)

func _overlay_label(caption: String, y: float, size_px: int, color: Color) -> void:
	var label := Label.new()
	label.text = caption
	label.position = Vector2(40, y + (layout_height - 1280) / 2)
	label.size = Vector2(640, 90)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_override("font", BOLD if size_px >= 28 else FONT)
	label.add_theme_font_size_override("font_size", size_px)
	label.add_theme_color_override("font_color", color)
	overlay.add_child(label)

func _show_reward() -> void:
	_clear_overlay()
	_overlay_label("DESTRUCTION LEVEL %d!" % stage if _is_destruction() else "ROUND COMPLETE!", 360, 36, MINT)
	_overlay_label("TOTAL %d • target %d • level +%d" % [score, goal, score - round_start_score], 440, 23, CREAM)
	_overlay_label("OBJECTIVES: +%d POINTS\nLast color: %s (%d/%d)" % [quest_points, COLOR_NAMES[quest_color], quest_progress, quest_target], 510, 22, COLOR_TINTS[quest_color])
	_overlay_label("Three new cards will be drawn from the collection.", 590, 24, CREAM)
	_overlay_label("STREAK %d • NEXT POINTS x%d" % [mission_streak, score_multiplier], 650, 23, Color("ffe18a"))
	var next := _button("NEXT LEVEL" if _is_destruction() else "NEXT ROUND", Rect2(140, 740 + (layout_height - 1280) / 2, 440, 84), MINT, 25)
	next.pressed.connect(_next_round)
	overlay.add_child(next)

func _next_round() -> void:
	if phase != Phase.REWARD: return
	stage += 1
	_start_round()
	_check_round_goal()
	_refresh_ui()

func _show_result() -> void:
	_clear_overlay()
	var art = preload("res://scripts/game_over.gd").new()
	art.game = self
	var top := maxf(110, (layout_height - 1000) / 2)
	art.position = Vector2(60, top)
	overlay.add_child(art)
	var retry := _button("TRY AGAIN", Rect2(120, top + 650, 480, 76), Color("ff797c"), 27)
	retry.pressed.connect(_restart)
	overlay.add_child(retry)
	var menu := _button("BACK TO MENU", Rect2(120, top + 742, 480, 58), Color("79688e"), 21)
	menu.pressed.connect(func(): front_end.show_main())
	overlay.add_child(menu)

func _read_best() -> void:
	if test_mode: return
	best = 0
	var config := ConfigFile.new()
	if config.load("user://recorde.cfg") == OK:
		best = int(config.get_value("game", "best_destruction" if _is_destruction() else "best", 0))

func _save_best() -> void:
	if total_score > best: run_new_record = true
	best = maxi(best, total_score)
	if test_mode: return
	var config := ConfigFile.new()
	config.load("user://recorde.cfg")
	config.set_value("game", "best_destruction" if _is_destruction() else "best", best)
	config.save("user://recorde.cfg")

func _damage_target(ball: BilaMarble, damage: int = 1) -> void:
	if ball.shooter or ball.captured: return
	ball.hits_taken += damage
	ball.hit_flash = 0.18
	ball.queue_redraw()
	if ball.hits_taken >= 2: _capture(ball)
	else: _burst(ball.position, COLOR_TINTS[ball.color_index], 8)

func _advance_special(delta: float) -> void:
	if active_action in [Action.PIERCING, Action.GIANT]:
		for ball in balls:
			if ball.captured or special_hits.has(ball.get_instance_id()): continue
			var closest := Geometry2D.get_closest_point_to_segment(ball.position, last_shooter_position, shooter.position)
			if closest.distance_to(ball.position) <= ball.radius + shooter.radius + (18 if active_action == Action.GIANT else 0):
				special_hits[ball.get_instance_id()] = true
				_damage_target(ball)
	elif active_action in [Action.MAGNET, Action.REPULSOR] and shooter.linear_velocity.length() > 15:
		for ball in balls:
			if ball.captured or ball.trapped: continue
			var offset := shooter.position - ball.position
			if offset.length() > 30 and offset.length() < 190:
				ball.linear_velocity += offset.normalized() * (450 if active_action == Action.MAGNET else -600) * delta * (1 - offset.length() / 230)
	last_shooter_position = shooter.position

func _explode(at: Vector2) -> void:
	blast_used = true
	_pulse(at, CARD_COLORS[Action.EXPLOSIVE], 0.65, 290)
	_pulse(at, Color("fff0cf"), 0.35, 150)
	_burst(at, CARD_COLORS[Action.EXPLOSIVE], 70, 560)
	camera_shake = maxf(camera_shake, 4.5)
	_tone(100, 0.15)
	for ball in balls:
		if ball.captured: continue
		var offset := ball.position - at
		var distance := offset.length()
		if distance < 260:
			_damage_target(ball, 2 if distance <= 130 else 1)
			if not ball.captured:
				ball.apply_central_impulse(offset.normalized() * 750 * (1 - distance / 320))

func _chain_lightning(primary: BilaMarble) -> void:
	lightning_used = true
	var visited: Array[BilaMarble] = [primary]
	var origin := primary.position
	for hop in range(3):
		var next: BilaMarble = null
		var nearest := 220.0
		for ball in balls:
			if ball.captured or ball in visited: continue
			var distance := origin.distance_to(ball.position)
			if distance < nearest:
				nearest = distance
				next = ball
		if next == null: break
		var points := PackedVector2Array([origin])
		for step in range(1, 5):
			points.append(origin.lerp(next.position, step / 5.0) + Vector2(fx_rng.randf_range(-10, 10), fx_rng.randf_range(-10, 10)))
		points.append(next.position)
		lightning_arcs.append({"points": points, "life": 0.35})
		_damage_target(next)
		visited.append(next)
		origin = next.position
	_tone(1000, 0.08)

func _destruction_impact(first: BilaMarble, second: BilaMarble) -> void:
	if first.captured or second.captured: return
	if (first.linear_velocity - second.linear_velocity).length() < 85: return
	var ids := [first.get_instance_id(), second.get_instance_id()]
	ids.sort()
	var pair := "%d:%d" % ids
	if clock_time - float(damage_pairs.get(pair, -100.0)) < 0.18: return
	damage_pairs[pair] = clock_time
	var direct := first.shooter or second.shooter
	var target: BilaMarble = second if first.shooter else first
	if direct and active_action == Action.EXPLOSIVE and not blast_used:
		_explode(shooter.position)
		return
	if direct and active_action == Action.GIANT:
		# The continuous wide sweep owns damage; body collisions only push.
		return
	for ball in [first, second]:
		_damage_target(ball, 2 if direct and active_action == Action.HEAVY else 1)
	if direct and active_action == Action.FROST and not target.captured:
		target.frost_remaining = 2.4
		target.linear_velocity *= 0.25
		_burst(target.position, CARD_COLORS[Action.FROST], 12)
	if direct and active_action == Action.LIGHTNING and not lightning_used:
		_chain_lightning(target)

func _collision(other: Node, ball: BilaMarble) -> void:
	if phase != Phase.ROLLING: return
	if _is_destruction() and other is BilaMarble: _destruction_impact(ball, other)
	if ball.linear_velocity.length() < 35: return
	ball.hit_flash = 0.18
	if other is BilaMarble:
		other.hit_flash = 0.18
		_burst(ball.position, Color("ffe7a6"), 6)
		if impact_cooldown <= 0:
			impact_cooldown = 0.055
			camera_shake = minf(4.5, ball.linear_velocity.length() / 240)
			_pulse(ball.position, Color("ffe7a6"), 0.24, 75)
		if audio_cooldown <= 0:
			_tone(380 + fx_rng.randf_range(0, 300), 0.035)
			audio_cooldown = 0.055

func _floating(caption: String, at: Vector2, color: Color, important: bool = false) -> void:
	# Offset simultaneous awards so their numbers remain distinct.
	var offset := Vector2((floaters.size() % 3 - 1) * 40, -floaters.size() % 3 * 42)
	floaters.append({"text": caption, "p": at + offset, "color": color, "life": 1.55, "duration": 1.55, "size": 42 if important else 30, "important": important, "points": false, "detail": ""})
	while floaters.size() > 14: floaters.pop_front()

func _burst(at: Vector2, color: Color, amount: int = 12, speed: float = 190) -> void:
	for i in range(amount):
		particles.append({"p": at, "v": Vector2.from_angle(fx_rng.randf_range(0, TAU)) * fx_rng.randf_range(45, speed), "life": fx_rng.randf_range(0.25, 0.6), "color": color})
	while particles.size() > 200: particles.pop_front()

func _setup_music() -> void:
	music = AudioStreamPlayer.new()
	music.name = "BackgroundMusic"
	music.process_mode = Node.PROCESS_MODE_ALWAYS
	var loop: AudioStreamWAV = MUSIC.duplicate()
	loop.loop_mode = AudioStreamWAV.LOOP_FORWARD
	loop.loop_begin = 0
	loop.loop_end = int(round(loop.get_length() * loop.mix_rate))
	music.stream = loop
	add_child(music)

func _apply_music_settings() -> void:
	if not is_instance_valid(music): return
	music.volume_db = -12.0 + linear_to_db(maxf(music_volume_percent / 100, 0.0001))
	if music_enabled and music_volume_percent > 0 and not app_in_background:
		if not music.playing and not test_mode: music.play()
		music.stream_paused = false
	else:
		music.stream_paused = true

func _setup_audio() -> void:
	audio = AudioStreamPlayer.new()
	var generator := AudioStreamGenerator.new()
	generator.mix_rate = 22050
	generator.buffer_length = 0.08
	audio.stream = generator
	audio.volume_db = -15 + linear_to_db(maxf(volume_percent / 100.0, 0.0001))
	add_child(audio)
	audio.play()
	audio_playback = audio.get_stream_playback()

func _tone(frequency: float, duration: float) -> void:
	if not sound_enabled or audio_playback == null: return
	notes.append({"frequency": frequency, "duration": duration, "t": 0.0})

func _process(_delta: float) -> void:
	if audio_playback == null: return
	var space := audio_playback.get_frames_available()
	for i in range(space):
		var sample := 0.0
		for j in range(notes.size() - 1, -1, -1):
			var n: Dictionary = notes[j]
			n.t += 1.0 / 22050.0
			if n.t >= n.duration:
				notes.remove_at(j)
			elif sound_enabled:
				sample += sin(n.t * n.frequency * TAU) * (1.0 - n.t / n.duration) * 0.45
		audio_playback.push_frame(Vector2.ONE * clampf(sample, -0.95, 0.95))

func _take_screenshot() -> void:
	var args := OS.get_cmdline_user_args()
	if "--preview-profile" in args:
		front_end.show_profile()
	elif "--preview-deck" in args:
		front_end.show_deck()
	elif "--preview-options" in args:
		front_end.show_options()
	if "--preview-game" in args or "--preview-used" in args or "--preview-reward" in args or "--preview-aim" in args or "--preview-roll" in args or "--preview-impact" in args or "--preview-combo" in args or "--preview-result" in args or "--preview-hop" in args or "--preview-obstacles" in args or "--preview-destruction" in args or "--preview-game-over" in args:
		if front_end.player_name == "": front_end.player_name = "Player"
		front_end.start_game(GameMode.DESTRUCTION if "--preview-destruction" in args else GameMode.CLASSIC)
		if "--preview-effect" in args:
			var index := args.find("--preview-effect")
			hand_missions[0] = CARD_ACTIONS.find(clampi(int(args[index + 1]), 0, 10))
			_refresh_ui()
		if "--preview-roll" in args:
			_advance_feedback(0.27)
		else:
			await get_tree().create_timer(1.15, true).timeout
	if "--preview-roll" in args or "--preview-result" in args:
		_use_card(0)
		_advance_feedback(0.27 if "--preview-roll" in args else 1.0)
		_refresh_ui()
	if "--preview-combo" in args:
		mission_streak = 2
		score_multiplier = 3
		score = 180
		displayed_score = score
		goal = 600
		_refresh_ui()
	if "--preview-roll" not in args and "--preview-result" not in args:
		_confirm_roll()
	if "--preview-hop" in args:
		_use_card(0)
		_advance_feedback(1.0)
		_confirm_roll()
		current_action = Action.BOUNCE
		_launch(Vector2(0, -120))
		await get_tree().create_timer(0.18, true).timeout
	if "--preview-impact" in args:
		_use_card(0)
		_advance_feedback(1.0)
		_confirm_roll()
		for ball in balls:
			if ball.color_index == quest_color:
				_capture(ball)
				break
		await get_tree().create_timer(0.30, true).timeout
	if "--preview-destruction" in args:
		_use_card(0)
		_advance_feedback(1.0)
		_confirm_roll()
		balls[0].hits_taken = 1
		balls[7].hits_taken = 1
		await get_tree().create_timer(0.75 if "--preview-rain" in args else 2.5, true).timeout
	if "--preview-game-over" in args:
		score = 125
		stage = 2
		goal = 480
		shots = 0
		run_destroyed = 9
		run_cards_used = 5
		phase = Phase.LOST
		_save_best()
		_show_result()
		await get_tree().create_timer(0.9, true).timeout
	if "--preview-toast" in args:
		empty_deck_notice = 2.2
	if "--preview-used" in args:
		stock = [0, 1, 0]
		current_action = Action.BOUNCE
		_refresh_ui()
	elif "--preview-reward" in args:
		score = goal
		phase = Phase.REWARD
		if _is_destruction(): _save_best()
		_show_reward()
	elif "--preview-aim" in args:
		var slot := 1
		if "--preview-effect" in args:
			var index := args.find("--preview-effect")
			slot = hand_missions.find(CARD_ACTIONS.find(clampi(int(args[index + 1]), 0, 10)))
		_use_card(slot)
		_advance_feedback(1.0)
		_confirm_roll()
		if rain_active: await get_tree().create_timer(2.4, true).timeout
		_begin_aim(HOME, -1)
		_update_aim(HOME + Vector2(55, 180 if "--preview-max" in args else 140))
		await get_tree().create_timer(0.3, true).timeout
	await get_tree().process_frame
	await get_tree().process_frame
	var idx := args.find("--screenshot")
	var path := args[idx + 1] if idx + 1 < args.size() else "/tmp/bila-mobile.png"
	var image := get_viewport().get_texture().get_image()
	image.save_png(path)
	print("SCREENSHOT: ", path)
	get_tree().quit()
