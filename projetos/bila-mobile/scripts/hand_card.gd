extends Button

const EffectIcons = preload("res://scripts/effect_icons.gd")
const FONT = preload("res://assets/pixelify-regular.tres")
const BOLD = preload("res://assets/pixelify-bold.tres")
const ATLAS = preload("res://assets/bilas-atlas.png")
const INK = Color("292238")
const PAPER = Color("fff0cf")
const ACCENTS = [Color("e37270"), Color("6cb97e"), Color("6c9bd9"), Color("d3ae59"), Color("a67bce"), Color("58b5ae")]
const COLORS = ["VERMELHA", "VERDE", "AZUL", "AMARELA", "ROXA", "TURQUESA"]
var mission_color: int = 0
var movement_action: int = 0
var movement_name: String = "LINHA RETA"
var face_down: bool = false
var chosen: bool = false
var footer_caption: String = "OBJETIVO + EFEITO"
var selection_caption: String = "PREPARADA"
var hovered: bool = false
var pulling: bool = false
var pull_start := Vector2.ZERO
var pull_rest := Vector2.ZERO
var pull_distance := 0.0

func _gui_input(event: InputEvent) -> void:
	if not face_down or disabled: return
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if event.pressed:
			pulling = true
			pull_start = get_global_transform_with_canvas() * event.position
			pull_rest = position
			pull_distance = 0
		elif pulling:
			pulling = false
			position = pull_rest
			if pull_distance >= 44:
				set_pressed_no_signal(false)
				pressed.emit()
				accept_event()
	elif event is InputEventMouseMotion and pulling:
		var at: Vector2 = get_global_transform_with_canvas() * event.position
		pull_distance = clampf(pull_start.y - at.y, 0, 150)
		position = pull_rest - Vector2(0, pull_distance)


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_WINDOW_FOCUS_OUT and pulling:
		pulling = false
		position = pull_rest
		pull_distance = 0
		set_pressed_no_signal(false)

func _ready() -> void:
	mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	focus_mode = Control.FOCUS_NONE
	for state in ["normal", "hover", "pressed", "disabled", "focus"]:
		add_theme_stylebox_override(state, StyleBoxEmpty.new())
	mouse_entered.connect(func(): hovered = true; queue_redraw())
	mouse_exited.connect(func(): hovered = false; queue_redraw())

func _label(caption: String, y: float, font_size: int, color: Color, bold: bool = false) -> void:
	var font: Font = BOLD if bold else FONT
	var width := font.get_string_size(caption, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size).x
	draw_string(font, Vector2((size.x - width) / 2, y), caption, HORIZONTAL_ALIGNMENT_LEFT, -1, font_size, color)

func _draw_back() -> void:
	var shadow := StyleBoxFlat.new()
	shadow.bg_color = Color(0.025, 0.015, 0.05, 0.5)
	shadow.set_corner_radius_all(11)
	draw_style_box(shadow, Rect2(Vector2(3, 7), size))
	var back := StyleBoxFlat.new()
	back.bg_color = Color("45335e") if hovered else Color("352746")
	back.border_color = Color("d2b58b")
	back.set_border_width_all(3)
	back.set_corner_radius_all(9)
	draw_style_box(back, Rect2(Vector2.ZERO, size))
	draw_rect(Rect2(10, 10, size.x - 20, size.y - 20), Color("99799f"), false, 1)
	for row in range(8):
		for col in range(6):
			var point := Vector2(20 + col * 27, 19 + row * 24)
			draw_circle(point, 1.5, Color("675177"))
	var center := size / 2
	draw_colored_polygon(PackedVector2Array([center + Vector2(0, -42), center + Vector2(36, 0), center + Vector2(0, 42), center + Vector2(-36, 0)]), Color("a18aaf"))
	draw_colored_polygon(PackedVector2Array([center + Vector2(0, -34), center + Vector2(28, 0), center + Vector2(0, 34), center + Vector2(-28, 0)]), Color("352746"))
	_label("?", center.y + 14, 40, PAPER, true)
	_label("GOOD BILA", 35, 15, Color("d2b58b"), true)
	_label("PUXE PARA JOGAR", 186, 11, PAPER, true)
	if disabled: draw_rect(Rect2(Vector2.ZERO, size), Color(0.05, 0.03, 0.08, 0.12))

func _draw() -> void:
	if face_down:
		_draw_back()
		return
	var accent: Color = ACCENTS[mission_color]
	var shadow := StyleBoxFlat.new()
	shadow.bg_color = Color(0.025, 0.015, 0.05, 0.5)
	shadow.set_corner_radius_all(11)
	draw_style_box(shadow, Rect2(Vector2(3, 7), size))
	var frame := StyleBoxFlat.new()
	frame.bg_color = PAPER.lightened(0.05) if hovered else PAPER
	frame.border_color = Color("9aecc3") if chosen else accent.darkened(0.3)
	frame.set_border_width_all(5 if chosen else 3)
	frame.set_corner_radius_all(9)
	draw_style_box(frame, Rect2(Vector2.ZERO, size))
	draw_rect(Rect2(10, 10, size.x - 20, 30), accent)
	_label("+60 POR BILA", 31, 16, Color("fff9ec"), true)
	var source := Rect2(35 + (mission_color % 4) * 313.5, 49 + (mission_color / 4) * 313.5, 244, 244)
	draw_texture_rect_region(ATLAS, Rect2(55, 52, 66, 66), source)
	EffectIcons.draw_target(self, Vector2(136, 82), 23, accent)
	EffectIcons.draw_icon(self, movement_action, Vector2(29, 160), 23, EffectIcons.COLORS[movement_action].darkened(0.15))
	_label(COLORS[mission_color], 143, 18, INK, true)
	_label(movement_name, 166, 15, accent.darkened(0.25), true)
	draw_line(Vector2(18, 175), Vector2(size.x - 18, 175), accent.lightened(0.35), 1)
	_label(selection_caption if chosen else footer_caption, 194, 12, accent.darkened(0.2), true)
	if disabled: draw_rect(Rect2(Vector2.ZERO, size), Color(0.05, 0.03, 0.08, 0.12))
