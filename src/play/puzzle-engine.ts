export function shuffleTiles(count:number):number[]{
 const tiles=Array.from({length:count},(_,i)=>i);
 for(let i=count-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}
 if(isSolved(tiles)&&count>1)[tiles[0],tiles[1]]=[tiles[1],tiles[0]];
 return tiles;
}
export function isSolved(tiles:number[]):boolean{return tiles.every((tile,i)=>tile===i);}
export function swapTiles(tiles:number[],a:number,b:number):number[]{const next=[...tiles];[next[a],next[b]]=[next[b],next[a]];return next;}
