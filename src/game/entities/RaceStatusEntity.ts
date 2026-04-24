import { GameObjects, Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { IconEntity } from '@/game/entities/IconEntity';

export class RaceStatusEntity extends GameObjects.Container {
  private readonly statusIcon: IconEntity<'icons'>;
  private readonly titleText: GameObjects.Text;
  private readonly bodyText: GameObjects.Text;
  private readonly actionButton: ButtonEntity;

  constructor(scene: Scene, x: number, y: number, private readonly onContinue: () => void) {
    super(scene, x, y);

    const panel = this.scene.add.rectangle(0, 0, 400, 180, 0xffffff).setOrigin(0, 0);
    panel.setStrokeStyle(1, 0x111111);

    this.statusIcon = new IconEntity(this.scene, 44, 50, { sheet: 'icons', icon: 'raceRunning' });
    this.statusIcon.setDisplaySize(48, 48);

    this.titleText = this.scene.add.text(84, 24, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
    });

    this.bodyText = this.scene.add.text(84, 62, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      lineSpacing: 6,
    });

    this.actionButton = new ButtonEntity(this.scene, 332, 136, 112, 34, 'Continue', () => this.onContinue());
    this.actionButton.setVisible(false);
    this.actionButton.setDisabled(false);

    this.add([panel, this.statusIcon, this.titleText, this.bodyText, this.actionButton]);
    this.scene.add.existing(this);
  }

  showProgress(raceName: string, remainingSeconds: number): void {
    this.setVisible(true);
    this.statusIcon.setIcon({ sheet: 'icons', icon: 'raceRunning' });
    this.titleText.setText(`Racing: ${raceName}`);
    this.bodyText.setText(`Remaining: ${remainingSeconds}s`);
    this.actionButton.setVisible(false);
  }

  showResult(position: number, reward: number, points: number): void {
    this.setVisible(true);
    this.statusIcon.setIcon({ sheet: 'icons', icon: 'success' });
    this.titleText.setText('Race complete');
    this.bodyText.setText([
      `Position: ${position}`,
      `Reward: ${reward}`,
      `Points: ${points}`,
    ]);
    this.actionButton.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }

  protected preDestroy(): void {
    this.statusIcon.destroy();
    this.titleText.destroy();
    this.bodyText.destroy();
    this.actionButton.destroy();
  }
}
