import { GameObjects, Scene } from 'phaser';
import type { Car } from '@/core/domain/Car';
import type { CarSlot } from '@/core/domain/CarSlot';
import { CarEquipmentEntity } from '@/game/entities/CarEquipmentEntity';
import { CarPartDetailsEntity } from '@/game/entities/CarPartDetailsEntity';
import { CarStatusEntity } from '@/game/entities/CarStatusEntity';
import { PartSlotEntity } from '@/game/entities/PartSlotEntity';

export class CarEntity extends GameObjects.Container {
  private selectedSlot: CarSlot;
  private readonly statusEntity: CarStatusEntity;
  private readonly detailsEntity: CarPartDetailsEntity;
  private readonly equipmentEntity: CarEquipmentEntity;
  private readonly slotEntities: PartSlotEntity[] = [];

  constructor(scene: Scene, x: number, y: number, private car: Car, private readonly onRepair: (slotId: string) => void) {
    super(scene, x, y);

    scene.add.existing(this);
    this.setDepth(5);
    this.selectedSlot = this.car.slots.chassis;
    this.statusEntity = new CarStatusEntity(this.scene, 170, -76, this.car.attributes);
    this.detailsEntity = new CarPartDetailsEntity(this.scene, 170, -6, this.selectedSlot, this.onRepair);
    this.equipmentEntity = new CarEquipmentEntity(this.scene, 170, 110, this.car);

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
    this.slotEntities.push(new PartSlotEntity(this.scene, 0, 0, 110, 190, this.car.slots.chassis, (slot) => this.selectSlot(slot)));
    this.add(this.slotEntities[this.slotEntities.length - 1]);
  }

  private addWheels(): void {
    const wheelX = 74;
    const frontY = -68;
    const rearY = 68;
    const wheelWidth = 22;
    const wheelHeight = 40;

    this.slotEntities.push(new PartSlotEntity(this.scene, -wheelX, frontY, wheelWidth, wheelHeight, this.car.slots.wheels.frontLeft, (slot) => this.selectSlot(slot)));
    this.slotEntities.push(new PartSlotEntity(this.scene, wheelX, frontY, wheelWidth, wheelHeight, this.car.slots.wheels.frontRight, (slot) => this.selectSlot(slot)));
    this.slotEntities.push(new PartSlotEntity(this.scene, -wheelX, rearY, wheelWidth, wheelHeight, this.car.slots.wheels.rearLeft, (slot) => this.selectSlot(slot)));
    this.slotEntities.push(new PartSlotEntity(this.scene, wheelX, rearY, wheelWidth, wheelHeight, this.car.slots.wheels.rearRight, (slot) => this.selectSlot(slot)));
    this.add(this.slotEntities[this.slotEntities.length - 4]);
    this.add(this.slotEntities[this.slotEntities.length - 3]);
    this.add(this.slotEntities[this.slotEntities.length - 2]);
    this.add(this.slotEntities[this.slotEntities.length - 1]);
  }

  private addTopModules(): void {
    this.slotEntities.push(new PartSlotEntity(this.scene, 0, -132, 76, 34, this.car.slots.engine, (slot) => this.selectSlot(slot)));
    this.slotEntities.push(new PartSlotEntity(this.scene, -72, -132, 30, 24, this.car.slots.steering, (slot) => this.selectSlot(slot)));
    this.slotEntities.push(new PartSlotEntity(this.scene, 72, -132, 24, 24, this.car.slots.nitro, (slot) => this.selectSlot(slot)));
    this.add(this.slotEntities[this.slotEntities.length - 3]);
    this.add(this.slotEntities[this.slotEntities.length - 2]);
    this.add(this.slotEntities[this.slotEntities.length - 1]);
  }

  private addSpoiler(): void {
    this.slotEntities.push(new PartSlotEntity(this.scene, 0, 132, 88, 22, this.car.slots.spoiler, (slot) => this.selectSlot(slot)));
    this.add(this.slotEntities[this.slotEntities.length - 1]);
  }

  private addStatus(): void {
    this.add(this.statusEntity);
    this.detailsEntity.setPosition(170, 92);
    this.add(this.detailsEntity);
    this.equipmentEntity.setPosition(170, 170);
    this.add(this.equipmentEntity);
  }

  private selectSlot(slot: CarSlot): void {
    this.selectedSlot = slot;
    this.detailsEntity.update(slot);
  }

  refresh(car: Car): void {
    if (!this.active || !this.statusEntity.active || !this.detailsEntity.active || !this.equipmentEntity.active) {
      return;
    }

    this.car = car;
    this.statusEntity.update(this.car.attributes);
    this.slotEntities.forEach((entity) => entity.refresh());
    this.detailsEntity.update(this.selectedSlot);
    this.equipmentEntity.update(this.car);
  }
}
