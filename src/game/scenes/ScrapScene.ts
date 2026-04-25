import { Scene, Time } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { IconEntity } from '@/game/entities/IconEntity';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ScrapUpgradeListEntity } from '@/game/entities/ScrapUpgradeListEntity';
import { TitleEntity } from '@/game/entities/TitleEntity';
import { ToastEntity } from '@/game/entities/ToastEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import { isWorkshopTool } from '@/core/domain/CarCrafting';
import type { GameState } from '@/core/domain/GameState';
import type { WorkshopTool } from '@/core/domain/WorkshopTool';
import { FUEL_PURCHASE_AMOUNT, FUEL_PURCHASE_CASH_COST, SCRAP_SALE_AMOUNT, SCRAP_SALE_CASH_REWARD } from '@/core/utils/Constants';

export class ScrapScene extends Scene {
  private resourceHud!: ResourceHud;
  private toast?: ToastEntity;
  private collectButton?: ButtonEntity;
  private collectIcon?: IconEntity<'icons'>;
  private buyFuelButton?: ButtonEntity;
  private buyFuelIcon?: IconEntity<'icons'>;
  private sellScrapButton?: ButtonEntity;
  private sellScrapIcon?: IconEntity<'icons'>;
  private upgradeList?: ScrapUpgradeListEntity;
  private latestState?: GameState;
  private unsubscribeState?: () => void;
  private cooldownTimer?: Time.TimerEvent;
  private autoClaimingUpgrade = false;

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

    this.collectButton = new ButtonEntity(this, this.scale.width / 2, 410, 220, 42, 'Collect scrap', () => {
      void ActionProvider.collectScrap().then((state) => {
        this.latestState = state;
        this.refreshCollectButton();
      });
    }, false, 'collect');
    this.collectIcon = new IconEntity(this, this.scale.width / 2 - 84, 410, { sheet: 'icons', icon: 'collectScrap' });
    this.collectIcon.setDisplaySize(24, 24);
    this.collectIcon.setDepth(1002);
    this.buyFuelButton = new ButtonEntity(this, 132, 460, 208, 42, `Buy ${FUEL_PURCHASE_AMOUNT} fuel`, () => {
      void ActionProvider.buyFuel().then((state) => {
        this.latestState = state;
        this.refreshFuelButton();
      });
    }, false, 'refuel');
    this.buyFuelIcon = new IconEntity(this, 54, 460, { sheet: 'icons', icon: 'fuel' });
    this.buyFuelIcon.setDisplaySize(24, 24);
    this.buyFuelIcon.setDepth(1002);
    this.sellScrapButton = new ButtonEntity(this, 348, 460, 208, 42, 'Sell scrap', () => {
      void ActionProvider.sellScrap().then((state) => {
        this.latestState = state;
        this.refreshCollectButton();
      });
    }, false, 'sell');
    this.sellScrapIcon = new IconEntity(this, 270, 460, { sheet: 'icons', icon: 'scrapYardCrafting' });
    this.sellScrapIcon.setDisplaySize(24, 24);
    this.sellScrapIcon.setDepth(1002);
    this.upgradeList = new ScrapUpgradeListEntity(this, 24, 490, 432);

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
      this.sellScrapButton?.destroy();
      this.sellScrapIcon?.destroy();
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
    this.refreshSellScrapButton();
    this.refreshUpgradeList();
  }

  private refreshFuelButton(): void {
    if (!this.latestState || !this.buyFuelButton || !this.buyFuelIcon) {
      return;
    }

    const disabled = this.latestState.cash < FUEL_PURCHASE_CASH_COST;
    this.buyFuelButton.setDisabled(disabled);
    this.buyFuelButton.setLabel(`Buy fuel - $${FUEL_PURCHASE_CASH_COST}`);
    this.buyFuelIcon.setAlpha(disabled ? 0.45 : 1);
  }

  private refreshSellScrapButton(): void {
    if (!this.latestState || !this.sellScrapButton || !this.sellScrapIcon) {
      return;
    }

    const disabled = this.latestState.scrap < SCRAP_SALE_AMOUNT;
    this.sellScrapButton.setDisabled(disabled);
    this.sellScrapButton.setLabel(`Sell ${SCRAP_SALE_AMOUNT}S - $${SCRAP_SALE_CASH_REWARD}`);
    this.sellScrapIcon.setAlpha(disabled ? 0.45 : 1);
  }

  private refreshUpgradeList(): void {
    if (!this.latestState || !this.upgradeList) {
      return;
    }

    const tools = ActionProvider.getWorkshopToolRepository()
      .findAll();
    const mechanicLevel = ActionProvider.getMechanicProgressRepository().get().level;
    const craftingStatus = ActionProvider.getCraftingStatus();
    this.upgradeList.refresh(tools, this.latestState, mechanicLevel, craftingStatus, (tool) => this.createUpgrade(tool));
    this.handleReadyUpgrade(craftingStatus);
  }

  private createUpgrade(tool: WorkshopTool): void {
    void ActionProvider.craftCarPart(tool.id)
      .then(() => this.refreshState())
      .catch(() => this.refreshState());
  }

  private handleReadyUpgrade(craftingStatus = ActionProvider.getCraftingStatus()): void {
    if (!craftingStatus.ready || !isWorkshopTool(craftingStatus.ready)) {
      this.autoClaimingUpgrade = false;
      return;
    }

    if (this.autoClaimingUpgrade) {
      return;
    }

    this.autoClaimingUpgrade = true;
    void ActionProvider.claimCraftedPart()
      .then(() => ActionProvider.getState())
      .then((state) => {
        if (!this.sys.isActive()) {
          return;
        }

        this.latestState = state;
        this.autoClaimingUpgrade = false;
        this.refreshCollectButton();
      });
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
