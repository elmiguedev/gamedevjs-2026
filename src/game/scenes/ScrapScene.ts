import { GameObjects, Scene, type Time } from 'phaser';
import type { GameState } from '@/core/domain/GameState';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ToastEntity } from '@/game/entities/ToastEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';

type WorkshopRow = {
  container: GameObjects.Container;
  craftButton: ButtonEntity;
};

export class ScrapScene extends Scene {
  private resourceHud!: ResourceHud;
  private rows: WorkshopRow[] = [];
  private headerText?: GameObjects.Text;
  private feedbackText?: GameObjects.Text;
  private craftingText?: GameObjects.Text;
  private toast?: ToastEntity;
  private collectButton?: ButtonEntity;
  private refreshEvent?: Time.TimerEvent;
  private unsubscribeState?: () => void;
  private autoClaiming = false;

  constructor() {
    super('ScrapScene');
  }

  preload(): void {
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.resourceHud = new ResourceHud(this);
    this.toast = new ToastEntity(this, this.scale.width / 2, 70);

    this.add.text(360, 86, 'Scrap Yard', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(360, 124, 'Craft parts, gain mechanic XP, and store them in your inventory.', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
    }).setOrigin(0.5);

    new MenuEntity(this);

    this.unsubscribeState = ActionProvider.subscribeState((state) => this.renderWorkshop(state));
    this.refreshEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.updateCraftingStatus(),
    });

    this.updateCraftingStatus();

    this.events.once('shutdown', () => {
      this.refreshEvent?.remove(false);
      this.unsubscribeState?.();
      this.clearWorkshop();
      this.craftingText?.destroy();
      this.craftingText = undefined;
      this.collectButton?.destroy();
      this.toast?.destroy();
    });
  }

  private renderWorkshop(gameState: GameState): void {
    this.clearWorkshop();

    const collectY = this.scale.height - 590;

    this.collectButton = new ButtonEntity(this, 360, collectY, 120, 36, 'Collect', () => {
      void ActionProvider.collectScrap();
    });

    const parts = ActionProvider.getCarPartRepository().findAll();
    const progress = ActionProvider.getMechanicProgressRepository().get();
    const craftableParts = parts.filter((part) => progress.level >= part.requiredLevel);
    const availableParts = craftableParts.filter((part) => part.scrapCost <= gameState.scrap && part.cashCost <= gameState.cash);
    const craftBusy = ActionProvider.getCraftingStatus().active !== null;
    this.headerText = this.add.text(40, 194, 'Craftable Parts', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    });

    let y = 230;

    availableParts.forEach((part) => {
      const row = this.add.container(0, y);
      const label = this.add.text(40, 0, `${part.name} | Lv ${part.requiredLevel} | Scrap ${part.scrapCost} | Time ${part.craftTimeSeconds}s`, {
        color: '#111111',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
      }).setOrigin(0, 0.5);

      const craftButton = new ButtonEntity(this, 620, 0, 92, 30, 'Craft', () => {
        void ActionProvider.craftCarPart(part.id)
          .then(() => {
            this.updateCraftingStatus();
          })
          .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : 'Craft failed';
            this.setFeedback(message);
          });
      }, craftBusy);

      row.add([label, craftButton]);
      this.rows.push({ container: row, craftButton });
      y += 44;
    });

    this.feedbackText = this.add.text(40, y + 18, availableParts.length ? '' : 'No available parts with current resources.', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    });

  }

  private updateCraftingStatus(): void {
    const status = ActionProvider.getCraftingStatus();
    const baseY = 230 + Math.max(1, this.rows.length) * 44 + 20;

    if (status.active) {
      const elapsed = (Date.now() - status.active.startedAt) / 1000;
      const progress = Math.min(100, Math.floor((elapsed / status.active.craftTimeSeconds) * 100));
      const remaining = Math.max(0, Math.ceil(status.active.craftTimeSeconds - elapsed));

      this.ensureCraftingText(baseY, `Crafting: ${status.active.part.name} ${progress}% (${remaining}s)`);
      this.setCraftButtonsDisabled(true);
      this.autoClaiming = false;
      return;
    }

    if (status.ready) {
      this.ensureCraftingText(baseY, `Ready: ${status.ready.name}`);
      this.setCraftButtonsDisabled(true);
      if (!this.autoClaiming) {
        this.autoClaiming = true;

        void ActionProvider.claimCraftedPart().then(() => {
          this.autoClaiming = false;
          void ActionProvider.getState().then((state) => this.renderWorkshop(state));
        });
      }
      return;
    }

    this.ensureCraftingText(baseY, 'Crafting: Idle');
    this.setCraftButtonsDisabled(false);
    this.autoClaiming = false;
  }

  private setFeedback(message: string): void {
    this.feedbackText?.setText(message);
  }

  private clearWorkshop(): void {
    this.rows.forEach((row) => row.container.destroy(true));
    this.rows = [];

    this.headerText?.destroy();
    this.feedbackText?.destroy();
    this.collectButton?.destroy();

    this.headerText = undefined;
    this.feedbackText = undefined;
    this.collectButton = undefined;
  }

  private setCraftButtonsDisabled(disabled: boolean): void {
    this.rows.forEach((row) => row.craftButton.setDisabled(disabled));
  }

  private ensureCraftingText(y: number, value: string): void {
    if (!this.craftingText || !this.craftingText.active) {
      this.craftingText?.destroy();
      this.craftingText = this.add.text(40, y, value, {
        color: '#111111',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
      });
      return;
    }

    this.craftingText.setPosition(40, y);
    this.craftingText.setText(value);
  }

}
