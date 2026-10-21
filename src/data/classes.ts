import type { ClassId, CharacterClass } from '../types';

export const classes: Record<ClassId, CharacterClass> = {
    knight: { id: 'knight', name: 'Cavaleiro', title: 'VANGUARDA DE AÇO', description: 'Resiste à linha de frente e quebra a guarda inimiga.', passive: 'Recebe menos dano e começa com mais vitalidade.', hp: 128, attack: 16, defense: 5, color: '#6685a1', accent: '#c7d4df', weapon: 'training_blade', armor: 'travel_coat', skills: [
            { id: 'shield-bash', name: 'Golpe de escudo', icon: 'shield', description: 'Impacto pesado a curta distância.', mode: 'damage', range: 1, power: 25, unlockLevel: 1, color: 'orange' },
            { id: 'cleave', name: 'Corte amplo', icon: 'sword', description: 'Um corte poderoso contra um alvo próximo.', mode: 'damage', range: 1, power: 34, unlockLevel: 2, color: 'orange' },
            { id: 'bulwark', name: 'Muralha de ferro', icon: 'shield', description: 'Reduz o próximo golpe recebido.', mode: 'guard', range: 0, power: 12, unlockLevel: 3, color: 'blue' }
        ] },
    arcanist: { id: 'arcanist', name: 'Mago', title: 'TECELÃO DO VÉU', description: 'Canaliza energia para atingir inimigos à distância.', passive: 'Magias causam dano elevado e alcançam mais longe.', hp: 82, attack: 21, defense: 1, color: '#8666b2', accent: '#e0c6ff', weapon: 'arcane_staff', armor: 'arcane_robe', skills: [
            { id: 'arcane-bolt', name: 'Dardo arcano', icon: 'arcanist', description: 'Projétil mágico de longo alcance.', mode: 'damage', range: 4, power: 28, unlockLevel: 1, color: 'violet' },
            { id: 'frost-lance', name: 'Lança gélida', icon: 'shard', description: 'Uma lança de gelo concentrada.', mode: 'damage', range: 4, power: 38, unlockLevel: 2, color: 'blue' },
            { id: 'mana-ward', name: 'Égide de mana', icon: 'shield', description: 'Ergue uma barreira contra o próximo ataque.', mode: 'guard', range: 0, power: 9, unlockLevel: 3, color: 'violet' }
        ] },
    archer: { id: 'archer', name: 'Arqueiro', title: 'SENTINELA DO BOSQUE', description: 'Controla o campo com precisão e alcance.', passive: 'Ataques à distância podem atingir alvos bem afastados.', hp: 98, attack: 18, defense: 2, color: '#668b5e', accent: '#d2e7a4', weapon: 'field_bow', armor: 'ranger_leathers', skills: [
            { id: 'aimed-shot', name: 'Disparo certeiro', icon: 'archer', description: 'Flecha precisa que alcança longe.', mode: 'damage', range: 5, power: 25, unlockLevel: 1, color: 'green' },
            { id: 'rapid-volley', name: 'Rajada veloz', icon: 'archer', description: 'Uma sequência rápida de disparos.', mode: 'damage', range: 4, power: 32, unlockLevel: 2, color: 'green' },
            { id: 'piercing-arrow', name: 'Flecha perfurante', icon: 'fang', description: 'Disparo de máxima potência.', mode: 'damage', range: 5, power: 40, unlockLevel: 3, color: 'orange' }
        ] },
};
