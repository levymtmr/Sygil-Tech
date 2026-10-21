import { createGameMarkup } from './layout';

export const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = createGameMarkup();

export const canvas = document.querySelector<HTMLCanvasElement>('#game')!;

export const ctx = canvas.getContext('2d')!;

export const miniMapCanvas = document.querySelector<HTMLCanvasElement>('#mini-map')!;

export const worldMapCanvas = document.querySelector<HTMLCanvasElement>('#world-map')!;

export const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

app.insertAdjacentHTML('beforeend', '<section class="store-screen hidden" id="store-screen" aria-label="Sua loja"><div class="store-screen-panel" id="store-screen-panel"></div></section><section class="store-screen hidden" id="workshop-screen" aria-label="Sua oficina"><div class="store-screen-panel" id="workshop-screen-panel"></div></section>');
