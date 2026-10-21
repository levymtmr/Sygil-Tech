import type { InventoryState } from './inventory';

export type BaseStructure = 'palisade' | 'watchtower';

export const structureCosts: Record<BaseStructure, Record<string, number>> = {
  palisade: { green_gel: 2, wolf_pelt: 1 },
  watchtower: { wolf_pelt: 2, wisp_shard: 1 }
};

export function baseDefense(structures: ReadonlySet<BaseStructure>): number {
  return (structures.has('palisade') ? 3 : 0) + (structures.has('watchtower') ? 2 : 0);
}

export function canBuild(structure: BaseStructure, inventory: InventoryState): boolean {
  return Object.entries(structureCosts[structure]).every(([itemId, quantity]) => (inventory[itemId] ?? 0) >= quantity);
}

export function shouldTriggerInvasion(victories: number): boolean {
  return victories > 0 && victories % 3 === 0;
}
