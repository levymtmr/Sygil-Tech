export const SIZE=6;
export function adjacent(a:number,b:number):boolean { return Math.abs(Math.floor(a/SIZE)-Math.floor(b/SIZE))+Math.abs(a%SIZE-b%SIZE)===1; }
export function hasMove(board:number[]):boolean { return board.some((color,i)=>(i%SIZE<SIZE-1&&board[i+1]===color)||(i+SIZE<board.length&&board[i+SIZE]===color)); }
export function fillBoard():number[]{
 const board=Array.from({length:SIZE*SIZE},()=>Math.floor(Math.random()*5));
 if(!hasMove(board))board[1]=board[0];
 return board;
}
export function resolveDots(board:number[],path:number[],loop:boolean):{board:number[];removed:number}{
 const selected=new Set(path);
 if(loop)board.forEach((color,i)=>{if(color===board[path[0]])selected.add(i);});
 const result=[...board];
 for(let x=0;x<SIZE;x++){
  const remaining=board.filter((_,i)=>i%SIZE===x&&!selected.has(i));
  const additions=SIZE-remaining.length;
  const column=[...Array.from({length:additions},()=>Math.floor(Math.random()*5)),...remaining];
  column.forEach((value,y)=>{result[y*SIZE+x]=value;});
 }
 return {board:result,removed:selected.size};
}
