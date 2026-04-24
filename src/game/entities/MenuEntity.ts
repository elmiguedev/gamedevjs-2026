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
    { key: 'ScrapScene', icon: 'scrapYardCrafting', targetScene: 'ScrapScene' },
    { key: 'InventoryScene', icon: 'inventory', targetScene: 'InventoryScene' },
    { key: 'RaceScene', icon: 'raceFlag', targetScene: 'RaceScene' },
    { key: 'AchievementsScene', icon: 'star', targetScene: 'AchievementsScene' },
  ];
  private currentScene?: string;

  // constructor
  // -----------------------

  constructor(private readonly scene: Scene) {
    this.currentScene = this.scene.scene.key;
    this.create();
  }

  // methods
  // -----------------------

  create(): void {
    const width = this.scene.game.canvas.width;
    const height = this.scene.game.canvas.height;
    const containerY = height - 50;
    const baseX = 80;
    const stepX = 80;

    this.createMenuItem(this.items[0], baseX + 0 * stepX, containerY);
    this.createMenuItem(this.items[1], baseX + 1 * stepX, containerY);
    this.createMenuItem(this.items[2], baseX + 2 * stepX, containerY);
    this.createMenuItem(this.items[3], baseX + 3 * stepX, containerY);
    this.createMenuItem(this.items[4], baseX + 4 * stepX, containerY);


    // const dock = this.scene.add.rectangle(width / 2, dockY, width - 28, 82, 0xffffff).setStrokeStyle(2, 0x111111);
    // dock.setScrollFactor(0);
    // dock.setDepth(20000);

    // const spacing = 76;
    // const startX = width / 2 - ((this.items.length - 1) * spacing) / 2;

    // this.items.forEach((item, index) => {
    //   const x = startX + index * spacing;
    //   const active = item.key === currentScene;
    //   const circle = this.scene.add.circle(x, dockY, 28, active ? 0xf2d27a : 0xffffff).setStrokeStyle(2, 0x111111);
    //   const icon = new IconEntity(this.scene, x, dockY, { sheet: 'icons', icon: item.icon });
    //   icon.setDisplaySize(22, 22);

    //   circle.setScrollFactor(0);
    //   icon.setScrollFactor(0);
    //   circle.setDepth(20001);
    //   icon.setDepth(20002);

    //   circle.setInteractive({ useHandCursor: true });
    //   circle.on('pointerdown', () => {
    //     if (!active) {
    //       this.scene.scene.start(item.targetScene);
    //     }
    //   });

    //   if (active) {
    //     const mark = this.scene.add.rectangle(x, dockY - 44, 18, 4, 0x111111);
    //     mark.setScrollFactor(0);
    //     mark.setDepth(20003);
    //   }
    // });
  }

  private createMenuItem(item: MenuItem, x: number, y: number): void {
    const radius = 28;
    const active = item.key === this.currentScene;
    const activeColor = active ? 0xf2d27a : 0xffffff;
    const strokeColor = 0x111111;
    const circle = this.scene.add.circle(x, y, radius, activeColor)
      .setStrokeStyle(2, strokeColor);

    const icon = new IconEntity(this.scene, x, y, { sheet: 'icons', icon: item.icon });
    icon.setDisplaySize(32, 32);

    //   circle.setScrollFactor(0);
    //   icon.setScrollFactor(0);
    //   circle.setDepth(20001);
    //   icon.setDepth(20002);

    circle.setInteractive({ useHandCursor: true });
    circle.on('pointerdown', () => {
      if (!active) {
        this.scene.scene.start(item.targetScene);
      }
    });

    //   if (active) {
    //     const mark = this.scene.add.rectangle(x, dockY - 44, 18, 4, 0x111111);
    //     mark.setScrollFactor(0);
    //     mark.setDepth(20003);
    //   }
  }
}
