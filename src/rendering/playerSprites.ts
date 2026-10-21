import knightUrl from '../assets/sprites/movement/knight-walk-v1.png';
import arcanistUrl from '../assets/sprites/movement/arcanist-walk-v1.png';
import archerUrl from '../assets/sprites/movement/archer-walk-v1.png';
import { movementFrame } from '../game/playerMovement';
import type { Facing } from '../game/playerMovement';
import type { ClassId, Motion } from '../types';

type Frame = { x: number; y: number; width: number; height: number };
type Sheet = { image: HTMLImageElement; frames: Frame[]; height: number };
const sources: Record<ClassId, { url: string; rows: number[] }> = {
  knight: { url: knightUrl, rows: [0, 330, 630, 925, 1286] },
  arcanist: { url: arcanistUrl, rows: [0, 313, 620, 923, 1254] },
  archer: { url: archerUrl, rows: [0, 330, 620, 915, 1275] },
};
const sheets = new Map<ClassId, Sheet>();
const facingRows: Record<Facing, number> = { down: 0, left: 1, right: 2, up: 3 };
let redraw = () => {};

export function initializePlayerSprites(onLoad: () => void) {
  redraw = onLoad;
}

function getSheet(id: ClassId): Sheet {
  const cached = sheets.get(id);
  if (cached) return cached;
  const sheet: Sheet = { image: new Image(), frames: [], height: 1 };
  sheets.set(id, sheet);
  sheet.image.onload = () => {
    try {
      sheet.frames = measureFrames(sheet.image, sources[id].rows);
      sheet.height = Math.max(...sheet.frames.map(frame => frame.height));
    } catch (error) {
      console.warn(`Não foi possível preparar a caminhada de ${id}.`, error);
    }
    redraw();
  };
  sheet.image.onerror = () => console.warn(`Não foi possível carregar a caminhada de ${id}.`);
  sheet.image.src = sources[id].url;
  return sheet;
}

// Measure alpha once on load. Blank margins vary in generated sheets; feet
// are anchored consistently without modifying the original PNG assets.
function measureFrames(image: HTMLImageElement, rows: number[]): Frame[] {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const frames: Frame[] = [];
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 4; column++) {
      const left = Math.round(column * canvas.width / 4), right = Math.round((column + 1) * canvas.width / 4);
      let minX = right, maxX = left, minY = rows[row + 1], maxY = rows[row];
      for (let y = rows[row]; y < rows[row + 1]; y++) {
        for (let x = left; x < right; x++) {
          if (data[(y * canvas.width + x) * 4 + 3] < 64) continue;
          minX = Math.min(minX, x); maxX = Math.max(maxX, x);
          minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
      }
      if (minX > maxX || minY > maxY) throw new Error(`Quadro vazio: ${row}, ${column}`);
      frames.push({ x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 });
    }
  }
  return frames;
}

export function drawPlayerSprite(ctx: CanvasRenderingContext2D, id: ClassId, facing: Facing, motion: Motion | null, cx: number, bottom: number, height: number): boolean {
  const sheet = getSheet(id);
  if (sheet.frames.length !== 16) return false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame = movementFrame(motion, performance.now(), reducedMotion);
  const source = sheet.frames[facingRows[facing] * 4 + frame];
  const scale = height / sheet.height;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet.image, source.x, source.y, source.width, source.height,
    cx - source.width * scale / 2, bottom - source.height * scale,
    source.width * scale, source.height * scale);
  ctx.restore();
  return true;
}
