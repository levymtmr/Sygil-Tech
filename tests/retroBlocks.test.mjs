import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyBoard, collides, clearLines, rotated, shuffledBag, SHAPES } from '../src/retro-blocks/engine.ts';

test('pieces stop at walls, floor and occupied cells', () => {
  const board = emptyBoard();
  const piece = { cells: SHAPES[3], x: 0, y: 0 };
  assert.equal(collides(board, piece), false);
  assert.equal(collides(board, {...piece,x:-1}), true);
  assert.equal(collides(board, {...piece,x:9}), true);
  assert.equal(collides(board, {...piece,y:19}), true);
  board[1][1] = 2;
  assert.equal(collides(board,piece),true);
});
test('clearing four lines drops remaining blocks and inserts empty rows', () => {
  const board = emptyBoard();
  board[15][2] = 6;
  for(let i=16;i<20;i++)board[i].fill(1);
  assert.equal(clearLines(board),4);
  assert.equal(board.length,20);
  assert.equal(board[19][2],6);
  assert.ok(board.slice(0,4).every(row=>row.every(cell=>cell===0)));
  assert.equal(clearLines(board),0);
});
test('rotation preserves each shape after four turns and bags contain all seven pieces', () => {
  for(const cells of SHAPES)assert.deepEqual(rotated(rotated(rotated(rotated(cells)))),cells);
  for(let i=0;i<20;i++)assert.deepEqual(shuffledBag().sort(),[0,1,2,3,4,5,6]);
});
