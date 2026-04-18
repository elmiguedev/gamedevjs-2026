import type { CarPart, CarPartType } from './CarPart';

export class CarSlot {
  constructor(
    public readonly id: string,
    public readonly type: CarPartType,
    public part: CarPart | null = null,
    public equippedItemId: string | null = null,
    public condition: number = 100,
    public repairingUntil: number | null = null,
  ) {}

  fill(part: CarPart, itemId: string): void {
    if (part.type !== this.type) {
      throw new Error(`Invalid part type for slot ${this.type}`);
    }

    this.part = part;
    this.equippedItemId = itemId;
    this.condition = 100;
    this.repairingUntil = null;
  }

  clear(): void {
    this.part = null;
    this.equippedItemId = null;
    this.condition = 100;
    this.repairingUntil = null;
  }

  applyDamage(amount: number): void {
    if (!this.part) {
      return;
    }

    this.condition = Math.max(0, this.condition - amount * 10);
  }

  startRepair(now: number, cooldownSeconds: number): void {
    if (!this.part || this.condition >= 100) {
      return;
    }

    this.repairingUntil = now + cooldownSeconds * 1000;
  }

  tickRepair(now: number): boolean {
    if (!this.repairingUntil || now < this.repairingUntil) {
      return false;
    }

    this.condition = 100;
    this.repairingUntil = null;
    return true;
  }

  isRepairing(now: number = Date.now()): boolean {
    return this.repairingUntil !== null && now < this.repairingUntil;
  }

  isUsable(): boolean {
    return this.part !== null && this.condition > 0;
  }

  isFullyRepaired(): boolean {
    return this.part !== null && this.condition >= 100 && !this.isRepairing();
  }
}
