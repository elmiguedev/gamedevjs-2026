export interface MechanicProgress {
  level: number;
  xp: number;
  totalXp: number;
}

export const createInitialMechanicProgress = (): MechanicProgress => ({
  level: 1,
  xp: 0,
  totalXp: 0,
});
