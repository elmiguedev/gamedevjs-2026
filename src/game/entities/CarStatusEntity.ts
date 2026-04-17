import { GameObjects, Scene } from 'phaser';
import type { CarAttributes } from '@/core/domain/Car';

export class CarStatusEntity extends GameObjects.Container {
  constructor(scene: Scene, x: number, y: number, private readonly attributes: CarAttributes) {
    super(scene, x, y);

    this.render();
  }

  private render(): void {
    const title = this.scene.add.text(0, -64, 'Car Status', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    const body = this.scene.add.text(0, -36, [
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

    this.add(title);
    this.add(body);
  }
}
