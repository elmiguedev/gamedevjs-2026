import { GameObjects, Scene } from 'phaser';
import { SoundManager, type SoundKey } from '@/game/audio/SoundManager';

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
    private readonly sound: SoundKey = 'button',
  ) {
    super(scene, x, y);

    this.buttonWidth = width;
    this.buttonHeight = height;
    this.disabled = disabled;
    this.background = this.scene.add.rectangle(0, 0, width, height, 0x111111);
    this.labelText = this.scene.add.text(0, 0, label, {
      color: '#ffffff',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add([this.background, this.labelText]);
    this.setSize(this.buttonWidth, this.buttonHeight);
    this.setScrollFactor(0);
    this.setDepth(1001);
    this.background.setInteractive({ useHandCursor: true });
    this.background.on('pointerdown', () => {
      if (this.disabled) {
        return;
      }

      SoundManager.play(this.sound);
      this.onPressed();
    });

    this.scene.add.existing(this);
    this.refreshVisualState();
  }

  setDisabled(disabled: boolean): void {
    if (!this.active || !this.background.active || !this.labelText.active) {
      return;
    }

    this.disabled = disabled;
    this.refreshVisualState();
  }

  setLabel(label: string): void {
    if (!this.active || !this.labelText.active) {
      return;
    }

    this.labelText.setText(label);
  }

  private refreshVisualState(): void {
    if (!this.active || !this.background.active || !this.labelText.active) {
      return;
    }

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

  protected preDestroy(): void {
    this.background.destroy();
    this.labelText.destroy();
  }
}
