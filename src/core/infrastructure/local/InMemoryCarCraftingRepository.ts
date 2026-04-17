import type { CarCraftJob } from '@/core/domain/CarCrafting';
import type { CarCraftingRepository, CraftingStatus } from '@/core/domain/CarCraftingRepository';
import type { CarPart } from '@/core/domain/CarPart';

export class InMemoryCarCraftingRepository implements CarCraftingRepository {
  private active: CarCraftJob | null = null;
  private ready: CarPart | null = null;

  getStatus(now: number = Date.now()): CraftingStatus {
    this.sync(now);

    return {
      active: this.active,
      ready: this.ready,
    };
  }

  start(part: CarPart, now: number = Date.now()): CarCraftJob {
    if (this.active || this.ready) {
      throw new Error('Crafting already in progress');
    }

    this.active = {
      part,
      startedAt: now,
      craftTimeSeconds: part.craftTimeSeconds,
    };

    return this.active;
  }

  claimReady(now: number = Date.now()): CarPart | null {
    this.sync(now);

    if (!this.ready) {
      return null;
    }

    const part = this.ready;
    this.ready = null;
    return part;
  }

  private sync(now: number): void {
    if (!this.active) {
      return;
    }

    const elapsedSeconds = (now - this.active.startedAt) / 1000;

    if (elapsedSeconds >= this.active.craftTimeSeconds) {
      this.ready = this.active.part;
      this.active = null;
    }
  }
}
