extends CanvasLayer

const FONT = preload("res://assets/pixelify-regular.tres")
const BOLD = preload("res://assets/pixelify-bold.tres")
const ATLAS = preload("res://assets/bilas-atlas.png")
const HandCard = preload("res://scripts/hand_card.gd")
const CREAM = Color("fff0cf")
const MUTED = Color("bcb0ce")
const MINT = Color("8de1be")

var game: Node2D
var panel: Control
var menu_background: ColorRect
var brand_footer: Label
var version_footer: Label
var screen: String = "main"
var player_name: String = ""
var volume: float = 70.0
var show_trajectory: bool = true
var has_run: bool = false
var requested_mode: int = 1
var continue_after_registration: bool = false
var name_input: LineEdit
var message_label: Label
var volume_label: Label
var music_volume_label: Label
var storage_path: String = "user://jogador.cfg"

func _ready() -> void:
	layer = 30
	process_mode = Node.PROCESS_MODE_ALWAYS
	get_tree().auto_accept_quit = false
	panel = Control.new()
	panel.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(panel)
	if game.test_mode:
		storage_path = "user://teste-jogador.cfg"
	else:
		_load_profile()
	_apply_settings()
	show_main()

func is_open() -> bool:
	return panel.visible

func _clean_name(value: String) -> String:
	return value.strip_edges().replace("\n", "").replace("\r", "").replace("\t", " ")

func register_player(value: String) -> bool:
	var clean := _clean_name(value)
	if clean.length() < 2 or clean.length() > 20:
		return false
	player_name = clean
	_save_profile()
	return true

func _load_profile() -> void:
	var file := ConfigFile.new()
	if file.load(storage_path) != OK: return
	var saved_name := _clean_name(str(file.get_value("player", "name", "")))
	player_name = saved_name if saved_name.length() >= 2 and saved_name.length() <= 20 else ""
	game.sound_enabled = bool(file.get_value("options", "sound", true))
	volume = clampf(float(file.get_value("options", "volume", 70.0)), 0, 100)
	show_trajectory = bool(file.get_value("options", "trajectory", true))
	game.music_enabled = bool(file.get_value("options", "music", true))
	game.music_volume_percent = clampf(float(file.get_value("options", "music_volume", 45.0)), 0, 100)

func _save_profile() -> void:
	var file := ConfigFile.new()
	file.set_value("player", "name", player_name)
	file.set_value("options", "sound", game.sound_enabled)
	file.set_value("options", "volume", volume)
	file.set_value("options", "trajectory", show_trajectory)
	file.set_value("options", "music", game.music_enabled)
	file.set_value("options", "music_volume", game.music_volume_percent)
	file.save(storage_path)

func _apply_settings() -> void:
	game.show_trajectory = show_trajectory
	game.volume_percent = volume
	game.sound_button.text = "EFEITOS: ON" if game.sound_enabled else "EFEITOS: OFF"
	game._apply_music_settings()
	if is_instance_valid(game.audio):
		game.audio.volume_db = -15.0 + linear_to_db(maxf(volume / 100.0, 0.0001)) if game.sound_enabled else -80.0

func set_sound(enabled: bool) -> void:
	game.sound_enabled = enabled
	_apply_settings()
	_save_profile()

func set_volume(value: float, persist: bool = true) -> void:
	volume = clampf(value, 0, 100)
	_apply_settings()
	if persist: _save_profile()
	if is_instance_valid(volume_label): volume_label.text = "Volume dos efeitos: %d%%" % int(volume)

func set_music(enabled: bool) -> void:
	game.music_enabled = enabled
	_apply_settings()
	_save_profile()

func set_music_volume(value: float, persist: bool = true) -> void:
	game.music_volume_percent = clampf(value, 0, 100)
	_apply_settings()
	if persist: _save_profile()
	if is_instance_valid(music_volume_label): music_volume_label.text = "Volume da música: %d%%" % int(game.music_volume_percent)

func set_trajectory(enabled: bool) -> void:
	show_trajectory = enabled
	_apply_settings()
	_save_profile()

func _clear(next_screen: String) -> void:
	screen = next_screen
	panel.visible = true
	game.aiming = false
	game.pointer_id = -99
	game.aim_vector = Vector2.ZERO
	get_tree().paused = true
	# Keep controls in the tree until this GUI event has finished. Removing
	# a pressed control immediately can invalidate touch/mouse dispatch.
	for child in panel.get_children():
		if child.is_queued_for_deletion(): continue
		child.process_mode = Node.PROCESS_MODE_DISABLED
		if child is Control:
			child.hide()
			child.mouse_filter = Control.MOUSE_FILTER_IGNORE
		child.queue_free()
	name_input = null
	message_label = null
	volume_label = null
	music_volume_label = null
	menu_background = ColorRect.new()
	menu_background.color = Color("171525")
	menu_background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(menu_background)
	for i in range(42):
		var dot := ColorRect.new()
		dot.position = Vector2(22 + (i * 173) % 680, 28 + (i * 97) % 1210)
		dot.size = Vector2(3, 3)
		dot.color = Color("4f3f59")
		dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
		panel.add_child(dot)
	brand_footer = _label("GOOD BILA", 1210, 15, MUTED)
	version_footer = _label("PILOTO 0.21.0  •  PERFIL LOCAL  •  OFFLINE", 1245, 12, MUTED)
	reflow()

func reflow() -> void:
	if not is_instance_valid(panel): return
	var viewport_size: Vector2 = game.view_size
	panel.position = Vector2((viewport_size.x - 720) / 2, game.safe_top + maxf(0, (game.layout_height - 1280) * 0.35))
	panel.size = Vector2(720, viewport_size.y - panel.position.y)
	if is_instance_valid(menu_background):
		menu_background.position = -panel.position
		menu_background.size = viewport_size
	if is_instance_valid(brand_footer): brand_footer.position.y = viewport_size.y - game.safe_bottom - panel.position.y - 70
	if is_instance_valid(version_footer): version_footer.position.y = viewport_size.y - game.safe_bottom - panel.position.y - 35

func _label(caption: String, y: float, font_size: int = 24, color: Color = CREAM, bold: bool = false, height: float = 55) -> Label:
	var label := Label.new()
	label.position = Vector2(40, y)
	label.size = Vector2(640, height)
	label.text = caption
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.add_theme_font_override("font", BOLD if bold else FONT)
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", color)
	label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(label)
	return label

func _button(caption: String, rect: Rect2, color: Color, callback: Callable, font_size: int = 24) -> Button:
	var button: Button = game._button(caption, rect, color, font_size)
	button.pressed.connect(callback)
	panel.add_child(button)
	return button

func _marble(at: Vector2, size_px: float = 90.0, region: Rect2 = Rect2(662, 49, 244, 244)) -> void:
	var art := TextureRect.new()
	var texture := AtlasTexture.new()
	texture.atlas = ATLAS
	texture.region = region
	art.texture = texture
	art.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	art.position = at - Vector2.ONE * size_px / 2
	art.size = Vector2.ONE * size_px
	art.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(art)

func show_main() -> void:
	_clear("main")
	_label("GOOD BILA", 115, 76, CREAM, true, 105)
	_label("QUINTAL DE LENDAS", 230, 23, MUTED, true)
	_marble(Vector2(360, 336), 104)
	_marble(Vector2(257, 348), 54, Rect2(35, 362.5, 244, 244))
	_marble(Vector2(463, 348), 54, Rect2(35, 49, 244, 244))
	_label("Olá, %s" % player_name if player_name != "" else "Seu quintal começa aqui", 408, 28, MINT, true)
	_button("ALTERAR REGISTRO" if player_name != "" else "CRIAR REGISTRO", Rect2(200, 470, 320, 48), Color("65577b"), show_profile, 18)
	var y := 560.0
	if has_run:
		_button("CONTINUAR", Rect2(120, y, 480, 70), MINT, resume_game, 27)
		y += 82
	_button("NOVA PARTIDA" if has_run else "INICIAR", Rect2(120, y, 480, 70), MINT, start_game, 27)
	_button("COLEÇÃO DE CARTAS", Rect2(120, y + 86, 480, 70), Color("c499ef"), show_collection)
	_button("OPÇÕES", Rect2(120, y + 172, 480, 70), Color("efab59"), show_options)
	_button("SAIR", Rect2(120, y + 258, 480, 70), Color("9b7185"), show_exit)
	_label("RECORDE • %d" % game.best, 1080, 19, MUTED)

func show_profile() -> void:
	_clear("profile")
	_label("SEU REGISTRO", 150, 43, CREAM, true, 75)
	_label("Escolha como quer ser chamado no quintal.", 248, 24)
	_label("O nome fica salvo apenas neste aparelho.", 302, 21, MUTED)
	name_input = LineEdit.new()
	name_input.position = Vector2(100, 420)
	name_input.size = Vector2(520, 80)
	name_input.placeholder_text = "Seu nome ou apelido"
	name_input.max_length = 20
	name_input.text = player_name
	name_input.add_theme_font_override("font", FONT)
	name_input.add_theme_font_size_override("font_size", 29)
	name_input.add_theme_color_override("font_color", CREAM)
	name_input.text_submitted.connect(func(_text: String): _submit_profile())
	panel.add_child(name_input)
	message_label = _label("De 2 a 20 caracteres.", 520, 19, MUTED)
	_button("SALVAR E JOGAR" if continue_after_registration else "SALVAR REGISTRO", Rect2(120, 620, 480, 76), MINT, _submit_profile)
	_button("VOLTAR", Rect2(200, 728, 320, 64), Color("65577b"), _back)

func _submit_profile() -> void:
	if not register_player(name_input.text):
		message_label.text = "Digite um nome de 2 a 20 caracteres."
		message_label.add_theme_color_override("font_color", Color("efab89"))
		return
	DisplayServer.virtual_keyboard_hide()
	if continue_after_registration:
		continue_after_registration = false
		start_game()
	else:
		show_main()

func start_game(mode: int = -1) -> void:
	requested_mode = game.GameMode.DESTRUCTION
	if player_name == "":
		continue_after_registration = true
		show_profile()
		return
	has_run = true
	panel.visible = false
	get_tree().paused = false
	game.phase = game.Phase.AIMING
	game.game_mode = requested_mode
	game._restart()

func resume_game() -> void:
	if not has_run: return
	panel.visible = false
	get_tree().paused = false
	game._refresh_ui()

func show_deck() -> void:
	show_collection()

func show_collection() -> void:
	_clear("collection")
	_label("COLEÇÃO DE CARTAS", 80, 38, CREAM, true, 80)
	_label("Três cartas desta coleção são sorteadas a cada nível.", 170, 22, MUTED)
	var scroll := ScrollContainer.new()
	scroll.position = Vector2(62, 260)
	scroll.size = Vector2(596, 740)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	panel.add_child(scroll)
	var grid := GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 18)
	grid.add_theme_constant_override("v_separation", 22)
	scroll.add_child(grid)
	for card_id in range(game.CARD_ACTIONS.size()):
		var card := HandCard.new()
		card.custom_minimum_size = Vector2(176, 204)
		card.mission_color = game.CARD_TARGETS[card_id]
		card.movement_action = game.CARD_ACTIONS[card_id]
		card.movement_name = game.CARD_NAMES[card.movement_action]
		card.footer_caption = "VER CARTA"
		card.pressed.connect(_show_card_info.bind(card_id))
		grid.add_child(card)
	_button("VOLTAR", Rect2(200, 1050, 320, 66), MINT, _back)

func _show_card_info(card_id: int) -> void:
	_clear("card")
	var action: int = game.CARD_ACTIONS[card_id]
	_label(game.CARD_NAMES[action], 100, 40, game.CARD_COLORS[action], true)
	var card := HandCard.new()
	card.position = Vector2(272, 260)
	card.size = Vector2(176, 204)
	card.mission_color = game.CARD_TARGETS[card_id]
	card.movement_action = action
	card.movement_name = game.CARD_NAMES[action]
	card.footer_caption = "NA COLEÇÃO"
	panel.add_child(card)
	_label("OBJETIVO: %s" % game.COLOR_NAMES[card.mission_color], 520, 27, game.COLOR_TINTS[card.mission_color], true)
	_label(game.CARD_HELP[action], 610, 25, CREAM, false, 100)
	_label("Pode aparecer em qualquer mão.
A escolha continua às cegas, com as cartas viradas.", 770, 22, MUTED, false, 110)
	_button("VOLTAR À COLEÇÃO", Rect2(140, 1020, 440, 66), MINT, show_collection, 23)

func _toggle(caption: String, y: float, enabled: bool, callback: Callable) -> void:
	var toggle := CheckButton.new()
	toggle.position = Vector2(100, y)
	toggle.size = Vector2(520, 74)
	toggle.text = caption
	toggle.button_pressed = enabled
	toggle.add_theme_font_override("font", FONT)
	toggle.add_theme_font_size_override("font_size", 25)
	toggle.add_theme_color_override("font_color", CREAM)
	toggle.toggled.connect(callback)
	panel.add_child(toggle)

func show_options() -> void:
	_clear("options")
	_label("OPÇÕES", 90, 45, CREAM, true, 80)
	_label("Suas preferências ficam salvas no aparelho.", 200, 22, MUTED)
	_toggle("Efeitos sonoros", 290, game.sound_enabled, set_sound)
	volume_label = _label("Volume dos efeitos: %d%%" % int(volume), 380, 23)
	var slider := _volume_slider(450, volume)
	slider.value_changed.connect(func(value: float): set_volume(value, false))
	slider.drag_ended.connect(func(_changed: bool): _save_profile())
	_toggle("Música de fundo", 560, game.music_enabled, set_music)
	music_volume_label = _label("Volume da música: %d%%" % int(game.music_volume_percent), 650, 23)
	var music_slider := _volume_slider(720, game.music_volume_percent)
	music_slider.value_changed.connect(func(value: float): set_music_volume(value, false))
	music_slider.drag_ended.connect(func(_changed: bool): _save_profile())
	_toggle("Mostrar trajetória da mira", 840, show_trajectory, set_trajectory)
	_button("VOLTAR", Rect2(200, 1030, 320, 70), MINT, _back)

func _volume_slider(y: float, value: float) -> HSlider:
	var slider := HSlider.new()
	slider.position = Vector2(110, y)
	slider.size = Vector2(500, 64)
	slider.min_value = 0
	slider.max_value = 100
	slider.step = 5
	slider.value = value
	panel.add_child(slider)
	return slider

func show_exit() -> void:
	_clear("exit")
	_label("SAIR DO QUINTAL?", 350, 40, CREAM, true, 80)
	_label("Seu nome, deck, opções e recorde ficam salvos.", 470, 23, MUTED, false, 80)
	if has_run:
		_label("A partida em andamento não é salva.", 560, 22, Color("efab89"))
	_button("SAIR DO JOGO", Rect2(140, 740, 440, 78), Color("efab59"), _quit_game)
	_button("VOLTAR", Rect2(200, 850, 320, 66), MINT, _back)

func _quit_game() -> void:
	_save_profile()
	get_tree().paused = false
	get_tree().quit()

func _back() -> void:
	if screen == "card":
		show_collection()
		return
	DisplayServer.virtual_keyboard_hide()
	_save_profile()
	continue_after_registration = false
	if screen != "main":
		show_main()
	elif has_run:
		resume_game()
	else:
		show_exit()

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_ESCAPE:
		if is_open(): _back()
		else: show_main()
		get_viewport().set_input_as_handled()

func _notification(what: int) -> void:
	if not is_instance_valid(panel): return
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		if is_open(): _back()
		else: show_main()
	elif what == NOTIFICATION_WM_CLOSE_REQUEST:
		show_exit()
