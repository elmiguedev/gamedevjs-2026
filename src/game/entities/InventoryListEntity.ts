import { GameObjects, Scene } from 'phaser';
import type { CarPartInventoryItem } from '@/core/domain/CarPartInventory';
import { PaginationEntity } from '@/game/entities/PaginationEntity';
import { InventoryRowEntity } from '@/game/entities/InventoryRowEntity';

const ITEMS_PER_PAGE = 6;

export class InventoryListEntity extends GameObjects.Container {
  private readonly frame: GameObjects.Rectangle;
  private readonly headerText: GameObjects.Text;
  private readonly pagination: PaginationEntity;
  private rows: InventoryRowEntity[] = [];
  private items: CarPartInventoryItem[] = [];
  private currentPage = 0;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    private readonly onEquip: (itemId: string) => void,
  ) {
    super(scene, x, y);

    this.frame = this.scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0, 0);

    this.headerText = this.scene.add.text(12, 12, 'Your Parts', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    });

    this.pagination = new PaginationEntity(this.scene, width / 2, height - 32, () => this.previousPage(), () => this.nextPage());

    this.add([this.frame, this.headerText, this.pagination]);
    this.scene.add.existing(this);
  }

  setData(items: CarPartInventoryItem[]): void {
    this.items = items;
    this.currentPage = Math.min(this.currentPage, this.maxPageIndex());
    this.renderPage();
  }

  private renderPage(): void {
    this.rows.forEach((row) => row.destroy());
    this.rows = [];

    const start = this.currentPage * ITEMS_PER_PAGE;
    const pageItems = this.items.slice(start, start + ITEMS_PER_PAGE);

    let yOffset = 54;

    if (!pageItems.length) {
      this.pagination.setPage(0, 1);
      return;
    }

    pageItems.forEach((item) => {
      const row = new InventoryRowEntity(this.scene, 12, yOffset, item, (itemId) => this.onEquip(itemId));
      this.rows.push(row);
      this.add(row);
      yOffset += 44;
    });

    this.updatePageText();
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
    return Math.max(0, Math.ceil(this.items.length / ITEMS_PER_PAGE) - 1);
  }

  private updatePageText(): void {
    const totalPages = Math.max(1, Math.ceil(this.items.length / ITEMS_PER_PAGE));

    this.pagination.setPage(this.currentPage, totalPages);
  }

  protected preDestroy(): void {
    this.rows.forEach((row) => row.destroy());
    this.pagination.destroy();
    this.frame.destroy();
    this.headerText.destroy();
  }
}
