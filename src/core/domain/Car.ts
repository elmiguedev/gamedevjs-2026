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
  wheels: {
    frontLeft: CarSlot;
    frontRight: CarSlot;
    rearLeft: CarSlot;
    rearRight: CarSlot;
  };
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
  constructor(public readonly slots: CarSlots) {}

  static createInitial(chassisPart: CarPart): Car {
    return new Car({
      chassis: new CarSlot('chasis', chassisPart, null),
      wheels: {
        frontLeft: new CarSlot('rueda'),
        frontRight: new CarSlot('rueda'),
        rearLeft: new CarSlot('rueda'),
        rearRight: new CarSlot('rueda'),
      },
      engine: new CarSlot('motor'),
      steering: new CarSlot('direccion'),
      nitro: new CarSlot('nitro'),
      spoiler: new CarSlot('aleron'),
    });
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
      return (
        this.slots.wheels.frontLeft.part === null ? this.slots.wheels.frontLeft :
        this.slots.wheels.frontRight.part === null ? this.slots.wheels.frontRight :
        this.slots.wheels.rearLeft.part === null ? this.slots.wheels.rearLeft :
        this.slots.wheels.rearRight.part === null ? this.slots.wheels.rearRight :
        this.slots.wheels.frontLeft
      );
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

  private listSlots(): CarSlot[] {
    return [
      this.slots.chassis,
      this.slots.wheels.frontLeft,
      this.slots.wheels.frontRight,
      this.slots.wheels.rearLeft,
      this.slots.wheels.rearRight,
      this.slots.engine,
      this.slots.steering,
      this.slots.nitro,
      this.slots.spoiler,
    ];
  }
}
