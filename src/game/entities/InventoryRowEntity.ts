import { GameObjects, Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import type { Car } from '@/core/domain/Car';
import type { CarPartInventoryItem } from '@/core/domain/CarPartInventory';

export class InventoryRowEntity extends GameObjects.Container {
  private readonly statusText: GameObjects.Text;
  private readonly equipButton: ButtonEntity;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly item: CarPartInventoryItem,
    car: Car,
    private readonly onEquip: (itemId: string) => void,
  ) {
    super(scene, x, y);

    const label = this.scene.add.text(0, 0, `${item.part.name} | ${item.part.type}`, {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    }).setOrigin(0, 0.5);

    const equipped = item.equipped;

    this.statusText = this.scene.add.text(420, 0, equipped ? 'Equipped' : 'Available', {
      color: equipped ? '#6b7280' : '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: equipped ? 'bold' : 'normal',
    }).setOrigin(0.5);

    this.equipButton = new ButtonEntity(this.scene, 620, 0, 92, 30, equipped ? 'Equipped' : 'Equip', () => {
      this.onEquip(this.item.id);
    }, equipped);

    this.add([label, this.statusText, this.equipButton]);
  }
}
