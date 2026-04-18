import { GameObjects, Scene } from 'phaser';

export class AchievementHeaderEntity extends GameObjects.Container {
  private readonly titleText: GameObjects.Text;
  private readonly subtitleText: GameObjects.Text;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);

    this.titleText = this.scene.add.text(0, 0, 'Achievements', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.subtitleText = this.scene.add.text(0, 38, 'Choose a category, then browse the goals.', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
    }).setOrigin(0.5);

    this.add([this.titleText, this.subtitleText]);
  }
}
