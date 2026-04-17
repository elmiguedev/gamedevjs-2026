import type { CarPart, CarPartType } from './CarPart';

export class CarSlot {
  constructor(
    public readonly type: CarPartType,
    public part: CarPart | null = null,
    public equippedItemId: string | null = null,
  ) {}

  fill(part: CarPart, itemId: string): void {
    if (part.type !== this.type) {
      throw new Error(`Invalid part type for slot ${this.type}`);
    }

    this.part = part;
    this.equippedItemId = itemId;
  }

  clear(): void {
    this.part = null;
    this.equippedItemId = null;
  }
}
