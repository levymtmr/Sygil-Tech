import { state } from '../game/state';
import type { Enemy } from '../types';
import { $ } from './dom';
import { monsterCatalog } from '../data/monsters';
import { iconSvg } from './icons';
import { items } from '../data/items';
import { currentClass, renderSkillTree, renderClassPicker, updateStartPreview, renderBattleActions, applyClass } from '../features/character/classes';
import { regions } from '../data/regions';
import { attackPower, defensePower, renderInventory } from '../features/inventory/inventory';
import { atBase } from '../features/base/base';
import { draw } from '../rendering/board';

export function renderCodex() {
    const kinds: Enemy['kind'][] = ['slime', 'wolf', 'wisp'];
    $('codex-summary').textContent = `${state.knownMonsters.size} DE ${kinds.length} CRIATURAS DESCOBERTAS`;
    $('codex-list').innerHTML = kinds.map(kind => {
        const monster = monsterCatalog[kind];
        if (!state.knownMonsters.has(kind))
            return `<article class="codex-entry codex-locked"><div class="codex-monster-icon">?</div><div class="codex-main"><h3>???</h3><p>Ainda não encontrado. Explore para registrar esta criatura.</p></div><div class="codex-lock">NÃO DESCOBERTO</div></article>`;
        const drops = monster.drops.map(drop => `<span class="codex-drop"><i>${iconSvg(items[drop.itemId].icon)}</i>${items[drop.itemId].name}<b>${Math.round(drop.chance * 100)}%</b></span>`).join('');
        return `<article class="codex-entry"><div class="codex-monster-icon ${kind}">${kind === 'slime' ? '●' : kind === 'wolf' ? '⌁' : '✦'}</div><div class="codex-main"><h3>${monster.name}</h3><p>${monster.description}</p><div class="codex-stats"><span>${iconSvg('heart')} <b>${monster.hp}</b> PV</span><span>${iconSvg('sword')} <b>${monster.damage}</b> ATQ</span><span>${iconSvg('star')} <b>${monster.xp}</b> XP</span></div><div class="codex-drop-list"><small>DROPS POSSÍVEIS</small>${drops}</div></div></article>`;
    }).join('');
}

export function showBattleRewards(xpGain: number, drops: Array<{
    itemId: string;
    quantity: number;
}>, levelGains: number) {
    $('reward-xp').textContent = `+${xpGain} XP`;
    $('reward-gold').textContent = drops.length ? `${drops.length} TIPO(S)` : 'SEM SAQUE';
    $('reward-subtitle').textContent = `${state.victories} ${state.victories === 1 ? 'vitória conquistada' : 'vitórias conquistadas'} · ${state.level}º nível`;
    $('reward-level').classList.toggle('hidden', levelGains === 0);
    $('reward-level').textContent = levelGains > 1 ? `✧ Você subiu ${levelGains} níveis e ganhou ${levelGains} ponto(s) de habilidade!` : '✧ Você subiu de nível e ganhou 1 ponto de habilidade!';
    $('reward-items').innerHTML = drops.length ? drops.map(drop => `<div class="reward-item"><span class="reward-item-icon">${iconSvg(items[drop.itemId].icon)}</span><b>${items[drop.itemId].name}</b><small>×${drop.quantity}</small></div>`).join('') : '<p class="no-drops">Nenhum material caiu desta vez. Explore para encontrar recursos e venda-os na base.</p>';
    $('reward-modal').classList.remove('hidden');
}

export function log(text: string) { state.recentEvents.unshift(text); if (state.recentEvents.length > 24)
    state.recentEvents.pop(); }

export function notify(text: string) { const el = $('toast'); el.textContent = text; el.classList.add('show'); clearTimeout(state.toastTimer); state.toastTimer = window.setTimeout(() => el.classList.remove('show'), 2400); }

export function updateUI() {
    const chosenClass = currentClass();
    $('region-name').textContent = regions[state.regionIndex].name;
    $('canvas-label').innerHTML = `<span>✦</span> ${regions[state.regionIndex].label}`;
    $('canvas-coords').textContent = `COORD. ${String(state.player.x + 1).padStart(2, '0')} · ${String(state.player.y + 1).padStart(2, '0')}`;
    $('hp-label').textContent = `${state.playerHp} / ${state.maxHp}`;
    $('hp-meter').style.width = `${state.playerHp / state.maxHp * 100}%`;
    $('xp-label').textContent = `${state.xp} / ${100 + (state.level - 1) * 80}`;
    $('xp-meter').style.width = `${state.xp / (100 + (state.level - 1) * 80) * 100}%`;
    $('level').textContent = String(state.level).padStart(2, '0');
    $('character-name').textContent = `Kael · ${chosenClass.name}`;
    $('class-summary').textContent = `${chosenClass.title} · ${chosenClass.passive}`;
    $('potion-count').textContent = String(state.inventory.healing_potion ?? 0);
    $('kill-count').textContent = String(state.victories);
    $('hud-hp').textContent = `${state.playerHp} / ${state.maxHp}`;
    $('hud-hp-meter').style.width = `${state.playerHp / state.maxHp * 100}%`;
    $('hud-level').textContent = String(state.level).padStart(2, '0');
    $('hud-potions').textContent = String(state.inventory.healing_potion ?? 0);
    $('attack-stat').textContent = String(attackPower());
    $('defense-stat').textContent = String(defensePower());
    $('gold-stat').textContent = String(state.gold);
    const alive = state.mapEnemies.filter(e => e.hp > 0);
    const nearby = alive.map(e => ({ e, d: Math.abs(state.player.x - e.x) + Math.abs(state.player.y - e.y) })).filter(o => o.d <= 4).sort((a, b) => a.d - b.d);
    nearby.forEach(({ e }) => state.knownMonsters.add(e.kind));
    const closest = nearby[0];
    $('encounter-button').classList.toggle('hidden', !closest || closest.d > 2 || state.mode === 'battle');
    $('objective-text').textContent = state.mode === 'battle' ? state.battleContext === 'invasion' ? 'Proteja a base: elimine todos os invasores.' : 'Derrote as criaturas para avançar.' : state.invasionPending ? (atBase() ? 'A invasão chegou. Abra a Base e prepare a defesa.' : 'Uma invasão se aproxima. Retorne à base no marco dourado.') : closest && closest.d <= 2 ? `${closest.e.name} avistado · inicie o encontro quando estiver pronto.` : state.victories === 0 ? 'Explore o bosque até avistar uma criatura.' : 'Colete materiais para fortalecer a base.';
    $('battle-actions').classList.toggle('hidden', state.mode !== 'battle' || state.turn !== 0 || !state.battleMenuOpen);
    $('battle-banner').classList.toggle('hidden', state.mode !== 'battle');
    $('battle-actions-reopen').classList.toggle('hidden', state.mode !== 'battle' || state.turn !== 0 || state.battleMenuOpen);
    if (state.mode === 'battle') {
        const active = state.battleEnemies.find(e => e.id === state.selectedEnemyId && e.hp > 0) ?? state.battleEnemies.find(e => e.hp > 0);
        $('battle-title').textContent = active?.name.toUpperCase() ?? 'COMBATE';
        $('turn-indicator').textContent = state.turn === 0 ? 'SEU TURNO' : 'TURNO INIMIGO';
    }
    renderInventory();
    renderCodex();
    renderSkillTree();
    renderClassPicker('class-list');
    renderClassPicker('start-class-list');
    updateStartPreview();
    renderBattleActions();
    draw();
}

export function togglePanel(panelId: string) {
    const panel = $(panelId);
    const wasOpen = !panel.classList.contains('hidden');
    document.querySelectorAll<HTMLElement>('.panel-backdrop').forEach(backdrop => backdrop.classList.add('hidden'));
    if (!wasOpen)
        panel.classList.remove('hidden');
}

export function closeOpenPanel() {
    const panel = document.querySelector<HTMLElement>('.panel-backdrop:not(.hidden)');
    if (!panel)
        return false;
    panel.classList.add('hidden');
    return true;
}

export function startGame() {
    if (!state.classChosen) {
        notify('Escolha uma classe para começar.');
        return;
    }
    applyClass(state.classId, false);
    state.started = true;
    $('start-screen').classList.add('start-screen-hidden');
    log(`Jornada iniciada como ${currentClass().name}.`);
    log('Explore o Bosque Sussurrante e prepare-se para o primeiro encontro.');
    updateUI();
}
