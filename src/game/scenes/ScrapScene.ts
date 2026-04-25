import { Scene, Time } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { IconEntity } from '@/game/entities/IconEntity';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ScrapUpgradeListEntity } from '@/game/entities/ScrapUpgradeListEntity';
import { TitleEntity } from '@/game/entities/TitleEntity';
import { ToastEntity } from '@/game/entities/ToastEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import type { GameState } from '@/core/domain/GameState';
import { FUEL_PURCHASE_AMOUNT, FUEL_PURCHASE_CASH_COST } from '@/core/utils/Constants';

export class ScrapScene extends Scene {
  private resourceHud!: ResourceHud;
  private toast?: ToastEntity;
  private collectButton?: ButtonEntity;
  private collectIcon?: IconEntity<'icons'>;
  private buyFuelButton?: ButtonEntity;
  private buyFuelIcon?: IconEntity<'icons'>;
  private upgradeList?: ScrapUpgradeListEntity;
  private latestState?: GameState;
  private unsubscribeState?: () => void;
  private cooldownTimer?: Time.TimerEvent;

  constructor() {
    super('ScrapScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.resourceHud = new ResourceHud(this);
    this.toast = new ToastEntity(this, this.scale.width / 2, 70);
    this.createTitle();

    const scrapyard = this.add.image(this.scale.width / 2, 280, 'scrapyard');
    scrapyard.setDisplaySize(400, 266);

    this.collectButton = new ButtonEntity(this, this.scale.width / 2, 468, 170, 42, 'Collect scrap', () => {
      void ActionProvider.collectScrap().then((state) => {
        this.latestState = state;
        this.refreshCollectButton();
      });
    });
    this.collectIcon = new IconEntity(this, this.scale.width / 2 - 60, 468, { sheet: 'icons', icon: 'collectScrap' });
    this.collectIcon.setDisplaySize(24, 24);
    this.collectIcon.setDepth(1002);
    this.buyFuelButton = new ButtonEntity(this, this.scale.width / 2, 520, 190, 42, `Buy ${FUEL_PURCHASE_AMOUNT} fuel`, () => {
      void ActionProvider.buyFuel().then((state) => {
        this.latestState = state;
        this.refreshFuelButton();
      });
    });
    this.buyFuelIcon = new IconEntity(this, this.scale.width / 2 - 82, 520, { sheet: 'icons', icon: 'fuel' });
    this.buyFuelIcon.setDisplaySize(24, 24);
    this.buyFuelIcon.setDepth(1002);
    this.upgradeList = new ScrapUpgradeListEntity(this, 28, 564, 424);

    this.unsubscribeState = ActionProvider.subscribeState((state) => {
      this.latestState = state;
      this.refreshCollectButton();
    });
    this.cooldownTimer = this.time.addEvent({
      delay: 250,
      loop: true,
      callback: () => void this.refreshState(),
    });

    new MenuEntity(this);

    this.events.once('shutdown', () => {
      this.unsubscribeState?.();
      this.cooldownTimer?.remove(false);
      this.collectButton?.destroy();
      this.collectIcon?.destroy();
      this.buyFuelButton?.destroy();
      this.buyFuelIcon?.destroy();
      this.upgradeList?.destroy();
      this.toast?.destroy();
    });
  }

  private createTitle(): void {
    new TitleEntity(this, 40, 88, 'SCRAPYARD', 'COLLECT SCRAP TO BUILD');
  }

  private refreshCollectButton(): void {
    if (!this.latestState || !this.collectButton || !this.collectIcon) {
      return;
    }

    const remainingSeconds = Math.max(0, Math.ceil((this.latestState.scrapCollectAvailableAt - Date.now()) / 1000));
    const disabled = remainingSeconds > 0;

    this.collectButton.setDisabled(disabled);
    this.collectButton.setLabel(disabled ? `Collecting ${remainingSeconds}s` : 'Collect scrap');
    this.collectIcon.setAlpha(disabled ? 0.45 : 1);
    this.refreshFuelButton();
    this.refreshUpgradeList();
  }

  private refreshFuelButton(): void {
    if (!this.latestState || !this.buyFuelButton || !this.buyFuelIcon) {
      return;
    }

    const disabled = this.latestState.cash < FUEL_PURCHASE_CASH_COST;
    this.buyFuelButton.setDisabled(disabled);
    this.buyFuelButton.setLabel(`Buy ${FUEL_PURCHASE_AMOUNT} fuel - ${FUEL_PURCHASE_CASH_COST} cash`);
    this.buyFuelIcon.setAlpha(disabled ? 0.45 : 1);
  }

  private refreshUpgradeList(): void {
    if (!this.latestState || !this.upgradeList) {
      return;
    }

    const tools = ActionProvider.getWorkshopToolRepository()
      .findAll()
      .filter((tool) => this.latestState?.craftedToolIds.includes(tool.id));
    this.upgradeList.refresh(tools);
  }

  private async refreshState(): Promise<void> {
    const state = await ActionProvider.getState();
    if (!this.sys.isActive()) {
      return;
    }

    this.latestState = state;
    this.refreshCollectButton();
  }
}
