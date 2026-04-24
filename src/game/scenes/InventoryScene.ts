import { GameObjects, Scene, type Time } from 'phaser';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import { ConfirmationEntity } from '@/game/entities/ConfirmationEntity';
import { ToastEntity } from '@/game/entities/ToastEntity';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { IconEntity } from '@/game/entities/IconEntity';
import { PART_ICON_BY_PART_ID, SLOT_ICON_BY_TYPE, type PartsIconName, type UiIconName } from '@/game/assets/spritesheets';
import type { GameState } from '@/core/domain/GameState';
import type { CarPartInventoryItem } from '@/core/domain/CarPartInventory';
import type { CarPart } from '@/core/domain/CarPart';

type WorkshopTab = 'craft' | 'inventory';

type WorkshopRow = {
  container: GameObjects.Container;
  craftButton: ButtonEntity;
};

const CONTENT_X = 28;
const CONTENT_WIDTH = 424;
const PANEL_Y = 232;
const PANEL_HEIGHT = 344;
const INVENTORY_ITEMS_PER_PAGE = 4;

export class InventoryScene extends Scene {
  private resourceHud!: ResourceHud;
  private unsubscribeInventory?: () => void;
  private unsubscribeState?: () => void;
  private confirmation?: ConfirmationEntity;
  private toast?: ToastEntity;
  private latestState?: GameState;
  private refreshEvent?: Time.TimerEvent;
  private activeTab: WorkshopTab = 'craft';
  private inventoryItems: CarPartInventoryItem[] = [];
  private contentObjects: GameObjects.GameObject[] = [];
  private craftRows: WorkshopRow[] = [];
  private craftingText?: GameObjects.Text;
  private inventoryPage = 0;
  private autoClaiming = false;

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

    this.createHero();
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
      callback: () => this.updateCraftingStatus(),
    });

    new MenuEntity(this);
    this.renderActiveTab();

    this.events.once('shutdown', () => {
      this.refreshEvent?.remove(false);
      this.unsubscribeInventory?.();
      this.unsubscribeState?.();
      this.clearContent();
      this.confirmation?.destroy();
      this.toast?.destroy();
    });
  }

  private createHero(): void {
    this.add.text(30, 98, 'TALLER', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
      fontStyle: 'bold',
    });

    const banner = this.add.rectangle(32, 158, 190, 34, 0xf2d27a).setOrigin(0, 0.5);
    banner.setStrokeStyle(1, 0x111111);
    this.add.text(48, 158, 'CREA. MEJORA. GANA.', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.add.text(258, 154, 'Inventario y fabricación', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      wordWrap: { width: 180 },
    }).setOrigin(0, 0.5);
  }

  private createTabs(): void {
    this.createTabButton(116, PANEL_Y + 38, 'Crear', 'craft', 'craft');
    this.createTabButton(300, PANEL_Y + 38, 'Inventario', 'inventory', 'inventory');

    const divider = this.add.rectangle(CONTENT_X, PANEL_Y + 76, CONTENT_WIDTH, 1, 0x111111).setOrigin(0, 0.5);
    divider.setAlpha(0.8);
  }

  private createTabButton(x: number, y: number, label: string, tab: WorkshopTab, iconName: UiIconName): void {
    const active = this.activeTab === tab;
    const bg = this.add.rectangle(x, y, 160, 48, active ? 0x111111 : 0xffffff).setOrigin(0.5);
    bg.setStrokeStyle(1, 0x111111);
    const icon = new IconEntity(this, x - 52, y, { sheet: 'icons', icon: iconName });
    icon.setDisplaySize(18, 18);
    icon.setTint(active ? 0xffffff : 0x111111);
    const text = this.add.text(x - 30, y, label, {
      color: active ? '#ffffff' : '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => {
      this.activeTab = tab;
      this.inventoryPage = 0;
      this.scene.restart();
    });
  }

  private renderActiveTab(): void {
    this.clearContent();

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

    const description = this.add.text(CONTENT_X + 18, PANEL_Y + 96, 'Crea piezas nuevas para mejorar tu auto.', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      wordWrap: { width: CONTENT_WIDTH - 36 },
    });
    this.contentObjects.push(description);

    const parts = ActionProvider.getCarPartRepository().findAll();
    const progress = ActionProvider.getMechanicProgressRepository().get();
    const craftBusy = ActionProvider.getCraftingStatus().active !== null;
    const availableParts = parts
      .filter((part) => progress.level >= part.requiredLevel)
      .filter((part) => part.scrapCost <= state.scrap && part.cashCost <= state.cash)
      .slice(0, 4);

    let y = PANEL_Y + 142;
    availableParts.forEach((part) => {
      const row = this.createCraftRow(y, part, craftBusy);
      this.craftRows.push(row);
      this.contentObjects.push(row.container);
      y += 50;
    });

    if (!availableParts.length) {
      const empty = this.add.text(CONTENT_X + 18, y, 'No hay piezas disponibles con tus recursos actuales.', {
        color: '#444444',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        wordWrap: { width: CONTENT_WIDTH - 36 },
      });
      this.contentObjects.push(empty);
    }

    this.updateCraftingStatus();
  }

  private createCraftRow(y: number, part: CarPart, craftBusy: boolean): WorkshopRow {
    const row = this.add.container(CONTENT_X + 18, y);
    const panel = this.add.rectangle(0, 0, CONTENT_WIDTH - 36, 42, 0xffffff).setOrigin(0, 0.5);
    panel.setStrokeStyle(1, 0x111111);

    const icon = new IconEntity(this, 22, 0, this.getPartIcon(part));
    icon.setDisplaySize(26, 26);

    const name = this.add.text(46, -8, part.name, {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    const cost = this.add.text(46, 10, `Scrap ${part.scrapCost} | Cash ${part.cashCost} | ${part.craftTimeSeconds}s`, {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
    }).setOrigin(0, 0.5);

    const craftButton = new ButtonEntity(this, 338, 0, 68, 28, 'Craft', () => {
      void ActionProvider.craftCarPart(part.id)
        .then(() => this.updateCraftingStatus())
        .catch((error: unknown) => this.ensureCraftingText(PANEL_Y + PANEL_HEIGHT - 36, error instanceof Error ? error.message : 'Craft failed'));
    }, craftBusy);

    row.add([panel, icon, name, cost, craftButton]);
    return { container: row, craftButton };
  }

  private renderInventory(): void {
    const description = this.add.text(CONTENT_X + 18, PANEL_Y + 96, 'Aquí están todas las piezas que has conseguido.', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      wordWrap: { width: CONTENT_WIDTH - 36 },
    });
    this.contentObjects.push(description);

    if (!this.inventoryItems.length) {
      const empty = this.add.text(CONTENT_X + 18, PANEL_Y + 148, 'Tu inventario está vacío. Crea piezas en el taller.', {
        color: '#444444',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        wordWrap: { width: CONTENT_WIDTH - 36 },
      });
      this.contentObjects.push(empty);
      return;
    }

    const maxPage = this.getInventoryMaxPage();
    this.inventoryPage = Math.min(this.inventoryPage, maxPage);
    const start = this.inventoryPage * INVENTORY_ITEMS_PER_PAGE;
    const pageItems = this.inventoryItems.slice(start, start + INVENTORY_ITEMS_PER_PAGE);

    pageItems.forEach((item, index) => {
      const row = this.createInventoryRow(CONTENT_X + 18, PANEL_Y + 146 + index * 48, item);
      this.contentObjects.push(row);
    });

    this.createInventoryPagination(PANEL_Y + PANEL_HEIGHT - 28, maxPage);
  }

  private createInventoryRow(x: number, y: number, item: CarPartInventoryItem): GameObjects.Container {
    const card = this.add.container(x, y);
    const panel = this.add.rectangle(0, 0, CONTENT_WIDTH - 36, 42, 0xffffff).setOrigin(0, 0.5);
    panel.setStrokeStyle(1, 0x111111);

    const icon = new IconEntity(this, 22, 0, this.getPartIcon(item.part));
    icon.setDisplaySize(26, 26);

    const name = this.add.text(46, -8, item.part.name, {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      wordWrap: { width: 170 },
    }).setOrigin(0, 0.5);

    const badge = this.add.text(46, 10, item.equipped ? 'EQUIPPED' : item.part.type.toUpperCase(), {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      backgroundColor: item.equipped ? '#d1d5db' : '#f2d27a',
      padding: { left: 4, right: 4, top: 2, bottom: 2 },
    }).setOrigin(0, 0.5);

    const equipButton = new ButtonEntity(this, 338, 0, 68, 28, item.equipped ? 'On' : 'Equip', () => {
      void this.requestEquip(item.id);
    }, item.equipped);

    card.add([panel, icon, name, badge, equipButton]);
    return card;
  }

  private createInventoryPagination(y: number, maxPage: number): void {
    const pageText = this.add.text(this.scale.width / 2, y, `${this.inventoryPage + 1}/${maxPage + 1}`, {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const prevButton = new ButtonEntity(this, this.scale.width / 2 - 82, y, 64, 28, 'Prev', () => {
      this.inventoryPage = Math.max(0, this.inventoryPage - 1);
      this.renderActiveTab();
    }, this.inventoryPage <= 0);

    const nextButton = new ButtonEntity(this, this.scale.width / 2 + 82, y, 64, 28, 'Next', () => {
      this.inventoryPage = Math.min(maxPage, this.inventoryPage + 1);
      this.renderActiveTab();
    }, this.inventoryPage >= maxPage);

    this.contentObjects.push(pageText, prevButton, nextButton);
  }

  private getInventoryMaxPage(): number {
    return Math.max(0, Math.ceil(this.inventoryItems.length / INVENTORY_ITEMS_PER_PAGE) - 1);
  }

  private updateCraftingStatus(): void {
    if (this.activeTab !== 'craft') {
      return;
    }

    const status = ActionProvider.getCraftingStatus();
    const y = PANEL_Y + PANEL_HEIGHT - 36;

    if (status.active) {
      const elapsed = (Date.now() - status.active.startedAt) / 1000;
      const progress = Math.min(100, Math.floor((elapsed / status.active.craftTimeSeconds) * 100));
      const remaining = Math.max(0, Math.ceil(status.active.craftTimeSeconds - elapsed));
      this.ensureCraftingText(y, `Crafting: ${status.active.part.name} ${progress}% (${remaining}s)`);
      this.setCraftButtonsDisabled(true);
      this.autoClaiming = false;
      return;
    }

    if (status.ready) {
      this.ensureCraftingText(y, `Ready: ${status.ready.name}`);
      this.setCraftButtonsDisabled(true);
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

    this.ensureCraftingText(y, 'Crafting: Idle');
    this.setCraftButtonsDisabled(false);
    this.autoClaiming = false;
  }

  private setCraftButtonsDisabled(disabled: boolean): void {
    this.craftRows.forEach((row) => row.craftButton.setDisabled(disabled));
  }

  private ensureCraftingText(y: number, value: string): void {
    if (!this.craftingText || !this.craftingText.active) {
      this.craftingText = this.add.text(CONTENT_X + 18, y, value, {
        color: '#111111',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        wordWrap: { width: CONTENT_WIDTH - 36 },
      });
      this.contentObjects.push(this.craftingText);
      return;
    }

    this.craftingText.setPosition(CONTENT_X + 18, y);
    this.craftingText.setText(value);
  }

  private clearContent(): void {
    this.craftRows = [];
    this.contentObjects.forEach((object) => object.destroy());
    this.contentObjects = [];
    this.craftingText = undefined;
  }

  private async requestEquip(itemId: string): Promise<void> {
    const item = ActionProvider.getCarPartInventoryRepository().findById(itemId);
    if (!item) {
      return;
    }

    const state = this.latestState ?? await ActionProvider.getState();
    const occupiedItemId = state.car.getEquippedItemIdForType(item.part.type);

    if (occupiedItemId && occupiedItemId !== itemId) {
      this.openConfirm(item, occupiedItemId);
      return;
    }

    void ActionProvider.equipCarPart(itemId);
  }

  private openConfirm(item: CarPartInventoryItem, occupiedItemId: string): void {
    this.confirmation?.destroy();

    const currentItem = ActionProvider.getCarPartInventoryRepository().findById(occupiedItemId);
    const currentName = currentItem?.part.name ?? 'current part';

    this.confirmation = new ConfirmationEntity(
      this,
      'Replace equipped part?',
      `Equip ${item.part.name} and replace ${currentName}?`,
      () => {
        void ActionProvider.equipCarPart(item.id);
        this.confirmation = undefined;
      },
      () => {
        this.confirmation = undefined;
      },
    );
  }

  private getPartIcon(part: CarPart): { sheet: 'icons'; icon: UiIconName } | { sheet: 'parts'; icon: PartsIconName } {
    const partIcon = PART_ICON_BY_PART_ID[part.id as keyof typeof PART_ICON_BY_PART_ID] as PartsIconName | undefined;
    if (partIcon) {
      return { sheet: 'parts', icon: partIcon };
    }

    return { sheet: 'icons', icon: SLOT_ICON_BY_TYPE[part.type] as UiIconName };
  }
}
