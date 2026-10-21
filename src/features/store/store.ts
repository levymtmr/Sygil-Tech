import { state } from '../../game/state';
import { items } from '../../data/items';
import { $ } from '../../ui/dom';
import { storeMarkup } from './storeView';
import { log, notify, updateUI } from '../../ui/panels';
import { removeItemQuantity, addItem } from '../inventory/inventory';
import { isAtPosition } from '../../game/explorationRules';
import { revealAroundPlayer } from '../world/map';

export function renderStore() {
    $('store-screen-panel').innerHTML = storeMarkup();
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
