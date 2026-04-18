import { Scene } from 'phaser';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import { InventoryListEntity } from '@/game/entities/InventoryListEntity';
import { ConfirmationEntity } from '@/game/entities/ConfirmationEntity';
import type { GameState } from '@/core/domain/GameState';
import type { CarPartInventoryItem } from '@/core/domain/CarPartInventory';

export class InventoryScene extends Scene {
  private resourceHud!: ResourceHud;
  private inventoryList?: InventoryListEntity;
  private unsubscribeInventory?: () => void;
  private unsubscribeState?: () => void;
  private confirmation?: ConfirmationEntity;
  private latestState?: GameState;

  constructor() {
    super('InventoryScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.resourceHud = new ResourceHud(this);

    this.add.text(360, 86, 'Inventory', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(360, 124, 'Equip crafted parts from your inventory.', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
    }).setOrigin(0.5);

    this.inventoryList = new InventoryListEntity(this, 40, 180, 640, 520, (itemId) => {
      void this.requestEquip(itemId);
    });

    this.unsubscribeInventory = ActionProvider.getCarPartInventoryRepository().subscribe((items) => {
      this.inventoryList?.setData(items);
    });

    this.unsubscribeState = ActionProvider.subscribeState((state) => {
      this.latestState = state;
    });

    new MenuEntity(this);

    this.events.once('shutdown', () => {
      this.unsubscribeInventory?.();
      this.unsubscribeState?.();
      this.confirmation?.destroy();
      this.inventoryList?.destroy();
    });
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
}
