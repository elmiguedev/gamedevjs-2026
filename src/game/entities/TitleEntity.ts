import { GameObjects, Scene } from 'phaser';

const FONT_FAMILY = 'Barlow Condensed, Arial, sans-serif';

export class TitleEntity extends GameObjects.Container {
  constructor(scene: Scene, x: number, y: number, title: string, subtitle: string) {
    super(scene, x, y);

    this.createTitle(title);
    this.createSubtitle(subtitle);

    this.setDepth(1500);
    this.scene.add.existing(this);
  }

  private createTitle(title: string): void {
    const titleText = this.scene.add.text(0, 0, title, {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      fontStyle: 'bold',
    }).setOrigin(0, 0);

    this.add(titleText);
  }

  private createSubtitle(subtitle: string): void {
    const subtitleText = this.scene.add.text(8, 38, subtitle, {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '11px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    const background = this.scene.add.rectangle(0, 38, subtitleText.width + 16, 18, 0xf2d27a).setOrigin(0, 0.5);
    background.setStrokeStyle(1, 0x111111);

    this.add([background, subtitleText]);
  }
}
