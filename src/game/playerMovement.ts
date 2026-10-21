import type { Motion, Point } from '../types';

export type Facing = 'down' | 'left' | 'right' | 'up';

export function movementFacing(from: Point, to: Point, fallback: Facing = 'down'): Facing {
  const dx = to.x - from.x, dy = to.y - from.y;
  if (dx === 0 && dy === 0) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

export function movementFrame(motion: Motion | null, now: number, reducedMotion = false): number {
  if (!motion || reducedMotion || motion.duration <= 0) return 0;
  const progress = (now - motion.startedAt) / motion.duration;
  if (progress < 0 || progress >= 1) return 0;
  // Start on a stride and return to the neutral pose when movement ends.
  return [1, 2, 3, 0][Math.floor(progress * 4)];
}
