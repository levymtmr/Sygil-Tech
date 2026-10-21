import { state } from '../../game/state';
import { isAtPosition } from '../../game/explorationRules';
import { baseDefense as getBaseDefense } from '../../game/baseRules';
import type { BaseStructure } from '../../types/game';
import { items } from '../../data/items';
import { $ } from '../../ui/dom';
import { iconSvg } from '../../ui/icons';
import { removeItemQuantity, addItem } from '../inventory/inventory';
import { log, notify, updateUI } from '../../ui/panels';
import { makeEnemy } from '../world/exploration';

export function atBase() { return isAtPosition(state.player, state.basePosition) && state.mode === 'explore'; }

export function baseDefense() { return getBaseDefense(state.builtStructures); }

export function structureCost(structure: BaseStructure) { return structure === 'palisade' ? { palisade_kit: 1 } : { watchtower_kit: 1 }; }

export function canBuild(structure: BaseStructure) { return Object.entries(structureCost(structure)).every(([item, amount]) => (state.inventory[item] ?? 0) >= amount); }

export function costLabel(structure: BaseStructure) { return Object.entries(structureCost(structure)).map(([item, amount]) => `${amount} ${items[item].name}`).join(' · '); }

export function renderBase() {
    $('base-status').textContent = state.invasionPending ? 'INVASÃO À VISTA' : state.builtStructures.size ? `DEFESA ${baseDefense()}` : 'SEM DEFESAS';
    $('base-status').className = `base-status ${state.invasionPending ? 'base-danger' : ''}`;
    $('base-intro').textContent = state.invasionPending ? 'Criaturas se aproximam. Fortifique ou defenda o refúgio antes de explorar novamente.' : atBase() ? 'Você está em casa. Use os materiais coletados para fortalecer o refúgio.' : 'Volte ao marco dourado no mapa para construir e preparar as defesas.';
    $('base-gold').textContent = String(state.gold);
    document.querySelectorAll<HTMLButtonElement>('[data-base-tab]').forEach(button => button.classList.toggle('active', button.dataset.baseTab === state.baseTab));
    $('base-workshop').classList.toggle('hidden', state.baseTab !== 'workshop');
    $('base-shop').classList.toggle('hidden', state.baseTab !== 'shop');
    const resources = ['green_gel', 'wolf_pelt', 'wisp_shard'];
    $('base-resources').innerHTML = resources.map(id => `<span>${iconSvg(items[id].icon)} <b>${state.inventory[id] ?? 0}</b> ${items[id].name}</span>`).join('');
    const buildings: Array<{
        id: BaseStructure;
        name: string;
        effect: string;
        icon: string;
    }> = [
        { id: 'palisade', name: 'Paliçada de raízes', effect: 'Reduz 3 de dano em invasões.', icon: 'armor' },
        { id: 'watchtower', name: 'Torre de vigia', effect: 'Reduz 2 de dano e alerta sobre invasões.', icon: 'archer' }
    ];
    $('base-buildings').innerHTML = buildings.map(building => {
        const built = state.builtStructures.has(building.id), available = atBase() && canBuild(building.id);
        return `<article class="base-building ${built ? 'base-built' : ''}"><span class="base-building-icon">${iconSvg(building.icon)}</span><div><b>${building.name}</b><p>${building.effect}</p><small>${built ? 'CONSTRUÍDA' : `CUSTO · ${costLabel(building.id)}`}</small></div>${built ? '<span class="base-built-state">PRONTA</span>' : `<button class="tiny-button" data-build="${building.id}" ${available ? '' : 'disabled'}>${atBase() ? 'Construir' : 'Vá até a base'}</button>`}</article>`;
    }).join('') + (state.invasionPending ? `<button class="primary-button base-defend" id="defend-base">⚔ <span>Defender a base</span><b>→</b></button>` : '');
    const salePrices: Record<string, number> = { green_gel: 4, wolf_pelt: 7, wisp_shard: 11 };
    $('shop-sell-list').innerHTML = Object.entries(salePrices).map(([itemId, price]) => `<article class="shop-row"><span>${iconSvg(items[itemId].icon)}</span><div><b>${items[itemId].name}</b><small>${price} moedas por unidade · possui ${state.inventory[itemId] ?? 0}</small></div><button class="tiny-button" data-sell="${itemId}" ${atBase() && (state.inventory[itemId] ?? 0) > 0 ? '' : 'disabled'}>Vender 1</button></article>`).join('');
    const offers = [
        { id: 'palisade_kit', name: 'Kit de paliçada', craft: { green_gel: 2, wolf_pelt: 1 }, price: 22 },
        { id: 'watchtower_kit', name: 'Kit de vigia', craft: { wolf_pelt: 2, wisp_shard: 1 }, price: 38 },
        { id: 'healing_potion', name: 'Poção de seiva', craft: null, price: 12 }
    ];
    $('shop-offers').innerHTML = offers.map(offer => `<article class="shop-row"><span>${iconSvg(items[offer.id].icon)}</span><div><b>${offer.name}</b><small>${offer.craft ? `Produza: ${Object.entries(offer.craft).map(([id, amount]) => `${amount} ${items[id].name}`).join(' · ')} ou compre` : 'Compra direta'}</small></div>${offer.craft ? `<button class="tiny-button" data-craft="${offer.id}" ${atBase() && Object.entries(offer.craft).every(([id, amount]) => (state.inventory[id] ?? 0) >= amount) ? '' : 'disabled'}>Produzir</button>` : ''}<button class="tiny-button shop-buy" data-buy="${offer.id}" data-price="${offer.price}" ${atBase() && state.gold >= offer.price ? '' : 'disabled'}>${offer.price} ◉</button></article>`).join('');
}

export function sellResource(itemId: string) {
    const prices: Record<string, number> = { green_gel: 4, wolf_pelt: 7, wisp_shard: 11 };
    if (!atBase() || !prices[itemId] || (state.inventory[itemId] ?? 0) < 1)
        return;
    removeItemQuantity(itemId);
    state.gold += prices[itemId];
    log(`Auri comprou ${items[itemId].name} por ${prices[itemId]} moedas.`);
    notify(`+${prices[itemId]} moedas`);
    updateUI();
    renderBase();
}

export function tradeForItem(itemId: string, price: number) {
    if (!atBase() || state.gold < price || !addItem(itemId)) {
        notify('Moedas insuficientes ou mochila cheia.');
        return;
    }
    state.gold -= price;
    log(`Você comprou ${items[itemId].name} de Auri por ${price} moedas.`);
    notify(`${items[itemId].name} adquirido.`);
    updateUI();
    renderBase();
}

export function craftItem(itemId: string) {
    const recipes: Record<string, Record<string, number>> = { palisade_kit: { green_gel: 2, wolf_pelt: 1 }, watchtower_kit: { wolf_pelt: 2, wisp_shard: 1 } };
    const recipe = recipes[itemId];
    if (!atBase() || !recipe || !Object.entries(recipe).every(([id, amount]) => (state.inventory[id] ?? 0) >= amount))
        return;
    Object.entries(recipe).forEach(([id, amount]) => removeItemQuantity(id, amount));
    if (!addItem(itemId)) {
        Object.entries(recipe).forEach(([id, amount]) => addItem(id, amount));
        notify('Mochila cheia.');
        return;
    }
    log(`Auri produziu ${items[itemId].name}.`);
    notify(`${items[itemId].name} produzido.`);
    updateUI();
    renderBase();
}

export function buildStructure(structure: BaseStructure) {
    if (!atBase()) {
        notify('Você precisa estar na base para construir.');
        return;
    }
    if (state.builtStructures.has(structure) || !canBuild(structure)) {
        notify('Faltam recursos para esta estrutura.');
        return;
    }
    Object.entries(structureCost(structure)).forEach(([item, amount]) => removeItemQuantity(item, amount));
    state.builtStructures.add(structure);
    log(`Base fortalecida: ${structure === 'palisade' ? 'Paliçada de raízes' : 'Torre de vigia'}.`);
    notify('Estrutura construída!');
    updateUI();
    renderBase();
}

export function startBaseInvasion() {
    if (!state.invasionPending || !atBase()) {
        notify('A invasão só pode ser enfrentada na base.');
        return;
    }
    state.battleContext = 'invasion';
    state.mode = 'battle';
    state.turn = 0;
    state.action = 'move';
    state.battleMenuOpen = true;
    state.battlePlayer = { x: 1, y: 4 };
    const defense = baseDefense(), scale = Math.max(1, Math.floor(state.victories / 3));
    state.battleEnemies = [makeEnemy(9001, 9, 3, 'wolf', scale), makeEnemy(9002, 8, 5, 'slime', scale)];
    if (scale > 1)
        state.battleEnemies.push(makeEnemy(9003, 9, 6, 'wisp', scale));
    state.battleEnemies.forEach(enemy => { enemy.damage = Math.max(1, enemy.damage - defense); });
    state.selectedEnemyId = state.battleEnemies[0].id;
    $('battle-tip').textContent = `Invasão à base! Suas defesas reduzem ${defense} de dano inimigo.`;
    $('base-modal').classList.add('hidden');
    log('A invasão alcançou a base. Proteja o refúgio!');
    updateUI();
}
