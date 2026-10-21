import { state } from '../../game/state';
import { regions } from '../../data/regions';
import { $, worldMapCanvas } from '../../ui/dom';

export function mapTileKey(region: number, x: number, y: number) { return `${region}:${x},${y}`; }

export function revealAroundPlayer() {
    for (let y = Math.max(0, state.player.y - 2); y <= Math.min(state.GRID_H - 1, state.player.y + 2); y++) {
        for (let x = Math.max(0, state.player.x - 2); x <= Math.min(state.GRID_W - 1, state.player.x + 2); x++) {
            if (Math.abs(x - state.player.x) + Math.abs(y - state.player.y) <= 3)
                state.discoveredTiles.add(mapTileKey(state.regionIndex, x, y));
        }
    }
}

export function drawWorldMap(target: HTMLCanvasElement) {
    const mapCtx = target.getContext('2d');
    if (!mapCtx)
        return;
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height)
        return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(rect.width * dpr), pixelHeight = Math.round(rect.height * dpr);
    if (target.width !== pixelWidth)
        target.width = pixelWidth;
    if (target.height !== pixelHeight)
        target.height = pixelHeight;
    mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cell = Math.min(rect.width / (state.GRID_W * regions.length), rect.height / state.GRID_H);
    const ox = (rect.width - cell * state.GRID_W * regions.length) / 2, oy = (rect.height - cell * state.GRID_H) / 2;
    mapCtx.clearRect(0, 0, rect.width, rect.height);
    mapCtx.fillStyle = '#101716';
    mapCtx.fillRect(0, 0, rect.width, rect.height);
    state.mapRegionOrder.forEach((regionId, mapRegion) => {
        const region = regions[regionId];
        for (let y = 0; y < state.GRID_H; y++)
            for (let x = 0; x < state.GRID_W; x++) {
                const px = ox + (mapRegion * state.GRID_W + x) * cell, py = oy + y * cell;
                const known = state.discoveredTiles.has(mapTileKey(regionId, x, y));
                mapCtx.fillStyle = known ? (state.hash(x + regionId * 19, y + regionId * 13) > .5 ? region.light : region.ground) : (state.hash(x, y) > .5 ? '#18211f' : '#141c1a');
                mapCtx.fillRect(px + .5, py + .5, Math.max(0, cell - 1), Math.max(0, cell - 1));
                if (known && state.trees.has(state.key(x, y))) {
                    mapCtx.fillStyle = region.dark;
                    mapCtx.fillRect(px + cell * .3, py + cell * .25, cell * .4, cell * .5);
                }
            }
    });
    const activeMapRegion = state.mapRegionOrder.indexOf(state.regionIndex);
    for (let r = 0; r <= regions.length; r++) {
        const x = ox + r * state.GRID_W * cell;
        mapCtx.strokeStyle = r === activeMapRegion || r === activeMapRegion + 1 ? '#d8bd7c' : 'rgba(223,220,190,.26)';
        mapCtx.lineWidth = r === activeMapRegion || r === activeMapRegion + 1 ? 1.5 : 1;
        mapCtx.beginPath();
        mapCtx.moveTo(x, oy);
        mapCtx.lineTo(x, oy + state.GRID_H * cell);
        mapCtx.stroke();
    }
    const markerX = ox + (activeMapRegion * state.GRID_W + state.player.x + .5) * cell;
    const markerY = oy + (state.player.y + .5) * cell;
    mapCtx.fillStyle = '#f4d888';
    mapCtx.shadowColor = '#f4d888';
    mapCtx.shadowBlur = Math.max(3, cell * .8);
    mapCtx.beginPath();
    mapCtx.arc(markerX, markerY, Math.max(2, cell * .28), 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.shadowBlur = 0;
    const percent = Math.round(state.discoveredTiles.size / (state.GRID_W * state.GRID_H * regions.length) * 100);
    $('map-progress').textContent = `${percent}% EXPLORADO`;
    $('map-caption').textContent = `${percent}% DESCOBERTO`;
}

export function openMap() { $('map-modal').classList.remove('hidden'); requestAnimationFrame(() => drawWorldMap(worldMapCanvas)); }

export function closeMap() { $('map-modal').classList.add('hidden'); }
