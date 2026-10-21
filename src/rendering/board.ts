import { state } from '../game/state';
import { canvas, ctx, miniMapCanvas, $ } from '../ui/dom';
import { regions } from '../data/regions';
import { drawCreature, drawHero } from './characters';
import { interpolate } from './animation';
import { drawWorldMap } from '../features/world/map';
import { reachable, occupied } from '../features/combat/combat';
import { skillById } from '../features/character/classes';
import { drawCombatEffects } from './effects';
import { drawPropSprite } from './sprites';

export function resize() {
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
}

export function draw() {
    const w = canvas.clientWidth, h = canvas.clientHeight, cell = Math.min(w / state.GRID_W, h / state.GRID_H), ox = (w - cell * state.GRID_W) / 2, oy = (h - cell * state.GRID_H) / 2;
    const theme = regions[state.regionIndex];
    if (state.mode === 'battle') {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#131b1d';
        ctx.fillRect(0, 0, w, h);
        drawBattle(ox, oy, cell, theme);
        canvas.dataset.ox = String(ox);
        canvas.dataset.oy = String(oy);
        canvas.dataset.cell = String(cell);
        updateBattleMenuPosition(ox, oy, cell);
        return;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = theme.ground;
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < state.GRID_H; y++)
        for (let x = 0; x < state.GRID_W; x++) {
            const n = state.hash(x + state.regionIndex * 19, y + state.regionIndex * 13), px = ox + x * cell, py = oy + y * cell;
            ctx.fillStyle = n > .5 ? theme.light : theme.ground;
            ctx.globalAlpha = .32 + n * .2;
            ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
            ctx.globalAlpha = 1;
            if ((x + y * 2) % 7 === 0) {
                ctx.fillStyle = '#e4d39a';
                ctx.globalAlpha = .2;
                ctx.beginPath();
                ctx.ellipse(px + cell * .55, py + cell * .7, cell * .06, cell * .025, -.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            if (state.flowers.has(state.key(x, y))) {
                ctx.fillStyle = '#f2d795';
                ctx.beginPath();
                ctx.arc(px + cell * .72, py + cell * .3, cell * .045, 0, Math.PI * 2);
                ctx.fill();
            }
            if (state.trees.has(state.key(x, y)))
                drawTree(px + cell * .5, py + cell * .56, cell, theme);
        }
    const bx = ox + (state.basePosition.x + .5) * cell, by = oy + (state.basePosition.y + .55) * cell;
    ctx.save();
    ctx.fillStyle = '#e6c36d';
    ctx.globalAlpha = .22;
    ctx.beginPath();
    ctx.arc(bx, by, cell * .56, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (!drawPropSprite(ctx, 'shop', bx, by + cell * .35, cell * 1.35)) {
    ctx.fillStyle = '#5a3d29';
    ctx.fillRect(bx - cell * .22, by - cell * .12, cell * .44, cell * .29);
    ctx.fillStyle = '#d6b778';
    ctx.beginPath();
    ctx.moveTo(bx - cell * .3, by - cell * .12);
    ctx.lineTo(bx, by - cell * .4);
    ctx.lineTo(bx + cell * .3, by - cell * .12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff0b3';
    ctx.beginPath();
    ctx.arc(bx, by - cell * .22, cell * .065, 0, Math.PI * 2);
    ctx.fill();
    }
    ctx.restore();
    for (const [nodeKey, resourceId] of state.resourceNodes) {
        const [x, y] = nodeKey.split(',').map(Number), px = ox + (x + .5) * cell, py = oy + (y + .55) * cell;
        if (drawPropSprite(ctx, resourceId, px, py + cell * .2, cell * .55)) continue;
        ctx.save();
        ctx.fillStyle = resourceId === 'green_gel' ? '#c9df88' : resourceId === 'wolf_pelt' ? '#c5d3c5' : '#d9ace9';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = cell * .18;
        ctx.beginPath();
        ctx.arc(px, py, cell * .13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff0bc';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }
    for (const e of state.mapEnemies)
        if (e.hp > 0)
            drawCreature(ox + (e.x + .5) * cell, oy + (e.y + .55) * cell, cell * .35, e);
    const worldPos = interpolate(state.worldMotion, state.player);
    drawHero(ox + (worldPos.x + .5) * cell, oy + (worldPos.y + .52) * cell, cell * .6);
    canvas.dataset.ox = String(ox);
    canvas.dataset.oy = String(oy);
    canvas.dataset.cell = String(cell);
    updateBattleMenuPosition(ox, oy, cell);
    drawWorldMap(miniMapCanvas);
}

export function updateBattleMenuPosition(ox: number, oy: number, cell: number) {
    if (state.mode !== 'battle' || !state.battleMenuOpen)
        return;
    const menu = $('battle-actions'), wrapper = canvas.parentElement;
    if (!wrapper || menu.classList.contains('hidden'))
        return;
    const wrapperRect = wrapper.getBoundingClientRect(), canvasRect = canvas.getBoundingClientRect();
    const playerPos = interpolate(state.battlePlayerMotion, state.battlePlayer);
    const canvasOffsetX = canvasRect.left - wrapperRect.left - wrapper.clientLeft;
    const canvasOffsetY = canvasRect.top - wrapperRect.top - wrapper.clientTop;
    const anchorX = canvasOffsetX + ox + (playerPos.x + .5) * cell;
    const anchorY = canvasOffsetY + oy + (playerPos.y + .2) * cell;
    const halfWidth = menu.offsetWidth / 2;
    const left = Math.max(halfWidth + 8, Math.min(wrapper.clientWidth - halfWidth - 8, anchorX));
    menu.style.left = `${left}px`;
    menu.style.top = `${Math.max(menu.offsetHeight + 8, anchorY)}px`;
    menu.style.setProperty('--arrow-offset', `${Math.max(18, Math.min(menu.offsetWidth - 18, anchorX - left + halfWidth))}px`);
}

export function drawTree(cx: number, cy: number, s: number, theme: typeof regions[number]) {
    if (drawPropSprite(ctx, state.hash(cx, cy) > .5 ? 'oak' : 'pine', cx, cy + s * .35, s * 1.12)) return;
    ctx.fillStyle = '#3e3526';
    ctx.fillRect(cx - s * .055, cy, s * .11, s * .27);
    ctx.fillStyle = theme.dark;
    ctx.beginPath();
    ctx.arc(cx, cy - s * .06, s * .27, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = theme.light;
    ctx.globalAlpha = .9;
    ctx.beginPath();
    ctx.arc(cx - s * .075, cy - s * .12, s * .16, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#d8c17d';
    ctx.globalAlpha = .7;
    ctx.beginPath();
    ctx.arc(cx + s * .1, cy - s * .2, s * .022, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

export function drawBattle(ox: number, oy: number, cell: number, theme: typeof regions[number]) {
    const valid = state.action === 'move' && state.turn === 0 ? reachable(state.battlePlayer, 3) : [];
    const selectedSkill = skillById(state.action);
    for (let y = 0; y < state.GRID_H; y++)
        for (let x = 0; x < state.GRID_W; x++) {
            const px = ox + x * cell, py = oy + y * cell, dist = Math.abs(x - state.battlePlayer.x) + Math.abs(y - state.battlePlayer.y);
            ctx.fillStyle = (x + y) % 2 ? '#29352f' : '#2f3d34';
            ctx.globalAlpha = .72;
            ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = 'rgba(226,215,176,.19)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + .5, py + .5, cell, cell);
            const inAttackRange = state.turn === 0 && dist > 0 && (state.action === 'strike' ? dist <= 1 : selectedSkill?.mode === 'damage' && dist <= selectedSkill.range);
            const enemyOnTile = state.battleEnemies.some(e => e.hp > 0 && e.x === x && e.y === y);
            if (inAttackRange) {
                const rangeColor = selectedSkill?.color ?? 'orange';
                const fill = rangeColor === 'violet' ? 'rgba(174,133,220,.3)' : rangeColor === 'blue' ? 'rgba(112,174,219,.3)' : rangeColor === 'green' ? 'rgba(137,207,141,.3)' : rangeColor === 'gold' ? 'rgba(236,205,111,.3)' : 'rgba(235,120,91,.32)';
                ctx.fillStyle = fill;
                ctx.fillRect(px + 2, py + 2, cell - 4, cell - 4);
                ctx.strokeStyle = rangeColor === 'violet' ? 'rgba(207,175,242,.62)' : rangeColor === 'blue' ? 'rgba(156,203,239,.7)' : rangeColor === 'green' ? 'rgba(190,239,166,.7)' : rangeColor === 'gold' ? 'rgba(255,229,145,.7)' : 'rgba(255,169,125,.68)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(px + 3, py + 3, cell - 6, cell - 6);
                if (enemyOnTile) {
                    ctx.fillStyle = fill;
                    ctx.globalAlpha = 1.7;
                    ctx.fillRect(px + 4, py + 4, cell - 8, cell - 8);
                    ctx.globalAlpha = 1;
                }
            }
            else if (valid.some(p => p.x === x && p.y === y) && !occupied(x, y)) {
                ctx.fillStyle = 'rgba(192,213,148,.2)';
                ctx.fillRect(px + 2, py + 2, cell - 4, cell - 4);
            }
            if (state.selectedEnemyId !== null && state.battleEnemies.some(e => e.id === state.selectedEnemyId && e.x === x && e.y === y)) {
                ctx.strokeStyle = '#f0ce85';
                ctx.lineWidth = 2;
                ctx.strokeRect(px + 3, py + 3, cell - 6, cell - 6);
            }
        }
    const now = performance.now();
    const pp = interpolate(state.battlePlayerMotion, state.battlePlayer, now);
    const heroBob = state.battlePlayerMotion ? Math.sin(Math.min(1, (now - state.battlePlayerMotion.startedAt) / state.battlePlayerMotion.duration) * Math.PI * 4) * .035 : 0;
    const heroX = ox + (pp.x + .5) * cell, heroY = oy + (pp.y + .52 + heroBob) * cell;
    drawHero(heroX, heroY, cell * .5);
    for (const e of state.battleEnemies)
        if (e.hp > 0) {
            const enemyPos = interpolate(state.enemyMotions.get(e.id) ?? null, e, now);
            drawCreature(ox + (enemyPos.x + .5) * cell, oy + (enemyPos.y + .55) * cell, cell * .29, e);
        }
    drawCombatEffects(ox, oy, cell);
    if (state.turn > 0) {
        ctx.fillStyle = 'rgba(226,212,165,.08)';
        ctx.fillRect(ox, oy, cell * state.GRID_W, cell * state.GRID_H);
    }
}
