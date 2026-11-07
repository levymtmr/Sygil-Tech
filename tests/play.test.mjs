import test from 'node:test';
import assert from 'node:assert/strict';
import { adjacent,hasMove,fillBoard,resolveDots } from '../src/play/dots-engine.ts';
import { shuffleTiles,isSolved,swapTiles } from '../src/play/puzzle-engine.ts';
test('dots adjacency excludes diagonals and row wrapping',()=>{
 assert.ok(adjacent(0,1));assert.ok(adjacent(0,6));assert.ok(!adjacent(5,6));assert.ok(!adjacent(0,7));
});
test('dots chains remove only selected dots and preserve column gravity',()=>{
 const board=Array.from({length:36},(_,i)=>i%5);board[24]=4;board[30]=4;
 const result=resolveDots(board,[24,30],false);
 assert.equal(result.removed,2);assert.equal(result.board.length,36);
 assert.equal(result.board[30],board[18]);assert.equal(result.board[24],board[12]);
 for(let i=0;i<36;i++)if(i%6!==0)assert.equal(result.board[i],board[i]);
});
test('dots circuits remove all dots of the selected color and fresh boards have a move',()=>{
 const board=Array(36).fill(1);for(const i of [0,1,6,7,35])board[i]=0;
 const result=resolveDots(board,[0,1,7,6],true);
 assert.equal(result.removed,5);
 for(let i=0;i<20;i++)assert.ok(hasMove(fillBoard()));
 assert.equal(hasMove(Array.from({length:36},(_,i)=>(Math.floor(i/6)+i%6)%2)),false);
});
test('puzzles start shuffled, contain every tile and can be solved through swaps',()=>{
 for(const size of [3,4,5]){
  let tiles=shuffleTiles(size*size);assert.equal(isSolved(tiles),false);
  assert.deepEqual([...tiles].sort((a,b)=>a-b),Array.from({length:size*size},(_,i)=>i));
  for(let i=0;i<tiles.length;i++)tiles=swapTiles(tiles,i,tiles.indexOf(i));
  assert.equal(isSolved(tiles),true);
 }
 const original=[1,0,2];assert.deepEqual(swapTiles(original,0,1),[0,1,2]);assert.deepEqual(original,[1,0,2]);
});
