import type { CarPart } from './CarPart';
import type { WorkshopTool } from './WorkshopTool';

export type CraftableItem = CarPart | WorkshopTool;

export const isWorkshopTool = (item: CraftableItem): item is WorkshopTool => 'effect' in item;

export interface CarCraftJob {
  part: CraftableItem;
  startedAt: number;
  craftTimeSeconds: number;
}
