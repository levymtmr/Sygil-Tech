import { state } from '../game/state';
import { currentClass } from '../features/character/classes';
import { items } from '../data/items';
import { ctx } from '../ui/dom';
import type { Enemy } from '../types';
import { drawClassSprite, drawMonsterSprite } from './sprites';
import { drawPlayerSprite } from './playerSprites';

export function drawHero(cx: number, cy: number, s: number) {
    const motion = state.mode === 'battle' ? state.battlePlayerMotion : state.worldMotion;
    const facing = state.mode === 'battle' ? state.battleFacing : state.worldFacing;
    if (drawPlayerSprite(ctx, state.classId, facing, motion, cx, cy + s * .48, s * 1.55)) return;
    const moving = Boolean(state.mode === 'battle' ? state.battlePlayerMotion : state.worldMotion);
    if (drawClassSprite(ctx, state.classId, cx, cy + s * .48, s * 1.8, moving)) return;
    const heroClass = currentClass(), armor = items[state.equipment.armor ?? ''], weapon = items[state.equipment.weapon ?? ''];
    const skin = '#e3bc91', cloth = heroClass.color, accent = heroClass.accent;
    ctx.save();
    ctx.fillStyle = '#18231d';
    ctx.globalAlpha = .55;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * .42, s * .34, s * .14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Legs and boots
    ctx.fillStyle = '#282a2a';
    ctx.fillRect(cx - s * .14, cy + s * .2, s * .1, s * .22);
    ctx.fillRect(cx + s * .04, cy + s * .2, s * .1, s * .22);
    ctx.fillStyle = '#5d493c';
    ctx.fillRect(cx - s * .19, cy + s * .36, s * .16, s * .08);
    ctx.fillRect(cx + s * .03, cy + s * .36, s * .16, s * .08);
    // Class-specific cloak, tunic, or plate silhouette
    if (state.classId === 'archer') {
        ctx.fillStyle = '#304536';
        ctx.beginPath();
        ctx.moveTo(cx - s * .16, cy - s * .03);
        ctx.lineTo(cx - s * .27, cy + s * .34);
        ctx.lineTo(cx, cy + s * .27);
        ctx.lineTo(cx + s * .27, cy + s * .34);
        ctx.lineTo(cx + s * .16, cy - s * .03);
        ctx.closePath();
        ctx.fill();
    }
    ctx.fillStyle = armor?.slot === 'armor' ? (armor.visualColor ?? cloth) : cloth;
    ctx.beginPath();
    ctx.moveTo(cx - s * .17, cy - s * .05);
    ctx.lineTo(cx + s * .17, cy - s * .05);
    ctx.lineTo(cx + s * .22, cy + s * .24);
    ctx.lineTo(cx - s * .22, cy + s * .24);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.globalAlpha = .88;
    ctx.fillRect(cx - s * .04, cy - s * .02, s * .08, s * .24);
    ctx.globalAlpha = 1;
    // Arms and class-specific shoulders
    ctx.strokeStyle = skin;
    ctx.lineWidth = s * .085;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - s * .15, cy);
    ctx.lineTo(cx - s * .28, cy + s * .17);
    ctx.moveTo(cx + s * .15, cy);
    ctx.lineTo(cx + s * .27, cy + s * .13);
    ctx.stroke();
    // Face
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(cx, cy - s * .19, s * .145, 0, Math.PI * 2);
    ctx.fill();
    if (state.classId === 'knight') {
        ctx.fillStyle = '#9eafbc';
        ctx.beginPath();
        ctx.arc(cx, cy - s * .22, s * .17, Math.PI, Math.PI * 2);
        ctx.lineTo(cx + s * .17, cy - s * .08);
        ctx.lineTo(cx - s * .17, cy - s * .08);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#dde5e7';
        ctx.fillRect(cx - s * .1, cy - s * .1, s * .2, s * .035);
        ctx.strokeStyle = '#d9e2e8';
        ctx.lineWidth = s * .045;
        ctx.beginPath();
        ctx.moveTo(cx - s * .25, cy + s * .04);
        ctx.lineTo(cx - s * .34, cy + s * .12);
        ctx.lineTo(cx - s * .28, cy + s * .23);
        ctx.lineTo(cx - s * .19, cy + s * .17);
        ctx.closePath();
        ctx.stroke();
    }
    else if (state.classId === 'arcanist') {
        ctx.fillStyle = '#44315f';
        ctx.beginPath();
        ctx.moveTo(cx - s * .2, cy - s * .14);
        ctx.lineTo(cx, cy - s * .42);
        ctx.lineTo(cx + s * .2, cy - s * .14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(cx, cy - s * .31, s * .035, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (state.classId === 'archer') {
        ctx.fillStyle = '#344c37';
        ctx.beginPath();
        ctx.arc(cx, cy - s * .21, s * .18, Math.PI, Math.PI * 2);
        ctx.lineTo(cx + s * .15, cy - s * .1);
        ctx.quadraticCurveTo(cx, cy - s * .16, cx - s * .15, cy - s * .1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = accent;
        ctx.lineWidth = s * .025;
        ctx.beginPath();
        ctx.moveTo(cx - s * .17, cy - s * .12);
        ctx.lineTo(cx + s * .17, cy - s * .12);
        ctx.stroke();
    }
    // Equipped main-hand weapon changes the silhouette.
    ctx.strokeStyle = weapon?.visualColor ?? heroClass.accent;
    ctx.lineWidth = s * .045;
    ctx.lineCap = 'round';
    if (weapon?.icon === 'staff') {
        ctx.beginPath();
        ctx.moveTo(cx + s * .28, cy + s * .22);
        ctx.lineTo(cx + s * .32, cy - s * .35);
        ctx.stroke();
        ctx.fillStyle = '#d9c2ff';
        ctx.shadowColor = '#c59bff';
        ctx.shadowBlur = s * .14;
        ctx.beginPath();
        ctx.arc(cx + s * .32, cy - s * .37, s * .055, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    else if (weapon?.icon === 'bow') {
        ctx.beginPath();
        ctx.arc(cx + s * .22, cy + s * .08, s * .22, Math.PI * 1.5, Math.PI * .5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + s * .22, cy - s * .14);
        ctx.lineTo(cx + s * .22, cy + s * .3);
        ctx.stroke();
    }
    else {
        ctx.beginPath();
        ctx.moveTo(cx + s * .22, cy + s * .19);
        ctx.lineTo(cx + s * .31, cy - s * .18);
        ctx.moveTo(cx + s * .25, cy + s * .05);
        ctx.lineTo(cx + s * .37, cy + s * .08);
        ctx.stroke();
        if (weapon?.icon === 'mace') {
            ctx.fillStyle = '#e7c675';
            ctx.fillRect(cx + s * .27, cy - s * .23, s * .1, s * .08);
        }
    }
    const charm = items[state.equipment.charm ?? ''];
    if (charm) {
        ctx.fillStyle = charm.visualColor ?? accent;
        ctx.strokeStyle = charm.visualColor ?? accent;
        ctx.beginPath();
        ctx.moveTo(cx, cy + s * .015);
        ctx.lineTo(cx + s * .045, cy + s * .085);
        ctx.lineTo(cx, cy + s * .14);
        ctx.lineTo(cx - s * .045, cy + s * .085);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy + s * .08, s * .075, Math.PI * 1.08, Math.PI * 1.92);
        ctx.stroke();
    }
    if (armor?.bonus?.defense && state.classId !== 'knight') {
        ctx.fillStyle = accent;
        ctx.globalAlpha = .85;
        ctx.beginPath();
        ctx.arc(cx - s * .16, cy - s * .02, s * .055, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
    ctx.restore();
}

export function drawCreature(cx: number, cy: number, s: number, e: Enemy) {
    if (drawMonsterSprite(ctx, e, cx, cy + s * .5, s * 2.5, state.enemyMotions.has(e.id))) {
        if (state.mode === 'battle' && state.battleEnemies.includes(e)) {
            const width = s * 1.4;
            ctx.fillStyle = '#342f2d';
            ctx.fillRect(cx - width / 2, cy - s * 1.7, width, s * .12);
            ctx.fillStyle = '#dd8172';
            ctx.fillRect(cx - width / 2, cy - s * 1.7, width * e.hp / e.maxHp, s * .12);
        }
        return;
    }
    ctx.fillStyle = '#18231d';
    ctx.globalAlpha = .45;
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * .53, s * .75, s * .2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = e.color;
    if (e.kind === 'slime') {
        ctx.beginPath();
        ctx.ellipse(cx, cy + s * .08, s * .72, s * .6, 0, Math.PI, Math.PI * 2);
        ctx.lineTo(cx + s * .68, cy + s * .42);
        ctx.quadraticCurveTo(cx, cy + s * .67, cx - s * .68, cy + s * .42);
        ctx.closePath();
        ctx.fill();
    }
    else if (e.kind === 'wolf') {
        ctx.beginPath();
        ctx.ellipse(cx, cy, s * .67, s * .4, -.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - s * .3, cy - s * .15);
        ctx.lineTo(cx - s * .43, cy - s * .75);
        ctx.lineTo(cx - s * .05, cy - s * .35);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + s * .13, cy - s * .18);
        ctx.lineTo(cx + s * .32, cy - s * .68);
        ctx.lineTo(cx + s * .46, cy - s * .08);
        ctx.fill();
        ctx.fillRect(cx + s * .35, cy + s * .2, s * .4, s * .14);
    }
    else {
        ctx.globalAlpha = .75;
        ctx.beginPath();
        ctx.arc(cx, cy, s * .48, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#f3e4ae';
        ctx.beginPath();
        ctx.arc(cx, cy, s * .19, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#342d29';
    ctx.beginPath();
    ctx.arc(cx - s * .16, cy, s * .045, 0, Math.PI * 2);
    ctx.arc(cx + s * .14, cy, s * .045, 0, Math.PI * 2);
    ctx.fill();
    if (state.mode === 'battle' && state.battleEnemies.includes(e)) {
        const bw = s * 1.4;
        ctx.fillStyle = '#342f2d';
        ctx.fillRect(cx - bw / 2, cy - s * .8, bw, s * .1);
        ctx.fillStyle = '#dd8172';
        ctx.fillRect(cx - bw / 2, cy - s * .8, bw * e.hp / e.maxHp, s * .1);
    }
}
