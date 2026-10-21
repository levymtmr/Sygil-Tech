import { state } from '../../game/state';
import type { Point, Enemy, Action, ClassSkill } from '../../types';
import { notify, log, updateUI, showBattleRewards } from '../../ui/panels';
import { makeEnemy } from '../world/exploration';
import { $ } from '../../ui/dom';
import { currentClass, skillById } from '../character/classes';
import { draw } from '../../rendering/board';
import { interpolate, requestAnimationFrameLoop, addEffect, shakeBoard } from '../../rendering/animation';
import { equipmentBonus, attackPower, defensePower, addItem, recalculateEquipmentStats } from '../inventory/inventory';
import { monsterCatalog } from '../../data/monsters';
import { resolveLevelUps } from '../../game/progression';
import { items } from '../../data/items';
import { movementFacing } from '../../game/playerMovement';

export function reachable(from: Point, max: number): Point[] {
    const out: Point[] = [];
    for (let y = 0; y < state.GRID_H; y++)
        for (let x = 0; x < state.GRID_W; x++)
            if (Math.abs(x - from.x) + Math.abs(y - from.y) <= max && !(x === from.x && y === from.y))
                out.push({ x, y });
    return out;
}

export function occupied(x: number, y: number) { return (x === state.battlePlayer.x && y === state.battlePlayer.y) || state.battleEnemies.some(e => e.hp > 0 && e.x === x && e.y === y); }

export function startBattle(target?: Enemy) {
    if (!state.started || state.mode !== 'explore')
        return;
    let source = target ?? state.mapEnemies.filter(e => e.hp > 0).sort((a, b) => Math.abs(a.x - state.player.x) + Math.abs(a.y - state.player.y) - (Math.abs(b.x - state.player.x) + Math.abs(b.y - state.player.y)))[0];
    if (!source) {
        notify('Não há criaturas por perto.');
        return;
    }
    state.knownMonsters.add(source.kind);
    state.encounterScale++;
    const difficulty = Math.floor((state.encounterScale - 1) / 3) + Math.max(0, state.regionIndex);
    const count = Math.min(3, 1 + Math.floor(state.encounterScale / 4));
    state.battleEnemies = [makeEnemy(source.id, state.GRID_W - 2, 2 + (source.id % 4), source.kind, difficulty)];
    for (let i = 1; i < count; i++)
        state.battleEnemies.push(makeEnemy(1000 + state.encounterScale * 10 + i, state.GRID_W - 2 - i, 2 + ((source.id + i * 2) % 5), i % 2 ? 'slime' : 'wolf', difficulty));
    state.battleContext = 'wild';
    state.mode = 'battle';
    state.turn = 0;
    state.action = 'move';
    state.battleMenuOpen = true;
    state.battlePlayer = { x: 1, y: 4 };
    state.battleFacing = 'right';
    state.selectedEnemyId = state.battleEnemies[0].id;
    $('battle-tip').textContent = `Turno de ${currentClass().name}: escolha uma ação.`;
    log(`${source.name} bloqueou seu caminho.`);
    updateUI();
}

export function setAction(value: Action) {
    if (state.turn !== 0 || state.mode !== 'battle')
        return;
    state.action = value;
    const skill = skillById(value);
    $('battle-tip').textContent = value === 'move' ? 'Casas verdes: mova-se até 3 tiles.' : value === 'strike' ? 'Casas laranja: golpe básico corpo a corpo.' : skill?.mode === 'heal' ? 'Toque em Kael para usar a cura.' : skill?.mode === 'guard' ? 'Toque em Kael para preparar a defesa.' : `${skill?.name}: alcance de ${skill?.range} tiles.`;
    state.battleMenuOpen = false;
    updateUI();
    if (skill && skill.mode !== 'damage')
        performSelfSkill(skill);
}

export function battleClick(x: number, y: number) {
    if (state.mode !== 'battle' || state.turn !== 0)
        return;
    if (x === state.battlePlayer.x && y === state.battlePlayer.y) {
        state.battleMenuOpen = true;
        updateUI();
        return;
    }
    const enemy = state.battleEnemies.find(e => e.hp > 0 && e.x === x && e.y === y);
    if (enemy && state.action !== 'move') {
        const selectedSkill = skillById(state.action);
        if (selectedSkill && selectedSkill.mode !== 'damage') {
            notify('Esta habilidade deve ser usada no tile de Kael.');
            return;
        }
        state.selectedEnemyId = enemy.id;
        attackEnemy(enemy);
        return;
    }
    if (enemy) {
        state.selectedEnemyId = enemy.id;
        draw();
        return;
    }
    if (state.action === 'move' && reachable(state.battlePlayer, 3).some(p => p.x === x && p.y === y) && !occupied(x, y)) {
        state.battleFacing = movementFacing(state.battlePlayer, { x, y }, state.battleFacing);
        const from = interpolate(state.battlePlayerMotion, state.battlePlayer);
        state.battlePlayer = { x, y };
        state.battlePlayerMotion = { from, to: state.battlePlayer, startedAt: performance.now(), duration: 260 };
        requestAnimationFrameLoop();
        finishPlayerTurn();
        return;
    }
    if (state.action === 'move')
        notify('Escolha uma casa iluminada, até 3 casas de distância.');
    else {
        const skill = skillById(state.action);
        notify(state.action === 'strike' ? 'Golpe só alcança um inimigo adjacente.' : `Alvo fora do alcance de ${skill?.name ?? 'habilidade'}.`);
    }
}

export function attackEnemy(enemy: Enemy) {
    const distance = Math.abs(enemy.x - state.battlePlayer.x) + Math.abs(enemy.y - state.battlePlayer.y);
    const skill = skillById(state.action);
    const range = skill?.mode === 'damage' ? skill.range : 1;
    if (distance > range) {
        notify(`Fique a até ${range} ${range === 1 ? 'casa' : 'casas'} do alvo.`);
        return;
    }
    const classDamageBonus = state.classId === 'arcanist' && skill ? 1.2 : 1;
    const dmg = Math.round((skill ? skill.power + equipmentBonus('attack') : attackPower()) * classDamageBonus + (state.level - 1) * (state.classId === 'arcanist' ? 5 : 4));
    const target = { x: enemy.x, y: enemy.y };
    state.battleFacing = movementFacing(state.battlePlayer, target, state.battleFacing);
    const now = performance.now();
    const variant = skill?.id ?? `basic-${state.classId}`;
    const lungeAmount = skill?.id === 'shield-bash' ? .38 : state.classId === 'knight' && distance === 1 ? .25 : .08;
    if (distance === 1 && skill?.id !== 'arcane-bolt' && skill?.id !== 'frost-lance' && skill?.id !== 'aimed-shot' && skill?.id !== 'rapid-volley' && skill?.id !== 'piercing-arrow' && skill?.id !== 'shadow-knife' && skill?.id !== 'radiant-bolt') {
        const from = { ...state.battlePlayer }, lunge = { x: state.battlePlayer.x + (enemy.x - state.battlePlayer.x) * lungeAmount, y: state.battlePlayer.y + (enemy.y - state.battlePlayer.y) * lungeAmount };
        state.battlePlayerMotion = { from, to: lunge, startedAt: now, duration: 145 };
        requestAnimationFrameLoop();
    }
    addEffect({ kind: 'classAttack', from: { ...state.battlePlayer }, to: target, duration: skill?.id === 'rapid-volley' ? 620 : 480, variant, tint: skill?.color ?? currentClass().accent });
    addEffect({ kind: 'damage', from: target, to: target, duration: 820, damage: dmg });
    shakeBoard();
    enemy.hp = Math.max(0, enemy.hp - dmg);
    log(`Kael causou ${dmg} de dano em ${enemy.name}.`);
    if (enemy.hp <= 0)
        log(`${enemy.name} foi derrotado.`);
    if (state.battleEnemies.every(e => e.hp <= 0)) {
        state.turn = 1;
        updateUI();
        state.turnTimer = window.setTimeout(winBattle, 390);
        return;
    }
    finishPlayerTurn();
}

export function performSelfSkill(skill: ClassSkill) {
    if (skill.mode === 'heal') {
        const healed = Math.min(state.maxHp - state.playerHp, Math.round(skill.power));
        if (healed <= 0) {
            notify('Sua vitalidade já está cheia.');
            return;
        }
        state.playerHp += healed;
        addEffect({ kind: 'heal', from: { ...state.battlePlayer }, to: { ...state.battlePlayer }, duration: 720, damage: healed });
        log(`${skill.name} restaurou ${healed} pontos de vitalidade.`);
        notify(`+${healed} vitalidade`);
    }
    else if (skill.mode === 'guard') {
        state.guardActive = true;
        addEffect({ kind: 'guard', from: { ...state.battlePlayer }, to: { ...state.battlePlayer }, duration: 780 });
        log(`${skill.name}: Kael prepara a guarda.`);
        notify('Guarda preparada para o próximo ataque.');
    }
    else
        return;
    finishPlayerTurn();
}

export function finishPlayerTurn() { state.turn = 1; state.battleMenuOpen = false; updateUI(); state.turnTimer = window.setTimeout(enemyTurn, 650); }

export function enemyTurn() {
    if (state.mode !== 'battle')
        return;
    for (const enemy of state.battleEnemies.filter(e => e.hp > 0)) {
        const dx = state.battlePlayer.x - enemy.x, dy = state.battlePlayer.y - enemy.y, d = Math.abs(dx) + Math.abs(dy);
        if (d <= 1) {
            const guardReduction = state.guardActive ? (state.classId === 'knight' ? .7 : .5) : 0;
            const dmg = Math.max(1, Math.round((enemy.damage - defensePower()) * (1 - guardReduction))), source = { x: enemy.x, y: enemy.y }, target = { ...state.battlePlayer };
            addEffect({ kind: 'enemyStrike', from: source, to: target, duration: 280 });
            addEffect({ kind: 'impact', from: target, to: target, duration: 460 });
            addEffect({ kind: 'damage', from: target, to: target, duration: 820, damage: dmg });
            shakeBoard();
            state.playerHp = Math.max(0, state.playerHp - dmg);
            state.guardActive = false;
            log(`${enemy.name} atingiu você por ${dmg} de dano.`);
        }
        else {
            const choices = Math.abs(dx) > Math.abs(dy) ? [{ x: enemy.x + Math.sign(dx), y: enemy.y }, { x: enemy.x, y: enemy.y + Math.sign(dy) }] : [{ x: enemy.x, y: enemy.y + Math.sign(dy) }, { x: enemy.x + Math.sign(dx), y: enemy.y }];
            const step = choices.find(p => p.x >= 0 && p.x < state.GRID_W && p.y >= 0 && p.y < state.GRID_H && !occupied(p.x, p.y));
            if (step) {
                const from = { x: enemy.x, y: enemy.y }, to = { ...step };
                enemy.x = step.x;
                enemy.y = step.y;
                state.enemyMotions.set(enemy.id, { from, to, startedAt: performance.now(), duration: 300 });
                requestAnimationFrameLoop();
            }
        }
    }
    if (state.playerHp <= 0) {
        state.turn = 1;
        updateUI();
        state.turnTimer = window.setTimeout(loseBattle, 450);
        return;
    }
    state.turn = 0;
    state.action = 'move';
    state.battleMenuOpen = true;
    $('battle-tip').textContent = `Turno de ${currentClass().name}: escolha uma ação.`;
    updateUI();
}

export function winBattle() {
    const wasInvasion = state.battleContext === 'invasion';
    const defeated = [...state.battleEnemies], gain = defeated.reduce((total, enemy) => total + enemy.xp, 0);
    const dropsByItem: Record<string, number> = {};
    defeated.forEach(enemy => {
        const monster = monsterCatalog[enemy.kind];
        for (const drop of monster.drops)
            if (Math.random() < drop.chance)
                dropsByItem[drop.itemId] = (dropsByItem[drop.itemId] ?? 0) + Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min;
    });
    const drops = Object.entries(dropsByItem).map(([itemId, quantity]) => ({ itemId, quantity }));
    drops.forEach(({ itemId, quantity }) => addItem(itemId, quantity));
    state.mode = 'explore';
    state.victories++;
    state.xp += gain;
    if (wasInvasion) {
        state.invasionPending = false;
        state.battleContext = 'wild';
        log('A base resistiu à invasão. O refúgio está seguro novamente.');
        notify('Base protegida!');
    }
    else if (state.victories > 0 && state.victories % 3 === 0) {
        state.invasionPending = true;
        log('Sinais de invasão foram vistos nos arredores. Volte à base para defendê-la.');
        notify('Invasão a caminho! Retorne à base.');
    }
    for (const e of defeated) {
        const original = state.mapEnemies.find(m => m.id === e.id);
        if (original)
            original.hp = 0;
    }
    let levelGains = 0;
    const progression = resolveLevelUps(state.level, state.xp);
    state.level = progression.level;
    state.xp = progression.experience;
    levelGains = progression.gains;
    if (levelGains) {
        state.skillPoints += levelGains;
        state.baseMaxHp += 18 * levelGains;
        recalculateEquipmentStats();
        state.playerHp = Math.min(state.maxHp, state.playerHp + 36 * levelGains);
    }
    if (levelGains) {
        log(`Você alcançou o nível ${state.level}! Recebeu ${levelGains} ponto(s) para a árvore de habilidades.`);
        notify(`Nível ${state.level} alcançado!`);
    }
    else {
        log(`Vitória! +${gain} XP e materiais para a sua loja.`);
        notify(`Vitória! +${gain} XP · materiais coletados`);
    }
    for (const drop of drops)
        log(`Você encontrou ${drop.quantity} × ${items[drop.itemId].name}.`);
    if (!wasInvasion)
        state.mapEnemies.push(makeEnemy(2000 + state.encounterScale, Math.max(0, Math.min(state.GRID_W - 1, state.player.x + (state.player.x < 5 ? 3 : -3))), (state.player.y + 2) % state.GRID_H, ['slime', 'wolf', 'wisp'][state.encounterScale % 3] as Enemy['kind'], Math.floor(state.encounterScale / 3) + state.regionIndex));
    state.battleEnemies = [];
    updateUI();
    showBattleRewards(gain, drops, levelGains);
}

export function loseBattle() { state.mode = 'explore'; state.playerHp = Math.max(1, Math.round(state.maxHp * .35)); state.player = { ...state.spawnPosition }; state.battleEnemies = []; log('Você recuou para o santuário e recuperou o fôlego.'); notify('Derrota. Você despertou no santuário.'); updateUI(); }

export function retreat() { if (state.mode !== 'battle')
    return; clearTimeout(state.turnTimer); state.mode = 'explore'; state.battleEnemies = []; state.playerHp = Math.max(1, state.playerHp - 12); state.player = { ...state.spawnPosition }; log('Você recuou para o santuário, deixando o combate para trás.'); notify('Você recuou. −12 de vitalidade.'); updateUI(); }
