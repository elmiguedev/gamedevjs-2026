import type { CarPart } from './CarPart';

export interface CarCraftJob {
  part: CarPart;
  startedAt: number;
  craftTimeSeconds: number;
}
