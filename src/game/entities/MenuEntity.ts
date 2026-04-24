import { Scene } from 'phaser';
import { IconEntity } from '@/game/entities/IconEntity';
import type { UiIconName } from '@/game/assets/spritesheets';

type MenuItem = {
  key: string;
  icon: UiIconName;
  targetScene: string;
};

export class MenuEntity {

  // properties
  // -----------------------

  private items: MenuItem[] = [
    { key: 'CarScene', icon: 'garageCar', targetScene: 'CarScene' },
    { key: 'ScrapScene', icon: 'collectScrap', targetScene: 'ScrapScene' },
    { key: 'InventoryScene', icon: 'craft', targetScene: 'InventoryScene' },
    { key: 'RaceScene', icon: 'raceFlag', targetScene: 'RaceScene' },
    { key: 'AchievementsScene', icon: 'star', targetScene: 'AchievementsScene' },
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
    const containerY = height - 58;
    const baseX = 80;
    const stepX = 80;

    this.createMenuItem(this.items[0], baseX + 0 * stepX, containerY);
    this.createMenuItem(this.items[1], baseX + 1 * stepX, containerY);
    this.createMenuItem(this.items[2], baseX + 2 * stepX, containerY);
    this.createMenuItem(this.items[3], baseX + 3 * stepX, containerY);
    this.createMenuItem(this.items[4], baseX + 4 * stepX, containerY);

  }

  // behavior methods
  // ------------------

  private createMenuItem(item: MenuItem, x: number, y: number): void {
    const radius = 26;
    const active = item.key === this.currentScene;
    const activeColor = active ? 0xf2d27a : 0xffffff;
    const strokeColor = 0x111111;
    const depth = 2000;
    const circle = this.scene.add.circle(x, y, radius, activeColor)
      .setStrokeStyle(2, strokeColor);

    const icon = new IconEntity(this.scene, x, y, { sheet: 'icons', icon: item.icon });
    icon.setDisplaySize(20, 20);

    circle.setDepth(depth);
    icon.setDepth(depth + 1);

    circle.setInteractive({ useHandCursor: true });
    circle.on('pointerdown', () => {
      if (!active) {
        this.scene.scene.start(item.targetScene);
      }
    });

  }
}
