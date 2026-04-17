import type { GameObjects, Scene } from 'phaser';
import type { GameState } from '@/core/domain/GameState';
import { ActionProvider } from '@/game/providers/ActionProvider';

export class ResourceHud {
  private text?: GameObjects.Text;

  constructor(private readonly scene: Scene) {
    this.create();
    void this.refreshState();
  }

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
      `Cash: ${state.cash}`,
      `Scrap: ${state.scrap}`,
    ]);
  }

  async refreshState(): Promise<void> {
    const state = await ActionProvider.getState();
    this.update(state);
  }
}
