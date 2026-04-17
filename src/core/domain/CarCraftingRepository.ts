import type { CarCraftJob } from './CarCrafting';
import type { CarPart } from './CarPart';

export interface CraftingStatus {
  active: CarCraftJob | null;
  ready: CarPart | null;
}

export interface CarCraftingRepository {
  getStatus(now?: number): CraftingStatus;
  start(part: CarPart, now?: number): CarCraftJob;
  claimReady(now?: number): CarPart | null;
}
