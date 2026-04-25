import { GameObjects, Scene } from 'phaser';
import { SoundManager } from '@/game/audio/SoundManager';

const FONT_FAMILY = 'Barlow Condensed, Arial, sans-serif';

export class PaginationEntity extends GameObjects.Container {
  private readonly pageText: GameObjects.Text;
  private readonly prevButton: GameObjects.Container;
  private readonly nextButton: GameObjects.Container;
  private readonly prevCircle: GameObjects.Arc;
  private readonly nextCircle: GameObjects.Arc;
  private readonly prevText: GameObjects.Text;
  private readonly nextText: GameObjects.Text;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly onPrev: () => void,
    private readonly onNext: () => void,
    private readonly onPage?: (page: number) => void,
  ) {
    super(scene, x, y);

    this.pageText = this.scene.add.text(0, 0, '', {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.prevButton = this.createArrowButton(-82, '<', onPrev);
    this.nextButton = this.createArrowButton(82, '>', onNext);
    this.prevCircle = this.prevButton.getAt(0) as GameObjects.Arc;
    this.nextCircle = this.nextButton.getAt(0) as GameObjects.Arc;
    this.prevText = this.prevButton.getAt(1) as GameObjects.Text;
    this.nextText = this.nextButton.getAt(1) as GameObjects.Text;

    this.add([this.pageText, this.prevButton, this.nextButton]);
    this.scene.add.existing(this);
  }

  private createArrowButton(x: number, label: string, onPressed: () => void): GameObjects.Container {
    const container = this.scene.add.container(x, 0);
    const circle = this.scene.add.circle(0, 0, 16, 0xffffff).setStrokeStyle(1, 0x111111);
    const text = this.scene.add.text(0, -1, label, {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    circle.setInteractive({ useHandCursor: true });
    circle.on('pointerdown', () => {
      SoundManager.play('button');
      onPressed();
    });
    container.add([circle, text]);
    return container;
  }

  setPage(currentPage: number, totalPages: number): void {
    this.pageText.setText(`${currentPage + 1}/${totalPages}`);

    this.setArrowDisabled(this.prevCircle, this.prevText, currentPage <= 0);
    this.setArrowDisabled(this.nextCircle, this.nextText, currentPage >= totalPages - 1);
  }

  private setArrowDisabled(circle: GameObjects.Arc, text: GameObjects.Text, disabled: boolean): void {
    circle.setAlpha(disabled ? 0.35 : 1);
    text.setAlpha(disabled ? 0.35 : 1);
  }

  protected preDestroy(): void {
    this.prevButton.destroy();
    this.nextButton.destroy();
    this.pageText.destroy();
  }
}
