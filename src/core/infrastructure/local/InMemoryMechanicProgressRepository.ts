import { createInitialMechanicProgress, type MechanicProgress } from '@/core/domain/MechanicProgress';
import type { MechanicProgressRepository } from '@/core/domain/MechanicProgressRepository';

const XP_TO_NEXT_LEVEL: Record<number, number> = {
  1: 20,
  2: 35,
  3: 55,
  4: 80,
  5: 110,
  6: 145,
};

export class InMemoryMechanicProgressRepository implements MechanicProgressRepository {
  private progress: MechanicProgress = createInitialMechanicProgress();

  get(): MechanicProgress {
    return this.progress;
  }

  set(progress: MechanicProgress): void {
    this.progress = progress;
  }

  addXp(amount: number): MechanicProgress {
    let nextProgress = {
      ...this.progress,
      xp: this.progress.xp + amount,
      totalXp: this.progress.totalXp + amount,
    };

    while (true) {
      const xpNeeded = XP_TO_NEXT_LEVEL[nextProgress.level];

      if (!xpNeeded || nextProgress.xp < xpNeeded) {
        break;
      }

      nextProgress = {
        ...nextProgress,
        level: nextProgress.level + 1,
        xp: nextProgress.xp - xpNeeded,
      };
    }

    this.progress = nextProgress;
    return this.progress;
  }

  getXpToNextLevel(): number {
    return XP_TO_NEXT_LEVEL[this.progress.level] ?? XP_TO_NEXT_LEVEL[6] ?? 145;
  }
}
