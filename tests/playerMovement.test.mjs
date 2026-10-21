import test from 'node:test';
import assert from 'node:assert/strict';
import { movementFacing, movementFrame } from '../src/game/playerMovement.ts';

test('movement points toward the destination and preserves facing at rest', () => {
  const origin = { x: 5, y: 5 };
  assert.equal(movementFacing(origin, { x: 6, y: 5 }), 'right');
  assert.equal(movementFacing(origin, { x: 4, y: 5 }), 'left');
  assert.equal(movementFacing(origin, { x: 5, y: 4 }), 'up');
  assert.equal(movementFacing(origin, { x: 5, y: 6 }), 'down');
  assert.equal(movementFacing(origin, origin, 'left'), 'left');
  assert.equal(movementFacing(origin, { x: 8, y: 6 }), 'right');
});

test('a walking cycle follows movement progress, then returns to idle', () => {
  const motion = { from: { x: 0, y: 0 }, to: { x: 1, y: 0 }, startedAt: 1000, duration: 240 };
  assert.deepEqual([1000, 1060, 1120, 1180].map(now => movementFrame(motion, now)), [1, 2, 3, 0]);
  assert.equal(movementFrame(motion, 999), 0);
  assert.equal(movementFrame(motion, 1240), 0);
  assert.equal(movementFrame(null, 1100), 0);
  assert.equal(movementFrame(motion, 1100, true), 0);
  assert.equal(movementFrame({ ...motion, duration: 0 }, 1000), 0);
});
