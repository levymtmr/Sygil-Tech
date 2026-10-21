import { state } from '../../game/state';
import { items } from '../../data/items';
import { $ } from '../../ui/dom';
import { iconSvg } from '../../ui/icons';
import { renderFurnitureGrid, furniturePalette } from './furniture';
import { log, notify, updateUI } from '../../ui/panels';
import { removeItemQuantity, addItem } from '../inventory/inventory';
import { isAtPosition } from '../../game/explorationRules';
import { revealAroundPlayer } from '../world/map';

export function renderStore() {
    const stocked = state.storeShelves.slice(0, state.storeShelfCount).filter(Boolean).length;
    const stockItems = Object.keys(state.storePrices).filter(itemId => (state.inventory[itemId] ?? 0) > 0);
    const customer = state.storeCustomer ? `<div class="store-customer ${state.storeCustomer.phase}"><span class="customer-head">●</span><div><b>${state.storeCustomer.name}</b><small>${state.storeCustomer.phase === 'entering' ? 'Entrando na loja…' : state.storeCustomer.phase === 'browsing' ? `Escolhendo ${items[state.storeCustomer.itemId].name}` : 'Indo pagar no caixa'}</small></div><i>${state.storeCustomer.phase === 'checkout' ? '◉ pagar' : '→'}</i></div>` : state.storeOpen ? '<div class="store-customer waiting"><span class="customer-head">●</span><div><b>A rua está quieta</b><small>Reponha as prateleiras para atrair visitantes.</small></div></div>' : '<div class="store-customer closed"><span>☾</span><div><b>Loja fechada</b><small>Abra quando houver produtos em exposição.</small></div></div>';
    const storeAmbience = `<div class="shop-ambience" aria-hidden="true"><i class="shop-beam beam-left"></i><i class="shop-beam beam-right"></i><i class="shop-lamp lamp-left"></i><i class="shop-lamp lamp-right"></i><i class="shop-plant plant-left">♣</i><i class="shop-plant plant-right">♣</i><i class="shop-wall-shelf shelf-left">◦ ◦ ◦</i><i class="shop-wall-shelf shelf-right">◦ ◦ ◦</i><i class="shop-rug">✦</i></div>`;
    $('store-screen-panel').innerHTML = `<header class="store-topbar"><button class="store-leave" data-leave-store>← Sair para o mapa</button><div><small>SUA BASE · LOJA DA FRONTEIRA</small><b class="store-status ${state.storeOpen ? 'is-open' : 'is-closed'}">${state.storeOpen ? '● LOJA ABERTA' : '○ LOJA FECHADA'}</b></div><div class="store-balance">CAIXA <b>${state.gold} ◉</b></div><button class="store-leave" data-open-workshop>Oficina</button></header><main class="store-interior"><section class="store-header"><div><p class="eyebrow">ATENDIMENTO AO VIVO</p><h1>${state.storeOpen ? 'Dia de vendas em andamento' : 'Prepare a vitrine'}</h1><small id="store-feedback" aria-live="polite">${state.storeOpen ? `${state.storeSales} venda(s) concluída(s) · ${stocked} produto(s) disponível(is).` : state.storeSelectedProduct ? `Produto selecionado: ${items[state.storeSelectedProduct].name}. Arraste-o ou toque numa prateleira.` : 'Selecione um produto do estoque e arraste para uma prateleira.'}</small></div><button class="primary-button store-toggle" data-store-toggle ${state.storeOpen || stocked > 0 ? '' : 'disabled'}>${state.storeOpen ? 'Encerrar expediente' : 'Abrir loja'} <b>→</b></button></section><section class="store-scene ${state.storeOpen ? 'day-open' : 'day-closed'}">${storeAmbience}<div class="store-sign">A LOJA DE ASTERA <small>${state.storeOpen ? 'ABERTA' : 'FECHADA'}</small></div><div class="store-door">▥<small>ENTRADA</small></div><div class="store-shelves">${state.storeShelves.slice(0, state.storeShelfCount).map((itemId, index) => `<button class="store-shelf ${itemId ? 'stocked' : ''} ${state.storeSelectedProduct ? 'ready' : ''}" data-shelf="${index}" ${state.storeOpen ? 'disabled' : ''}><span>${itemId ? iconSvg(items[itemId].icon) : '＋'}</span><b>${itemId ? items[itemId].name : 'Prateleira vazia'}</b><small>${itemId ? `${state.storePrices[itemId]} moedas` : state.storeSelectedProduct ? 'Solte aqui' : 'Clique para retirar'}</small></button>`).join('')}</div><div class="store-counter"><span>CAIXA</span><b>${state.gold} ◉</b><small>${state.storeCustomer?.phase === 'checkout' ? 'Cliente pagando' : 'Aguardando'}</small></div>${customer}</section><section class="store-layout"><section><h3>Estoque da mochila</h3><p>Arraste ou selecione um produto; depois toque na prateleira em que quer expô-lo.</p><div class="store-stock">${stockItems.length ? stockItems.map(itemId => `<button draggable="${!state.storeOpen}" class="stock-product ${state.storeSelectedProduct === itemId ? 'selected' : ''}" data-select-product="${itemId}" ${state.storeOpen ? 'disabled' : ''}>${iconSvg(items[itemId].icon)}<span><b>${items[itemId].name}</b><small>${state.inventory[itemId]} em estoque · preço ${state.storePrices[itemId]} ◉</small></span><i>↗ arrastar</i></button>`).join('') : '<small class="empty-stock">Colete recursos ou conquiste materiais para abastecer a loja.</small>'}</div></section><aside class="store-how"><b>Montagem da loja</b><p>${state.storeShelfCount}/6 prateleiras instaladas.</p><button class="tiny-button" data-install-shelf ${state.storeOpen || state.storeShelfCount >= 6 || (state.inventory.green_gel ?? 0) < 2 || (state.inventory.wolf_pelt ?? 0) < 1 ? 'disabled' : ''}>Montar prateleira · 2 gel + 1 pelo</button><b>Loop de atendimento</b><ol><li>Monte e abasteça as prateleiras.</li><li>Abra a loja.</li><li>Clientes entram, escolhem e pagam.</li><li>Feche para reorganizar o estoque.</li></ol></aside></section></main>`;
    $('store-screen-panel').querySelector('.store-scene')?.insertAdjacentHTML('afterbegin', renderFurnitureGrid('store'));
    $('store-screen-panel').querySelector('.store-interior')?.insertAdjacentHTML('beforeend', furniturePalette('store'));
}

export function scheduleStoreCustomer(delay = 700) {
    window.clearTimeout(state.storeTimer);
    state.storeTimer = window.setTimeout(() => {
        if (!state.storeOpen || state.storeCustomer)
            return;
        const shelfIndex = state.storeShelves.slice(0, state.storeShelfCount).findIndex(Boolean);
        if (shelfIndex < 0) {
            renderStore();
            return;
        }
        const itemId = state.storeShelves[shelfIndex]!;
        state.storeCustomer = { itemId, name: ['Nara', 'Toma', 'Elen', 'Bram'][Math.floor(Math.random() * 4)], phase: 'entering' };
        renderStore();
        state.storeTimer = window.setTimeout(() => { if (state.storeCustomer) {
            state.storeCustomer.phase = 'browsing';
            renderStore();
            state.storeTimer = window.setTimeout(() => { if (state.storeCustomer) {
                state.storeCustomer.phase = 'checkout';
                renderStore();
                state.storeTimer = window.setTimeout(() => completeStoreSale(shelfIndex), 900);
            } }, 1000);
        } }, 900);
    }, delay);
}

export function completeStoreSale(shelfIndex: number) {
    if (!state.storeOpen || !state.storeCustomer || state.storeShelves[shelfIndex] !== state.storeCustomer.itemId)
        return;
    const itemId = state.storeCustomer.itemId, value = state.storePrices[itemId];
    state.storeShelves[shelfIndex] = null;
    state.storeCustomer = null;
    state.storeSales++;
    state.gold += value;
    log(`${itemId === 'healing_potion' ? 'Um viajante' : 'Um cliente'} comprou ${items[itemId].name} por ${value} moedas na sua loja.`);
    notify(`Venda concluída: +${value} moedas`);
    updateUI();
    renderStore();
    scheduleStoreCustomer(1200);
}

export function toggleStore() {
    if (state.storeOpen) {
        state.storeOpen = false;
        state.storeCustomer = null;
        window.clearTimeout(state.storeTimer);
        log(`A loja fechou com ${state.storeSales} venda(s) no dia.`);
        notify('Loja fechada.');
    }
    else if (state.storeShelves.some(Boolean)) {
        state.storeOpen = true;
        state.storeSales = 0;
        log('Você abriu a loja. Clientes começaram a chegar.');
        notify('Loja aberta!');
        scheduleStoreCustomer();
    }
    else {
        notify('Coloque ao menos um produto na prateleira.');
        return;
    }
    renderStore();
    updateUI();
}

export function selectStoreProduct(itemId: string) { if (!state.storeOpen && (state.inventory[itemId] ?? 0) > 0) {
    state.storeSelectedProduct = state.storeSelectedProduct === itemId ? null : itemId;
    renderStore();
} }

export function placeStoreProduct(itemId: string, index: number) {
    if (state.storeOpen || state.storeShelves[index] || (state.inventory[itemId] ?? 0) < 1)
        return;
    removeItemQuantity(itemId);
    state.storeShelves[index] = itemId;
    state.storeSelectedProduct = null;
    notify(`${items[itemId].name} exposto na prateleira.`);
    renderStore();
}

export function interactWithShelf(index: number) {
    if (state.storeOpen)
        return;
    const currentItem = state.storeShelves[index];
    if (state.storeSelectedProduct && !currentItem) {
        placeStoreProduct(state.storeSelectedProduct, index);
        return;
    }
    if (currentItem) {
        if (!addItem(currentItem)) {
            notify('Mochila cheia.');
            return;
        }
        state.storeShelves[index] = null;
        notify('Produto devolvido ao estoque.');
        renderStore();
    }
}

export function installStoreShelf() {
    if (state.storeOpen || state.storeShelfCount >= state.storeShelves.length || (state.inventory.green_gel ?? 0) < 2 || (state.inventory.wolf_pelt ?? 0) < 1)
        return;
    removeItemQuantity('green_gel', 2);
    removeItemQuantity('wolf_pelt', 1);
    state.storeShelfCount++;
    log('Você montou uma nova prateleira na loja.');
    notify('Prateleira instalada!');
    updateUI();
    renderStore();
}

export function enterStore() {
    if (!state.started || state.mode !== 'explore' || !isAtPosition(state.player, state.basePosition))
        return;
    renderStore();
    $('store-screen').classList.remove('hidden');
    log('Você entrou na Loja de Astera.');
}

export function leaveStore() {
    $('store-screen').classList.add('hidden');
    state.player = { x: state.basePosition.x, y: Math.min(state.GRID_H - 1, state.basePosition.y + 1) };
    state.worldMotion = null;
    revealAroundPlayer();
    updateUI();
    notify('Você saiu para a fronteira.');
}
