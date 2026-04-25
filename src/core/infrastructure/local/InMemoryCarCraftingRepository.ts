import type { CarCraftJob } from '@/core/domain/CarCrafting';
import type { CarCraftingRepository, CraftingStatus } from '@/core/domain/CarCraftingRepository';
import type { CraftableItem } from '@/core/domain/CarCrafting';

export class InMemoryCarCraftingRepository implements CarCraftingRepository {
  private active: CarCraftJob | null = null;
  private ready: CraftableItem | null = null;

  snapshot(): CraftingStatus {
    return {
      active: this.active,
      ready: this.ready,
    };
  }

  hydrate(snapshot: CraftingStatus): void {
    this.active = snapshot.active;
    this.ready = snapshot.ready;
  }

  getStatus(now: number = Date.now()): CraftingStatus {
    this.sync(now);

    return {
      active: this.active,
      ready: this.ready,
    };
  }

  start(part: CraftableItem, now: number = Date.now()): CarCraftJob {
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

  claimReady(now: number = Date.now()): CraftableItem | null {
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
