import { GameObjects, Scene } from 'phaser';
import type { Car } from '@/core/domain/Car';
import type { CarSlot } from '@/core/domain/CarSlot';
import { CarSlotCardEntity } from '@/game/entities/CarSlotCardEntity';

type SlotCard = {
  slotId: string;
  entity: CarSlotCardEntity;
};

type CarEntityOptions = {
  onSelectSlot: (slot: CarSlot) => void;
  selectedSlotId: string;
};

export class CarEntity extends GameObjects.Container {
  // entities
  // ------------

  private readonly draft: GameObjects.Image;
  private readonly slotCards: SlotCard[] = [];

  // constructor
  // ----------------

  constructor(scene: Scene, x: number, y: number, car: Car, options: CarEntityOptions) {
    super(scene, x, y);

    this.draft = this.scene.add.image(54, 36, 'car-draft');
    this.draft.setOrigin(0.5);
    this.draft.setDisplaySize(228, 135);

    const slots: Array<{ slot: CarSlot; y: number }> = [
      { slot: car.slots.chassis, y: -112 },
      { slot: car.slots.engine, y: -84 },
      { slot: car.slots.steering, y: -56 },
      { slot: car.slots.nitro, y: -28 },
      { slot: car.slots.wheels.frontLeft, y: 0 },
      { slot: car.slots.wheels.frontRight, y: 28 },
      { slot: car.slots.wheels.rearLeft, y: 56 },
      { slot: car.slots.wheels.rearRight, y: 84 },
      { slot: car.slots.spoiler, y: 112 },
    ];

    this.add(this.draft);

    slots.forEach(({ slot, y: slotY }) => {
      const card = new CarSlotCardEntity(scene, -154, slotY, 96, 28, slot, (selectedSlot) => options.onSelectSlot(selectedSlot));
      this.slotCards.push({ slotId: slot.id, entity: card });
      this.add(card);
    });

    this.scene.add.existing(this);
    this.setDepth(4);

    this.refresh(car, options.selectedSlotId);
  }

  // behavior methods
  // ------------------

  refresh(car: Car, selectedSlotId: string): void {
    this.draft.setDisplaySize(228, 135);
    this.slotCards.forEach(({ slotId, entity }) => {
      const slot = this.findSlot(car, slotId);
      if (!slot) {
        return;
      }

      entity.refresh(slot, slot.id === selectedSlotId);
    });
  }

  private findSlot(car: Car, slotId: string): CarSlot | null {
    const slots = [
      car.slots.chassis,
      car.slots.wheels.frontLeft,
      car.slots.wheels.frontRight,
      car.slots.wheels.rearLeft,
      car.slots.wheels.rearRight,
      car.slots.engine,
      car.slots.steering,
      car.slots.nitro,
      car.slots.spoiler,
    ];

    return slots.find((slot) => slot.id === slotId) ?? null;
  }
}
