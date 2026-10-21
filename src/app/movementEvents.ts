import { state } from '../game/state';
import { moveExplore, collectResourceAt } from '../features/world/exploration';
import { openMap, closeMap } from '../features/world/map';
import { canvas, $ } from '../ui/dom';
import { togglePanel, notify, closeOpenPanel } from '../ui/panels';
import { atBase, renderBase } from '../features/base/base';
import { leaveStore } from '../features/store/store';
import { retreat, battleClick } from '../features/combat/combat';
import type { Point } from '../types';
export function bindMovementEvents() {
    window.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
            return;
        if (!state.started)
            return;
        const shortcut = e.key.toLowerCase();
        const panelShortcuts: Record<string, string> = { i: 'inventory-modal', q: 'equipment-modal' };
        if (panelShortcuts[shortcut]) {
            e.preventDefault();
            togglePanel(panelShortcuts[shortcut]);
            return;
        }
        if (shortcut === 'b') {
            e.preventDefault();
            if (atBase()) {
                renderBase();
                $('base-modal').classList.remove('hidden');
            }
            else
                notify('Vá até a Loja de Astera para gerenciar a base.');
            return;
        }
        if (e.key.toLowerCase() === 'm') {
            e.preventDefault();
            if ($('map-modal').classList.contains('hidden'))
                openMap();
            else
                closeMap();
            return;
        }
        if (e.key === 'Escape') {
            if (!$('store-screen').classList.contains('hidden')) {
                leaveStore();
                return;
            }
            if (closeOpenPanel())
                return;
            if (!$('class-modal').classList.contains('hidden')) {
                $('class-modal').classList.add('hidden');
                return;
            }
            if (!$('map-modal').classList.contains('hidden'))
                closeMap();
            else if (!$('reward-modal').classList.contains('hidden'))
                $('reward-modal').classList.add('hidden');
            else if (!$('codex-modal').classList.contains('hidden'))
                $('codex-modal').classList.add('hidden');
            else if (!$('help-modal').classList.contains('hidden'))
                $('help-modal').classList.add('hidden');
            else if (state.mode === 'battle')
                retreat();
        }
        const movement: Record<string, Point> = { ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 } };
        if (movement[e.key]) {
            e.preventDefault();
            moveExplore(movement[e.key].x, movement[e.key].y);
        }
    });
    canvas.addEventListener('pointerdown', e => {
        if (!state.started)
            return;
        const rect = canvas.getBoundingClientRect(), cell = Number(canvas.dataset.cell), ox = Number(canvas.dataset.ox), oy = Number(canvas.dataset.oy);
        const x = Math.floor((e.clientX - rect.left - ox) / cell), y = Math.floor((e.clientY - rect.top - oy) / cell);
        if (x < 0 || x >= state.GRID_W || y < 0 || y >= state.GRID_H)
            return;
        if (state.mode === 'battle')
            battleClick(x, y);
        else if (collectResourceAt(x, y))
            return;
        else if (Math.abs(x - state.player.x) + Math.abs(y - state.player.y) === 1)
            moveExplore(x - state.player.x, y - state.player.y);
    });
    document.querySelectorAll<HTMLButtonElement>('[data-dir]').forEach(btn => btn.addEventListener('click', () => { const dirs: Record<string, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }; const d = dirs[btn.dataset.dir!]; moveExplore(d.x, d.y); }));
}
