import charactersUrl from '../assets/sprites/characters-v1.png';
import { environmentAtlas, propPositions } from '../data/spriteAtlas';
import type { PropSprite } from '../data/spriteAtlas';
import type { ClassId, Enemy } from '../types';

type Atlas = { image: HTMLImageElement; columns: number; rows: number[]; ready: boolean };
const characters: Atlas = { image: new Image(), columns: 4, rows: [0, 235, 455, 680, 900, 1120, 1320, 1540, 1774], ready: false };
const environment: Atlas = { image: new Image(), columns: environmentAtlas.columns, rows: environmentAtlas.rows, ready: false };
const classRows: Record<ClassId, number> = { knight: 0, arcanist: 1, archer: 2 };
const creatureRows: Record<Enemy['kind'], number> = { slime: 5, wolf: 6, wisp: 7 };
export type { PropSprite } from '../data/spriteAtlas';

function load(atlas: Atlas, url: string): Promise<void> {
  return new Promise(resolve => {
    atlas.image.onload = () => { atlas.ready = true; resolve(); };
    // Keep the existing canvas artwork available if an asset cannot load.
    atlas.image.onerror = () => { console.warn(`Não foi possível carregar sprites: ${url}`); resolve(); };
    atlas.image.src = url;
  });
}

export async function initializeSpriteRendering(redraw: () => void) {
  await Promise.all([load(characters, charactersUrl), load(environment, environmentAtlas.url)]);
  redraw();
  if (characters.ready && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.setInterval(() => { if (!document.hidden) redraw(); }, 140);
  }
}

function drawFrame(ctx: CanvasRenderingContext2D, atlas: Atlas, column: number, row: number, cx: number, bottom: number, height: number): boolean {
  if (!atlas.ready) return false;
  const sw = atlas.image.naturalWidth / atlas.columns;
  const sy = atlas.rows[row], sh = atlas.rows[row + 1] - sy;
  const width = height * sw / sh;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(atlas.image, column * sw, sy, sw, sh, cx - width / 2, bottom - height, width, height);
  ctx.restore();
  return true;
}

export function drawClassSprite(ctx: CanvasRenderingContext2D, id: ClassId, cx: number, bottom: number, height: number, moving: boolean) {
  const frame = moving ? Math.floor(performance.now() / 90) % 4 : 0;
  return drawFrame(ctx, characters, frame, classRows[id], cx, bottom, height);
}

export function drawMonsterSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, cx: number, bottom: number, height: number, moving: boolean) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame = !reducedMotion && (moving || enemy.kind !== 'wolf') ? Math.floor(performance.now() / 140 + enemy.id) % 4 : 0;
  return drawFrame(ctx, characters, frame, creatureRows[enemy.kind], cx, bottom, height);
}

export function drawPropSprite(ctx: CanvasRenderingContext2D, id: PropSprite, cx: number, bottom: number, height: number) {
  const [column, row] = propPositions[id];
  return drawFrame(ctx, environment, column, row, cx, bottom, height);
}
