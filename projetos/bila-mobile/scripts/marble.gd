class_name BilaMarble
extends RigidBody2D

const EffectIcons = preload("res://scripts/effect_icons.gd")
var effect_action: int = 0
var effect_active: bool = false
var visual_clock: float = 0.0
const ATLAS = preload("res://assets/bilas-atlas.png")
var radius: float = 21.0
var color_index: int = 0
var shooter: bool = false
var captured: bool = false
var destructible: bool = false
var hits_taken: int = 0
var frost_remaining: float = 0.0
var dropping: bool = false
var drop_delay: float = 0.0
var drop_start: float = 0.0
var drop_height: float = 0.0
var hit_flash: float = 0.0
var charge: float = 0.0
signal terrain_hit(kind: String, at: Vector2)
var terrain: Array[Dictionary] = []
var trapped: bool = false
var trap_index: int = -1
var trap_center := Vector2.ZERO
var ignored_hole: int = -1
var on_sand: bool = false
var heavy: bool = false

func release_trap() -> void:
	if trapped:
		ignored_hole = trap_index
		trapped = false
		trap_index = -1

func _terrain_forces(state: PhysicsDirectBodyState2D) -> void:
	var at := state.transform.origin
	if trapped:
		state.linear_velocity = Vector2.ZERO
		state.angular_velocity = 0
		state.transform = Transform2D(0, trap_center)
		return
	var in_sand := false
	for i in range(terrain.size()):
		var obstacle: Dictionary = terrain[i]
		if obstacle.kind == "hole":
			if i == ignored_hole:
				if at.distance_to(obstacle.p) > obstacle.radius + radius + 12: ignored_hole = -1
				else: continue
			if airborne: continue
			var next := at + state.linear_velocity * state.step
			var nearest := Geometry2D.get_closest_point_to_segment(obstacle.p, at, next)
			if nearest.distance_to(obstacle.p) < obstacle.radius * 0.55:
				trapped = true
				trap_index = i
				trap_center = obstacle.p
				state.transform = Transform2D(0, trap_center)
				state.linear_velocity = Vector2.ZERO
				state.angular_velocity = 0
				terrain_hit.emit("hole", trap_center)
				break
		elif obstacle.kind == "sand" and not airborne:
			var local: Vector2 = (at - obstacle.p) / obstacle.extent
			if local.length_squared() < 1:
				in_sand = true
				state.linear_velocity *= exp(-4.2 * state.step)
				if not on_sand: terrain_hit.emit("sand", at)
	on_sand = in_sand

const HOP_PERIOD = 0.54
const HOP_AIRTIME = 0.36
const HOP_COUNT = 3
var hop_elapsed: float = -1.0
var hop_height: float = 0.0
var airborne: bool = false

func start_hops(enabled: bool) -> void:
	hop_elapsed = 0.0 if enabled else -1.0
	hop_height = 0.0
	airborne = false
	collision_layer = 1
	collision_mask = 3

static func hop_height_at(elapsed: float) -> float:
	if elapsed < 0: return 0.0
	var cycle := int(elapsed / HOP_PERIOD)
	var local := fmod(elapsed, HOP_PERIOD)
	return sin(PI * local / HOP_AIRTIME) * (58.0 - cycle * 12) if cycle < HOP_COUNT and local < HOP_AIRTIME else 0.0

func _physics_process(delta: float) -> void:
	if hop_elapsed < 0: return
	hop_elapsed += delta
	var cycle := int(hop_elapsed / HOP_PERIOD)
	hop_height = hop_height_at(hop_elapsed)
	var in_air := hop_height > 12
	if in_air != airborne:
		airborne = in_air
		# Walls use layer 2; airborne marbles pass over targets on layer 1.
		collision_layer = 0 if airborne else 1
		collision_mask = 2 if airborne else 3
		if not airborne:
			hit_flash = 0.18
	if cycle >= HOP_COUNT:
		hop_elapsed = -1
	queue_redraw()

func advance_visuals(delta: float) -> void:
	if frost_remaining > 0:
		frost_remaining = maxf(0, frost_remaining - delta)
		queue_redraw()
	if shooter: visual_clock += delta
	if hit_flash > 0 or shooter:
		hit_flash = maxf(0, hit_flash - delta)
		queue_redraw()

func set_size(value: float) -> void:
	radius = value
	if get_child_count() > 0:
		var collision := get_child(0) as CollisionShape2D
		if collision: collision.shape.radius = value
	queue_redraw()

func _ready() -> void:
	collision_mask = 3
	gravity_scale = 0.0
	linear_damp = 1.8
	angular_damp = 4.0
	lock_rotation = true
	continuous_cd = RigidBody2D.CCD_MODE_CAST_SHAPE
	contact_monitor = true
	max_contacts_reported = 4
	var material := PhysicsMaterial.new()
	material.bounce = 0.72
	material.friction = 0.0
	physics_material_override = material
	var collision := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = radius
	collision.shape = circle
	add_child(collision)
	queue_redraw()

func _integrate_forces(state: PhysicsDirectBodyState2D) -> void:
	_terrain_forces(state)
	if trapped: return
	if frost_remaining > 0:
		state.linear_velocity *= exp(-4.0 * state.step)

func _draw() -> void:
	draw_circle(Vector2(2, 5), radius + 1, Color(0.12, 0.06, 0.1, 0.35))
	draw_set_transform(Vector2(0, 6 if trapped else -hop_height - drop_height), 0, Vector2.ONE * (0.72 if trapped else 1.0))
	var source := Rect2(35 + (color_index % 4) * 313.5, 49 + (color_index / 4) * 313.5, 244, 244)
	var extent := radius * 1.24 * (1.0 + 0.10 * hit_flash / 0.18)
	if hit_flash > 0:
		draw_circle(Vector2.ZERO, radius + 6, Color(1, 0.96, 0.75, hit_flash * 2))
	if shooter:
		var tint: Color = EffectIcons.COLORS[effect_action] if effect_active else Color("f7f5ed")
		var wobble := sin(visual_clock * 6)
		var stretch := Vector2.ONE
		if effect_active and effect_action == 2: stretch = Vector2(1 + wobble * 0.07, 1 - wobble * 0.09)
		if effect_active and effect_action == 3: stretch *= 1 + sin(visual_clock * 2) * 0.025
		draw_set_transform(Vector2(0, 6 if trapped else -hop_height), 0, stretch * (0.72 if trapped else 1.0))
		draw_circle(Vector2.ZERO, radius + 4, Color("241d32"))
		draw_circle(Vector2.ZERO, radius + 1, tint.lightened(0.65))
		draw_circle(Vector2.ZERO, radius - 2, tint.darkened(0.42))
		draw_circle(Vector2(-2, -3), radius - 4, tint)
		draw_circle(Vector2(-5, -7), radius * 0.42, tint.lightened(0.28))
		if effect_active:
			match effect_action:
				0:
					var slide := sin(visual_clock * (3 + charge * 5)) * 6
					draw_line(Vector2(-12, 6 + slide), Vector2(8, -10 + slide), tint.lightened(0.65), 4)
				1:
					for i in range(3):
						var crystal := Vector2(sin(i * 3 + visual_clock) * 11, cos(i * 4 + visual_clock) * 11)
						draw_rect(Rect2(crystal - Vector2(2, 2), Vector2(4, 4)), Color("fff8ee"))
				2:
					draw_arc(Vector2(0, 3 + wobble * 2), radius * 0.65, 0.15, PI - 0.15, 16, tint.darkened(0.4), 4)
				3:
					draw_arc(Vector2.ZERO, radius - 6, 0, TAU, 8, tint.darkened(0.35), 5)
					for i in range(3):
						var stud := Vector2.from_angle(i * TAU / 3 + visual_clock * 0.5) * (radius - 7)
						draw_rect(Rect2(stud - Vector2(2, 2), Vector2(4, 4)), tint.lightened(0.6))
				4:
					draw_arc(Vector2.ZERO, radius - 9, 0, TAU, 12, tint.darkened(0.3), 6)
					draw_circle(Vector2(4, 3), 8 + sin(visual_clock * 3) * 2, tint.lightened(0.3))
				5:
					for i in range(3):
						var y := -9.0 + i * 8 + sin(visual_clock * 12) * 2
						draw_line(Vector2(-10, y), Vector2(9, y - 6), tint.lightened(0.6), 3)
				6:
					for i in range(2):
						var phase := fmod(visual_clock * 0.8 + i * 0.5, 1)
						draw_arc(Vector2.ZERO, radius + (1 - phase) * 22, 0, TAU, 28, Color(tint, 1 - phase), 2)
				7:
					draw_circle(Vector2.ZERO, 8 + sin(visual_clock * 9) * 3, tint.lightened(0.65))
					for i in range(4):
						var ray := Vector2.from_angle(i * TAU / 4 + visual_clock)
						draw_line(ray * 12, ray * 18, tint.darkened(0.35), 3)
				8:
					var angle := visual_clock * 4
					draw_arc(Vector2.ZERO, radius - 7, angle, angle + PI, 7, tint.lightened(0.65), 4)
				9:
					var spark := sin(visual_clock * 19) * 5
					draw_polyline(PackedVector2Array([Vector2(-5, -16), Vector2(5, -3), Vector2(-4, 3), Vector2(6, 15 + spark)]), Color("fff8e5"), 4)
				10:
					for i in range(2):
						var wave := fmod(visual_clock + i * 0.5, 1)
						draw_arc(Vector2.ZERO, radius + wave * 26, 0, TAU, 24, Color(tint, 1 - wave), 2)
		draw_rect(Rect2(-11, -13, 8, 5), Color("fff9ed"))
		draw_rect(Rect2(-14, -6, 4, 4), tint.lightened(0.7))
	else:
		draw_texture_rect_region(ATLAS, Rect2(Vector2.ONE * -extent, Vector2.ONE * extent * 2), source)
	if frost_remaining > 0:
		draw_circle(Vector2.ZERO, radius, Color(0.55, 0.85, 1, 0.3))
		draw_arc(Vector2.ZERO, radius - 2, 0, TAU, 6, Color("d9f8ff"), 3)
	if destructible and hits_taken == 1:
		var crack := PackedVector2Array([Vector2(-6, -radius + 3), Vector2(2, -8), Vector2(-4, -1), Vector2(7, 8), Vector2(3, radius - 2)])
		draw_polyline(crack, Color("302239"), 5)
		draw_polyline(PackedVector2Array([Vector2(-4, -1), Vector2(-13, 5)]), Color("fff1ce"), 2)
	if shooter and charge > 0.01:
		var tint: Color = EffectIcons.COLORS[effect_action] if effect_active else Color("fff4cc")
		draw_arc(Vector2.ZERO, radius + 8, -PI / 2, -PI / 2 + TAU * charge, 40, Color(tint, 0.75), 2, true)
