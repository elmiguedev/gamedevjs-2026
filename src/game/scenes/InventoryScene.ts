import { Scene } from 'phaser';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import { InventoryListEntity } from '@/game/entities/InventoryListEntity';

export class InventoryScene extends Scene {
  private resourceHud!: ResourceHud;
  private inventoryList?: InventoryListEntity;
  private unsubscribeInventory?: () => void;
  private unsubscribeState?: () => void;

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

    this.inventoryList = new InventoryListEntity(this, 40, 180, (itemId) => {
      void ActionProvider.equipCarPart(itemId);
    });

    this.unsubscribeInventory = ActionProvider.getCarPartInventoryRepository().subscribe((items) => {
      const state = ActionProvider.getState();
      void state.then((gameState) => {
        this.inventoryList?.setData(items, gameState.car);
      });
    });

    this.unsubscribeState = ActionProvider.subscribeState((state) => {
      const items = ActionProvider.getCarPartInventoryRepository().findAll();
      this.inventoryList?.setData(items, state.car);
    });

    new MenuEntity(this);

    this.events.once('shutdown', () => {
      this.unsubscribeInventory?.();
      this.unsubscribeState?.();
      this.inventoryList?.destroy();
    });
  }
}
