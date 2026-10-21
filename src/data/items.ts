import type { ItemDefinition } from '../types';

export const items: Record<string, ItemDefinition> = {
    healing_potion: { name: 'Poção de seiva', icon: 'potion', description: 'Recupera até 40 pontos de vitalidade.' },
    training_blade: { name: 'Lâmina de treino', icon: 'sword', description: '+4 de ataque.', slot: 'weapon', visualColor: '#e3d3a0', bonus: { attack: 4 } },
    arcane_staff: { name: 'Cajado rúnico', icon: 'staff', description: '+3 de ataque mágico.', slot: 'weapon', visualColor: '#c8a7ff', bonus: { attack: 3 } },
    field_bow: { name: 'Arco de bétula', icon: 'bow', description: '+2 de ataque.', slot: 'weapon', visualColor: '#b8d788', bonus: { attack: 2 } },
    sun_mace: { name: 'Maça solar', icon: 'mace', description: '+2 de ataque.', slot: 'weapon', visualColor: '#ffe09a', bonus: { attack: 2 } },
    duelist_rapier: { name: 'Florete errante', icon: 'duelist', description: '+5 de ataque.', slot: 'weapon', visualColor: '#f0b6a1', bonus: { attack: 5 } },
    travel_coat: { name: 'Manto de viajante', icon: 'armor', description: '+2 de defesa.', slot: 'armor', visualColor: '#c3a66c', bonus: { defense: 2 } },
    arcane_robe: { name: 'Manto de sigilos', icon: 'arcanist', description: '+1 defesa e +8 vitalidade máxima.', slot: 'armor', visualColor: '#7656a4', bonus: { defense: 1, maxHp: 8 } },
    ranger_leathers: { name: 'Couro de patrulheiro', icon: 'hood', description: '+2 defesa e +4 vitalidade máxima.', slot: 'armor', visualColor: '#496b43', bonus: { defense: 2, maxHp: 4 } },
    healer_vest: { name: 'Veste da aurora', icon: 'healer', description: '+2 defesa e +8 vitalidade máxima.', slot: 'armor', visualColor: '#c2a45c', bonus: { defense: 2, maxHp: 8 } },
    duelist_jerkin: { name: 'Gibão rubro', icon: 'duelist', description: '+1 defesa e +4 vitalidade máxima.', slot: 'armor', visualColor: '#803c42', bonus: { defense: 1, maxHp: 4 } },
    carapace_brooch: { name: 'Broche de carapaça', icon: 'brooch', description: '+1 defesa e +10 vitalidade máxima.', slot: 'charm', visualColor: '#c1d397', bonus: { defense: 1, maxHp: 10 } },
    wolf_fang_blade: { name: 'Lâmina presa-de-bruma', icon: 'fang', description: '+7 de ataque.', slot: 'weapon', bonus: { attack: 7 } },
    ember_charm: { name: 'Amuleto de fagulha', icon: 'charm', description: '+2 ataque, +1 defesa e +8 vitalidade máxima.', slot: 'charm', visualColor: '#e6a1e2', bonus: { attack: 2, defense: 1, maxHp: 8 } },
    green_gel: { name: 'Gelatina verde', icon: 'gel', description: 'Material viscoso deixado por limos-folha.' },
    wolf_pelt: { name: 'Pelo da bruma', icon: 'fur', description: 'Pelo macio de um lobo-das-brumas.' },
    wisp_shard: { name: 'Fragmento de fagulha', icon: 'shard', description: 'Estilhaço ainda carregado de energia arcana.' },
    palisade_kit: { name: 'Kit de paliçada', icon: 'armor', description: 'Peças prontas para erguer uma paliçada.' },
    watchtower_kit: { name: 'Kit de vigia', icon: 'archer', description: 'Ferragens e sinalizadores para uma torre de vigia.' }
};
