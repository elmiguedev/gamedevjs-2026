import { GameObjects, Scene } from 'phaser';
import type { Race } from '@/core/domain/Race';
import { RaceCardEntity } from '@/game/entities/RaceCardEntity';

export class RaceListEntity extends GameObjects.Container {
  private cards: RaceCardEntity[] = [];
  private races: Race[] = [];

  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly onEnter: (raceId: string) => void,
  ) {
    super(scene, x, y);
    this.scene.add.existing(this);
  }

  setData(races: Race[], statusResolver: (race: Race) => { label: string; disabled: boolean }): void {
    this.clearCards();
    this.races = races;

    let yOffset = 0;

    races.forEach((race) => {
      const card = new RaceCardEntity(this.scene, 0, yOffset, race, this.onEnter);
      card.setStatus(statusResolver(race));
      this.cards.push(card);
      this.add(card);
      yOffset += 108;
    });
  }

  updateStatuses(statusResolver: (race: Race) => { label: string; disabled: boolean }): void {
    this.cards.forEach((card) => {
      const race = this.races.find((entry) => entry.id === card.getRaceId());

      if (!race) {
        return;
      }

      card.setStatus(statusResolver(race));
    });
  }

  private clearCards(): void {
    this.cards.forEach((card) => card.destroy());
    this.cards = [];
  }
}
