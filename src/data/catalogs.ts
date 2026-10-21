// Compatibility exports; each catalog is maintained in its own module.
export { regions } from './regions';
export { items } from './items';
export { classes } from './classes';
export { monsterCatalog } from './monsters';
export const slotNames = { weapon: 'Arma', armor: 'Armadura', charm: 'Amuleto' };
export const inventoryCapacity = 20;
export const mapRegionOrder = [1, 0, 2] as const;
