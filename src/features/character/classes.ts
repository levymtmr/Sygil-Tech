import { state } from '../../game/state';
import { classes } from '../../data/classes';
import type { ClassId, CharacterClass, Action } from '../../types';
import { recalculateEquipmentStats, attackPower } from '../inventory/inventory';
import { log, notify, updateUI } from '../../ui/panels';
import { $ } from '../../ui/dom';
import { iconSvg } from '../../ui/icons';
import { items } from '../../data/items';
import { setAction } from '../combat/combat';

export function currentClass() { return classes[state.classId]; }

export function skillById(id: string) { return currentClass().skills.find(skill => skill.id === id); }

export function applyClass(id: ClassId, announce = true) {
    state.classId = id;
    state.classChosen = true;
    const chosen = currentClass();
    state.equipment.weapon = chosen.weapon;
    state.equipment.armor = chosen.armor;
    state.equipment.charm = null;
    Object.keys(state.inventory).forEach(itemId => delete state.inventory[itemId]);
    state.inventory.healing_potion = 3;
    state.inventoryOrder.fill(null);
    state.inventoryOrder[0] = 'healing_potion';
    state.selectedInventorySlot = null;
    state.unlockedSkills[id] = new Set(chosen.skills.filter(skill => skill.unlockLevel === 1).map(skill => skill.id));
    state.level = 1;
    state.xp = 0;
    state.skillPoints = 0;
    state.victories = 0;
    state.baseMaxHp = chosen.hp;
    state.builtStructures.clear();
    state.invasionPending = false;
    state.battleContext = 'wild';
    recalculateEquipmentStats();
    state.playerHp = state.maxHp;
    if (announce) {
        log(`Kael escolheu o caminho de ${chosen.name}.`);
        notify(`Classe escolhida: ${chosen.name}`);
    }
}

export function selectClass(id: ClassId) {
    if (!state.started) {
        state.classId = id;
        state.classChosen = true;
        updateStartPreview();
        renderClassPicker('start-class-list');
        return;
    }
    if (state.mode === 'battle' && state.classId !== id) {
        notify('Não é possível trocar de classe durante uma batalha.');
        return;
    }
    if (state.classId === id) {
        $('class-modal').classList.add('hidden');
        return;
    }
    if (state.level > 1 || state.victories > 0) {
        notify('Sua jornada já começou. A classe não pode ser trocada após vencer a primeira batalha.');
        return;
    }
    applyClass(id);
    $('class-modal').classList.add('hidden');
    updateUI();
}

export function updateStartPreview() {
    const chosen = state.classChosen ? currentClass() : null;
    const preview = $('start-preview');
    preview.className = `start-preview ${chosen ? `class-preview-${chosen.id}` : ''}`;
    $('start-class-icon').innerHTML = chosen ? iconSvg(chosen.id) : '✧';
    $('start-class-title').textContent = chosen?.title ?? 'SELECIONE UMA CLASSE';
    $('start-class-name').textContent = chosen?.name ?? 'Seu herói aguarda';
    $('start-class-description').textContent = chosen ? `${chosen.description} ${chosen.passive}` : 'Escolha uma das classes para ver seu estilo, seus atributos e equipamento inicial.';
    $('start-class-hp').textContent = chosen ? String(chosen.hp) : '—';
    $('start-class-attack').textContent = chosen ? String(chosen.attack + (items[chosen.weapon].bonus?.attack ?? 0)) : '—';
    $('start-class-defense').textContent = chosen ? String(chosen.defense + (items[chosen.armor].bonus?.defense ?? 0)) : '—';
    $('start-class-gear').textContent = chosen ? `${items[chosen.weapon].name} · ${items[chosen.armor].name}` : '✦ Seu equipamento será definido pela classe';
    const startButton = $('start-game-button');
    startButton.toggleAttribute('disabled', !state.classChosen);
    startButton.innerHTML = state.classChosen ? `INICIAR JORNADA COMO ${chosen?.name.toUpperCase()} <span>→</span>` : 'ESCOLHA UMA CLASSE PARA CONTINUAR <span>→</span>';
}

export function renderClassPicker(hostId = 'class-list') {
    $(hostId).innerHTML = (Object.values(classes) as CharacterClass[]).map(characterClass => {
        const selected = (state.started || state.classChosen) && characterClass.id === state.classId;
        const locked = (state.level > 1 || state.victories > 0) && !selected;
        const style = characterClass.id === 'knight' ? 'CORPO A CORPO · RESISTÊNCIA' : characterClass.id === 'arcanist' ? 'LONGO ALCANCE · MAGIA' : 'LONGO ALCANCE · CONTROLE';
        return `<button class="class-card class-card-${characterClass.id} ${selected ? 'class-current' : ''}" data-class="${characterClass.id}" ${locked ? 'disabled' : ''} style="--class-color:${characterClass.color};--class-accent:${characterClass.accent}"><span class="class-art">${iconSvg(characterClass.id)}</span><span class="class-card-copy"><b>${characterClass.name}</b><small>${characterClass.title}</small><em>${characterClass.description}</em><span class="class-role">${style}</span><span class="class-card-stats">♥ ${characterClass.hp}　⚔ ${characterClass.attack}　⬡ ${characterClass.defense}</span></span>${selected ? '<span class="class-selected">EM USO</span>' : locked ? '<span class="class-selected">JORNADA INICIADA</span>' : '<span class="class-arrow">→</span>'}</button>`;
    }).join('');
}

export function renderSkillTree() {
    $('skill-points').textContent = `${state.skillPoints} ${state.skillPoints === 1 ? 'PONTO' : 'PONTOS'}`;
    $('skill-tree-list').innerHTML = currentClass().skills.map(skill => {
        const unlocked = state.unlockedSkills[state.classId].has(skill.id), available = !unlocked && state.level >= skill.unlockLevel && state.skillPoints > 0;
        return `<article class="skill-node ${unlocked ? 'skill-unlocked' : available ? 'skill-available' : 'skill-locked'}"><span class="skill-node-icon">${iconSvg(skill.icon)}</span><span class="skill-node-copy"><b>${skill.name}</b><small>NÍVEL ${skill.unlockLevel} · ALCANCE ${skill.range || 'PESSOAL'}</small><em>${skill.description}</em></span>${unlocked ? '<span class="skill-state">APRENDIDA</span>' : `<button class="tiny-button skill-learn" data-learn-skill="${skill.id}" ${available ? '' : 'disabled'}>${available ? 'Aprender · 1 pt' : `Nível ${skill.unlockLevel}`}</button>`}</article>`;
    }).join('');
}

export function selectSkill(skillId: string) {
    const skill = skillById(skillId);
    if (!skill || state.skillPoints < 1 || state.level < skill.unlockLevel || state.unlockedSkills[state.classId].has(skillId))
        return;
    state.unlockedSkills[state.classId].add(skillId);
    state.skillPoints--;
    renderSkillTree();
    renderBattleActions();
    log(`Habilidade aprendida: ${skill.name}.`);
    notify(`${skill.name} aprendida!`);
}

export function renderBattleActions() {
    const skills = currentClass().skills.filter(skill => state.unlockedSkills[state.classId].has(skill.id));
    const actionHost = document.querySelector<HTMLDivElement>('#battle-actions .action-buttons')!;
    actionHost.innerHTML = `<button class="action-button ${state.action === 'move' ? 'selected' : ''}" data-action="move"><span>⇥</span><b>Mover</b><small>ATÉ 3 CASAS</small></button><button class="action-button ${state.action === 'strike' ? 'selected' : ''}" data-action="strike"><span>${iconSvg('sword')}</span><b>Golpe básico</b><small>1 CASA · ${attackPower()} DANO</small></button>${skills.map(skill => `<button class="action-button ${state.action === skill.id ? 'selected' : ''} action-${skill.color}" data-action="${skill.id}"><span>${iconSvg(skill.icon)}</span><b>${skill.name}</b><small>${skill.mode === 'heal' ? `CURA ${skill.power}` : skill.mode === 'guard' ? 'DEFESA' : `${skill.range} CASAS · ${skill.power} DANO`}</small></button>`).join('')}`;
    actionHost.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => setAction(button.dataset.action as Action)));
}
