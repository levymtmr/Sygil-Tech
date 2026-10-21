import { environmentAtlas, propPositions } from '../data/spriteAtlas';
import type { PropSprite } from '../data/spriteAtlas';
import charactersUrl from '../assets/sprites/characters-v1.png';
import type { ClassId } from '../types';

let nextClipId = 0;

function atlasArt(url: string, x: number, y: number, width: number, height: number, atlasWidth: number, atlasHeight: number) {
  const clipId = `sprite-clip-${nextClipId++}`;
  return `<span class="sprite-art" aria-hidden="true"><svg viewBox="${x} ${y} ${width} ${height}" preserveAspectRatio="xMidYMax meet" focusable="false"><defs><clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${width}" height="${height}" /></clipPath></defs><image href="${url}" width="${atlasWidth}" height="${atlasHeight}" clip-path="url(#${clipId})" /></svg></span>`;
}

export function propArt(id: PropSprite) {
  const [column, row] = propPositions[id], atlas = environmentAtlas;
  const width = atlas.width / atlas.columns;
  return atlasArt(atlas.url, column * width, atlas.rows[row], width,
    atlas.rows[row + 1] - atlas.rows[row], atlas.width, atlas.height);
}

export function characterArt(id: ClassId) {
  const rows = { knight: [0, 235], arcanist: [235, 455], archer: [455, 680] };
  const [top, bottom] = rows[id];
  return atlasArt(charactersUrl, 0, top, 887 / 4, bottom - top, 887, 1774);
}
