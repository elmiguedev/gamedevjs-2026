import { GameObjects, Scene } from 'phaser';

export class ButtonEntity extends GameObjects.Container {
  private readonly background: GameObjects.Rectangle;
  private readonly labelText: GameObjects.Text;
  private readonly buttonWidth: number;
  private readonly buttonHeight: number;
  public disabled: boolean;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    private readonly onPressed: () => void,
    disabled = false,
  ) {
    super(scene, x, y);

    this.buttonWidth = width;
    this.buttonHeight = height;
    this.disabled = disabled;
    this.background = this.scene.add.rectangle(0, 0, width, height, 0x111111);
    this.labelText = this.scene.add.text(0, 0, label, {
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    }).setOrigin(0.5);

    this.add([this.background, this.labelText]);
    this.setSize(this.buttonWidth, this.buttonHeight);
    this.background.setInteractive({ useHandCursor: true });
    this.background.on('pointerdown', () => {
      if (this.disabled) {
        return;
      }

      this.onPressed();
    });

    this.scene.add.existing(this);
    this.refreshVisualState();
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.refreshVisualState();
  }

  private refreshVisualState(): void {
    if (this.disabled) {
      this.background.setFillStyle(0x9ca3af);
      this.background.setAlpha(0.75);
      this.labelText.setColor('#6b7280');
      this.disableInteractive();
      return;
    }

    this.background.setFillStyle(0x111111);
    this.background.setAlpha(1);
    this.labelText.setColor('#ffffff');
    this.background.setInteractive({ useHandCursor: true });
  }
}
