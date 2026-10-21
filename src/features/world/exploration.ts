import { state } from '../../game/state';
import type { Enemy } from '../../types';
import { monsterCatalog } from '../../data/monsters';
import { clampPosition, isAtPosition } from '../../game/explorationRules';
import { interpolate, requestAnimationFrameLoop } from '../../rendering/animation';
import { revealAroundPlayer } from './map';
import { updateUI, notify, log } from '../../ui/panels';
import { enterStore } from '../store/store';
import { addItem } from '../inventory/inventory';
import { items } from '../../data/items';
import { regions } from '../../data/regions';
import { startBattle } from '../combat/combat';

export function createWorld() {
    for (let y = 0; y < state.GRID_H; y++)
        for (let x = 0; x < state.GRID_W; x++) {
            const n = state.hash(x, y);
            if (n > 0.86 && !(x === 5 && y === 4))
                state.trees.add(state.key(x, y));
            if (n < 0.12)
                state.flowers.add(state.key(x, y));
        }
    const seed: Array<[
        number,
        number,
        Enemy['kind']
    ]> = [[2, 2, 'slime'], [8, 2, 'wolf'], [8, 7, 'slime'], [2, 7, 'wisp']];
    seed.forEach(([x, y, kind], id) => state.mapEnemies.push(makeEnemy(id, x, y, kind, 0)));
    [[1, 5, 'green_gel'], [4, 1, 'green_gel'], [9, 5, 'wolf_pelt'], [7, 7, 'wolf_pelt'], [3, 8, 'wisp_shard']].forEach(([x, y, resource]) => state.resourceNodes.set(state.key(x as number, y as number), resource as 'green_gel' | 'wolf_pelt' | 'wisp_shard'));
    state.trees.delete(state.key(state.spawnPosition.x, state.spawnPosition.y));
    state.trees.delete(state.key(state.basePosition.x, state.basePosition.y));
}

export function makeEnemy(id: number, x: number, y: number, kind: Enemy['kind'], scale: number): Enemy {
    const base = monsterCatalog[kind];
    const mult = 1 + scale * 0.23 + Math.max(0, state.regionIndex) * 0.34;
    return { id, name: base.name, kind, x, y, hp: Math.round(base.hp * mult), maxHp: Math.round(base.hp * mult), damage: Math.round(base.damage * (1 + scale * 0.15 + state.regionIndex * 0.2)), color: base.color, xp: Math.round(base.xp * (1 + scale * 0.1 + state.regionIndex * 0.2)) };
}

export function moveExplore(dx: number, dy: number) {
    if (!state.started || state.mode !== 'explore')
        return;
    const { x, y } = clampPosition(state.player, { x: dx, y: dy }, state.GRID_W, state.GRID_H);
    if ((x !== state.player.x || y !== state.player.y) && !state.trees.has(state.key(x, y))) {
        const from = interpolate(state.worldMotion, state.player);
        state.player = { x, y };
        state.worldMotion = { from, to: state.player, startedAt: performance.now(), duration: 230 };
        requestAnimationFrameLoop();
        checkRegion();
        revealAroundPlayer();
        updateUI();
        if (isAtPosition(state.player, state.basePosition))
            window.setTimeout(enterStore, 180);
    }
}

export function collectResourceAt(x: number, y: number) {
    const nodeKey = state.key(x, y), resourceId = state.resourceNodes.get(nodeKey);
    if (!resourceId || state.mode !== 'explore')
        return false;
    if (Math.abs(state.player.x - x) + Math.abs(state.player.y - y) > 1) {
        notify('Aproxime-se do recurso para coletá-lo.');
        return true;
    }
    if (!addItem(resourceId)) {
        notify('Mochila cheia. Venda ou reorganize seus itens.');
        return true;
    }
    state.resourceNodes.delete(nodeKey);
    log(`Você coletou ${items[resourceId].name}.`);
    notify(`${items[resourceId].name} coletado.`);
    updateUI();
    return true;
}

export function checkRegion() { const next = state.player.x > 8 ? 2 : state.player.x < 2 ? 1 : 0; if (next !== state.regionIndex) {
    state.regionIndex = next;
    log(`Você chegou à ${regions[next].name}.`);
    notify(`Nova região: ${regions[next].name}`);
} }

export function checkEncounter() { const e = state.mapEnemies.find(e => e.hp > 0 && Math.abs(e.x - state.player.x) + Math.abs(e.y - state.player.y) === 0); if (e)
    startBattle(e); }
