import type { ClassId, ClassSkill, Point } from '../types';

export function tileDistance(from: Point, to: Point): number {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

export function isWithinRange(from: Point, to: Point, range: number): boolean {
  return tileDistance(from, to) <= range;
}

export function calculateSkillDamage(options: {
  power: number;
  level: number;
  classId: ClassId;
  equipmentAttack: number;
  skill?: ClassSkill;
  distance: number;
}): number {
  const { power, level, classId, equipmentAttack, skill, distance } = options;
  const classMultiplier = classId === 'arcanist' && skill ? 1.2 : 1;
  const levelBonus = (level - 1) * (classId === 'arcanist' ? 5 : 4);
  return Math.round((power + equipmentAttack) * classMultiplier + levelBonus);
}

export function calculateIncomingDamage(enemyDamage: number, defense: number, guardReduction = 0): number {
  return Math.max(1, Math.round((enemyDamage - defense) * (1 - guardReduction)));
}

export function skillRange(skill: ClassSkill | undefined, basicRange = 1): number {
  return skill?.mode === 'damage' ? skill.range : basicRange;
}
