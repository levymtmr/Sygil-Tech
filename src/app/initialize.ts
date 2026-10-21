import { createWorld } from '../features/world/exploration';
import { revealAroundPlayer } from '../features/world/map';
import { resize, draw } from '../rendering/board';
import { initializeSpriteRendering } from '../rendering/sprites';
import { initializePlayerSprites } from '../rendering/playerSprites';
import { canvas } from '../ui/dom';
import { updateUI, log } from '../ui/panels';
import { bindMovementEvents } from './movementEvents';
import { bindPanelsEvents } from './panelsEvents';
import { bindStoreEvents } from './storeEvents';
import { bindInventoryEvents } from './inventoryEvents';
export function initializeGame() {
    initializePlayerSprites(draw);
    createWorld();
    revealAroundPlayer();
    new ResizeObserver(resize).observe(canvas);
    bindMovementEvents();
    bindPanelsEvents();
    bindStoreEvents();
    bindInventoryEvents();
    log('Sua jornada pelo Bosque Sussurrante começa.');
    log('Dizem que as criaturas ficam mais fortes a cada vitória.');
    updateUI();
    void initializeSpriteRendering(draw);
}
