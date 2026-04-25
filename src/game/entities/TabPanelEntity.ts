import { GameObjects, Scene } from 'phaser';
import { SoundManager } from '@/game/audio/SoundManager';
import type { UiIconName } from '@/game/assets/spritesheets';
import { IconEntity } from '@/game/entities/IconEntity';

const FONT_FAMILY = 'Barlow Condensed, Arial, sans-serif';

export type TabPanelItem<T extends string> = {
  key: T;
  label: string;
  icon: UiIconName;
};

type TabView<T extends string> = {
  item: TabPanelItem<T>;
  background: GameObjects.Rectangle;
  icon: IconEntity<'icons'>;
  label: GameObjects.Text;
};

export class TabPanelEntity<T extends string> extends GameObjects.Container {
  private readonly views: TabView<T>[] = [];

  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly width: number,
    private readonly height: number,
    private activeKey: T,
    private readonly items: TabPanelItem<T>[],
    private readonly onSelect: (key: T) => void,
  ) {
    super(scene, x, y);

    this.createTabs();
    this.scene.add.existing(this);
    this.refresh(activeKey);
  }

  refresh(activeKey: T): void {
    this.activeKey = activeKey;

    for (const view of this.views) {
      const active = view.item.key === this.activeKey;
      view.background.setFillStyle(active ? 0x111111 : 0xffffff);
      view.background.setStrokeStyle(1, active ? 0x111111 : 0x999999);
      view.icon.setTint(active ? 0xffffff : 0x111111);
      view.label.setColor(active ? '#ffffff' : '#111111');
    }
  }

  private createTabs(): void {
    const tabWidth = this.width / this.items.length;

    this.items.forEach((item, index) => {
      const x = index * tabWidth;
      const background = this.scene.add.rectangle(x, 0, tabWidth - 5, this.height, 0xffffff).setOrigin(0, 0);
      const icon = new IconEntity(this.scene, x + tabWidth / 2 - 50, this.height / 2, { sheet: 'icons', icon: item.icon });
      icon.setDisplaySize(24, 24);
      const label = this.scene.add.text(x + tabWidth / 2 - 22, this.height / 2, item.label, {
        color: '#111111',
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      background.setInteractive({ useHandCursor: true });
      background.on('pointerdown', () => {
        SoundManager.play('tab');
        this.refresh(item.key);
        this.onSelect(item.key);
      });

      this.views.push({ item, background, icon, label });
      this.add([background, icon, label]);
    });
  }
}
