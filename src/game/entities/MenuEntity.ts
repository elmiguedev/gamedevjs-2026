import { Scene } from 'phaser';
import { IconEntity } from '@/game/entities/IconEntity';
import type { UiIconName } from '@/game/assets/spritesheets';

type MenuItem = {
  key: string;
  icon: UiIconName;
  label: string;
  targetScene: string;
};

export class MenuEntity {

  // properties
  // -----------------------

  private items: MenuItem[] = [
    { key: 'CarScene', icon: 'garageCar', label: 'My Car', targetScene: 'CarScene' },
    { key: 'ScrapScene', icon: 'collectScrap', label: 'Scrapyard', targetScene: 'ScrapScene' },
    { key: 'InventoryScene', icon: 'craft', label: 'Workshop', targetScene: 'InventoryScene' },
    { key: 'RaceScene', icon: 'raceFlag', label: 'Races', targetScene: 'RaceScene' },
    { key: 'AchievementsScene', icon: 'star', label: 'Awards', targetScene: 'AchievementsScene' },
  ];
  private currentScene?: string;

  // constructor
  // ----------------

  constructor(private readonly scene: Scene) {
    this.currentScene = this.scene.scene.key;
    this.create();
  }

  // creation methods
  // ----------------

  create(): void {
    const height = this.scene.game.canvas.height;
    const containerY = height - 60;
    const baseX = 70;
    const stepX = 85;

    this.createDivider();

    this.createMenuItem(this.items[0], baseX + 0 * stepX, containerY);
    this.createMenuItem(this.items[1], baseX + 1 * stepX, containerY);
    this.createMenuItem(this.items[2], baseX + 2 * stepX, containerY);
    this.createMenuItem(this.items[3], baseX + 3 * stepX, containerY);
    this.createMenuItem(this.items[4], baseX + 4 * stepX, containerY);

  }

  // creation methods
  // ------------------

  private createDivider() {
    const lineColor = 0x999999;
    const x = 40;
    const y = 600;
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

  private createMenuItem(item: MenuItem, x: number, y: number): void {
    const radius = 26;
    const active = item.key === this.currentScene;
    const activeColor = active ? 0xf2d27a : 0xffffff;
    const strokeColor = 0x111111;
    const depth = 2000;
    const circle = this.scene.add.circle(x, y, radius, activeColor)
      .setStrokeStyle(2, strokeColor);

    const icon = new IconEntity(this.scene, x, y, { sheet: 'icons', icon: item.icon });
    icon.setDisplaySize(40, 40);

    const label = this.scene.add.text(x, y + 39, item.label, {
      color: '#111111',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '16px',
      fontStyle: active ? 'bold' : 'normal',
    }).setOrigin(0.5);

    circle.setDepth(depth);
    icon.setDepth(depth + 1);
    label.setDepth(depth + 1);

    circle.setInteractive({ useHandCursor: true });
    circle.on('pointerdown', () => {
      if (!active) {
        this.scene.scene.start(item.targetScene);
      }
    });

  }
}
