import { header } from './common';
import { pictures } from './pictures';
import { shuffleTiles,isSolved,swapTiles } from './puzzle-engine';
document.querySelector('#app')!.innerHTML=`${header()}<main class="puzzle-main"><div class="puzzle-heading"><p class="eyebrow">SYGIL PLAY / CADA PEÇA TEM SEU LUGAR</p><h1>Um pedacinho de calma.</h1><p>Troque as peças de lugar e revele a paisagem.<br>Sem relógio. Sem pressa. Só mais um encaixe.</p></div><section class="game-shell" aria-label="Quebra-cabeça"><div class="game-toolbar"><label>Paisagem<select id="picture">${pictures.map((p,i)=>`<option value="${i}">${p.name}</option>`).join('')}</select></label><label>Desafio<select id="size"><option value="3">Fácil · 9 peças</option><option value="4">Médio · 16 peças</option><option value="5">Difícil · 25 peças</option></select></label><button class="plain-button" id="restart">↻ Embaralhar</button></div><div class="game-stats"><span>Trocas <b id="moves">0</b></span><span>No lugar certo <b id="correct"></b></span><button class="plain-button" id="preview-toggle" aria-expanded="false" aria-controls="preview">Ver imagem</button></div><div class="picture-board" id="puzzle-board" aria-label="Peças da paisagem"></div><img class="picture-preview" id="preview" hidden alt="Imagem completa para referência"><label class="check-label"><input id="numbers" type="checkbox" checked> Mostrar números nas peças</label><p class="game-status" id="status" role="status" aria-live="polite"></p></section><p class="game-help">Toque em uma peça e depois em outra para trocar as duas de lugar.<br>Os números indicam a ordem: da esquerda para a direita, de cima para baixo.<br>No teclado, use Tab para escolher e Enter ou espaço para selecionar.</p></main>`;
const board=document.querySelector<HTMLDivElement>('#puzzle-board')!;
const sizeInput=document.querySelector<HTMLSelectElement>('#size')!;
const pictureInput=document.querySelector<HTMLSelectElement>('#picture')!;
const numbers=document.querySelector<HTMLInputElement>('#numbers')!;
const preview=document.querySelector<HTMLImageElement>('#preview')!;
const previewToggle=document.querySelector<HTMLButtonElement>('#preview-toggle')!;
const status=document.querySelector('#status')!;
let size=3,tiles:number[]=[],selected=-1,moves=0,solved=false;
function draw(focus=-1){
 board.style.gridTemplateColumns=`repeat(${size},1fr)`;
 board.style.setProperty('--picture',`url("${pictures[Number(pictureInput.value)].url}")`);
 board.style.setProperty('--background-size',`${size*100}% ${size*100}%`);
 board.classList.toggle('solved',solved);
 board.innerHTML=tiles.map((tile,i)=>`<button class="picture-tile${selected===i?' selected':''}${numbers.checked?'':' hide-number'}" style="--position:${tile%size/(size-1)*100}% ${Math.floor(tile/size)/(size-1)*100}%" data-index="${i}" aria-pressed="${selected===i}" aria-label="Peça ${tile+1}, posição ${i+1}${tile===i?', no lugar certo':''}" ${solved?'disabled':''}><span aria-hidden="true">${tile+1}</span></button>`).join('');
 document.querySelector('#moves')!.textContent=String(moves);
 document.querySelector('#correct')!.textContent=`${tiles.filter((tile,i)=>tile===i).length} / ${tiles.length}`;
 if(focus>=0)(board.children[focus] as HTMLButtonElement).focus();
}
board.addEventListener('click',event=>{
 const target=(event.target as HTMLElement).closest<HTMLElement>('[data-index]');if(!target||solved)return;
 const i=Number(target.dataset.index);
 if(selected===i){selected=-1;draw(i);return;}
 if(selected===-1){selected=i;status.textContent=`Peça ${tiles[i]+1} selecionada. Escolha outra para trocar.`;draw(i);return;}
 tiles=swapTiles(tiles,selected,i);selected=-1;moves++;solved=isSolved(tiles);
 status.textContent=solved?`Paisagem completa! Você resolveu em ${moves} trocas. Escolha outra imagem ou embaralhe para jogar de novo.`:'Bom encaixe! Continue montando sua paisagem.';
 draw(solved?-1:i);if(solved)document.querySelector<HTMLButtonElement>('#restart')!.focus();
});
function start(){size=Number(sizeInput.value);tiles=shuffleTiles(size*size);selected=-1;moves=0;solved=false;preview.src=pictures[Number(pictureInput.value)].url;preview.alt=`Imagem completa: ${pictures[Number(pictureInput.value)].name}`;status.textContent='Sua paisagem está esperando. Escolha duas peças para trocar.';draw();}
sizeInput.addEventListener('change',start);pictureInput.addEventListener('change',start);document.querySelector('#restart')!.addEventListener('click',start);numbers.addEventListener('change',()=>draw());
previewToggle.addEventListener('click',()=>{preview.hidden=!preview.hidden;previewToggle.setAttribute('aria-expanded',String(!preview.hidden));previewToggle.textContent=preview.hidden?'Ver imagem':'Esconder imagem';});start();
