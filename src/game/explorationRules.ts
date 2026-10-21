import type { Point } from '../types';

export function clampPosition(position: Point, delta: Point, width: number, height: number): Point {
  return { x: Math.max(0, Math.min(width - 1, position.x + delta.x)), y: Math.max(0, Math.min(height - 1, position.y + delta.y)) };
}

export function isAdjacent(from: Point, to: Point): boolean {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y) === 1;
}

export function isAtPosition(position: Point, target: Point): boolean {
  return position.x === target.x && position.y === target.y;
}
