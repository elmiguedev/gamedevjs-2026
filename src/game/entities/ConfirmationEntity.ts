import { GameObjects, Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';

export class ConfirmationEntity extends GameObjects.Container {
  private readonly titleText: GameObjects.Text;
  private readonly messageText: GameObjects.Text;
  private readonly overlay: GameObjects.Rectangle;
  private readonly confirmButton: ButtonEntity;
  private readonly cancelButton: ButtonEntity;

  constructor(
    scene: Scene,
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel: () => void,
  ) {
    super(scene, 0, 0);

    this.overlay = this.scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.35).setScrollFactor(0);
    this.overlay.setDepth(1998);
    this.overlay.setInteractive({ useHandCursor: false });
    this.overlay.on('pointerdown', () => undefined);

    const panel = this.scene.add.rectangle(360, 640, 540, 240, 0xffffff);
    panel.setStrokeStyle(2, 0x111111);
    panel.setDepth(1999);

    this.titleText = this.scene.add.text(360, 560, title, {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2000);

    this.messageText = this.scene.add.text(360, 620, message, {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      align: 'center',
      wordWrap: { width: 460 },
    }).setOrigin(0.5).setDepth(2000);

    this.confirmButton = new ButtonEntity(this.scene, 290, 710, 120, 36, 'Confirm', () => {
      onConfirm();
      this.destroy();
    });
    this.confirmButton.setDepth(2001);

    this.cancelButton = new ButtonEntity(this.scene, 430, 710, 120, 36, 'Cancel', () => {
      onCancel();
      this.destroy();
    });
    this.cancelButton.setDepth(2001);

    this.add([this.overlay, panel, this.titleText, this.messageText, this.confirmButton, this.cancelButton]);
    this.scene.add.existing(this);
    this.setDepth(1998);
  }

  protected preDestroy(): void {
    this.overlay.destroy();
    this.titleText.destroy();
    this.messageText.destroy();
    this.confirmButton.destroy();
    this.cancelButton.destroy();
  }
}
