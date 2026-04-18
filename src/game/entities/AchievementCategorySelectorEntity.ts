import { GameObjects, Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';

export type AchievementGroup = 'hall' | 'garage';

export class AchievementCategorySelectorEntity extends GameObjects.Container {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly onSelect: (group: AchievementGroup) => void,
  ) {
    super(scene, x, y);

    const title = this.scene.add.text(0, 0, 'Choose a path', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
    });

    const hallButton = new ButtonEntity(this.scene, 130, 70, 240, 74, 'Hall of Fame', () => this.onSelect('hall'));
    const garageButton = new ButtonEntity(this.scene, 390, 70, 240, 74, 'Garage Path', () => this.onSelect('garage'));

    const hallDescription = this.scene.add.text(130, 116, 'Cup ladder and podium goals.', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    const garageDescription = this.scene.add.text(390, 116, 'Crafting, collecting, and build goals.', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    this.add([title, hallButton, garageButton, hallDescription, garageDescription]);
    this.scene.add.existing(this);
  }
}
