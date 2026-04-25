import { GameObjects, Scene } from 'phaser';
import type { CarAttributes } from '@/core/domain/Car';

const FONT_FAMILY = 'Barlow Condensed, Arial, sans-serif';

type StatView = {
  key: keyof CarAttributes;
  value: GameObjects.Text;
};

export class CarStatsPanelEntity extends GameObjects.Container {
  private readonly statViews: StatView[] = [];

  constructor(scene: Scene, x: number, y: number, width: number, height: number, attributes: CarAttributes) {
    super(scene, x, y);

    this.createBackground(width, height);
    this.createTitle();
    this.createStats(attributes);

    this.scene.add.existing(this);
    this.refresh(attributes);
  }

  private createBackground(width: number, height: number): void {
    const background = this.scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0);
    background.setStrokeStyle(1, 0x999999);
    this.add(background);
  }

  private createTitle(): void {
    const title = this.scene.add.text(14, 12, 'CAR STATS', {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.add(title);
  }

  private createStats(attributes: CarAttributes): void {
    const stats = [
      { key: 'speed', label: 'SPEED' },
      { key: 'acceleration', label: 'ACCELERATION' },
      { key: 'direction', label: 'STEERING' },
      { key: 'resistance', label: 'RESISTANCE' },
    ] as const;

    stats.forEach((stat, index) => {
      const x = 14 + index * 112;
      const label = this.scene.add.text(x, 40, stat.label, {
        color: '#111111',
        fontFamily: FONT_FAMILY,
        fontSize: '12px',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5);
      const value = this.scene.add.text(x, 62, String(attributes[stat.key]), {
        color: '#111111',
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      this.statViews.push({ key: stat.key, value });
      this.add([label, value]);
    });
  }

  refresh(attributes: CarAttributes): void {
    for (const view of this.statViews) {
      const value = attributes[view.key];
      view.value.setText(String(value));
    }
  }
}
