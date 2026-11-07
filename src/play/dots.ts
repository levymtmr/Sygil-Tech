import { header } from './common';
import { SIZE, adjacent, hasMove, fillBoard, resolveDots } from './dots-engine';
document.querySelector('#app')!.innerHTML=`${header()}<main class="puzzle-main"><div class="puzzle-heading"><p class="eyebrow">SYGIL PLAY / CONECTE AS POSSIBILIDADES</p><h1>Um ponto puxa outro.</h1><p>Ligue pontos da mesma cor. Feche um quadrado<br>e veja todas as bolinhas dessa cor desaparecerem.</p></div><section class="game-shell" aria-label="Jogo Dots"><div class="game-toolbar"><label>Seu ritmo<select id="mode"><option value="30">Desafio · 30 jogadas</option><option value="0">Livre · sem limite</option></select></label><button class="plain-button" id="restart">↻ Nova partida</button></div><div class="game-stats"><span>Pontos <b id="score">0</b></span><span id="remaining"></span><span>Recorde <b id="best">0</b></span></div><div class="dots-board" id="dots-board" aria-label="Pontos coloridos"></div><div class="dots-actions"><button class="plain-button" id="confirm" disabled>Conectar pontos ✓</button><button class="plain-button" id="cancel">Desmarcar</button></div><p class="game-status" id="status" role="status" aria-live="polite"></p></section><p class="game-help">Arraste entre vizinhos da mesma cor, na horizontal ou vertical.<br>Também pode tocar em cada ponto e usar “Conectar pontos”.<br>Forme um circuito com pelo menos 4 pontos para limpar a cor inteira.</p></main>`;
const colors=['#dc8c7e','#85b5ba','#e5c668','#ac99c6','#a6bb8b'];
const names=['Coral','Azul','Amarelo','Lilás','Verde'];
const marks=['●','◆','▲','✦','■'];
const host=document.querySelector<HTMLDivElement>('#dots-board')!;
const mode=document.querySelector<HTMLSelectElement>('#mode')!;
const confirm=document.querySelector<HTMLButtonElement>('#confirm')!;
const status=document.querySelector('#status')!;
let board=fillBoard(),path:number[]=[],loop=false,score=0,moves=0,over=false,dragging=false,dragged=false,startIndex=-1;
let best=0;try{best=Number(localStorage.getItem('sygil-dots-best'))||0;}catch{/* Optional. */}
function stats(){document.querySelector('#score')!.textContent=String(score);document.querySelector('#best')!.textContent=String(best);document.querySelector('#remaining')!.textContent=mode.value==='0'?`${moves} jogadas`:`${Math.max(0,Number(mode.value)-moves)} jogadas restantes`;}
function selection(){
 host.querySelectorAll('.dot').forEach((button,i)=>{button.classList.toggle('selected',path.includes(i));button.setAttribute('aria-pressed',String(path.includes(i)));});
 host.classList.toggle('loop',loop);confirm.disabled=path.length<2||over;
 const points=[...path,...(loop?[path[0]]:[])].map(i=>`${(i%SIZE+.5)*100/SIZE},${(Math.floor(i/SIZE)+.5)*100/SIZE}`).join(' ');
 host.querySelector('polyline')!.setAttribute('points',points);host.querySelector('polyline')!.setAttribute('stroke',colors[board[path[0]]??0]);
}
function render(){
 host.innerHTML=board.map((color,i)=>`<button class="dot" data-index="${i}" style="--dot-color:${colors[color]}" aria-label="${names[color]}, linha ${Math.floor(i/SIZE)+1}, coluna ${i%SIZE+1}" aria-pressed="false" ${over?'disabled':''}><span aria-hidden="true">${marks[color]}</span></button>`).join('')+'<svg class="dots-lines" viewBox="0 0 100 100" aria-hidden="true"><polyline points=""/></svg>';
 selection();stats();
}
function pick(i:number){
 if(over)return;
 if(!path.length){path=[i];loop=false;selection();return;}
 const last=path[path.length-1];
 if(i===last)return;
 if(path.length>1&&i===path[path.length-2]){path.pop();loop=false;selection();return;}
 if(loop)return;
 if(!adjacent(last,i)||board[i]!==board[path[0]])return;
 if(i===path[0]&&path.length>=4){loop=true;status.textContent='Circuito fechado! Todos os pontos dessa cor vão desaparecer.';}
 else if(!path.includes(i))path.push(i);
 selection();
}
function commit(){
 if(over||path.length<2)return;
 const result=resolveDots(board,path,loop);board=result.board;score+=result.removed;moves++;
 status.textContent=loop?`Boa! ${result.removed} pontos removidos com um circuito.`:`${result.removed} pontos conectados. Continue assim!`;
 path=[];loop=false;
 if(score>best){best=score;try{localStorage.setItem('sygil-dots-best',String(best));}catch{/* Optional. */}}
 over=mode.value!=='0'&&moves>=Number(mode.value);
 if(over)status.textContent=`Partida concluída! Você fez ${score} pontos. Use Nova partida para jogar de novo.`;
 else if(!hasMove(board)){board=fillBoard();status.textContent+=' Sem pares disponíveis: renovamos o tabuleiro sem gastar jogadas.';}
 render();
}
function indexAt(x:number,y:number):number|null{const element=document.elementFromPoint(x,y)?.closest<HTMLElement>('[data-index]');return element&&host.contains(element)?Number(element.dataset.index):null;}
host.addEventListener('pointerdown',event=>{
 const i=indexAt(event.clientX,event.clientY);if(i===null||over)return;
 if(event.pointerType==='mouse'&&event.button!==0)return;
 dragging=true;dragged=false;startIndex=i;host.setPointerCapture(event.pointerId);pick(i);
});
host.addEventListener('pointermove',event=>{if(!dragging)return;const i=indexAt(event.clientX,event.clientY);if(i!==null&&i!==startIndex){dragged=true;pick(i);}});
host.addEventListener('pointerup',()=>{if(!dragging)return;dragging=false;if(dragged&&path.length>=2)commit();});
function cancel(){dragging=false;dragged=false;path=[];loop=false;selection();}
host.addEventListener('pointercancel',cancel);host.addEventListener('lostpointercapture',()=>{dragging=false;});
host.addEventListener('click',event=>{if(event.detail===0){const target=(event.target as HTMLElement).closest<HTMLElement>('[data-index]');if(target)pick(Number(target.dataset.index));}});
confirm.addEventListener('click',commit);document.querySelector('#cancel')!.addEventListener('click',cancel);
function start(){board=fillBoard();path=[];loop=false;moves=0;score=0;over=false;dragging=false;status.textContent='Escolha uma cor e comece sua conexão.';render();}
document.querySelector('#restart')!.addEventListener('click',start);mode.addEventListener('change',start);start();
