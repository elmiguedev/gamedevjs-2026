import type { GameObjects, Scene } from 'phaser';
import type { GameState } from '@/core/domain/GameState';

export class ResourceHud {
  private text?: GameObjects.Text;

  constructor(private readonly scene: Scene) {}

  create(): void {
    this.text = this.scene.add.text(16, 16, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
    });
    this.text.setDepth(10);
  }

  update(state: GameState): void {
    this.text?.setText([
      `Money: ${state.money}`,
      `Scrap: ${state.scrap}`,
      `Fuel: ${state.fuel}`,
      `Prestige: ${state.prestige}`,
    ]);
  }
}
