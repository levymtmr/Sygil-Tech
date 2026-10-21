import { state } from '../../game/state';
import { furnitureCatalog } from '../../data/furniture';
import type { FurnitureId } from '../../types/game';
import { notify, updateUI } from '../../ui/panels';
import { renderStore } from './store';
import { $ } from '../../ui/dom';
import { propArt } from '../../ui/spriteArt';
import { workshopMarkup } from './workshopView';

export function renderFurnitureGrid(area: 'store' | 'workshop') {
    return `<div class="decor-grid ${state.selectedFurniture ? 'is-placing' : ''}" role="group" aria-label="Piso para decorar ${area === 'store' ? 'a loja' : 'a oficina'}">${state.furnitureLayouts[area].map((id, index) => {
        const label = id ? `${furnitureCatalog[id].name}: guardar mobília` : state.selectedFurniture ? `Posicionar ${furnitureCatalog[state.selectedFurniture].name} no espaço ${index + 1}` : `Espaço livre ${index + 1}`;
        return `<button class="decor-cell ${id ? 'decor-filled' : ''}" data-decor-cell="${index}" data-decor-area="${area}" aria-label="${label}" title="${label}">${id ? propArt(id) : '<span class="decor-add">＋</span>'}</button>`;
    }).join('')}</div>`;
}

export function furniturePalette(area: 'store' | 'workshop') {
    return `<section class="furniture-panel"><div class="furniture-heading"><div><p class="eyebrow">DETALHES QUE FAZEM UM LAR</p><h2>Decore ${area === 'store' ? 'sua loja' : 'sua oficina'}</h2><p>Plantas, luz e madeira para dar vida ao seu refúgio.</p></div><span class="furniture-hint">${state.selectedFurniture ? `Posicione: ${furnitureCatalog[state.selectedFurniture].name}` : 'Compre uma peça e escolha um espaço no piso.'}</span></div><div class="furniture-list">${(Object.keys(furnitureCatalog) as FurnitureId[]).map(id => {
        const furniture = furnitureCatalog[id], owned = state.furnitureStock[id];
        return `<article class="furniture-card ${state.selectedFurniture === id ? 'selected' : ''}" draggable="${owned > 0}" data-furniture="${id}"><div class="furniture-art">${propArt(id)}</div><div class="furniture-copy"><h3>${furniture.name}</h3><p>${furniture.description}</p><small>${owned > 0 ? `${owned} disponível para posicionar` : 'Uma nova peça para o refúgio'}</small></div>${owned > 0 ? `<button class="tiny-button" data-select-furniture="${id}" aria-pressed="${state.selectedFurniture === id}">${state.selectedFurniture === id ? 'Cancelar' : 'Posicionar'}</button>` : `<button class="tiny-button" data-buy-furniture="${id}" aria-label="Comprar ${furniture.name} por ${furniture.price} moedas" ${state.gold >= furniture.price ? '' : 'disabled'}>Comprar <span>${furniture.price} ◉</span></button>`}</article>`;
    }).join('')}</div></section>`;
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
    $('workshop-screen-panel').innerHTML = workshopMarkup();
}
