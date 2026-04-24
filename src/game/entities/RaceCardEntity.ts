import { GameObjects, Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { IconEntity } from '@/game/entities/IconEntity';
import type { RaceIconName, UiIconName } from '@/game/assets/spritesheets';
import type { Race } from '@/core/domain/Race';

type RaceCardStatus = {
  label: string;
  disabled: boolean;
  icon: UiIconName;
};

const RACE_ICON_BY_ID = {
  'street-a': 'neonLoop',
  'street-b': 'midnightGrid',
  'street-c': 'chromaticRun',
} as const satisfies Record<string, RaceIconName>;

export class RaceCardEntity extends GameObjects.Container {
  private readonly raceIcon: IconEntity<'races'>;
  private readonly statusIcon: IconEntity<'icons'>;
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

    const panel = this.scene.add.rectangle(0, 0, 400, 110, 0xffffff).setOrigin(0, 0);
    panel.setStrokeStyle(1, 0x111111);

    this.raceIcon = new IconEntity(this.scene, 42, 42, {
      sheet: 'races',
      icon: RACE_ICON_BY_ID[race.id] ?? 'neonLoop',
    });
    this.raceIcon.setDisplaySize(56, 56);

    this.titleText = this.scene.add.text(84, 12, race.name, {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
    });

    this.infoText = this.scene.add.text(84, 40, `Time ${race.durationSeconds}s | Prize ${race.rewards.first}/${race.rewards.second}/${race.rewards.third}\nFuel ${race.fuelMin}-${race.fuelMax} | Cooldown ${race.cooldownSeconds}s`, {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      lineSpacing: 3,
    });

    this.statusIcon = new IconEntity(this.scene, 24, 88, { sheet: 'icons', icon: 'raceFlag' });
    this.statusIcon.setDisplaySize(18, 18);

    this.statusText = this.scene.add.text(42, 88, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    }).setOrigin(0, 0.5);

    this.actionButton = new ButtonEntity(this.scene, 344, 86, 88, 32, 'Enter', () => {
      this.onEnter(this.race.id);
    });

    this.add([panel, this.raceIcon, this.titleText, this.infoText, this.statusIcon, this.statusText, this.actionButton]);
  }

  setStatus(status: RaceCardStatus): void {
    this.statusText.setText(status.label);
    this.statusIcon.setIcon({ sheet: 'icons', icon: status.icon });
    this.actionButton.setDisabled(status.disabled);
  }

  getRaceId(): string {
    return this.race.id;
  }
}
