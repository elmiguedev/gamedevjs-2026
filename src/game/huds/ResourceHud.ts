import type { GameObjects, Scene, Time } from 'phaser';
import type { GameState } from '@/core/domain/GameState';
import { ActionProvider } from '@/game/providers/ActionProvider';

export class ResourceHud {
  private text?: GameObjects.Text;
  private unsubscribe?: () => void;
  private readonly progressTimer: Time.TimerEvent;

  constructor(private readonly scene: Scene) {
    this.create();
    this.unsubscribe = ActionProvider.subscribeState((state) => this.update(state));
    this.progressTimer = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.refreshState(),
    });

    this.scene.events.once('shutdown', () => this.destroy());
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
    const mechanic = ActionProvider.getMechanicProgressRepository().get();
    const xpToNext = ActionProvider.getMechanicProgressRepository().getXpToNextLevel();
    const craftingStatus = ActionProvider.getCraftingStatus();
    const craftingLine = craftingStatus.active
      ? `Craft: ${craftingStatus.active.part.name} ${Math.min(100, Math.floor(((Date.now() - craftingStatus.active.startedAt) / 1000 / craftingStatus.active.craftTimeSeconds) * 100))}%`
      : craftingStatus.ready
        ? `Craft: Ready - ${craftingStatus.ready.name}`
        : 'Craft: Idle';

    this.text?.setText([
      `Cash: ${state.cash}`,
      `Scrap: ${state.scrap}`,
      `Mech: Lv ${mechanic.level} | XP ${mechanic.xp}/${xpToNext}`,
      craftingLine,
    ]);
  }

  async refreshState(): Promise<void> {
    const state = await ActionProvider.getState();
    this.update(state);
  }

  destroy(): void {
    this.unsubscribe?.();
    this.progressTimer.remove(false);
    this.text?.destroy();
  }
}
