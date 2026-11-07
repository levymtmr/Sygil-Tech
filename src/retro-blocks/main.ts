import './style.css';
import { brandMark } from '../company/icons';
import { WIDTH, HEIGHT, SHAPES, emptyBoard, rotated, collides, clearLines, shuffledBag } from './engine';
import type { Piece } from './engine';

document.querySelector('#app')!.innerHTML = `
<header><a href="../../" aria-label="Sygil Tech — início" class="brand">${brandMark()}<span>SYGIL<small>TECH</small></span></a><a class="cartridge play-return" href="../../play/">← ESCOLHER OUTRO JOGO</a><button id="sound" aria-pressed="false">SOM: OFF</button></header>
<main><div class="title"><span class="edition">— THE FALLING BLOCK PUZZLE —</span><h1>RETRO<span>BLOCKS</span></h1><p>ENCAIXE. COMPLETE. SUPERE.</p></div>
<section class="cabinet" aria-label="Jogo Retro Blocks"><div class="cabinet-top"><span>▰ SUPER PUZZLE SYSTEM</span><span class="power">● POWER</span></div>
<div class="console"><aside class="left-panel"><div class="panel"><h2>RECORDE</h2><strong id="best">000000</strong></div><div class="panel"><h2>PONTOS</h2><strong id="score">000000</strong></div><div class="panel"><h2>NÍVEL</h2><strong id="level">01</strong></div><div class="panel"><h2>LINHAS</h2><strong id="lines">000</strong></div><div class="mini-art" aria-hidden="true">▟▙<br>▜▛<span>PLAY<br>FOREVER</span></div></aside>
<div class="screen-frame"><canvas id="board" width="300" height="600" aria-label="Tabuleiro de blocos, 10 colunas e 20 linhas"></canvas><div id="overlay" class="overlay"><span class="overlay-star">✦</span><h2 id="overlay-title">PRONTO<br>PARA JOGAR?</h2><p id="overlay-text">O próximo recorde pode ser seu.</p><button id="start">▶ INICIAR JOGO</button><small id="overlay-hint">ENTER PARA COMEÇAR</small></div></div>
<aside class="right-panel"><div class="panel next"><h2>PRÓXIMA</h2><canvas id="next" width="120" height="120" aria-label="Próxima peça"></canvas></div><div class="panel instructions"><h2>CONTROLES</h2><p><kbd>←</kbd><kbd>→</kbd><span>MOVER</span></p><p><kbd>↑</kbd><span>GIRAR</span></p><p><kbd>↓</kbd><span>DESCER</span></p><p><kbd>ESPAÇO</kbd><span>SOLTAR</span></p><p><kbd>P</kbd><span>PAUSAR</span></p></div><button id="pause" class="pause" disabled>Ⅱ PAUSAR</button><p class="level-note">10 LINHAS<br><span>UM NOVO NÍVEL</span></p></aside></div>
<div class="mobile-controls" aria-label="Controles por toque"><button data-action="left" aria-label="Mover para esquerda">◀</button><button data-action="down" aria-label="Descer">▼</button><button data-action="right" aria-label="Mover para direita">▶</button><button data-action="rotate" aria-label="Girar peça">↻</button><button data-action="drop" aria-label="Soltar peça">⤓<small>SOLTAR</small></button></div>
<div class="cabinet-bottom"><span>● ●</span><p>ONE MORE GAME.</p><span>● ●</span></div></section><p class="footnote">SEM PRESSA PARA COMEÇAR. DIFÍCIL É PARAR.</p><p id="announcement" class="sr-only" role="status" aria-live="polite"></p></main>
<footer><a href="../../play/">← ESCOLHER OUTRO JOGO</a><span>UM CLÁSSICO EM CADA ENCAIXE.</span></footer>`;
const canvas = document.querySelector<HTMLCanvasElement>('#board')!;
const ctx = canvas.getContext('2d')!;
const nextCtx = document.querySelector<HTMLCanvasElement>('#next')!.getContext('2d')!;
const overlay = document.querySelector<HTMLDivElement>('#overlay')!;
const startButton = document.querySelector<HTMLButtonElement>('#start')!;
const pauseButton = document.querySelector<HTMLButtonElement>('#pause')!;
const colors = ['','#53d6df','#6183ed','#edaa53','#f1dc66','#7bd38b','#b887e5','#ed748e'];
let board = emptyBoard();
let piece: Piece = {cells: SHAPES[0], x:3, y:0};
let bag: number[] = [];
let next = 0;
let score = 0;
let lines = 0;
let level = 1;
let best = 0;
try { best = Number(localStorage.getItem('sygil-retro-best')) || 0; } catch { /* Storage is optional. */ }
let state: 'ready' | 'playing' | 'paused' | 'over' = 'ready';
let elapsed = 0;
let last = 0;
let sound = false;
let audio: AudioContext | undefined;
function tone(frequency:number, duration=.07) {
  if (!sound) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const osc = audio.createOscillator(); const gain = audio.createGain();
    osc.type = 'square'; osc.frequency.value = frequency;
    gain.gain.setValueAtTime(.035,audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);
    osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);
  } catch { /* Play remains available without audio. */ }
}
function take():number { if (!bag.length) bag = shuffledBag(); return bag.pop()!; }
function stats() {
  for (const [id,value,length] of [['score',score,6],['best',best,6],['lines',lines,3],['level',level,2]] as const) document.querySelector(`#${id}`)!.textContent = String(value).padStart(length,'0');
}
function block(context:CanvasRenderingContext2D,x:number,y:number,size:number,color:number) {
  context.fillStyle = colors[color];context.fillRect(x+1,y+1,size-2,size-2);
  context.fillStyle = '#ffffff70';context.fillRect(x+2,y+2,size-4,3);context.fillRect(x+2,y+2,3,size-4);
  context.fillStyle = '#00000050';context.fillRect(x+2,y+size-5,size-4,3);context.fillRect(x+size-5,y+2,3,size-4);
  context.fillStyle = '#ffffff18';context.fillRect(x+7,y+7,size-14,size-14);
}
function draw() {
  ctx.fillStyle = '#0b1020';ctx.fillRect(0,0,300,600);
  ctx.strokeStyle = '#ffffff07';ctx.lineWidth = 1;
  for(let x=0;x<=WIDTH;x++){ctx.beginPath();ctx.moveTo(x*30,0);ctx.lineTo(x*30,600);ctx.stroke();}
  for(let y=0;y<=HEIGHT;y++){ctx.beginPath();ctx.moveTo(0,y*30);ctx.lineTo(300,y*30);ctx.stroke();}
  board.forEach((row,y)=>row.forEach((cell,x)=>{if(cell)block(ctx,x*30,y*30,30,cell);}));
  if(state !== 'ready' && state !== 'over') piece.cells.forEach((row,y)=>row.forEach((cell,x)=>{if(cell && piece.y+y>=0)block(ctx,(piece.x+x)*30,(piece.y+y)*30,30,cell);}));
  nextCtx.clearRect(0,0,120,120);
  const cells = SHAPES[next];
  cells.forEach((row,y)=>row.forEach((cell,x)=>{if(cell)block(nextCtx, (120-cells.length*24)/2+x*24, (120-cells.length*24)/2+y*24,24,cell);}));
}
function spawn() {
  piece = {cells:SHAPES[next].map(row=>[...row]), x:Math.floor((WIDTH-SHAPES[next].length)/2), y:0};
  next = take();
  if(collides(board,piece)) finish();
}
function finish() {
  state='over'; saveBest(); pauseButton.disabled=true;
  showOverlay('FIM DE<br>JOGO',`${score} pontos. Que tal mais uma?`,'↻ JOGAR DE NOVO');
  document.querySelector('#announcement')!.textContent=`Fim de jogo. ${score} pontos, ${lines} linhas.`;
  tone(110,.3);
}
function saveBest() { if(score>best){ best=score;try{localStorage.setItem('sygil-retro-best',String(best));}catch{/* Optional. */} } stats(); }
function lock() {
  let above = false;
  piece.cells.forEach((row,y)=>row.forEach((cell,x)=>{if(cell){if(piece.y+y<0)above=true;else board[piece.y+y][piece.x+x]=cell;}}));
  if(above){finish();return;}
  const cleared=clearLines(board);
  if(cleared){score += [0,40,100,300,1200][cleared]*level;lines+=cleared;level=1+Math.floor(lines/10);tone(660,.16);document.querySelector('#announcement')!.textContent=`${cleared} ${cleared===1?'linha completa':'linhas completas'}! ${score} pontos.`;}
  else tone(150,.04);
  saveBest();spawn();elapsed=0;draw();
}
function move(dx:number,dy:number):boolean {
  const candidate={...piece,x:piece.x+dx,y:piece.y+dy};
  if(collides(board,candidate))return false;
  piece=candidate;draw();return true;
}
function action(name:string) {
  if(state!=='playing')return;
  if(name==='left')move(-1,0);
  if(name==='right')move(1,0);
  if(name==='down'){if(move(0,1)){score++;stats();elapsed=0;}else lock();}
  if(name==='rotate'){
    const cells=rotated(piece.cells);
    for(const offset of [0,-1,1,-2,2]){
      const candidate={...piece,cells,x:piece.x+offset};
      if(!collides(board,candidate)){piece=candidate;tone(330);break;}
    }
  }
  if(name==='drop'){while(move(0,1))score+=2;lock();}
  draw();
}
function showOverlay(title:string,text:string,label:string) {
  document.querySelector('#overlay-title')!.innerHTML=title;
  document.querySelector('#overlay-text')!.textContent=text;
  startButton.textContent=label;
  document.querySelector('#overlay-hint')!.textContent=state==='paused'?'P OU ENTER PARA CONTINUAR':'ENTER PARA COMEÇAR';
  overlay.hidden=false;
}
function start() {
  if(state==='paused'){pause();return;}
  board=emptyBoard();bag=[];score=0;lines=0;level=1;next=take();state='playing';elapsed=0;spawn();stats();draw();overlay.hidden=true;pauseButton.disabled=false;pauseButton.textContent='Ⅱ PAUSAR';tone(440,.1);
}
function pause() {
  if(state==='playing'){state='paused';pauseButton.textContent='▶ CONTINUAR';showOverlay('PAUSA', 'Sua partida está esperando por você.','▶ CONTINUAR');}
  else if(state==='paused'){state='playing';elapsed=0;overlay.hidden=true;pauseButton.textContent='Ⅱ PAUSAR';}
}
startButton.addEventListener('click',start);pauseButton.addEventListener('click',pause);
document.querySelector('#sound')!.addEventListener('click',()=>{sound=!sound;const button=document.querySelector('#sound')!;button.textContent=`SOM: ${sound?'ON':'OFF'}`;button.setAttribute('aria-pressed',String(sound));tone(440);});
const keys:Record<string,string>={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rotate',' ':'drop',x:'rotate',X:'rotate'};
window.addEventListener('keydown',event=>{
  if(event.target instanceof HTMLButtonElement && (event.key===' '||event.key==='Enter'))return;
  if(keys[event.key]){event.preventDefault();if(!event.repeat || !['rotate','drop'].includes(keys[event.key]))action(keys[event.key]);}
  if(event.key.toLowerCase()==='p'&&!event.repeat){event.preventDefault();pause();}
  if(event.key==='Enter'&&!event.repeat){event.preventDefault();if(state==='ready'||state==='over')start();else pause();}
});
let repeatDelay:ReturnType<typeof setTimeout>|undefined;
let repeat:ReturnType<typeof setInterval>|undefined;
function stopRepeat(){clearTimeout(repeatDelay);clearInterval(repeat);}
document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button=>{
  button.addEventListener('pointerdown',event=>{event.preventDefault();stopRepeat();button.setPointerCapture(event.pointerId);const name=button.dataset.action!;action(name);if(['left','right','down'].includes(name))repeatDelay=setTimeout(()=>{repeat=setInterval(()=>action(name),85);},200);});
  button.addEventListener('pointerup',stopRepeat);button.addEventListener('pointercancel',stopRepeat);button.addEventListener('lostpointercapture',stopRepeat);
  button.addEventListener('click',event=>{if(event.detail===0)action(button.dataset.action!);});
});
window.addEventListener('blur',()=>{stopRepeat();if(state==='playing')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopRepeat();if(state==='playing')pause();}});
function frame(now:number){const delta=Math.min(now-last,100);last=now;if(state==='playing'){elapsed+=delta;if(elapsed>=Math.max(80,850*Math.pow(.8,level-1))){elapsed=0;if(!move(0,1))lock();}}requestAnimationFrame(frame);}
stats();draw();requestAnimationFrame(frame);
