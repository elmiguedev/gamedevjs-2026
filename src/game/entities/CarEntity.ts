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

  private draft?: GameObjects.Image;
  private slotCards: SlotCard[] = [];

  // state
  // ------------

  private car: Car;
  private carOptions: CarEntityOptions;

  // constructor
  // ----------------

  constructor(scene: Scene, x: number, y: number, car: Car, options: CarEntityOptions) {
    super(scene, x, y);
    this.car = car;
    this.carOptions = options;

    this.createDraft();
    this.createSlots();

    this.scene.add.existing(this);
    this.setDepth(4);
    this.refresh(car, options.selectedSlotId);
  }

  // creation methods
  // ----------------

  createDraft() {
    this.draft = this.scene.add.image(100, 0, 'car-draft');
    this.draft.setOrigin(0);
    this.add(this.draft);
  }

  createSlots() {
    const baseX = 0;
    const baseY = 0;
    const stepY = 70;

    this.createSlot(baseX, baseY + stepY, this.car.slots.chassis);
    this.createSlot(baseX, baseY, this.car.slots.engine);
    this.createSlot(baseX, baseY + stepY * 2, this.car.slots.steering);
    this.createSlot(baseX, baseY + stepY * 3, this.car.slots.nitro);
    this.createSlot(baseX, baseY + stepY * 4, this.car.slots.spoiler);
    this.createSlot(baseX, baseY + stepY * 5, this.car.slots.wheels);
  }

  createSlot(x: number, y: number, slot: CarSlot) {
    const cardWidth = 150;
    const cardHeight = 60;
    const card = new CarSlotCardEntity(
      this.scene,
      x,
      y,
      cardWidth,
      cardHeight,
      slot,
      (selectedSlot) => this.carOptions.onSelectSlot(selectedSlot)
    );
    this.slotCards.push({ slotId: slot.id, entity: card });
    this.add(card);
  }

  // behavior methods
  // ------------------

  refresh(car: Car, selectedSlotId: string): void {
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
      car.slots.wheels,
      car.slots.engine,
      car.slots.steering,
      car.slots.nitro,
      car.slots.spoiler,
    ];

    return slots.find((slot) => slot.id === slotId) ?? null;
  }
}
