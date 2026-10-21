import { state } from '../../game/state';
import { items } from '../../data/items';
import { characterArt, propArt } from '../../ui/spriteArt';
import type { PropSprite } from '../../data/spriteAtlas';
import { renderFurnitureGrid, furniturePalette } from './furniture';
import { roomBackdrop, roomCaption } from './room';

const productSprites: Record<string, PropSprite> = {
  healing_potion: 'healing_potion', green_gel: 'green_gel', wolf_pelt: 'wolf_pelt', wisp_shard: 'wisp_shard',
};

function productArt(itemId: string) {
  return propArt(productSprites[itemId] ?? 'healing_potion');
}

function customerMarkup() {
  const customer = state.storeCustomer;
  if (!customer) {
    return `<div class="shop-quiet"><span>${state.storeOpen ? '✦' : '☾'}</span><b>${state.storeOpen ? 'À espera de viajantes' : 'Um descanso entre jornadas'}</b><small>${state.storeOpen ? 'Há lugar para novas histórias.' : 'Abasteça a loja e abra as portas.'}</small></div>`;
  }
  const message = customer.phase === 'entering' ? 'Chegando da fronteira' : customer.phase === 'browsing' ? `Escolhendo ${items[customer.itemId].name}` : 'Pagando no balcão';
  return `<div class="shop-visitor ${customer.phase}">${characterArt('knight')}<div class="visitor-bubble"><b>${customer.name}</b><small>${message}</small></div></div>`;
}

function shelvesMarkup() {
  return state.storeShelves.slice(0, state.storeShelfCount).map((itemId, index) => `
    <button class="shop-display ${itemId ? 'stocked' : 'empty'} ${state.storeSelectedProduct ? 'ready' : ''}"
      data-shelf="${index}" ${state.storeOpen ? 'disabled' : ''}
      aria-label="Prateleira ${index + 1}: ${itemId ? items[itemId].name : 'vazia'}">
      ${propArt('shelf')}
      <span class="display-product">${itemId ? productArt(itemId) : '<span class="display-add">＋</span>'}</span>
      <span class="display-label"><b>${itemId ? items[itemId].name : 'Prateleira livre'}</b><small>${itemId ? `${state.storePrices[itemId]} moedas` : state.storeSelectedProduct ? 'Colocar produto' : 'Escolha um produto'}</small></span>
    </button>`).join('');
}

export function storeMarkup() {
  const stocked = state.storeShelves.slice(0, state.storeShelfCount).filter(Boolean).length;
  const stockItems = Object.keys(state.storePrices).filter(itemId => (state.inventory[itemId] ?? 0) > 0);
  const feedback = state.storeOpen ? `${state.storeSales} vendas hoje · ${stocked} prateleiras abastecidas`
    : state.storeSelectedProduct ? `${items[state.storeSelectedProduct].name} selecionado. Toque numa prateleira livre.`
    : 'Escolha um produto da mochila e coloque-o numa prateleira.';
  return `
    <header class="store-topbar">
      <button class="store-leave" data-leave-store>← <span>Voltar ao bosque</span></button>
      <div class="store-location"><small>REFÚGIO DE ASTERA</small><b>O Empório da Fronteira</b></div>
      <div class="store-balance"><small>SUAS MOEDAS</small><b>${state.gold} <span>◉</span></b></div>
      <button class="store-leave room-link" data-open-workshop>Visitar oficina <span>→</span></button>
    </header>
    <main class="store-interior">
      <section class="store-header">
        <div><p class="eyebrow">TESOUROS DO BOSQUE · ENCONTROS PELO CAMINHO</p><h1>A loja de <em>Astera</em></h1><p class="store-intro">Um lugar para trocar o que a aventura trouxe.</p></div>
        <div class="store-day-controls"><span class="store-status ${state.storeOpen ? 'is-open' : 'is-closed'}">${state.storeOpen ? '● PORTAS ABERTAS' : '○ LOJA FECHADA'}</span><button class="primary-button store-toggle" data-store-toggle ${state.storeOpen || stocked > 0 ? '' : 'disabled'}>${state.storeOpen ? 'Encerrar expediente' : 'Abrir a loja'} <b>→</b></button></div>
      </section>
      <section class="room-scene shop-room ${state.storeOpen ? 'day-open' : 'day-closed'}" aria-label="Interior da loja de Astera">
        ${roomBackdrop()}
        <div class="room-wall-sign"><small>DESDE A PRIMEIRA JORNADA</small><b>Empório de Astera</b><span>✦</span></div>
        <div class="shop-displays">${shelvesMarkup()}</div>
        <div class="shop-merchant">${characterArt('archer')}<span>Auri</span></div>
        <div class="shop-register">${propArt('counter')}<span><small>CAIXA DA LOJA</small><b>${state.gold} ◉</b></span></div>
        ${renderFurnitureGrid('store')}
        ${customerMarkup()}
      </section>
      ${roomCaption('Sua loja, suas histórias', 'Abra as portas para receber viajantes. A área livre do piso pode ser decorada.')}
      <div class="store-feedback" id="store-feedback" aria-live="polite"><span>✧</span>${feedback}</div>
      <section class="store-layout">
        <section class="stock-panel"><p class="eyebrow">DA MOCHILA PARA A VITRINE</p><h2>Produtos da jornada</h2><p>Selecione um produto ou arraste-o até uma prateleira.</p>
          <div class="store-stock">${stockItems.length ? stockItems.map(itemId => `<button draggable="${!state.storeOpen}" class="stock-product ${state.storeSelectedProduct === itemId ? 'selected' : ''}" data-select-product="${itemId}" ${state.storeOpen ? 'disabled' : ''}>${productArt(itemId)}<span><b>${items[itemId].name}</b><small>${state.inventory[itemId]} na mochila · ${state.storePrices[itemId]} moedas por unidade</small></span><i>${state.storeSelectedProduct === itemId ? 'Selecionado' : 'Expor →'}</i></button>`).join('') : '<p class="empty-stock">O bosque guarda novos tesouros. Explore e volte com materiais para vender.</p>'}</div>
        </section>
        <aside class="store-how"><p class="eyebrow">SEU PEQUENO EMPÓRIO</p><h2>Espaço para crescer</h2><div class="shop-capacity"><b>${state.storeShelfCount}<span> / 6</span></b><small>prateleiras instaladas</small></div><button class="tiny-button" data-install-shelf ${state.storeOpen || state.storeShelfCount >= 6 || (state.inventory.green_gel ?? 0) < 2 || (state.inventory.wolf_pelt ?? 0) < 1 ? 'disabled' : ''}>Montar prateleira <span>2 gel + 1 pelo</span></button><p>Abasteça, abra a loja e acompanhe as vendas. Feche o expediente para reorganizar os produtos.</p></aside>
      </section>
      ${furniturePalette('store')}
    </main>`;
}
