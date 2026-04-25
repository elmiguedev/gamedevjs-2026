import { GameObjects, Scene, type Time } from 'phaser';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import { ToastEntity } from '@/game/entities/ToastEntity';
import { TitleEntity } from '@/game/entities/TitleEntity';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { IconEntity } from '@/game/entities/IconEntity';
import { PaginationEntity } from '@/game/entities/PaginationEntity';
import { ProgressBarEntity } from '@/game/entities/ProgressBarEntity';
import { TabPanelEntity } from '@/game/entities/TabPanelEntity';
import { PART_ICON_BY_PART_ID, SLOT_ICON_BY_TYPE, type PartsIconName, type UiIconName } from '@/game/assets/spritesheets';
import type { GameState } from '@/core/domain/GameState';
import type { CarPartInventoryItem } from '@/core/domain/CarPartInventory';
import type { CarPart } from '@/core/domain/CarPart';
import type { CraftingStatus } from '@/core/domain/CarCraftingRepository';
import { isWorkshopTool, type CraftableItem } from '@/core/domain/CarCrafting';
import type { WorkshopTool } from '@/core/domain/WorkshopTool';

type WorkshopTab = 'craft' | 'inventory';

type WorkshopRow = {
  container: GameObjects.Container;
  craftButton: ButtonEntity;
};

const CONTENT_X = 28;
const CONTENT_WIDTH = 424;
const LIST_Y = 356;
const LIST_HEIGHT = 190;
const ITEMS_PER_PAGE = 3;

export class InventoryScene extends Scene {
  private resourceHud!: ResourceHud;
  private unsubscribeInventory?: () => void;
  private unsubscribeState?: () => void;
  private toast?: ToastEntity;
  private latestState?: GameState;
  private refreshEvent?: Time.TimerEvent;
  private activeTab: WorkshopTab = 'craft';
  private inventoryItems: CarPartInventoryItem[] = [];
  private contentObjects: GameObjects.GameObject[] = [];
  private craftRows: WorkshopRow[] = [];
  private inventoryPage = 0;
  private craftPage = 0;
  private autoClaiming = false;
  private tabs?: TabPanelEntity<WorkshopTab>;

  constructor() {
    super('InventoryScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');
    this.inventoryItems = [];
    this.contentObjects = [];
    this.craftRows = [];
    this.autoClaiming = false;

    this.resourceHud = new ResourceHud(this);
    this.toast = new ToastEntity(this, this.scale.width / 2, 70);

    this.createTitle();
    this.createWorkshopImage();
    this.createTabs();

    this.unsubscribeInventory = ActionProvider.getCarPartInventoryRepository().subscribe((items) => {
      this.inventoryItems = items;
      if (this.activeTab === 'inventory') {
        this.renderActiveTab();
      }
    });

    this.unsubscribeState = ActionProvider.subscribeState((state) => {
      this.latestState = state;
      if (this.activeTab === 'craft') {
        this.renderActiveTab();
      }
    });

    this.refreshEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.activeTab === 'craft') {
          this.renderActiveTab();
        }
      },
    });

    new MenuEntity(this);
    this.renderActiveTab();

    this.events.once('shutdown', () => {
      this.refreshEvent?.remove(false);
      this.unsubscribeInventory?.();
      this.unsubscribeState?.();
      this.clearContent();
      this.toast?.destroy();
    });
  }

  private createTitle(): void {
    new TitleEntity(this, 40, 88, 'TALLER', 'CREA. MEJORA. GANA.');
  }

  private createWorkshopImage(): void {
    const workshop = this.add.image(325, 178, 'workshop');
    workshop.setDisplaySize(270, 190);
  }

  private createTabs(): void {
    this.tabs = new TabPanelEntity(this, CONTENT_X, 292, CONTENT_WIDTH, 44, this.activeTab, [
      { key: 'craft', label: 'MESA DE TRABAJO', icon: 'repair' },
      { key: 'inventory', label: 'INVENTARIO', icon: 'inventory' },
    ], (tab) => {
      this.activeTab = tab;
      this.inventoryPage = 0;
      this.craftPage = 0;
      this.renderActiveTab();
    });
  }

  private renderActiveTab(): void {
    this.clearContent();
    this.tabs?.refresh(this.activeTab);

    if (this.activeTab === 'inventory') {
      this.renderInventory();
      return;
    }

    this.renderCrafting();
  }

  private renderCrafting(): void {
    const state = this.latestState;
    if (!state) {
      return;
    }

    const title = this.add.text(CONTENT_X + 8, LIST_Y, 'MESA DE TRABAJO', {
      color: '#111111',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
    });
    this.contentObjects.push(title);

    const parts = ActionProvider.getCarPartRepository().findAll();
    const tools = ActionProvider.getWorkshopToolRepository().findAll();
    const progress = ActionProvider.getMechanicProgressRepository().get();
    const craftingStatus = ActionProvider.getCraftingStatus();
    const craftBusy = craftingStatus.active !== null || craftingStatus.ready !== null;
    const availableParts = [...parts, ...tools];

    const maxPage = this.getMaxPage(availableParts.length);
    this.craftPage = Math.min(this.craftPage, maxPage);
    const activePartId = craftingStatus.active?.part.id ?? craftingStatus.ready?.id;
    const activePartIndex = activePartId ? availableParts.findIndex((part) => part.id === activePartId) : -1;
    if (activePartIndex >= 0) {
      this.craftPage = Math.floor(activePartIndex / ITEMS_PER_PAGE);
    }

    const start = this.craftPage * ITEMS_PER_PAGE;
    const pageParts = availableParts.slice(start, start + ITEMS_PER_PAGE);

    let y = LIST_Y + 42;
    pageParts.forEach((part) => {
      const canCraft = part.scrapCost <= state.scrap && part.cashCost <= state.cash;
      const levelLocked = progress.level < part.requiredLevel;
      const alreadyOwned = isWorkshopTool(part) && state.craftedToolIds.includes(part.id);
      const row = this.createCraftRow(y, part, craftBusy || !canCraft || alreadyOwned || levelLocked, craftingStatus, alreadyOwned, levelLocked);
      this.craftRows.push(row);
      this.contentObjects.push(row.container);
      y += 48;
    });

    if (!pageParts.length) {
      const empty = this.add.text(CONTENT_X + 8, y, 'No hay piezas disponibles para tu nivel actual.', {
        color: '#444444',
        fontFamily: 'Barlow Condensed, Arial, sans-serif',
        fontSize: '13px',
        wordWrap: { width: CONTENT_WIDTH - 36 },
      });
      this.contentObjects.push(empty);
    }

    this.createPagination(maxPage, this.craftPage, (page) => {
      this.craftPage = page;
      this.renderActiveTab();
    });

    this.handleReadyCraft(craftingStatus);
  }

  private createCraftRow(y: number, part: CraftableItem, disabled: boolean, craftingStatus: CraftingStatus, alreadyOwned = false, levelLocked = false): WorkshopRow {
    const row = this.add.container(CONTENT_X + 18, y);
    const panel = this.add.rectangle(0, 0, CONTENT_WIDTH - 16, 42, 0xffffff).setOrigin(0, 0.5);
    panel.setStrokeStyle(1, 0xcccccc);

    const icon = new IconEntity(this, 22, 0, this.getCraftIcon(part));
    icon.setDisplaySize(26, 26);

    const name = this.add.text(46, -8, part.name, {
      color: '#111111',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    const cost = this.add.text(46, 10, this.formatCraftDetail(part, alreadyOwned, levelLocked), {
      color: levelLocked ? '#9ca3af' : '#444444',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '12px',
    }).setOrigin(0, 0.5);

    const active = craftingStatus.active?.part.id === part.id ? craftingStatus.active : null;
    const ready = craftingStatus.ready?.id === part.id;
    const craftButton = new ButtonEntity(this, 330, 0, 68, 28, this.getCraftButtonLabel(part, craftingStatus, alreadyOwned, levelLocked), () => {
      void ActionProvider.craftCarPart(part.id)
        .then(() => this.renderActiveTab())
        .catch(() => this.renderActiveTab());
    }, disabled);

    row.add([panel, icon, name, cost, craftButton]);

    if (active || ready) {
      craftButton.setVisible(false);
      const statusText = this.add.text(330, -8, ready ? 'LISTA' : this.formatActiveCraft(active), {
        color: '#111111',
        fontFamily: 'Barlow Condensed, Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      const progress = ready ? 1 : this.getCraftProgress(active);
      const progressBar = new ProgressBarEntity(this, 292, 10, 76, 4, progress);
      row.add([statusText, progressBar]);
    }

    return { container: row, craftButton };
  }

  private getCraftActionLabel(part: CraftableItem, status: CraftingStatus): string {
    if (status.active?.part.id === part.id) {
      return '...';
    }

    if (status.ready?.id === part.id) {
      return 'Lista';
    }

    return 'Crear';
  }

  private getCraftButtonLabel(part: CraftableItem, status: CraftingStatus, alreadyOwned: boolean, levelLocked: boolean): string {
    if (alreadyOwned) {
      return 'Activa';
    }

    if (levelLocked) {
      return `LV ${part.requiredLevel}`;
    }

    return this.getCraftActionLabel(part, status);
  }

  private formatCraftDetail(part: CraftableItem, alreadyOwned: boolean, levelLocked: boolean): string {
    if (alreadyOwned) {
      return 'MEJORA ACTIVA';
    }

    if (levelLocked) {
      return `Requiere nivel ${part.requiredLevel}`;
    }

    return `Scrap ${part.scrapCost} | Cash ${part.cashCost} | ${part.craftTimeSeconds}s`;
  }

  private formatActiveCraft(active: NonNullable<CraftingStatus['active']> | null): string {
    if (!active) {
      return '';
    }

    const elapsed = (Date.now() - active.startedAt) / 1000;
    const progress = Math.floor(this.getCraftProgress(active) * 100);
    const remaining = Math.max(0, Math.ceil(active.craftTimeSeconds - elapsed));
    return `${progress}% / ${remaining}s`;
  }

  private getCraftProgress(active: NonNullable<CraftingStatus['active']> | null): number {
    if (!active) {
      return 0;
    }

    const elapsed = (Date.now() - active.startedAt) / 1000;
    return Math.min(1, elapsed / active.craftTimeSeconds);
  }

  private renderInventory(): void {
    const title = this.add.text(CONTENT_X + 8, LIST_Y, `INVENTARIO (${this.inventoryItems.length})`, {
      color: '#111111',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
    });
    this.contentObjects.push(title);

    if (!this.inventoryItems.length) {
      const empty = this.add.text(CONTENT_X + 8, LIST_Y + 42, 'Tu inventario está vacío. Crea piezas en el taller.', {
        color: '#444444',
        fontFamily: 'Barlow Condensed, Arial, sans-serif',
        fontSize: '13px',
        wordWrap: { width: CONTENT_WIDTH - 36 },
      });
      this.contentObjects.push(empty);
      return;
    }

    const maxPage = this.getMaxPage(this.inventoryItems.length);
    this.inventoryPage = Math.min(this.inventoryPage, maxPage);
    const start = this.inventoryPage * ITEMS_PER_PAGE;
    const pageItems = this.inventoryItems.slice(start, start + ITEMS_PER_PAGE);

    pageItems.forEach((item, index) => {
      const row = this.createInventoryRow(CONTENT_X + 8, LIST_Y + 42 + index * 48, item);
      this.contentObjects.push(row);
    });

    this.createPagination(maxPage, this.inventoryPage, (page) => {
      this.inventoryPage = page;
      this.renderActiveTab();
    });
  }

  private createInventoryRow(x: number, y: number, item: CarPartInventoryItem): GameObjects.Container {
    const card = this.add.container(x, y);
    const panel = this.add.rectangle(0, 0, CONTENT_WIDTH - 16, 42, 0xffffff).setOrigin(0, 0.5);
    panel.setStrokeStyle(1, 0xcccccc);

    const icon = new IconEntity(this, 22, 0, this.getPartIcon(item.part));
    icon.setDisplaySize(26, 26);

    const name = this.add.text(46, -8, item.part.name, {
      color: '#111111',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      wordWrap: { width: 170 },
    }).setOrigin(0, 0.5);

    const badge = this.add.text(46, 10, item.equipped ? 'EQUIPADA' : item.part.type.toUpperCase(), {
      color: '#111111',
      fontFamily: 'Barlow Condensed, Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      backgroundColor: item.equipped ? '#d1d5db' : '#f2d27a',
      padding: { left: 4, right: 4, top: 2, bottom: 2 },
    }).setOrigin(0, 0.5);

    const equipButton = new ButtonEntity(this, 330, 0, 68, 28, item.equipped ? 'On' : 'Equip', () => {
      void this.requestEquip(item.id);
    }, item.equipped);

    card.add([panel, icon, name, badge, equipButton]);
    return card;
  }

  private createPagination(maxPage: number, currentPage: number, onPage: (page: number) => void): void {
    const pagination = new PaginationEntity(
      this,
      this.scale.width / 2,
      LIST_Y + LIST_HEIGHT,
      () => onPage(Math.max(0, currentPage - 1)),
      () => onPage(Math.min(maxPage, currentPage + 1)),
      onPage,
    );
    pagination.setPage(currentPage, maxPage + 1);
    this.contentObjects.push(pagination);
  }

  private getMaxPage(totalItems: number): number {
    return Math.max(0, Math.ceil(totalItems / ITEMS_PER_PAGE) - 1);
  }

  private handleReadyCraft(status: CraftingStatus): void {
    if (status.ready) {
      if (!this.autoClaiming) {
        this.autoClaiming = true;
        void ActionProvider.claimCraftedPart().then(() => {
          this.autoClaiming = false;
          void ActionProvider.getState().then((state) => {
            this.latestState = state;
            this.renderActiveTab();
          });
        });
      }
      return;
    }

    this.autoClaiming = false;
  }

  private clearContent(): void {
    this.craftRows = [];
    this.contentObjects.forEach((object) => object.destroy());
    this.contentObjects = [];
  }

  private requestEquip(itemId: string): void {
    void ActionProvider.equipCarPart(itemId);
  }

  private getCraftIcon(item: CraftableItem): { sheet: 'icons'; icon: UiIconName } | { sheet: 'parts'; icon: PartsIconName } {
    if (isWorkshopTool(item)) {
      return { sheet: 'icons', icon: this.getToolIcon(item) };
    }

    return this.getPartIcon(item);
  }

  private getToolIcon(tool: WorkshopTool): UiIconName {
    if (tool.id === 'brazo-mecanico') {
      return 'repair';
    }

    if (tool.id === 'iman-poderoso') {
      return 'collectScrap';
    }

    if (tool.id === 'pozo-petrolero') {
      return 'fuel';
    }

    return 'scrapYardCrafting';
  }

  private getPartIcon(part: CarPart): { sheet: 'icons'; icon: UiIconName } | { sheet: 'parts'; icon: PartsIconName } {
    const partIcon = PART_ICON_BY_PART_ID[part.id as keyof typeof PART_ICON_BY_PART_ID] as PartsIconName | undefined;
    if (partIcon) {
      return { sheet: 'parts', icon: partIcon };
    }

    return { sheet: 'icons', icon: SLOT_ICON_BY_TYPE[part.type] as UiIconName };
  }
}
