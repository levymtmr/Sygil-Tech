export type Hero = {name:string; icon:string; color:string; hp:number; max:number; x:number; y:number; spawn:number[]; score:number; cooldown:number[]; shield:boolean};
export type Mode = 'move'|'attack'|'skill0'|'skill1';
export const walls = new Set(['3,2','6,2','2,3','7,3','2,6','7,6','3,7','6,7']);
export const skills = [['Investida','Onda de choque'],['Disparo preciso','Chuva de flechas'],['Bola de fogo','Teleporte'],['Ataque furtivo','Passo das sombras']];
export const descriptions = [['Causa 4 de dano a até 2 casas e empurra uma casa.','Causa 3 de dano a todos os inimigos a até 2 casas.'],['Causa 4 de dano a até 6 casas.','Causa 3 de dano em uma área a até 4 casas.'],['Causa 4 de dano em uma área a até 4 casas.','Teleporta para uma casa livre a até 4 casas.'],['Causa 5 de dano a um inimigo adjacente.','Teleporta para uma casa livre a até 5 casas.']];
export const distance = (a:{x:number;y:number},b:{x:number;y:number})=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export const center = (h:{x:number;y:number})=>h.x>=4&&h.x<=5&&h.y>=4&&h.y<=5;
export function createGame(){return {heroes:[['Guerreiro','⚔','#ee9972',14,1,1],['Arqueiro','➶','#8ccc9b',10,8,1],['Mago','✦','#ac9fe8',10,8,8],['Ladino','◆','#77c6db',11,1,8]].map(([name,icon,color,max,x,y])=>({name,icon,color,hp:max,max,x,y,spawn:[x,y],score:0,cooldown:[0,0],shield:false}) as Hero),active:0,round:1,moved:false,acted:false,winner:-1,log:['A arena está aberta. Disputem o centro!']};}
export type Game = ReturnType<typeof createGame>;
export function free(g:Game,x:number,y:number){return x>=0&&x<10&&y>=0&&y<10&&!walls.has(`${x},${y}`)&&!g.heroes.some(h=>h.hp>0&&h.x===x&&h.y===y);}
export function reachable(g:Game,limit=3){const h=g.heroes[g.active], seen=new Map<string,number>([[`${h.x},${h.y}`,0]]),queue=[[h.x,h.y,0]];for(const [x,y,d] of queue){if(d>=limit)continue;for(const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const k=`${nx},${ny}`;if(!seen.has(k)&&free(g,nx,ny)){seen.set(k,d+1);queue.push([nx,ny,d+1]);}}}seen.delete(`${h.x},${h.y}`);return seen;}
export function sight(a:{x:number;y:number},b:{x:number;y:number}){const steps=Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))*4;for(let i=1;i<steps;i++){if(walls.has(`${Math.round(a.x+(b.x-a.x)*i/steps)},${Math.round(a.y+(b.y-a.y)*i/steps)}`))return false;}return true;}
export function range(g:Game,mode:Mode){return mode==='attack'?[1,4,3,1][g.active]:mode==='skill0'?[2,6,4,1][g.active]:[2,4,4,5][g.active];}
// Range is visible even when there is no enemy to target.
export function attackArea(g:Game,mode:Mode){
 const cells=new Set<string>();
 if(mode==='move'||g.winner>=0||g.acted)return cells;
 if(mode!=='attack'&&g.heroes[g.active].cooldown[mode==='skill0'?0:1]>0)return cells;
 const h=g.heroes[g.active];
 for(let y=0;y<10;y++)for(let x=0;x<10;x++){
  const p={x,y};
  if(mode==='skill1'&&g.active>=2){if(valid(g,mode,x,y))cells.add(`${x},${y}`);}
  else if(distance(h,p)>0&&distance(h,p)<=range(g,mode)&&!walls.has(`${x},${y}`)&&((mode==='skill1'&&g.active===0)||sight(h,p)))cells.add(`${x},${y}`);
 }
 return cells;
}
export function impactArea(g:Game,mode:Mode,x:number,y:number){
 const cells=new Set<string>();
 if(mode==='move'||(mode==='skill1'&&g.active>=2))return cells;
 const wave=mode==='skill1'&&g.active===0;
 const radius=wave?2:((mode==='skill1'&&g.active===1)||(mode==='skill0'&&g.active===2))?1:0;
 const origin=wave?g.heroes[g.active]:{x,y};
 for(let row=0;row<10;row++)for(let col=0;col<10;col++)if(distance(origin,{x:col,y:row})<=radius)cells.add(`${col},${row}`);
 return cells;
}
export function valid(g:Game,mode:Mode,x:number,y:number){if(g.winner>=0)return false;const h=g.heroes[g.active],p={x,y};if(mode==='move')return !g.moved&&reachable(g).has(`${x},${y}`);if(g.acted)return false;const index=mode==='skill0'?0:1;if(mode!=='attack'&&h.cooldown[index]>0)return false;if(distance(h,p)>range(g,mode)||!sight(h,p))return false;if(mode==='skill1'&&g.active>=2)return free(g,x,y);if(mode==='skill1'&&g.active===0)return x===h.x&&y===h.y;return g.heroes.some(t=>t!==h&&t.hp>0&&t.x===x&&t.y===y);}
function hit(g:Game,t:Hero,damage:number){const h=g.heroes[g.active];const previous=t.hp;t.hp=Math.max(0,t.hp-Math.max(1,damage-(t.shield?2:0)));g.log.unshift(`${t.name} sofreu ${previous-t.hp} de dano${t.shield?' (defesa ativa)':''}. Vida: ${t.hp}/${t.max} PV.`);if(t.hp===0){h.score++;g.log.unshift(`${h.name} derrotou ${t.name}: +1 ponto.`);if(h.score>=5)g.winner=g.active;}}
export function act(g:Game,mode:Mode,x:number,y:number){if(!valid(g,mode,x,y))return false;const h=g.heroes[g.active];if(mode==='move'){h.x=x;h.y=y;g.moved=true;return true;}g.acted=true;if(mode!=='attack')h.cooldown[mode==='skill0'?0:1]=3;if(mode==='skill1'&&g.active>=2){h.x=x;h.y=y;g.log.unshift(`${h.name} usou ${skills[g.active][1]}.`);return true;}const area=mode==='skill1'||(mode==='skill0'&&g.active===2);for(const t of g.heroes){if(t===h||t.hp<=0)continue;const target={x,y};if(area?(g.active===0?distance(h,t)<=2:distance(target,t)<=1):t.x===x&&t.y===y){hit(g,t,mode==='attack'?3:mode==='skill1'?3:g.active===3?5:4);if(g.active===0&&mode==='skill0'&&t.hp>0){const dx=Math.sign(t.x-h.x),dy=dx===0?Math.sign(t.y-h.y):0;if(free(g,t.x+dx,t.y+dy)){t.x+=dx;t.y+=dy;}}}}g.log.unshift(`${h.name} usou ${mode==='attack'?'ataque básico':skills[g.active][mode==='skill0'?0:1]}.`);return true;}
export function endTurn(g:Game){if(g.winner>=0)return;g.active=(g.active+1)%4;if(g.active===0){const holders=g.heroes.filter(h=>h.hp>0&&center(h));if(holders.length===1){holders[0].score++;g.log.unshift(`${holders[0].name} controlou o centro: +1 ponto.`);if(holders[0].score>=5)g.winner=g.heroes.indexOf(holders[0]);}g.round++;}const h=g.heroes[g.active];h.cooldown=h.cooldown.map(n=>Math.max(0,n-1));h.shield=false;if(h.hp===0){const choices=[];for(let y=0;y<10;y++)for(let x=0;x<10;x++)if(free(g,x,y))choices.push({x,y});choices.sort((a,b)=>distance(a,{x:h.spawn[0],y:h.spawn[1]})-distance(b,{x:h.spawn[0],y:h.spawn[1]}));h.x=choices[0].x;h.y=choices[0].y;h.hp=h.max;g.log.unshift(`${h.name} voltou à arena.`);}g.moved=false;g.acted=false;}
