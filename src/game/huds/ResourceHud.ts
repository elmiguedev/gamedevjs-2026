import type { GameObjects, Scene, Time } from 'phaser';
import type { GameState } from '@/core/domain/GameState';
import { IconEntity } from '@/game/entities/IconEntity';
import { ActionProvider } from '@/game/providers/ActionProvider';

export class ResourceHud {
  // entities
  // ------------

  private levelIcon!: IconEntity<'icons'>;
  private levelText!: GameObjects.Text;
  private levelXpText!: GameObjects.Text;

  private scrapIcon!: IconEntity<'icons'>;
  private scrapText!: GameObjects.Text;

  private cashIcon!: IconEntity<'icons'>;
  private cashText!: GameObjects.Text;

  private fuelIcon!: IconEntity<'icons'>;
  private fuelText!: GameObjects.Text;

  private unsubscribe?: () => void;
  // private readonly progressTimer: Time.TimerEvent;

  // constructor
  // ----------------

  constructor(private readonly scene: Scene) {

    this.createDivider();
    this.createLevelPanel();
    this.createScrapPanel();
    this.createCashPanel();
    this.createFuelPanel();

    this.suscribeGameState();

    this.scene.events.once('shutdown', () => this.destroy());
  }

  // creation methods
  // ----------------

  private createDivider() {
    const lineColor = 0x999999;
    const x = 40;
    const y = 70;
    const width = 400;

    const line = this.scene.add.rectangle(
      x,
      y,
      width,
      1,
      lineColor,
    );

    line.setOrigin(0, 0.5);
  }

  private createLevelPanel() {
    const x = 50;
    const y = 42;
    this.levelIcon = new IconEntity(this.scene, x, y, { sheet: 'icons', icon: 'mechanicLevel' });
    this.levelIcon.setDisplaySize(46, 46);
    this.levelText = this.scene.add.text(x + 25, y - 8, 'LV 0', {
      color: '#111111',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.levelXpText = this.scene.add.text(x + 25, y + 10, '0 / 0 XP', {
      color: '#444444',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '14px',
    }).setOrigin(0, 0.5);
  }

  private createScrapPanel() {
    const x = 220;
    const y = 42;
    this.scrapIcon = new IconEntity(this.scene, x, y, { sheet: 'icons', icon: 'scrap' });
    this.scrapIcon.setDisplaySize(46, 46);
    this.scrapText = this.scene.add.text(x + 25, y, '0', {
      color: '#111111',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
  }

  private createCashPanel() {
    const x = 310;
    const y = 42;
    this.cashIcon = new IconEntity(this.scene, x, y, { sheet: 'icons', icon: 'cash' });
    this.cashIcon.setDisplaySize(46, 46);
    this.cashText = this.scene.add.text(x + 25, y, '0', {
      color: '#111111',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
  }

  private createFuelPanel() {
    const x = 390;
    const y = 42;
    this.fuelIcon = new IconEntity(this.scene, x, y, { sheet: 'icons', icon: 'fuel' });
    this.fuelIcon.setDisplaySize(46, 46);
    this.fuelText = this.scene.add.text(x + 25, y, '0', {
      color: '#111111',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
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

  private suscribeGameState(): void {
    this.unsubscribe = ActionProvider.subscribeState((state) => this.update(state));
    // this.progressTimer = this.scene.time.addEvent({
    //   delay: 1000,
    //   loop: true,
    //   callback: () => void this.refreshState(),
    // });
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
    // this.progressTimer.remove(false);
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
