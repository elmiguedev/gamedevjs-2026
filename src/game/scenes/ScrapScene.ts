import { GameObjects, Scene, type Time } from 'phaser';
import type { GameState } from '@/core/domain/GameState';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ToastEntity } from '@/game/entities/ToastEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import { IconEntity } from '@/game/entities/IconEntity';

const CONTENT_X = 40;
const CONTENT_WIDTH = 400;
const WORKSHOP_START_Y = 420;
const WORKSHOP_ROW_STEP = 52;

type WorkshopRow = {
  container: GameObjects.Container;
  craftButton: ButtonEntity;
};

export class ScrapScene extends Scene {
  // entities
  // ------------

  private resourceHud!: ResourceHud;
  private rows: WorkshopRow[] = [];
  private headerText?: GameObjects.Text;
  private feedbackText?: GameObjects.Text;
  private craftingText?: GameObjects.Text;
  private toast?: ToastEntity;
  private collectButton?: ButtonEntity;
  private collectIcon?: IconEntity<'icons'>;
  private refreshEvent?: Time.TimerEvent;
  private unsubscribeState?: () => void;
  private autoClaiming = false;

  // constructor
  // ----------------

  constructor() {
    super('ScrapScene');
  }

  // core loop methods
  // ----------------

  preload(): void {
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');
    this.rows = [];
    this.autoClaiming = false;

    this.resourceHud = new ResourceHud(this);
    this.toast = new ToastEntity(this, this.scale.width / 2, 70);

    this.add.text(this.scale.width / 2, 94, 'Scrap Yard', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, 126, 'Collect scrap and craft car parts.', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
    }).setOrigin(0.5);

    const scrapyard = this.add.image(this.scale.width / 2, 246, 'scrapyard');
    scrapyard.setDisplaySize(320, 213);
    scrapyard.setDepth(1);

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
      this.toast?.destroy();
    });
  }

  // behavior methods
  // ------------------

  private renderWorkshop(gameState: GameState): void {
    this.clearWorkshop();

    this.collectButton = new ButtonEntity(this, this.scale.width / 2, 346, 150, 38, 'Collect', () => {
      void ActionProvider.collectScrap();
    });
    this.collectButton.setDepth(6);
    this.collectIcon = new IconEntity(this, this.scale.width / 2 - 52, 346, { sheet: 'icons', icon: 'collectScrap' });
    this.collectIcon.setDisplaySize(22, 22);
    this.collectIcon.setDepth(7);

    const parts = ActionProvider.getCarPartRepository().findAll();
    const progress = ActionProvider.getMechanicProgressRepository().get();
    const craftableParts = parts.filter((part) => progress.level >= part.requiredLevel);
    const availableParts = craftableParts.filter((part) => part.scrapCost <= gameState.scrap && part.cashCost <= gameState.cash);
    const craftBusy = ActionProvider.getCraftingStatus().active !== null;
    this.headerText = this.add.text(CONTENT_X, 382, 'Craftable Parts', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    });

    let y = WORKSHOP_START_Y;

    availableParts.forEach((part) => {
      const row = this.add.container(CONTENT_X, y);
      const panel = this.add.rectangle(0, 0, CONTENT_WIDTH, 44, 0xffffff).setOrigin(0, 0.5);
      panel.setStrokeStyle(1, 0x111111);

      const name = this.add.text(12, -9, part.name, {
        color: '#111111',
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5);

      const details = this.add.text(12, 10, `Lv ${part.requiredLevel} | Scrap ${part.scrapCost} | Cash ${part.cashCost} | ${part.craftTimeSeconds}s`, {
        color: '#444444',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
      }).setOrigin(0, 0.5);

      const craftIcon = new IconEntity(this, 292, 0, { sheet: 'icons', icon: 'craft' });
      craftIcon.setDisplaySize(18, 18);

      const craftButton = new ButtonEntity(this, 354, 0, 76, 30, 'Craft', () => {
        void ActionProvider.craftCarPart(part.id)
          .then(() => {
            this.updateCraftingStatus();
          })
          .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : 'Craft failed';
            this.setFeedback(message);
          });
      }, craftBusy);

      row.add([panel, name, details, craftIcon, craftButton]);
      this.rows.push({ container: row, craftButton });
      y += WORKSHOP_ROW_STEP;
    });

    this.feedbackText = this.add.text(CONTENT_X, y + 8, availableParts.length ? '' : 'No available parts with current resources.', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      wordWrap: { width: CONTENT_WIDTH },
    });

  }

  private updateCraftingStatus(): void {
    const status = ActionProvider.getCraftingStatus();
    const baseY = WORKSHOP_START_Y + Math.max(1, this.rows.length) * WORKSHOP_ROW_STEP + 14;

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
    this.collectIcon?.destroy();

    this.headerText = undefined;
    this.feedbackText = undefined;
    this.collectButton = undefined;
    this.collectIcon = undefined;
  }

  private setCraftButtonsDisabled(disabled: boolean): void {
    this.rows.forEach((row) => row.craftButton.setDisabled(disabled));
  }

  private ensureCraftingText(y: number, value: string): void {
    if (!this.craftingText || !this.craftingText.active) {
      this.craftingText?.destroy();
      this.craftingText = this.add.text(CONTENT_X, y, value, {
        color: '#111111',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        wordWrap: { width: CONTENT_WIDTH },
      });
      return;
    }

    this.craftingText.setPosition(CONTENT_X, y);
    this.craftingText.setText(value);
  }

}
