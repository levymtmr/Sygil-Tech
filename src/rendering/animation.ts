import { state } from '../game/state';
import type { Motion, Point, CombatEffect } from '../types';
import { draw } from './board';
import { canvas } from '../ui/dom';

export function interpolate(motion: Motion | null, fallback: Point, now = performance.now()): Point {
    if (!motion)
        return fallback;
    const linear = Math.min(1, Math.max(0, (now - motion.startedAt) / motion.duration));
    const eased = linear * linear * (3 - 2 * linear);
    return { x: motion.from.x + (motion.to.x - motion.from.x) * eased, y: motion.from.y + (motion.to.y - motion.from.y) * eased };
}

export function addEffect(effect: Omit<CombatEffect, 'startedAt'>) {
    state.combatEffects.push({ ...effect, startedAt: performance.now() });
    requestAnimationFrameLoop();
}

export function requestAnimationFrameLoop() {
    if (state.animationFramePending)
        return;
    state.animationFramePending = true;
    requestAnimationFrame(animateVisuals);
}

export function animateVisuals(now: number) {
    state.worldMotion = state.worldMotion && now < state.worldMotion.startedAt + state.worldMotion.duration ? state.worldMotion : null;
    state.battlePlayerMotion = state.battlePlayerMotion && now < state.battlePlayerMotion.startedAt + state.battlePlayerMotion.duration ? state.battlePlayerMotion : null;
    for (const [id, motion] of state.enemyMotions)
        if (now >= motion.startedAt + motion.duration)
            state.enemyMotions.delete(id);
    state.combatEffects = state.combatEffects.filter(effect => now < effect.startedAt + effect.duration);
    draw();
    state.animationFramePending = Boolean(state.worldMotion || state.battlePlayerMotion || state.enemyMotions.size || state.combatEffects.length);
    if (state.animationFramePending)
        requestAnimationFrame(animateVisuals);
}

export function shakeBoard() {
    canvas.classList.remove('hit-shake');
    void canvas.offsetWidth;
    canvas.classList.add('hit-shake');
    window.setTimeout(() => canvas.classList.remove('hit-shake'), 280);
}
