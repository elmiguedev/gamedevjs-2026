import { GameObjects, Scene } from 'phaser';
import type { Car } from '@/core/domain/Car';
import type { CarSlot } from '@/core/domain/CarSlot';
import { CarPartDetailsEntity } from '@/game/entities/CarPartDetailsEntity';
import { CarStatusEntity } from '@/game/entities/CarStatusEntity';
import { PartSlotEntity } from '@/game/entities/PartSlotEntity';

export class CarEntity extends GameObjects.Container {
  private selectedSlot: CarSlot;
  private readonly detailsEntity: CarPartDetailsEntity;

  constructor(scene: Scene, x: number, y: number, private readonly car: Car) {
    super(scene, x, y);

    scene.add.existing(this);
    this.setDepth(5);
    this.selectedSlot = this.car.slots.chassis;
    this.detailsEntity = new CarPartDetailsEntity(this.scene, 170, -6, this.selectedSlot);

    this.render();
  }

  private render(): void {
    this.addTitle();
    this.addChassis();
    this.addWheels();
    this.addTopModules();
    this.addSpoiler();
    this.addStatus();
  }

  private addTitle(): void {
    const title = this.scene.add.text(0, -190, 'Car', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add(title);
  }

  private addChassis(): void {
    this.add(new PartSlotEntity(this.scene, 0, 0, 110, 190, this.car.slots.chassis, (slot) => this.selectSlot(slot)));
  }

  private addWheels(): void {
    const wheelX = 74;
    const frontY = -68;
    const rearY = 68;
    const wheelWidth = 22;
    const wheelHeight = 40;

    this.add(new PartSlotEntity(this.scene, -wheelX, frontY, wheelWidth, wheelHeight, this.car.slots.wheels.frontLeft, (slot) => this.selectSlot(slot)));
    this.add(new PartSlotEntity(this.scene, wheelX, frontY, wheelWidth, wheelHeight, this.car.slots.wheels.frontRight, (slot) => this.selectSlot(slot)));
    this.add(new PartSlotEntity(this.scene, -wheelX, rearY, wheelWidth, wheelHeight, this.car.slots.wheels.rearLeft, (slot) => this.selectSlot(slot)));
    this.add(new PartSlotEntity(this.scene, wheelX, rearY, wheelWidth, wheelHeight, this.car.slots.wheels.rearRight, (slot) => this.selectSlot(slot)));
  }

  private addTopModules(): void {
    this.add(new PartSlotEntity(this.scene, 0, -132, 76, 34, this.car.slots.engine, (slot) => this.selectSlot(slot)));
    this.add(new PartSlotEntity(this.scene, -72, -132, 30, 24, this.car.slots.steering, (slot) => this.selectSlot(slot)));
    this.add(new PartSlotEntity(this.scene, 72, -132, 24, 24, this.car.slots.nitro, (slot) => this.selectSlot(slot)));
  }

  private addSpoiler(): void {
    this.add(new PartSlotEntity(this.scene, 0, 132, 88, 22, this.car.slots.spoiler, (slot) => this.selectSlot(slot)));
  }

  private addStatus(): void {
    this.add(new CarStatusEntity(this.scene, 170, -76, this.car.attributes));
    this.detailsEntity.setPosition(170, 92);
    this.add(this.detailsEntity);
  }

  private selectSlot(slot: CarSlot): void {
    this.selectedSlot = slot;
    this.detailsEntity.update(slot);
  }
}
