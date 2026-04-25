import { Scene, Time } from 'phaser';
import { CarActionsPanelEntity } from '@/game/entities/CarActionsPanelEntity';
import { CarOverviewEntity } from '@/game/entities/CarOverviewEntity';
import { CarStatsPanelEntity } from '@/game/entities/CarStatsPanelEntity';
import { CarVitalsPanelEntity } from '@/game/entities/CarVitalsPanelEntity';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { TitleEntity } from '@/game/entities/TitleEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import type { GameState } from '@/core/domain/GameState';

export class CarScene extends Scene {
  // entities
  // ------------

  private resourceHud?: ResourceHud;
  private carOverview?: CarOverviewEntity;
  private statsPanel?: CarStatsPanelEntity;
  private vitalsPanel?: CarVitalsPanelEntity;
  private actionsPanel?: CarActionsPanelEntity;

  // state
  // --------------

  private currentState?: GameState;
  private initialized = false;
  private unsubscribeState?: () => void;
  private repairTimer?: Time.TimerEvent;

  // constructor
  // ----------------

  constructor() {
    super('CarScene');
  }

  // core loop methods
  // ----------------

  create(): void {
    this.currentState = undefined;
    this.initialized = false;
    this.carOverview = undefined;
    this.statsPanel = undefined;
    this.vitalsPanel = undefined;
    this.actionsPanel = undefined;

    this.createBackground();
    this.createHud();
    this.createMenu();
    this.createTitle();
    this.createCar();

    this.events.once('shutdown', () => this.destroyScene());
  }

  // creation methods
  // ----------------

  private createBackground(): void {
    this.cameras.main.setBackgroundColor('#ffffff');
  }

  private createHud(): void {
    this.resourceHud = new ResourceHud(this);
  }

  private createMenu(): void {
    new MenuEntity(this);
  }

  private createCar(): void {
    this.unsubscribeState = ActionProvider.subscribeState((state) => {
      this.currentState = state;
      if (this.initialized) {
        this.refreshScene();
      }
    });

    void ActionProvider.getState().then((state) => {
      if (!this.sys.isActive()) {
        return;
      }

      this.currentState = state;
      this.buildCar(state);
      this.initialized = true;
    });
  }

  private createTitle(): void {
    new TitleEntity(this, 40, 88, 'MI AUTO', 'ESTAS SON TUS PARTES');
  }

  // behavior methods
  // ------------------

  private buildCar(state: GameState): void {
    this.carOverview = new CarOverviewEntity(this, 0, 124, state.car);
    this.statsPanel = new CarStatsPanelEntity(this, 20, 360, 440, 86, state.car.attributes);
    this.vitalsPanel = new CarVitalsPanelEntity(this, 20, 458, 440, 78, state.car);
    this.actionsPanel = new CarActionsPanelEntity(
      this,
      20,
      548,
      state,
      (slotIds) => {
        void this.repairSlots(slotIds).then((updatedState) => {
          this.currentState = updatedState;
          if (!this.sys.isActive()) {
            return;
          }

          this.refreshScene();
        }).catch(() => void this.refreshState());
      },
      () => {
        void ActionProvider.refuelCar().then((updatedState) => {
          this.currentState = updatedState;
          if (!this.sys.isActive()) {
            return;
          }

          this.refreshScene();
        }).catch(() => void this.refreshState());
      },
    );

    this.repairTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => void this.refreshState(),
    });

    this.refreshScene();
  }



  private refreshScene(): void {
    if (!this.currentState || !this.carOverview) {
      return;
    }

    this.carOverview.refresh(this.currentState.car);
    this.statsPanel?.refresh(this.currentState.car.attributes);
    this.vitalsPanel?.refresh(this.currentState.car);
    this.actionsPanel?.refresh(this.currentState);
  }

  private async repairSlots(slotIds: string[]): Promise<GameState> {
    let state = this.currentState ?? await ActionProvider.getState();

    for (const slotId of slotIds) {
      state = await ActionProvider.repairCarSlot(slotId);
    }

    return state;
  }

  private async refreshState(): Promise<void> {
    const state = await ActionProvider.getState();
    if (!this.sys.isActive()) {
      return;
    }

    this.currentState = state;
    this.refreshScene();
  }

  private destroyScene(): void {
    this.unsubscribeState?.();
    this.repairTimer?.remove(false);
    this.carOverview?.destroy();
    this.statsPanel?.destroy();
    this.vitalsPanel?.destroy();
    this.actionsPanel?.destroy();
    this.unsubscribeState = undefined;
    this.repairTimer = undefined;
    this.resourceHud = undefined;
    this.carOverview = undefined;
    this.statsPanel = undefined;
    this.vitalsPanel = undefined;
    this.actionsPanel = undefined;
    this.currentState = undefined;
    this.initialized = false;
  }
}
