import type { CarPart, CarPartType } from './CarPart';

export class CarSlot {
  constructor(
    public readonly type: CarPartType,
    public part: CarPart | null = null,
  ) {}

  fill(part: CarPart): void {
    if (part.type !== this.type) {
      throw new Error(`Invalid part type for slot ${this.type}`);
    }

    this.part = part;
  }

  clear(): void {
    this.part = null;
  }
}
