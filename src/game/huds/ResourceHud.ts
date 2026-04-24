import type { GameObjects, Scene, Time } from 'phaser';
import type { GameState } from '@/core/domain/GameState';
import { IconEntity } from '@/game/entities/IconEntity';
import { ActionProvider } from '@/game/providers/ActionProvider';

export class ResourceHud {
  // entities
  // ------------

  private readonly levelIcon: IconEntity<'icons'>;
  private readonly levelText: GameObjects.Text;
  private readonly levelXpText: GameObjects.Text;

  private readonly scrapIcon: IconEntity<'icons'>;
  private readonly scrapText: GameObjects.Text;

  private readonly cashIcon: IconEntity<'icons'>;
  private readonly cashText: GameObjects.Text;

  private readonly fuelIcon: IconEntity<'icons'>;
  private readonly fuelText: GameObjects.Text;

  private unsubscribe?: () => void;
  private readonly progressTimer: Time.TimerEvent;

  // constructor
  // ----------------

  constructor(private readonly scene: Scene) {
    const y = 48;

    this.levelIcon = new IconEntity(this.scene, 24, y, { sheet: 'icons', icon: 'mechanicLevel' });
    this.levelIcon.setDisplaySize(18, 18);
    this.levelText = this.scene.add.text(44, y - 8, 'LV 0', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.levelXpText = this.scene.add.text(44, y + 10, '0 / 0 XP', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
    }).setOrigin(0, 0.5);

    this.scrapIcon = new IconEntity(this.scene, 152, y, { sheet: 'icons', icon: 'scrap' });
    this.scrapIcon.setDisplaySize(18, 18);
    this.scrapText = this.scene.add.text(172, y, '0', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.cashIcon = new IconEntity(this.scene, 270, y, { sheet: 'icons', icon: 'cash' });
    this.cashIcon.setDisplaySize(18, 18);
    this.cashText = this.scene.add.text(290, y, '0', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.fuelIcon = new IconEntity(this.scene, 382, y, { sheet: 'icons', icon: 'fuel' });
    this.fuelIcon.setDisplaySize(18, 18);
    this.fuelText = this.scene.add.text(402, y, '0 / 0', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.unsubscribe = ActionProvider.subscribeState((state) => this.update(state));
    this.progressTimer = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => void this.refreshState(),
    });

    this.scene.events.once('shutdown', () => this.destroy());
  }

  // behavior methods
  // ------------------

  update(state: GameState): void {
    const mechanic = ActionProvider.getMechanicProgressRepository().get();
    const xpToNext = ActionProvider.getMechanicProgressRepository().getXpToNextLevel();

    this.levelText.setText(`LV ${mechanic.level}`);
    this.levelXpText.setText(`${mechanic.xp} / ${xpToNext} XP`);
    this.scrapText.setText(String(state.scrap));
    this.cashText.setText(String(state.cash));
    this.fuelText.setText(`${state.car.fuel} / ${state.car.maxFuel}`);
  }

  async refreshState(): Promise<void> {
    const state = await ActionProvider.getState();
    if (!this.scene.sys.isActive()) {
      return;
    }

    this.update(state);
  }

  destroy(): void {
    this.unsubscribe?.();
    this.progressTimer.remove(false);
    this.levelIcon.destroy();
    this.levelText.destroy();
    this.levelXpText.destroy();
    this.scrapIcon.destroy();
    this.scrapText.destroy();
    this.cashIcon.destroy();
    this.cashText.destroy();
    this.fuelIcon.destroy();
    this.fuelText.destroy();
  }
}
