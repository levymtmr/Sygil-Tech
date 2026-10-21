import { state } from '../../game/state';
import { characterArt, propArt } from '../../ui/spriteArt';
import { renderFurnitureGrid, furniturePalette } from './furniture';
import { roomBackdrop, roomCaption } from './room';

export function workshopMarkup() {
  const placed = state.furnitureLayouts.workshop.filter(Boolean).length;
  return `<header class="store-topbar">
    <button class="store-leave" data-leave-workshop>← <span>Voltar à loja</span></button>
    <div class="store-location"><small>REFÚGIO DE ASTERA</small><b>A Oficina do Bosque</b></div>
    <div class="store-balance"><small>SUAS MOEDAS</small><b>${state.gold} <span>◉</span></b></div>
    <span class="store-status is-editing">✧ SEU ESPAÇO</span>
  </header>
  <main class="store-interior">
    <section class="store-header"><div><p class="eyebrow">MADEIRA, LUZ E NOVAS POSSIBILIDADES</p><h1>A sua <em>oficina</em></h1><p class="store-intro">Dê um lar às ideias que nascem pelo caminho.</p></div><div class="workshop-count"><b>${placed}<span> / 24</span></b><small>espaços decorados</small></div></section>
    <section class="room-scene workshop-room" aria-label="Interior da oficina de Astera">
      ${roomBackdrop()}
      <div class="room-wall-sign"><small>FEITO COM TEMPO E CUIDADO</small><b>Oficina do Bosque</b><span>✦</span></div>
      <div class="workshop-supplies">${propArt('shelf')}</div>
      <div class="workshop-bench">${propArt('workbench')}</div>
      <div class="workshop-artisan">${characterArt(state.classId)}</div>
      ${renderFurnitureGrid('workshop')}
    </section>
    ${roomCaption('Um refúgio com a sua cara', 'Escolha uma peça abaixo e toque no piso para posicionar. Toque numa peça para guardá-la.')}
    ${furniturePalette('workshop')}
  </main>`;
}
