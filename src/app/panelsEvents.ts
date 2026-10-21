import { state } from '../game/state';
import { openMap, closeMap } from '../features/world/map';
import { $ } from '../ui/dom';
import { togglePanel, notify, closeOpenPanel, updateUI, startGame, renderCodex } from '../ui/panels';
import { atBase, renderBase, buildStructure, startBaseInvasion, sellResource, craftItem, tradeForItem } from '../features/base/base';
import { retreat, startBattle } from '../features/combat/combat';
import type { EquipSlot, ClassId } from '../types';
import { usePotion, unequipItem } from '../features/inventory/inventory';
import type { BaseStructure } from '../types/game';
import { renderClassPicker, selectSkill, selectClass } from '../features/character/classes';
export function bindPanelsEvents() {
    $('encounter-button').addEventListener('click', () => startBattle());
    $('retreat-button').addEventListener('click', retreat);
    $('battle-menu-hide').addEventListener('click', () => { state.battleMenuOpen = false; updateUI(); });
    $('battle-actions-reopen').addEventListener('click', () => { state.battleMenuOpen = true; updateUI(); });
    $('potion-button').addEventListener('click', usePotion);
    $('equipment-modal').addEventListener('click', e => {
        if (e.target === $('equipment-modal'))
            $('equipment-modal').classList.add('hidden');
    });
    $('inventory-modal').addEventListener('click', e => {
        if (e.target === $('inventory-modal'))
            $('inventory-modal').classList.add('hidden');
    });
    document.querySelectorAll<HTMLButtonElement>('[data-panel]').forEach(button => button.addEventListener('click', () => togglePanel(button.dataset.panel!)));
    document.querySelectorAll<HTMLButtonElement>('[data-close-panel]').forEach(button => button.addEventListener('click', () => closeOpenPanel()));
    $('base-button').addEventListener('click', () => {
        if (atBase()) {
            renderBase();
            $('base-modal').classList.remove('hidden');
        }
        else
            notify('A Base fica no marco dourado do mapa. Entre nela para acessar sua loja.');
    });
    $('base-modal').addEventListener('click', event => {
        if (event.target === $('base-modal'))
            $('base-modal').classList.add('hidden');
    });
    $('base-buildings').addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement))
            return;
        const build = target.closest<HTMLButtonElement>('[data-build]')?.dataset.build as BaseStructure | undefined;
        if (build)
            buildStructure(build);
        if (target.closest('#defend-base'))
            startBaseInvasion();
    });
    $('base-modal').addEventListener('click', event => {
        const target = event.target;
        if (!(target instanceof HTMLElement))
            return;
        const tab = target.closest<HTMLButtonElement>('[data-base-tab]')?.dataset.baseTab as typeof state.baseTab | undefined;
        if (tab) {
            state.baseTab = tab;
            renderBase();
            return;
        }
        const sellId = target.closest<HTMLButtonElement>('[data-sell]')?.dataset.sell;
        if (sellId) {
            sellResource(sellId);
            return;
        }
        const craftId = target.closest<HTMLButtonElement>('[data-craft]')?.dataset.craft;
        if (craftId) {
            craftItem(craftId);
            return;
        }
        const buyButton = target.closest<HTMLButtonElement>('[data-buy]');
        if (buyButton?.dataset.buy && buyButton.dataset.price) {
            tradeForItem(buyButton.dataset.buy, Number(buyButton.dataset.price));
            return;
        }
    });
    $('equipment-grid').addEventListener('click', event => {
        const target = event.target;
        if (target instanceof HTMLElement) {
            const button = target.closest<HTMLButtonElement>('[data-unequip]');
            if (button?.dataset.unequip)
                unequipItem(button.dataset.unequip as EquipSlot);
        }
    });
    $('class-button').addEventListener('click', () => { renderClassPicker(); $('class-modal').classList.remove('hidden'); });
    $('class-modal').addEventListener('click', event => {
        if (event.target === $('class-modal'))
            $('class-modal').classList.add('hidden');
    });
    $('skill-tree-list').addEventListener('click', event => {
        const target = event.target;
        if (target instanceof HTMLElement) {
            const button = target.closest<HTMLButtonElement>('[data-learn-skill]');
            if (button?.dataset.learnSkill)
                selectSkill(button.dataset.learnSkill);
        }
    });
    $('class-list').addEventListener('click', event => {
        const target = event.target;
        if (target instanceof HTMLElement) {
            const button = target.closest<HTMLButtonElement>('[data-class]');
            if (button?.dataset.class)
                selectClass(button.dataset.class as ClassId);
        }
    });
    $('start-class-list').addEventListener('click', event => {
        const target = event.target;
        if (target instanceof HTMLElement) {
            const button = target.closest<HTMLButtonElement>('[data-class]');
            if (button?.dataset.class)
                selectClass(button.dataset.class as ClassId);
        }
    });
    $('start-game-button').addEventListener('click', startGame);
    $('map-trigger').addEventListener('click', openMap);
    $('close-map').addEventListener('click', closeMap);
    $('map-modal').addEventListener('click', e => {
        if (e.target === $('map-modal'))
            closeMap();
    });
    $('codex-button').addEventListener('click', () => { renderCodex(); $('codex-modal').classList.remove('hidden'); });
    $('close-codex').addEventListener('click', () => $('codex-modal').classList.add('hidden'));
    $('codex-modal').addEventListener('click', e => {
        if (e.target === $('codex-modal'))
            $('codex-modal').classList.add('hidden');
    });
    $('reward-close').addEventListener('click', () => $('reward-modal').classList.add('hidden'));
    $('reward-modal').addEventListener('click', e => {
        if (e.target === $('reward-modal'))
            $('reward-modal').classList.add('hidden');
    });
    $('help-button').addEventListener('click', () => $('help-modal').classList.remove('hidden'));
    $('close-help').addEventListener('click', () => $('help-modal').classList.add('hidden'));
    $('start-help').addEventListener('click', () => $('help-modal').classList.add('hidden'));
    $('help-modal').addEventListener('click', e => {
        if (e.target === $('help-modal'))
            $('help-modal').classList.add('hidden');
    });
}
