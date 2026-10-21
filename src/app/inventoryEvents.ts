import { $ } from '../ui/dom';
import { usePotion, equipItem, handleInventoryCellClick, swapInventorySlots } from '../features/inventory/inventory';
export function bindInventoryEvents() {
    $('inventory-items').addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement))
            return;
        const equipButton = target.closest<HTMLButtonElement>('[data-equip]');
        const potionButton = target.closest<HTMLButtonElement>('[data-use-potion]');
        if (equipButton?.dataset.equip)
            equipItem(equipButton.dataset.equip);
        else if (potionButton)
            usePotion();
        else {
            const cell = target.closest<HTMLElement>('[data-slot-index]');
            if (cell)
                handleInventoryCellClick(Number(cell.dataset.slotIndex));
        }
    });
    $('inventory-items').addEventListener('dragstart', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement))
            return;
        const cell = target.closest<HTMLElement>('.inventory-cell[data-item]');
        if (!cell || !event.dataTransfer) {
            event.preventDefault();
            return;
        }
        event.dataTransfer.setData('text/plain', cell.dataset.slotIndex ?? '');
        event.dataTransfer.effectAllowed = 'move';
        cell.classList.add('inventory-cell-dragging');
    });
    $('inventory-items').addEventListener('dragover', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement))
            return;
        const cell = target.closest<HTMLElement>('.inventory-cell');
        if (cell) {
            event.preventDefault();
            cell.classList.add('inventory-drop-target');
        }
    });
    $('inventory-items').addEventListener('dragleave', event => {
        const target = event.target;
        if (target instanceof HTMLElement)
            target.closest<HTMLElement>('.inventory-cell')?.classList.remove('inventory-drop-target');
    });
    $('inventory-items').addEventListener('drop', event => {
        event.preventDefault();
        const target = event.target;
        if (!(target instanceof HTMLElement) || !event.dataTransfer)
            return;
        const cell = target.closest<HTMLElement>('.inventory-cell');
        const from = Number(event.dataTransfer.getData('text/plain'));
        const to = Number(cell?.dataset.slotIndex);
        if (cell && Number.isInteger(from) && Number.isInteger(to))
            swapInventorySlots(from, to);
    });
    $('inventory-items').addEventListener('dragend', () => {
        document.querySelectorAll('.inventory-cell-dragging, .inventory-drop-target').forEach(cell => cell.classList.remove('inventory-cell-dragging', 'inventory-drop-target'));
    });
    $('inventory-items').addEventListener('keydown', event => {
        const keyboardEvent = event as KeyboardEvent;
        const target = keyboardEvent.target;
        if (!(target instanceof HTMLElement) || (keyboardEvent.key !== 'Enter' && keyboardEvent.key !== ' '))
            return;
        const cell = target.closest<HTMLElement>('[data-slot-index]');
        if (cell) {
            keyboardEvent.preventDefault();
            handleInventoryCellClick(Number(cell.dataset.slotIndex));
        }
    });
}
