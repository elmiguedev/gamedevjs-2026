import { GameObjects, Scene } from 'phaser';
import type { Achievement } from '@/core/domain/Achievement';
import { AchievementRowEntity } from '@/game/entities/AchievementRowEntity';
import { PaginationEntity } from '@/game/entities/PaginationEntity';

const ITEMS_PER_PAGE = 4;

export class AchievementListEntity extends GameObjects.Container {
  private readonly frame: GameObjects.Rectangle;
  private readonly titleText: GameObjects.Text;
  private readonly pagination: PaginationEntity;
  private rows: AchievementRowEntity[] = [];
  private achievements: Achievement[] = [];
  private currentPage = 0;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);

    this.frame = this.scene.add.rectangle(0, 0, 640, 540, 0xffffff).setOrigin(0, 0);
    this.titleText = this.scene.add.text(12, 12, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    });

    this.pagination = new PaginationEntity(this.scene, 320, 502, () => this.previousPage(), () => this.nextPage());

    this.add([this.frame, this.titleText, this.pagination]);
    this.scene.add.existing(this);
  }

  setData(title: string, achievements: Achievement[]): void {
    this.titleText.setText(title);
    this.achievements = achievements;
    this.currentPage = 0;
    this.renderPage();
  }

  private renderPage(): void {
    this.rows.forEach((row) => row.destroy());
    this.rows = [];

    const start = this.currentPage * ITEMS_PER_PAGE;
    const pageItems = this.achievements.slice(start, start + ITEMS_PER_PAGE);

    let yOffset = 44;

    pageItems.forEach((achievement) => {
      const row = new AchievementRowEntity(this.scene, 0, yOffset, achievement);
      this.rows.push(row);
      this.add(row);
      yOffset += 96;
    });

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
    return Math.max(0, Math.ceil(this.achievements.length / ITEMS_PER_PAGE) - 1);
  }

  private updatePagination(): void {
    const totalPages = Math.max(1, Math.ceil(this.achievements.length / ITEMS_PER_PAGE));
    this.pagination.setPage(this.currentPage, totalPages);
  }

  protected preDestroy(): void {
    this.rows.forEach((row) => row.destroy());
    this.pagination.destroy();
    this.frame.destroy();
    this.titleText.destroy();
  }
}
