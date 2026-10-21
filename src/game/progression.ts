export function experienceNeeded(level: number): number {
  return 100 + (level - 1) * 80;
}

export function resolveLevelUps(level: number, experience: number): { level: number; experience: number; gains: number } {
  let nextLevel = level, remainingExperience = experience, gains = 0;
  while (remainingExperience >= experienceNeeded(nextLevel)) {
    remainingExperience -= experienceNeeded(nextLevel);
    nextLevel++; gains++;
  }
  return { level: nextLevel, experience: remainingExperience, gains };
}
