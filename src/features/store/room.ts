import { propArt } from '../../ui/spriteArt';

export function roomBackdrop() {
  return `<div class="room-backdrop" aria-hidden="true">
    <div class="room-wall"><span class="room-window"></span><span class="room-crest">✦</span><span class="room-window"></span></div>
    <div class="room-lamp room-lamp-left">${propArt('lamp')}</div>
    <div class="room-lamp room-lamp-right">${propArt('lamp')}</div>
    <div class="room-plant room-plant-left">${propArt('plant')}</div>
    <div class="room-plant room-plant-right">${propArt('plant')}</div>
    <div class="room-rug">${propArt('rug')}</div>
    <div class="room-crates">${propArt('barrel')}</div>
    <div class="room-threshold"></div>
  </div>`;
}

export function roomCaption(title: string, text: string) {
  return `<div class="room-caption"><span>✦</span><div><b>${title}</b><small>${text}</small></div></div>`;
}
