import { state } from '../../game/state';
import { furnitureCatalog } from '../../data/furniture';
import type { FurnitureId } from '../../types/game';
import { notify, updateUI } from '../../ui/panels';
import { renderStore } from './store';
import { $ } from '../../ui/dom';

export function renderFurnitureGrid(area: 'store' | 'workshop') {
    return `<div class="decor-grid" data-decor-area="${area}">${state.furnitureLayouts[area].map((furnitureId, index) => `<button class="decor-cell ${furnitureId ? 'decor-filled' : ''} ${state.selectedFurniture ? 'decor-ready' : ''}" data-decor-cell="${index}" data-decor-area="${area}">${furnitureId ? `<span>${furnitureCatalog[furnitureId].icon}</span><small>${furnitureCatalog[furnitureId].name}</small>` : '<span>＋</span>'}</button>`).join('')}</div>`;
}

export function furniturePalette(area: 'store' | 'workshop') {
    return `<section class="furniture-panel"><div><p class="eyebrow">CATÁLOGO DE MOBÍLIA</p><h3>Personalize ${area === 'store' ? 'a loja' : 'a oficina'}</h3><small>Compre com moedas e arraste a peça para uma casa livre.</small></div><div class="furniture-list">${(Object.keys(furnitureCatalog) as FurnitureId[]).map(id => { const furniture = furnitureCatalog[id], owned = state.furnitureStock[id]; return `<article class="furniture-card ${state.selectedFurniture === id ? 'selected' : ''}" draggable="${owned > 0}" data-furniture="${id}"><span>${furniture.icon}</span><div><b>${furniture.name}</b><small>${furniture.description} · ${owned} disponível</small></div>${owned > 0 ? `<button class="tiny-button" data-select-furniture="${id}">Posicionar</button>` : `<button class="tiny-button" data-buy-furniture="${id}" ${state.gold >= furniture.price ? '' : 'disabled'}>${furniture.price} ◉</button>`}</article>`; }).join('')}</div></section>`;
}

export function buyFurniture(id: FurnitureId) {
    const furniture = furnitureCatalog[id];
    if (!furniture || state.gold < furniture.price) {
        notify('Moedas insuficientes.');
        return;
    }
    state.gold -= furniture.price;
    state.furnitureStock[id]++;
    notify(`${furniture.name} comprado. Posicione-o na base.`);
    renderStore();
    renderWorkshop();
    updateUI();
}

export function selectFurniture(id: FurnitureId) { if (state.furnitureStock[id] > 0) {
    state.selectedFurniture = state.selectedFurniture === id ? null : id;
    renderStore();
    renderWorkshop();
} }

export function placeFurniture(area: 'store' | 'workshop', index: number, id = state.selectedFurniture) {
    if (!id || state.furnitureLayouts[area][index] || state.furnitureStock[id] < 1)
        return;
    state.furnitureLayouts[area][index] = id;
    state.furnitureStock[id]--;
    state.selectedFurniture = null;
    notify(`${furnitureCatalog[id].name} posicionado.`);
    renderStore();
    renderWorkshop();
}

export function removeFurniture(area: 'store' | 'workshop', index: number) {
    const id = state.furnitureLayouts[area][index];
    if (!id)
        return;
    state.furnitureLayouts[area][index] = null;
    state.furnitureStock[id]++;
    notify(`${furnitureCatalog[id].name} guardado no inventário de mobília.`);
    renderStore();
    renderWorkshop();
}

export function renderWorkshop() {
    $('workshop-screen-panel').innerHTML = `<header class="store-topbar"><button class="store-leave" data-leave-workshop>← Voltar à loja</button><div><small>SUA BASE · OFICINA</small><b class="store-status is-closed">MODO DE EDIÇÃO</b></div><div class="store-balance">CAIXA <b>${state.gold} ◉</b></div></header><main class="store-interior"><section class="store-header"><div><p class="eyebrow">CONSTRUÇÃO E CUSTOMIZAÇÃO</p><h1>Oficina de Astera</h1><small>Arraste uma peça do catálogo para a grade. Clique numa peça posicionada para guardá-la.</small></div></section><section class="workshop-scene"><div class="workbench-mark">⚒ OFICINA</div>${renderFurnitureGrid('workshop')}</section>${furniturePalette('workshop')}</main>`;
}
