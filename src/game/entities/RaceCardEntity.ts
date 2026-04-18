import { GameObjects, Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import type { Race } from '@/core/domain/Race';

type RaceCardStatus = {
  label: string;
  disabled: boolean;
};

export class RaceCardEntity extends GameObjects.Container {
  private readonly titleText: GameObjects.Text;
  private readonly infoText: GameObjects.Text;
  private readonly statusText: GameObjects.Text;
  private readonly actionButton: ButtonEntity;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly race: Race,
    private readonly onEnter: (raceId: string) => void,
  ) {
    super(scene, x, y);

    const panel = this.scene.add.rectangle(0, 0, 640, 96, 0xffffff).setOrigin(0, 0);
    panel.setStrokeStyle(1, 0x111111);

    this.titleText = this.scene.add.text(12, 10, race.name, {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    });

    this.infoText = this.scene.add.text(12, 38, `Time ${race.durationSeconds}s | Reward ${race.rewards.first}/${race.rewards.second}/${race.rewards.third} | Cooldown ${race.cooldownSeconds}s`, {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });

    this.statusText = this.scene.add.text(12, 62, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });

    this.actionButton = new ButtonEntity(this.scene, 560, 48, 120, 34, 'Enter', () => {
      this.onEnter(this.race.id);
    });

    this.add([panel, this.titleText, this.infoText, this.statusText, this.actionButton]);
  }

  setStatus(status: RaceCardStatus): void {
    this.statusText.setText(status.label);
    this.actionButton.setDisabled(status.disabled);
  }

  getRaceId(): string {
    return this.race.id;
  }
}
