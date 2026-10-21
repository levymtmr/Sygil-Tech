import type { EquipSlot, ClassId, SkillId, Mode, Action, Point, Enemy, Motion, CombatEffect } from '../types';
import { classes } from '../data/classes';
import type { BaseStructure, FurnitureId } from '../types/game';

const GRID_W = 11, GRID_H = 9;

const equipment: Record<EquipSlot, string | null> = { weapon: 'training_blade', armor: 'travel_coat', charm: null };

const inventory: Record<string, number> = { healing_potion: 3 };

const INVENTORY_CAPACITY = 20;

let inventoryOrder: Array<string | null> = ['healing_potion', ...Array<string | null>(INVENTORY_CAPACITY - 1).fill(null)];

let selectedInventorySlot: number | null = null;

const slotNames: Record<EquipSlot, string> = { weapon: 'Arma', armor: 'Armadura', charm: 'Amuleto' };

const unlockedSkills: Record<ClassId, Set<SkillId>> = {
    knight: new Set(['shield-bash']), arcanist: new Set(['arcane-bolt']), archer: new Set(['aimed-shot'])
};

const mapRegionOrder = [1, 0, 2];

let regionIndex = 0, mode: Mode = 'explore', action: Action = 'move', selectedEnemyId: number | null = null, battleMenuOpen = false, classChosen = false, started = false, battleContext: 'wild' | 'invasion' = 'wild';

const spawnPosition: Point = { x: 5, y: 7 };

let player: Point = { ...spawnPosition }, battlePlayer: Point = { x: 1, y: 4 }, classId: ClassId = 'knight', playerHp = classes.knight.hp, maxHp = classes.knight.hp, baseMaxHp = classes.knight.hp, xp = 0, level = 1, skillPoints = 0, guardActive = false, gold = 0, victories = 0, encounterScale = 0, turn = 0;

let enemies: Enemy[] = [], battleEnemies: Enemy[] = [], turnTimer = 0, toastTimer = 0;

const mapEnemies: Enemy[] = [];

const trees = new Set<string>(), flowers = new Set<string>();

const resourceNodes = new Map<string, 'green_gel' | 'wolf_pelt' | 'wisp_shard'>();

const discoveredTiles = new Set<string>();

const knownMonsters = new Set<Enemy['kind']>();

let worldMotion: Motion | null = null, battlePlayerMotion: Motion | null = null;

const enemyMotions = new Map<number, Motion>();

let combatEffects: CombatEffect[] = [], animationFramePending = false;

const basePosition: Point = { x: 5, y: 4 };

const builtStructures = new Set<BaseStructure>();

let invasionPending = false;

let baseTab: 'workshop' | 'shop' = 'workshop';

const storeShelves: Array<string | null> = Array(6).fill(null);

const storePrices: Record<string, number> = { green_gel: 7, wolf_pelt: 12, wisp_shard: 18, healing_potion: 20 };

let storeOpen = false, storeSales = 0, storeShelfCount = 3, storeSelectedProduct: string | null = null, storeCustomer: {
    itemId: string;
    name: string;
    phase: 'entering' | 'browsing' | 'checkout';
} | null = null;

let storeTimer: number | undefined;

const furnitureStock: Record<FurnitureId, number> = { plant: 0, rug: 0, lamp: 0, counter: 0, workbench: 0 };

const furnitureLayouts: Record<'store' | 'workshop', Array<FurnitureId | null>> = { store: Array(24).fill(null), workshop: Array(24).fill(null) };

let selectedFurniture: FurnitureId | null = null;

const key = (x: number, y: number) => `${x},${y}`;

const hash = (x: number, y: number) => Math.abs(Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1;

const isTouch = matchMedia('(pointer: coarse)').matches;

const recentEvents: string[] = [];

export interface GameState {
    worldFacing: import('./playerMovement').Facing;
    battleFacing: import('./playerMovement').Facing;
  GRID_W: typeof GRID_W;
  GRID_H: typeof GRID_H;
  equipment: Record<EquipSlot, string | null>;
  inventory: Record<string, number>;
  INVENTORY_CAPACITY: typeof INVENTORY_CAPACITY;
  inventoryOrder: Array<string | null>;
  selectedInventorySlot: number | null;
  slotNames: Record<EquipSlot, string>;
  unlockedSkills: Record<ClassId, Set<SkillId>>;
  mapRegionOrder: typeof mapRegionOrder;
  regionIndex: typeof regionIndex;
  mode: Mode;
  action: Action;
  selectedEnemyId: number | null;
  battleMenuOpen: boolean;
  classChosen: boolean;
  started: boolean;
  battleContext: 'wild' | 'invasion';
  spawnPosition: Point;
  player: Point;
  battlePlayer: Point;
  classId: ClassId;
  playerHp: typeof playerHp;
  maxHp: typeof maxHp;
  baseMaxHp: typeof baseMaxHp;
  xp: typeof xp;
  level: typeof level;
  skillPoints: typeof skillPoints;
  guardActive: boolean;
  gold: typeof gold;
  victories: typeof victories;
  encounterScale: typeof encounterScale;
  turn: typeof turn;
  enemies: Enemy[];
  battleEnemies: Enemy[];
  turnTimer: typeof turnTimer;
  toastTimer: typeof toastTimer;
  mapEnemies: Enemy[];
  trees: typeof trees;
  flowers: typeof flowers;
  resourceNodes: typeof resourceNodes;
  discoveredTiles: typeof discoveredTiles;
  knownMonsters: typeof knownMonsters;
  worldMotion: Motion | null;
  battlePlayerMotion: Motion | null;
  enemyMotions: typeof enemyMotions;
  combatEffects: CombatEffect[];
  animationFramePending: boolean;
  basePosition: Point;
  builtStructures: typeof builtStructures;
  invasionPending: boolean;
  baseTab: 'workshop' | 'shop';
  storeShelves: Array<string | null>;
  storePrices: Record<string, number>;
  storeOpen: boolean;
  storeSales: typeof storeSales;
  storeShelfCount: typeof storeShelfCount;
  storeSelectedProduct: string | null;
  storeCustomer: {
    itemId: string;
    name: string;
    phase: 'entering' | 'browsing' | 'checkout';
} | null;
  storeTimer: number | undefined;
  furnitureStock: Record<FurnitureId, number>;
  furnitureLayouts: Record<'store' | 'workshop', Array<FurnitureId | null>>;
  selectedFurniture: FurnitureId | null;
  key: typeof key;
  hash: typeof hash;
  isTouch: typeof isTouch;
  recentEvents: string[];
}

export const state: GameState = {
    worldFacing: 'down',
    battleFacing: 'right',
GRID_W,
GRID_H,
equipment,
inventory,
INVENTORY_CAPACITY,
inventoryOrder,
selectedInventorySlot,
slotNames,
unlockedSkills,
mapRegionOrder,
regionIndex,
mode,
action,
selectedEnemyId,
battleMenuOpen,
classChosen,
started,
battleContext,
spawnPosition,
player,
battlePlayer,
classId,
playerHp,
maxHp,
baseMaxHp,
xp,
level,
skillPoints,
guardActive,
gold,
victories,
encounterScale,
turn,
enemies,
battleEnemies,
turnTimer,
toastTimer,
mapEnemies,
trees,
flowers,
resourceNodes,
discoveredTiles,
knownMonsters,
worldMotion,
battlePlayerMotion,
enemyMotions,
combatEffects,
animationFramePending,
basePosition,
builtStructures,
invasionPending,
baseTab,
storeShelves,
storePrices,
storeOpen,
storeSales,
storeShelfCount,
storeSelectedProduct,
storeCustomer,
storeTimer,
furnitureStock,
furnitureLayouts,
selectedFurniture,
key,
hash,
isTouch,
recentEvents
};

