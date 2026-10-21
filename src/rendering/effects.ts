import { state } from '../game/state';
import { ctx } from '../ui/dom';
import { currentClass } from '../features/character/classes';

export function drawCombatEffects(ox: number, oy: number, cell: number) {
    const now = performance.now();
    for (const effect of state.combatEffects) {
        const progress = Math.min(1, Math.max(0, (now - effect.startedAt) / effect.duration));
        const fromX = ox + (effect.from.x + .5) * cell, fromY = oy + (effect.from.y + .45) * cell;
        const toX = ox + (effect.to.x + .5) * cell, toY = oy + (effect.to.y + .48) * cell;
        ctx.save();
        if (effect.kind === 'damage') {
            ctx.globalAlpha = 1 - progress;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `700 ${Math.max(14, cell * .28)}px "DM Sans", sans-serif`;
            ctx.lineWidth = Math.max(2, cell * .045);
            ctx.strokeStyle = '#28231f';
            ctx.fillStyle = '#ffe0a0';
            const text = `−${effect.damage ?? 0}`;
            ctx.strokeText(text, toX, toY - cell * (.15 + progress * .72));
            ctx.fillText(text, toX, toY - cell * (.15 + progress * .72));
        }
        else if (effect.kind === 'classAttack') {
            const variant = effect.variant ?? 'basic';
            const dx = toX - fromX, dy = toY - fromY, angle = Math.atan2(dy, dx);
            const palette: Record<string, string> = { violet: '#d7a8ff', blue: '#9adbf5', green: '#c5ed91', gold: '#ffe08b', orange: '#ffc27e' };
            const tint = palette[effect.tint ?? ''] ?? effect.tint ?? currentClass().accent;
            const projectile = (offset = 0, delay = 0, heavy = false) => {
                const t = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
                if (t <= 0)
                    return;
                const x = fromX + dx * t + Math.cos(angle + Math.PI / 2) * offset;
                const y = fromY + dy * t + Math.sin(angle + Math.PI / 2) * offset;
                ctx.globalAlpha = Math.min(1, t * 5) * (1 - t * .28);
                ctx.strokeStyle = tint;
                ctx.fillStyle = '#fff7dc';
                ctx.lineWidth = heavy ? Math.max(3, cell * .065) : Math.max(2, cell * .035);
                ctx.shadowColor = tint;
                ctx.shadowBlur = cell * .28;
                ctx.beginPath();
                ctx.moveTo(x - Math.cos(angle) * cell * (heavy ? .4 : .24), y - Math.sin(angle) * cell * (heavy ? .4 : .24));
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - Math.cos(angle - .55) * cell * .14, y - Math.sin(angle - .55) * cell * .14);
                ctx.lineTo(x - Math.cos(angle + .55) * cell * .14, y - Math.sin(angle + .55) * cell * .14);
                ctx.closePath();
                ctx.fill();
            };
            if (variant === 'aimed-shot' || variant === 'piercing-arrow') {
                projectile(0, 0, variant === 'piercing-arrow');
                if (progress > .76) {
                    ctx.globalAlpha = (progress - .76) * 4;
                    ctx.strokeStyle = tint;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(toX, toY, cell * (.12 + (progress - .76)), 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            else if (variant === 'rapid-volley') {
                projectile(-cell * .13, 0, false);
                projectile(0, .18, true);
                projectile(cell * .13, .36, false);
            }
            else if (variant === 'arcane-bolt' || variant === 'frost-lance' || variant === 'shadow-knife') {
                const ease = 1 - Math.pow(1 - progress, 2), x = fromX + dx * ease, y = fromY + dy * ease;
                ctx.globalAlpha = .95;
                ctx.shadowColor = tint;
                ctx.shadowBlur = cell * .38;
                ctx.fillStyle = variant === 'frost-lance' ? '#d7f7ff' : tint;
                if (variant === 'frost-lance') {
                    ctx.translate(x, y);
                    ctx.rotate(angle);
                    ctx.beginPath();
                    ctx.moveTo(cell * .23, 0);
                    ctx.lineTo(-cell * .16, -cell * .11);
                    ctx.lineTo(-cell * .1, 0);
                    ctx.lineTo(-cell * .16, cell * .11);
                    ctx.closePath();
                    ctx.fill();
                    ctx.rotate(-angle);
                    ctx.translate(-x, -y);
                }
                else {
                    ctx.beginPath();
                    ctx.arc(x, y, cell * (variant === 'shadow-knife' ? .095 : .12), 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = .5;
                ctx.strokeStyle = tint;
                ctx.lineWidth = Math.max(2, cell * .04);
                ctx.beginPath();
                ctx.moveTo(fromX, fromY);
                ctx.lineTo(x, y);
                ctx.stroke();
                if (progress > .7) {
                    ctx.globalAlpha = 1 - progress;
                    ctx.beginPath();
                    ctx.arc(toX, toY, cell * (.12 + progress * .3), 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            else if (variant === 'radiant-bolt') {
                const reach = Math.min(1, progress * 1.2), x = fromX + dx * reach, y = fromY + dy * reach;
                ctx.globalAlpha = progress < .75 ? .8 : 1 - progress;
                ctx.strokeStyle = '#fff1a7';
                ctx.shadowColor = '#ffe785';
                ctx.shadowBlur = cell * .45;
                ctx.lineWidth = cell * .12;
                ctx.beginPath();
                ctx.moveTo(fromX, fromY);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.globalAlpha = progress < .72 ? 0 : (1 - progress) * 3.5;
                ctx.lineWidth = Math.max(2, cell * .035);
                ctx.beginPath();
                ctx.moveTo(toX - cell * .15, toY);
                ctx.lineTo(toX + cell * .15, toY);
                ctx.moveTo(toX, toY - cell * .15);
                ctx.lineTo(toX, toY + cell * .15);
                ctx.stroke();
            }
            else if (variant === 'shield-bash') {
                ctx.globalAlpha = 1 - progress;
                ctx.strokeStyle = '#d9edff';
                ctx.fillStyle = 'rgba(139,190,222,.22)';
                ctx.lineWidth = Math.max(2, cell * .055);
                ctx.shadowColor = '#8bc9ec';
                ctx.shadowBlur = cell * .25;
                ctx.beginPath();
                ctx.arc(toX, toY, cell * (.16 + progress * .43), 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(toX, toY - cell * .18);
                ctx.lineTo(toX + cell * .15, toY - cell * .1);
                ctx.lineTo(toX + cell * .12, toY + cell * .09);
                ctx.lineTo(toX, toY + cell * .19);
                ctx.lineTo(toX - cell * .12, toY + cell * .09);
                ctx.lineTo(toX - cell * .15, toY - cell * .1);
                ctx.closePath();
                ctx.stroke();
            }
            else if (variant === 'cleave') {
                ctx.globalAlpha = 1 - progress;
                ctx.strokeStyle = '#ffe19a';
                ctx.lineWidth = Math.max(3, cell * .075);
                ctx.shadowColor = '#ffd15f';
                ctx.shadowBlur = cell * .24;
                ctx.beginPath();
                ctx.arc(toX, toY, cell * .34, angle - 1.15 + progress * .2, angle + 1.15 + progress * .2);
                ctx.stroke();
            }
            else if (variant === 'quick-cut' || variant === 'riposte' || variant.startsWith('basic-')) {
                const sweep = progress * Math.PI * 1.2;
                ctx.globalAlpha = 1 - progress * .55;
                ctx.strokeStyle = tint;
                ctx.lineWidth = Math.max(3, cell * .06);
                ctx.shadowColor = tint;
                ctx.shadowBlur = cell * .23;
                ctx.beginPath();
                ctx.arc(toX, toY, cell * .35, angle - .85 + sweep, angle + .22 + sweep);
                ctx.stroke();
                if (variant === 'riposte' && progress > .35) {
                    ctx.globalAlpha = 1 - progress;
                    ctx.beginPath();
                    ctx.arc(toX, toY, cell * (.3 + progress * .35), 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            else {
                projectile(0, 0, true);
            }
        }
        else if (effect.kind === 'bolt') {
            const eased = 1 - Math.pow(1 - progress, 2);
            const x = fromX + (toX - fromX) * eased, y = fromY + (toY - fromY) * eased;
            ctx.globalAlpha = .9 - progress * .35;
            ctx.strokeStyle = '#e5b9f6';
            ctx.lineWidth = Math.max(2, cell * .055);
            ctx.shadowColor = '#ca87f1';
            ctx.shadowBlur = cell * .38;
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.fillStyle = '#fff1ff';
            ctx.beginPath();
            ctx.arc(x, y, cell * (.09 + Math.sin(progress * Math.PI) * .07), 0, Math.PI * 2);
            ctx.fill();
            if (progress > .76) {
                ctx.globalAlpha = (progress - .76) * 4;
                ctx.strokeStyle = '#f2d5ff';
                ctx.beginPath();
                ctx.arc(toX, toY, cell * (.12 + (progress - .76) * .8), 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        else if (effect.kind === 'heal') {
            ctx.globalAlpha = 1 - progress;
            ctx.strokeStyle = '#b4f2a6';
            ctx.lineWidth = Math.max(2, cell * .05);
            ctx.shadowColor = '#9be58a';
            ctx.shadowBlur = cell * .35;
            ctx.beginPath();
            ctx.arc(toX, toY, cell * (.16 + progress * .4), 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#e3ffd2';
            ctx.textAlign = 'center';
            ctx.font = `700 ${Math.max(13, cell * .24)}px "DM Sans", sans-serif`;
            ctx.fillText(`+${effect.damage ?? 0}`, toX, toY - cell * (.25 + progress * .6));
        }
        else if (effect.kind === 'guard') {
            ctx.globalAlpha = 1 - progress;
            ctx.strokeStyle = '#94d7f0';
            ctx.lineWidth = Math.max(2, cell * .045);
            ctx.shadowColor = '#7bc9ec';
            ctx.shadowBlur = cell * .35;
            ctx.beginPath();
            ctx.arc(toX, toY, cell * (.25 + progress * .48), Math.PI * 1.05, Math.PI * 1.95);
            ctx.stroke();
        }
        else if (effect.kind === 'impact') {
            ctx.globalAlpha = 1 - progress;
            ctx.strokeStyle = '#ff987a';
            ctx.lineWidth = Math.max(2, cell * .06);
            ctx.shadowColor = '#f26e63';
            ctx.shadowBlur = cell * .25;
            ctx.beginPath();
            ctx.arc(toX, toY, cell * (.12 + progress * .42), 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(235,93,78,.18)';
            ctx.fillRect(ox + effect.to.x * cell + 3, oy + effect.to.y * cell + 3, cell - 6, cell - 6);
        }
        else {
            const angle = Math.atan2(toY - fromY, toX - fromX);
            const isEnemy = effect.kind === 'enemyStrike';
            const reach = isEnemy ? progress : Math.min(1, progress * 1.5);
            const centerX = fromX + (toX - fromX) * reach, centerY = fromY + (toY - fromY) * reach;
            if (isEnemy) {
                ctx.globalAlpha = progress < .8 ? 1 : (1 - progress) * 5;
                ctx.translate(centerX, centerY);
                ctx.rotate(angle);
                ctx.strokeStyle = '#ff967a';
                ctx.lineWidth = Math.max(2, cell * .055);
                ctx.shadowColor = '#ef7063';
                ctx.shadowBlur = cell * .22;
                ctx.beginPath();
                ctx.moveTo(-cell * .28, cell * .2);
                ctx.quadraticCurveTo(0, -cell * .34, cell * .3, -cell * .14);
                ctx.stroke();
            }
            else {
                ctx.globalAlpha = 1 - progress * .45;
                ctx.translate(centerX, centerY);
                ctx.rotate(angle);
                ctx.strokeStyle = '#f6dda0';
                ctx.lineWidth = Math.max(2, cell * .06);
                ctx.shadowColor = '#f4c975';
                ctx.shadowBlur = cell * .2;
                ctx.beginPath();
                ctx.moveTo(-cell * .3, cell * .2);
                ctx.quadraticCurveTo(0, -cell * .42, cell * .34, -cell * .18);
                ctx.stroke();
                ctx.strokeStyle = '#fff4cf';
                ctx.lineWidth = Math.max(1, cell * .022);
                ctx.beginPath();
                ctx.moveTo(-cell * .22, cell * .27);
                ctx.quadraticCurveTo(cell * .02, -cell * .23, cell * .27, -cell * .1);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}
