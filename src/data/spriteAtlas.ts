import environmentUrl from '../assets/sprites/environment-v1.png';

export const environmentAtlas = {
  url: environmentUrl,
  width: 1536,
  height: 1024,
  columns: 4,
  rows: [0, 300, 572, 805, 1024],
};

export const propPositions = {
  oak: [0, 0], pine: [1, 0], rock: [2, 0], shrub: [3, 0],
  shop: [0, 1], shelf: [1, 1], counter: [2, 1], workbench: [3, 1],
  plant: [0, 2], rug: [1, 2], lamp: [2, 2], barrel: [3, 2],
  green_gel: [0, 3], wolf_pelt: [1, 3], wisp_shard: [2, 3], healing_potion: [3, 3],
} as const;
export type PropSprite = keyof typeof propPositions;
