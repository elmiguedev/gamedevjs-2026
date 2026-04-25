import type { CarCraftJob } from './CarCrafting';
import type { CraftableItem } from './CarCrafting';

export interface CraftingStatus {
  active: CarCraftJob | null;
  ready: CraftableItem | null;
}

export interface CarCraftingRepository {
  getStatus(now?: number): CraftingStatus;
  start(part: CraftableItem, now?: number): CarCraftJob;
  claimReady(now?: number): CraftableItem | null;
}
