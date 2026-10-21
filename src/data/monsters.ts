import type { Enemy, MonsterDrop } from '../types';

export const monsterCatalog: Record<Enemy['kind'], {
    name: string;
    description: string;
    hp: number;
    damage: number;
    xp: number;
    gold: [
        number,
        number
    ];
    color: string;
    drops: MonsterDrop[];
}> = {
    slime: { name: 'Limo-folha', description: 'Pequeno e persistente. Costuma se esconder entre as raízes do bosque.', hp: 38, damage: 9, xp: 35, gold: [2, 5], color: '#b8d27f', drops: [{ itemId: 'green_gel', chance: .8, min: 1, max: 2 }, { itemId: 'healing_potion', chance: .18, min: 1, max: 1 }, { itemId: 'carapace_brooch', chance: .08, min: 1, max: 1 }] },
    wolf: { name: 'Lobo-das-brumas', description: 'Caçador veloz que encurta a distância antes de atacar.', hp: 50, damage: 12, xp: 48, gold: [4, 8], color: '#8ba3a2', drops: [{ itemId: 'wolf_pelt', chance: .8, min: 1, max: 2 }, { itemId: 'healing_potion', chance: .2, min: 1, max: 1 }, { itemId: 'wolf_fang_blade', chance: .1, min: 1, max: 1 }] },
    wisp: { name: 'Fagulha errante', description: 'Um espírito instável que pulsa com magia antiga.', hp: 31, damage: 10, xp: 42, gold: [3, 7], color: '#d5a0ca', drops: [{ itemId: 'wisp_shard', chance: .8, min: 1, max: 2 }, { itemId: 'healing_potion', chance: .16, min: 1, max: 1 }, { itemId: 'ember_charm', chance: .1, min: 1, max: 1 }] }
};
