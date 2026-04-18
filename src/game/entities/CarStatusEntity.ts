import { GameObjects, Scene } from 'phaser';
import type { CarAttributes } from '@/core/domain/Car';

export class CarStatusEntity extends GameObjects.Container {
  private readonly titleText: GameObjects.Text;
  private readonly bodyText: GameObjects.Text;

  constructor(scene: Scene, x: number, y: number, private attributes: CarAttributes) {
    super(scene, x, y);

    this.titleText = this.scene.add.text(0, -64, 'Car Status', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.bodyText = this.scene.add.text(0, -36, [
      `Acceleration  ${this.attributes.acceleration}`,
      `Velocity      ${this.attributes.speed}`,
      `Resistance    ${this.attributes.resistance}`,
      `Direction     ${this.attributes.direction}`,
    ], {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      lineSpacing: 8,
    }).setOrigin(0, 0);

    this.add(this.titleText);
    this.add(this.bodyText);
  }

  update(attributes: CarAttributes): void {
    if (!this.active || !this.bodyText.active) {
      return;
    }

    this.attributes = attributes;
    this.bodyText.setText([
      `Acceleration  ${this.attributes.acceleration}`,
      `Velocity      ${this.attributes.speed}`,
      `Resistance    ${this.attributes.resistance}`,
      `Direction     ${this.attributes.direction}`,
    ]);
  }
}
