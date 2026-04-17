import { GameObjects, Scene } from 'phaser';
import type { Car } from '@/core/domain/Car';
import type { CarPartInventoryItem } from '@/core/domain/CarPartInventory';
import { InventoryRowEntity } from '@/game/entities/InventoryRowEntity';

export class InventoryListEntity extends GameObjects.Container {
  private rows: InventoryRowEntity[] = [];

  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly onEquip: (itemId: string) => void,
  ) {
    super(scene, x, y);
    this.scene.add.existing(this);
  }

  setData(items: CarPartInventoryItem[], car: Car): void {
    this.clearRows();

    let yOffset = 0;

    items.forEach((item) => {
      const row = new InventoryRowEntity(this.scene, 0, yOffset, item, car, this.onEquip);
      this.rows.push(row);
      this.add(row);
      yOffset += 44;
    });
  }

  private clearRows(): void {
    this.rows.forEach((row) => row.destroy());
    this.rows = [];
  }
}
