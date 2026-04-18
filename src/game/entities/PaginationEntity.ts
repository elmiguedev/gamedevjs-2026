import { GameObjects, Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';

export class PaginationEntity extends GameObjects.Container {
  private readonly pageText: GameObjects.Text;
  private readonly prevButton: ButtonEntity;
  private readonly nextButton: ButtonEntity;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly onPrev: () => void,
    private readonly onNext: () => void,
  ) {
    super(scene, x, y);

    this.pageText = this.scene.add.text(0, 0, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    }).setOrigin(0.5);

    this.prevButton = new ButtonEntity(this.scene, -70, 0, 70, 28, 'Prev', onPrev, false);
    this.nextButton = new ButtonEntity(this.scene, 70, 0, 70, 28, 'Next', onNext, false);

    this.add([this.pageText, this.prevButton, this.nextButton]);
    this.scene.add.existing(this);
  }

  setPage(currentPage: number, totalPages: number): void {
    this.pageText.setText(`${currentPage + 1}/${totalPages}`);
    this.prevButton.setDisabled(currentPage <= 0);
    this.nextButton.setDisabled(currentPage >= totalPages - 1);
  }

  protected preDestroy(): void {
    this.prevButton.destroy();
    this.nextButton.destroy();
    this.pageText.destroy();
  }
}
