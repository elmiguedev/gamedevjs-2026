import { GameObjects, Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { IconEntity } from '@/game/entities/IconEntity';
import { ProgressBarEntity } from '@/game/entities/ProgressBarEntity';

const FONT_FAMILY = 'Barlow Condensed, Arial, sans-serif';

export class RaceStatusEntity extends GameObjects.Container {
  private readonly panel: GameObjects.Rectangle;
  private readonly statusIcon: IconEntity<'icons'>;
  private readonly titleText: GameObjects.Text;
  private readonly bodyText: GameObjects.Text;
  private readonly progressBar: ProgressBarEntity;
  private readonly progressLabel: GameObjects.Text;
  private readonly actionButton: ButtonEntity;

  constructor(scene: Scene, x: number, y: number, private readonly onContinue: () => void) {
    super(scene, x, y);

    this.panel = this.scene.add.rectangle(0, 0, 400, 180, 0xffffff).setOrigin(0, 0);
    this.panel.setStrokeStyle(1, 0x111111);

    this.statusIcon = new IconEntity(this.scene, 44, 50, { sheet: 'icons', icon: 'raceRunning' });
    this.statusIcon.setDisplaySize(48, 48);

    this.titleText = this.scene.add.text(84, 24, '', {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      fontStyle: 'bold',
    });

    this.bodyText = this.scene.add.text(84, 62, '', {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '15px',
      lineSpacing: 6,
    });

    this.progressBar = new ProgressBarEntity(this.scene, 24, 138, 352, 14, 0, {
      trackColor: 0xf3f4f6,
      fillColor: 0xf2d27a,
      strokeColor: 0x111111,
    });
    this.progressLabel = this.scene.add.text(200, 118, '', {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.actionButton = new ButtonEntity(this.scene, 332, 136, 112, 34, 'Claim', () => this.onContinue(), false, 'race');
    this.actionButton.setVisible(false);
    this.actionButton.setDisabled(false);

    this.add([this.panel, this.statusIcon, this.titleText, this.bodyText, this.progressBar, this.progressLabel, this.actionButton]);
    this.scene.add.existing(this);
  }

  showProgress(raceName: string, remainingSeconds: number, totalSeconds: number): void {
    const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;

    this.setVisible(true);
    this.statusIcon.setIcon({ sheet: 'icons', icon: 'raceRunning' });
    this.titleText.setText(raceName.toUpperCase());
    this.bodyText.setText([
      'Race in progress',
      `Finish in ${remainingSeconds}s`,
    ]);
    this.progressBar.setVisible(true);
    this.progressBar.setProgress(progress);
    this.progressLabel.setVisible(true);
    this.progressLabel.setText(`${Math.floor(progress * 100)}% COMPLETE`);
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
    this.progressBar.setVisible(false);
    this.progressLabel.setVisible(false);
    this.actionButton.setLabel('Claim');
    this.actionButton.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }

  protected preDestroy(): void {
    this.panel.destroy();
    this.statusIcon.destroy();
    this.titleText.destroy();
    this.bodyText.destroy();
    this.progressBar.destroy();
    this.progressLabel.destroy();
    this.actionButton.destroy();
  }
}
