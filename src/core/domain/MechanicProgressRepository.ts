import type { MechanicProgress } from './MechanicProgress';

export interface MechanicProgressRepository {
  get(): MechanicProgress;
  set(progress: MechanicProgress): void;
  addXp(amount: number): MechanicProgress;
  getXpToNextLevel(): number;
}
