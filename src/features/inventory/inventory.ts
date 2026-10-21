import { state } from '../../game/state';
import { items } from '../../data/items';
import { currentClass } from '../character/classes';
import { notify, log, updateUI } from '../../ui/panels';
import type { EquipSlot } from '../../types';
import { $ } from '../../ui/dom';
import { iconSvg } from '../../ui/icons';

export function equipmentBonus(stat: 'attack' | 'defense' | 'maxHp') {
    return Object.values(state.equipment).reduce((total, id) => total + (id ? (items[id].bonus?.[stat] ?? 0) : 0), 0);
}

export function attackPower() { return currentClass().attack + equipmentBonus('attack'); }

export function defensePower() { return currentClass().defense + equipmentBonus('defense'); }

export function recalculateEquipmentStats() { state.maxHp = state.baseMaxHp + equipmentBonus('maxHp'); state.playerHp = Math.min(state.playerHp, state.maxHp); }

export function addItem(itemId: string, quantity = 1) {
    if (state.inventory[itemId]) {
        state.inventory[itemId] += quantity;
        return true;
    }
    const slot = state.inventoryOrder.indexOf(null);
    if (slot < 0) {
        notify('Mochila cheia. Libere um espaço antes de recolher este item.');
        return false;
    }
    state.inventory[itemId] = quantity;
    state.inventoryOrder[slot] = itemId;
    return true;
}

export function removeItemQuantity(itemId: string, quantity = 1) {
    if (!state.inventory[itemId])
        return;
    state.inventory[itemId] -= quantity;
    if (state.inventory[itemId] <= 0) {
        delete state.inventory[itemId];
        const slot = state.inventoryOrder.indexOf(itemId);
        if (slot >= 0)
            state.inventoryOrder[slot] = null;
    }
}

export function equipItem(itemId: string) {
    const item = items[itemId];
    if (!item?.slot || (state.inventory[itemId] ?? 0) < 1)
        return;
    const previous = state.equipment[item.slot];
    removeItemQuantity(itemId);
    if (previous)
        addItem(previous);
    state.equipment[item.slot] = itemId;
    recalculateEquipmentStats();
    log(`Equipamento alterado: ${item.name}.`);
    notify(`${item.name} equipado.`);
    updateUI();
}

export function unequipItem(slot: EquipSlot) {
    const itemId = state.equipment[slot];
    if (!itemId)
        return;
    addItem(itemId);
    state.equipment[slot] = null;
    recalculateEquipmentStats();
    log(`${items[itemId].name} guardado na mochila.`);
    notify(`${state.slotNames[slot]} removida.`);
    updateUI();
}

export function renderInventory() {
    const slots: EquipSlot[] = ['weapon', 'armor', 'charm'];
    const slotIcons: Record<EquipSlot, string> = { weapon: 'sword', armor: 'armor', charm: 'charm' };
    $('equipment-grid').className = `gear-board class-look-${state.classId}`;
    $('equipment-grid').innerHTML = `<div class="gear-figure" aria-hidden="true"><div class="gear-aura"></div>${iconSvg(state.classId, 'character-silhouette')}<span>${currentClass().name.toUpperCase()}</span></div>` + slots.map(slot => {
        const itemId = state.equipment[slot], item = itemId ? items[itemId] : null;
        const place = slot === 'weapon' ? 'MÃO DIREITA' : slot === 'armor' ? 'PEITO' : 'PESCOÇO';
        return `<button class="gear-slot gear-${slot} ${item ? 'equipped' : 'empty'}" data-unequip="${slot}" title="${item ? `Remover ${item.name}` : `Posição de ${state.slotNames[slot]}`}" ${item ? '' : 'disabled'}><span class="gear-item-icon">${iconSvg(item?.icon ?? slotIcons[slot])}</span><span class="gear-slot-copy"><small>${state.slotNames[slot]} · ${place}</small><b>${item?.name ?? 'Vazio'}</b><em>${item ? item.description : 'Sem equipamento'}</em></span>${item ? `<span class="gear-remove">×</span>` : '<span class="gear-empty-mark">＋</span>'}</button>`;
    }).join('');
    const count = Object.values(state.inventory).reduce((sum, quantity) => sum + quantity, 0);
    $('inventory-count').textContent = String(count).padStart(2, '0');
    $('inventory-items').innerHTML = `<div class="inventory-grid" role="grid" aria-label="Grade da mochila">${state.inventoryOrder.map((id, index) => {
        const item = id ? items[id] : null, quantity = id ? state.inventory[id] ?? 0 : 0;
        const action = id && item?.slot ? `<button class="inventory-cell-action" data-equip="${id}" aria-label="Equipar ${item.name}">EQUIPAR</button>` : id === 'healing_potion' ? '<button class="inventory-cell-action" data-use-potion aria-label="Usar poção">USAR</button>' : '';
        return `<div class="inventory-cell ${id ? 'filled' : 'empty'} ${state.selectedInventorySlot === index ? 'inventory-cell-selected' : ''}" role="gridcell" data-slot-index="${index}" draggable="${Boolean(id)}" tabindex="0" title="${item ? `${item.name} · ${item.description} · ×${quantity}` : `Espaço vazio ${index + 1}`}" aria-label="${item ? `${item.name}, quantidade ${quantity}` : `Espaço vazio ${index + 1}`}" ${id ? `data-item="${id}"` : ''}>${id ? `<span class="inventory-cell-icon item-icon-${id}">${iconSvg(item!.icon)}</span><span class="inventory-cell-name">${item!.name}</span><span class="inventory-cell-quantity">×${quantity}</span>${action}` : `<span class="inventory-cell-number">${String(index + 1).padStart(2, '0')}</span><span class="inventory-cell-empty-mark">＋</span>`}</div>`;
    }).join('')}</div><p class="inventory-grid-note">Computador: arraste itens · celular: toque em um item e depois no destino</p>`;
}

export function swapInventorySlots(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= state.INVENTORY_CAPACITY || to >= state.INVENTORY_CAPACITY)
        return;
    [state.inventoryOrder[from], state.inventoryOrder[to]] = [state.inventoryOrder[to], state.inventoryOrder[from]];
    state.selectedInventorySlot = null;
    renderInventory();
}

export function handleInventoryCellClick(index: number) {
    const itemId = state.inventoryOrder[index];
    if (state.selectedInventorySlot === null) {
        if (itemId)
            state.selectedInventorySlot = index;
        renderInventory();
        return;
    }
    if (state.selectedInventorySlot === index) {
        state.selectedInventorySlot = null;
        renderInventory();
        return;
    }
    swapInventorySlots(state.selectedInventorySlot, index);
}

export function usePotion() { if (state.mode === 'battle') {
    notify('Poções podem ser usadas fora de combate.');
    return;
} if (!(state.inventory.healing_potion > 0)) {
    notify('Suas poções acabaram.');
    return;
} if (state.playerHp === state.maxHp) {
    notify('Sua vitalidade já está cheia.');
    return;
} removeItemQuantity('healing_potion'); const heal = Math.min(40, state.maxHp - state.playerHp); state.playerHp += heal; log(`Uma poção restaurou ${heal} pontos de vitalidade.`); notify(`+${heal} de vitalidade`); updateUI(); }
