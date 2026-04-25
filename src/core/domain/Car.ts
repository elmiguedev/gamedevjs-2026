import type { CarPart, CarPartType } from './CarPart';
import type { CarPartInventoryItem } from './CarPartInventory';
import { CarSlot } from './CarSlot';

export interface CarAttributes {
  acceleration: number;
  speed: number;
  resistance: number;
  direction: number;
}

export interface CarSlots {
  chassis: CarSlot;
  wheels: CarSlot;
  engine: CarSlot;
  steering: CarSlot;
  nitro: CarSlot;
  spoiler: CarSlot;
}

export const zeroCarAttributes = (): CarAttributes => ({
  acceleration: 0,
  speed: 0,
  resistance: 0,
  direction: 0,
});

export class Car {
  constructor(
    public readonly slots: CarSlots,
    public fuel: number = 100,
    public readonly maxFuel: number = 100,
  ) {}

  static createInitial(chassisPart: CarPart, wheelsPart: CarPart): Car {
    return new Car({
      chassis: new CarSlot('chassis', 'chasis', chassisPart, null),
      wheels: new CarSlot('wheels', 'rueda', wheelsPart, null),
      engine: new CarSlot('engine', 'motor'),
      steering: new CarSlot('steering', 'direccion'),
      nitro: new CarSlot('nitro', 'nitro'),
      spoiler: new CarSlot('spoiler', 'aleron'),
    }, 100, 100);
  }

  get attributes(): CarAttributes {
    const total = zeroCarAttributes();

    for (const slot of this.listSlots()) {
      if (!slot.part) {
        continue;
      }

      total.acceleration += slot.part.stats.acceleration ?? 0;
      total.speed += slot.part.stats.speed ?? 0;
      total.resistance += slot.part.stats.resistance ?? 0;
      total.direction += slot.part.stats.direction ?? 0;
    }

    return total;
  }

  hasCompleteCar(): boolean {
    return this.listSlots().every((slot) => slot.part !== null);
  }

  hasRequiredRaceParts(): boolean {
    return this.listRequiredRaceSlots().every((slot) => slot.part !== null);
  }

  hasBrokenPart(): boolean {
    return this.listSlots().some((slot) => slot.part !== null && slot.condition <= 0);
  }

  canRace(): boolean {
    return this.listRequiredRaceSlots().every((slot) => slot.isUsable());
  }

  hasFuel(amount: number): boolean {
    return this.fuel >= amount;
  }

  consumeFuel(amount: number): void {
    this.fuel = Math.max(0, this.fuel - amount);
  }

  refillFuel(amount: number): void {
    this.fuel = Math.min(this.maxFuel, this.fuel + amount);
  }

  applyRaceDamage(amounts: Partial<Record<CarPartType, number>>): void {
    for (const [key, value] of Object.entries(amounts)) {
      if (typeof value !== 'number') {
        continue;
      }

      const slot = this.findSlotForPart(key as CarPartType);
      slot?.applyDamage(value);
    }
  }

  tickRepairs(now: number = Date.now()): boolean {
    return this.listSlots().some((slot) => slot.tickRepair(now));
  }

  getSlotById(slotId: string): CarSlot | null {
    const slots = this.listSlots();
    return slots.find((slot) => slot.id === slotId) ?? null;
  }

  equipItem(item: CarPartInventoryItem): string | null {
    const slot = this.findSlotForPart(item.part.type);

    if (!slot) {
      throw new Error(`No slot available for ${item.part.type}`);
    }

    if (slot.equippedItemId === item.id) {
      return item.id;
    }

    const previousEquippedItemId = slot.equippedItemId;
    slot.fill(item.part, item.id);
    return previousEquippedItemId;
  }

  isItemEquipped(itemId: string): boolean {
    return this.listSlots().some((slot) => slot.equippedItemId === itemId);
  }

  getEquippedItemIdForType(type: CarPartType): string | null {
    return this.findSlotForPart(type)?.equippedItemId ?? null;
  }

  isPartEquipped(part: CarPart): boolean {
    return this.listSlots().some((slot) => slot.part === part);
  }

  private findSlotForPart(type: CarPartType): CarSlot | null {
    if (type === 'rueda') {
      return this.slots.wheels;
    }

    const lookup: Record<Exclude<CarPartType, 'rueda'>, CarSlot> = {
      chasis: this.slots.chassis,
      nitro: this.slots.nitro,
      motor: this.slots.engine,
      direccion: this.slots.steering,
      aleron: this.slots.spoiler,
    };

    return lookup[type as Exclude<CarPartType, 'rueda'>] ?? null;
  }

  listSlots(): CarSlot[] {
    return [
      this.slots.chassis,
      this.slots.wheels,
      this.slots.engine,
      this.slots.steering,
      this.slots.nitro,
      this.slots.spoiler,
    ];
  }

  private listRequiredRaceSlots(): CarSlot[] {
    return [
      this.slots.chassis,
      this.slots.wheels,
      this.slots.engine,
      this.slots.steering,
    ];
  }
}
