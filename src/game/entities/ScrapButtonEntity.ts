import type { Scene, GameObjects } from 'phaser';
import { SoundManager } from '@/game/audio/SoundManager';

export class ScrapButtonEntity {
  private button?: GameObjects.Rectangle;

  constructor(
    private readonly scene: Scene,
    private readonly x: number,
    private readonly y: number,
    private readonly onPressed: () => void,
  ) {
    this.create();
  }

  create(): void {
    this.button = this.scene.add.rectangle(this.x, this.y, 100, 100, 0x808080);
    this.button.setScrollFactor(0);
    this.button.setDepth(900);
    this.button.setInteractive({ useHandCursor: true });
    this.button.on('pointerdown', () => {
      SoundManager.play('collect');
      this.onPressed();
    });
  }
}
