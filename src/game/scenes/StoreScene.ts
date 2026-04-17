import { GameObjects, Scene } from 'phaser';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';

type InventoryRow = {
  container: GameObjects.Container;
  equipButton: GameObjects.Rectangle;
  equipLabel: GameObjects.Text;
};

export class StoreScene extends Scene {
  private inventoryRows: InventoryRow[] = [];
  private inventoryHeaderText?: GameObjects.Text;
  private emptyText?: GameObjects.Text;
  private unsubscribeInventory?: () => void;

  constructor() {
    super('StoreScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    new ResourceHud(this);

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

    this.unsubscribeInventory = ActionProvider.getCarPartInventoryRepository().subscribe((items) => this.renderInventory(items));

    this.events.once('shutdown', () => {
      this.unsubscribeInventory?.();
      this.clearInventory();
    });

    new MenuEntity(this);
  }

  private renderInventory(items: Array<{ id: string; part: { name: string; type: string } }>): void {
    this.clearInventory();

    this.inventoryHeaderText = this.add.text(40, 180, 'Your Parts', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    let y = 224;

    if (!items.length) {
      this.emptyText = this.add.text(40, y, 'No parts in inventory yet.', {
        color: '#111111',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      });
      return;
    }

    items.forEach((item) => {
      const row = this.add.container(0, y);
      const label = this.add.text(40, 0, `${item.part.name} | ${item.part.type}`, {
        color: '#111111',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      }).setOrigin(0, 0.5);

      const equipButton = this.add.rectangle(620, 0, 92, 30, 0x111111);
      equipButton.setInteractive({ useHandCursor: true });

      const equipLabel = this.add.text(620, 0, 'Equip', {
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      }).setOrigin(0.5);

      equipButton.on('pointerdown', () => {
        void ActionProvider.equipCarPart(item.id);
      });

      row.add([label, equipButton, equipLabel]);
      this.inventoryRows.push({ container: row, equipButton, equipLabel });
      y += 44;
    });
  }

  private clearInventory(): void {
    this.inventoryRows.forEach((row) => row.container.destroy(true));
    this.inventoryRows = [];

    this.inventoryHeaderText?.destroy();
    this.emptyText?.destroy();
    this.inventoryHeaderText = undefined;
    this.emptyText = undefined;
  }
}
