import './style.css';
import { brandMark } from '../company/icons';

type Item = { symbol: string; name: string; fact: string };
const themes: Record<string, Item[]> = {
  animais: [
    { symbol: '🐝', name: 'Abelha', fact: 'As abelhas ajudam as flores a formar frutos e sementes.' },
    { symbol: '🐢', name: 'Tartaruga', fact: 'A tartaruga tem um casco que protege seu corpo.' },
    { symbol: '🦋', name: 'Borboleta', fact: 'Antes de virar borboleta, ela é uma lagarta!' },
    { symbol: '🐙', name: 'Polvo', fact: 'O polvo tem oito braços.' },
    { symbol: '🐸', name: 'Sapo', fact: 'O sapo começa a vida na água, como um girino.' },
    { symbol: '🐘', name: 'Elefante', fact: 'O elefante usa a tromba para cheirar, beber água e pegar comida.' },
    { symbol: '🐬', name: 'Golfinho', fact: 'O golfinho respira ar e precisa subir à superfície.' },
    { symbol: '🦉', name: 'Coruja', fact: 'Muitas corujas procuram alimento à noite.' },
  ],
  frutas: [
    { symbol: '🍎', name: 'Maçã', fact: 'A maçã cresce em uma árvore chamada macieira.' },
    { symbol: '🍌', name: 'Banana', fact: 'As bananas crescem juntas em cachos.' },
    { symbol: '🍇', name: 'Uva', fact: 'As uvas crescem em uma planta chamada videira.' },
    { symbol: '🍉', name: 'Melancia', fact: 'A melancia tem muita água na sua polpa.' },
    { symbol: '🍓', name: 'Morango', fact: 'Os pontinhos do morango são pequenos frutos que guardam sementes.' },
    { symbol: '🍍', name: 'Abacaxi', fact: 'O abacaxi cresce perto do chão.' },
    { symbol: '🍊', name: 'Laranja', fact: 'A laranja é uma fonte de vitamina C.' },
    { symbol: '🍐', name: 'Pera', fact: 'A pera tem fibras, que ajudam o intestino a funcionar.' },
  ],
  numeros: Array.from({ length: 8 }, (_, i) => ({ symbol: String(i + 1), name: ['Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito'][i], fact: `Vamos contar? ${Array(i + 1).fill('●').join(' ')} — ${i + 1}!` })),
};
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<header><a href="../../" class="brand" aria-label="Sygil Tech — início">${brandMark()}<span>SYGIL<small>TECH</small></span></a><span class="header-note">Feito para aprender brincando</span></header>
<main>
<section class="intro"><span class="eyebrow">UM PAR DE CADA VEZ, UMA NOVA DESCOBERTA</span><h1>Memória do <span>Saber<span class="spark">✦</span></span></h1><p>Vire as cartinhas, encontre os pares<br>e descubra um mundo de coisas legais!</p></section>
<section class="game" aria-label="Jogo da memória">
<div class="settings"><label>Vamos descobrir<select id="theme"><option value="animais">🐾 Animais</option><option value="frutas">🍓 Frutas</option><option value="numeros">🔢 Números</option></select></label><label>Tamanho da aventura<select id="level"><option value="4">Começando · 4 pares</option><option value="6" selected>Explorando · 6 pares</option><option value="8">Desafiando · 8 pares</option></select></label><button id="restart" class="restart">↻ <span>Recomeçar</span></button></div>
<div class="score"><span>⭐ <b id="pairs">0 / 6</b> pares</span><span>🖐 <b id="moves">0</b> jogadas</span><span class="gentle">No seu tempo. Você consegue!</span></div>
<div id="board" class="board" aria-label="Cartas"></div>
<div id="message" class="message" role="status" aria-live="polite"></div>
<div id="win" class="win" hidden><span class="win-star">🌟</span><h2>Você encontrou todos os pares!</h2><p id="result"></p><button id="again">Vamos jogar de novo →</button></div>
</section>
<p class="how"><span>💡</span> Como brincar: toque em duas cartas. Se forem iguais, o par é seu!</p>
</main><footer>Uma brincadeira da <a href="../../">Sygil Tech</a> <span>•</span> Curiosidade é o começo de tudo.</footer>`;
const board = document.querySelector<HTMLDivElement>('#board')!;
const theme = document.querySelector<HTMLSelectElement>('#theme')!;
const level = document.querySelector<HTMLSelectElement>('#level')!;
const message = document.querySelector<HTMLDivElement>('#message')!;
const win = document.querySelector<HTMLDivElement>('#win')!;
let deck: Item[] = [];
let open: number[] = [];
let matched = new Set<number>();
let moves = 0;
let pairs = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
function updateScore() {
  document.querySelector('#pairs')!.textContent = `${pairs} / ${level.value}`;
  document.querySelector('#moves')!.textContent = String(moves);
}
function reveal(index: number, visible: boolean) {
  const card = board.children[index] as HTMLButtonElement;
  card.classList.toggle('revealed', visible);
  card.setAttribute('aria-label', visible ? deck[index].name : `Carta ${index + 1}, virada para baixo`);
  card.setAttribute('aria-pressed', String(visible));
}
function flip(index: number) {
  if (open.length === 2 || open.includes(index) || matched.has(index)) return;
  reveal(index, true);
  open.push(index);
  if (open.length < 2) return;
  moves++;
  updateScore();
  const [a, b] = open;
  if (deck[a].name === deck[b].name) {
    pairs++;
    [a, b].forEach(i => {
      matched.add(i);
      const card = board.children[i] as HTMLButtonElement;
      card.classList.add('matched');
      card.setAttribute('aria-disabled', 'true');
      card.setAttribute('aria-label', `${deck[i].name}, par encontrado`);
    });
    message.textContent = `${deck[a].symbol} ${deck[a].name}: ${deck[a].fact}`;
    open = [];
    updateScore();
    if (pairs === Number(level.value)) {
      win.hidden = false;
      document.querySelector('#result')!.textContent = `Uma aventura com ${pairs} descobertas em ${moves} jogadas. Muito bem!`;
      document.querySelector<HTMLButtonElement>('#again')!.focus();
    }
  } else {
    message.textContent = 'Quase! Observe as cartas e tente outra vez. 🌱';
    timer = setTimeout(() => {
      reveal(a, false);
      reveal(b, false);
      open = [];
    }, 1200);
  }
}
function start() {
  clearTimeout(timer);
  open = [];
  matched = new Set();
  moves = 0;
  pairs = 0;
  win.hidden = true;
  const selection = shuffle([...themes[theme.value]]).slice(0, Number(level.value));
  deck = shuffle([...selection, ...selection]);
  board.innerHTML = '';
  deck.forEach((item, index) => {
    const button = document.createElement('button');
    button.className = `card${theme.value === 'numeros' ? ' number' : ''}`;
    button.setAttribute('aria-label', `Carta ${index + 1}, virada para baixo`);
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = `<span class="back" aria-hidden="true">✳</span><span class="face" aria-hidden="true"><span>${item.symbol}</span><small>${item.name}</small></span>`;
    button.addEventListener('click', () => flip(index));
    board.append(button);
  });
  updateScore();
  message.textContent = '✨ Sua aventura começa com duas cartinhas. Vamos lá?';
}
theme.addEventListener('change', start);
level.addEventListener('change', start);
document.querySelector('#restart')!.addEventListener('click', start);
document.querySelector('#again')!.addEventListener('click', () => { start(); (board.firstElementChild as HTMLButtonElement).focus(); });
start();
