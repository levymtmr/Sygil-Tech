import { state } from '../game/state';
import { $ } from '../ui/dom';
import { leaveStore, toggleStore, selectStoreProduct, installStoreShelf, interactWithShelf, placeStoreProduct, renderStore } from '../features/store/store';
import type { FurnitureId } from '../types/game';
import { renderWorkshop, selectFurniture, buyFurniture, removeFurniture, placeFurniture } from '../features/store/furniture';
export function bindStoreEvents() {
    $('store-screen').addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement))
            return;
        if (target.closest<HTMLButtonElement>('[data-leave-store]')) {
            leaveStore();
            return;
        }
        if (target.closest<HTMLButtonElement>('[data-open-workshop]')) {
            $('store-screen').classList.add('hidden');
            renderWorkshop();
            $('workshop-screen').classList.remove('hidden');
            return;
        }
        if (target.closest<HTMLButtonElement>('[data-store-toggle]')) {
            toggleStore();
            return;
        }
        const productId = target.closest<HTMLButtonElement>('[data-select-product]')?.dataset.selectProduct;
        if (productId) {
            selectStoreProduct(productId);
            return;
        }
        if (target.closest<HTMLButtonElement>('[data-install-shelf]')) {
            installStoreShelf();
            return;
        }
        const furnitureId = target.closest<HTMLElement>('[data-select-furniture]')?.dataset.selectFurniture as FurnitureId | undefined;
        if (furnitureId) {
            selectFurniture(furnitureId);
            return;
        }
        const buyFurnitureId = target.closest<HTMLElement>('[data-buy-furniture]')?.dataset.buyFurniture as FurnitureId | undefined;
        if (buyFurnitureId) {
            buyFurniture(buyFurnitureId);
            return;
        }
        const decorCell = target.closest<HTMLElement>('[data-decor-cell]');
        if (decorCell) {
            const index = Number(decorCell.dataset.decorCell), area = decorCell.dataset.decorArea as 'store' | 'workshop';
            if (state.furnitureLayouts[area][index])
                removeFurniture(area, index);
            else
                placeFurniture(area, index);
            return;
        }
        const shelf = target.closest<HTMLButtonElement>('[data-shelf]')?.dataset.shelf;
        if (shelf)
            interactWithShelf(Number(shelf));
    });
    $('store-screen').addEventListener('dragstart', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement) || !event.dataTransfer)
            return;
        const itemId = target.closest<HTMLButtonElement>('[data-select-product]')?.dataset.selectProduct;
        if (!itemId || state.storeOpen)
            return;
        event.dataTransfer.setData('text/plain', itemId);
        event.dataTransfer.effectAllowed = 'move';
    });
    $('store-screen').addEventListener('dragover', event => {
        const target = event.target;
        if (target instanceof HTMLElement && target.closest('[data-shelf]'))
            event.preventDefault();
    });
    $('store-screen').addEventListener('drop', event => {
        event.preventDefault();
        const target = event.target;
        if (!(target instanceof HTMLElement))
            return;
        const shelf = target.closest<HTMLButtonElement>('[data-shelf]')?.dataset.shelf;
        const itemId = event.dataTransfer?.getData('text/plain');
        if (shelf && itemId)
            placeStoreProduct(itemId, Number(shelf));
    });
    $('workshop-screen').addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement))
            return;
        if (target.closest('[data-leave-workshop]')) {
            $('workshop-screen').classList.add('hidden');
            renderStore();
            $('store-screen').classList.remove('hidden');
            return;
        }
        const furnitureId = target.closest<HTMLElement>('[data-select-furniture]')?.dataset.selectFurniture as FurnitureId | undefined;
        if (furnitureId) {
            selectFurniture(furnitureId);
            return;
        }
        const buyFurnitureId = target.closest<HTMLElement>('[data-buy-furniture]')?.dataset.buyFurniture as FurnitureId | undefined;
        if (buyFurnitureId) {
            buyFurniture(buyFurnitureId);
            return;
        }
        const decorCell = target.closest<HTMLElement>('[data-decor-cell]');
        if (decorCell) {
            const index = Number(decorCell.dataset.decorCell);
            if (state.furnitureLayouts.workshop[index])
                removeFurniture('workshop', index);
            else
                placeFurniture('workshop', index);
        }
    });
    for (const screenId of ['store-screen', 'workshop-screen']) {
        $(screenId).addEventListener('dragstart', event => {
            const target = event.target;
            if (!(target instanceof HTMLElement) || !event.dataTransfer)
                return;
            const id = target.closest<HTMLElement>('[data-furniture]')?.dataset.furniture;
            if (!id)
                return;
            event.dataTransfer.setData('application/x-furniture', id);
            event.dataTransfer.effectAllowed = 'move';
        });
        $(screenId).addEventListener('dragover', event => {
            const target = event.target;
            if (target instanceof HTMLElement && target.closest('[data-decor-cell]'))
                event.preventDefault();
        });
        $(screenId).addEventListener('drop', event => {
            const target = event.target;
            if (!(target instanceof HTMLElement))
                return;
            const cell = target.closest<HTMLElement>('[data-decor-cell]'), id = event.dataTransfer?.getData('application/x-furniture') as FurnitureId;
            if (cell && id) {
                event.preventDefault();
                placeFurniture(cell.dataset.decorArea as 'store' | 'workshop', Number(cell.dataset.decorCell), id);
            }
        });
    }
}
