export const WIDTH = 10;
export const HEIGHT = 20;
export const SHAPES = [
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  [[2,0,0],[2,2,2],[0,0,0]],
  [[0,0,3],[3,3,3],[0,0,0]],
  [[4,4],[4,4]],
  [[0,5,5],[5,5,0],[0,0,0]],
  [[0,6,0],[6,6,6],[0,0,0]],
  [[7,7,0],[0,7,7],[0,0,0]],
];
export type Matrix = number[][];
export type Piece = { cells: Matrix; x: number; y: number };
export function emptyBoard(): Matrix { return Array.from({length:HEIGHT}, () => Array(WIDTH).fill(0)); }
export function rotated(cells: Matrix): Matrix { return cells[0].map((_, x) => cells.map(row => row[x]).reverse()); }
export function collides(board: Matrix, piece: Piece): boolean {
  return piece.cells.some((row, y) => row.some((cell, x) => cell !== 0 && (piece.x+x < 0 || piece.x+x >= WIDTH || piece.y+y >= HEIGHT || (piece.y+y >= 0 && board[piece.y+y][piece.x+x] !== 0))));
}
export function clearLines(board: Matrix): number {
  const remaining = board.filter(row => row.some(cell => cell === 0));
  const cleared = HEIGHT - remaining.length;
  board.splice(0, board.length, ...Array.from({length:cleared}, () => Array(WIDTH).fill(0)), ...remaining);
  return cleared;
}
export function shuffledBag(): number[] {
  const bag = SHAPES.map((_, i) => i);
  for (let i = bag.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [bag[i],bag[j]] = [bag[j],bag[i]]; }
  return bag;
}
