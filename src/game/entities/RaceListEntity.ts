import { GameObjects, Scene } from 'phaser';
import type { Race } from '@/core/domain/Race';
import { RaceCardEntity } from '@/game/entities/RaceCardEntity';
import { PaginationEntity } from '@/game/entities/PaginationEntity';
import type { UiIconName } from '@/game/assets/spritesheets';

type RaceCardStatus = { label: string; disabled: boolean; icon: UiIconName };
const ITEMS_PER_PAGE = 3;

export class RaceListEntity extends GameObjects.Container {
  private readonly pagination: PaginationEntity;
  private cards: RaceCardEntity[] = [];
  private races: Race[] = [];
  private currentPage = 0;
  private statusResolver?: (race: Race) => RaceCardStatus;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly onEnter: (raceId: string) => void,
  ) {
    super(scene, x, y);
    this.pagination = new PaginationEntity(this.scene, 200, 386, () => this.previousPage(), () => this.nextPage());
    this.add(this.pagination);
    this.scene.add.existing(this);
  }

  setData(races: Race[], statusResolver: (race: Race) => RaceCardStatus): void {
    this.races = races;
    this.statusResolver = statusResolver;
    this.currentPage = Math.min(this.currentPage, this.maxPageIndex());
    this.renderPage();
  }

  updateStatuses(statusResolver: (race: Race) => RaceCardStatus): void {
    this.statusResolver = statusResolver;
    this.cards.forEach((card) => {
      const race = this.races.find((entry) => entry.id === card.getRaceId());

      if (!race) {
        return;
      }

      card.setStatus(statusResolver(race));
    });
  }

  private renderPage(): void {
    this.clearCards();

    const start = this.currentPage * ITEMS_PER_PAGE;
    const pageRaces = this.races.slice(start, start + ITEMS_PER_PAGE);

    let yOffset = 0;

    pageRaces.forEach((race) => {
      const card = new RaceCardEntity(this.scene, 0, yOffset, race, this.onEnter);
      if (this.statusResolver) {
        card.setStatus(this.statusResolver(race));
      }
      this.cards.push(card);
      this.add(card);
      yOffset += 122;
    });

    this.sendToBack(this.cards[0]);
    this.updatePagination();
  }

  private previousPage(): void {
    this.currentPage = Math.max(0, this.currentPage - 1);
    this.renderPage();
  }

  private nextPage(): void {
    this.currentPage = Math.min(this.maxPageIndex(), this.currentPage + 1);
    this.renderPage();
  }

  private maxPageIndex(): number {
    return Math.max(0, Math.ceil(this.races.length / ITEMS_PER_PAGE) - 1);
  }

  private updatePagination(): void {
    const totalPages = Math.max(1, Math.ceil(this.races.length / ITEMS_PER_PAGE));
    this.pagination.setVisible(totalPages > 1);
    this.pagination.setPage(this.currentPage, totalPages);
  }

  private clearCards(): void {
    this.cards.forEach((card) => card.destroy());
    this.cards = [];
  }

  protected preDestroy(): void {
    this.clearCards();
    this.pagination.destroy();
  }
}
