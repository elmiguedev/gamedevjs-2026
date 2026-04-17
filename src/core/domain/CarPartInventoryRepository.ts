import type { CarPartInventoryItem } from './CarPartInventory';
import type { CarPart } from './CarPart';

export interface CarPartInventoryRepository {
  findAll(): CarPartInventoryItem[];
  add(part: CarPart): CarPartInventoryItem;
  remove(id: string): CarPartInventoryItem | undefined;
  findById(id: string): CarPartInventoryItem | undefined;
  replace(item: CarPartInventoryItem): void;
  setEquipped(id: string, equipped: boolean): void;
  subscribe(listener: (items: CarPartInventoryItem[]) => void): () => void;
}
