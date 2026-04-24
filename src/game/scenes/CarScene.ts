import { Scene } from 'phaser';
import { CarEntity } from '@/game/entities/CarEntity';
import { CarPartDetailsEntity } from '@/game/entities/CarPartDetailsEntity';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import type { GameState } from '@/core/domain/GameState';
import type { CarSlot } from '@/core/domain/CarSlot';

export class CarScene extends Scene {
  // entities
  // ------------

  private resourceHud?: ResourceHud;
  private carEntity?: CarEntity;
  private detailsEntity?: CarPartDetailsEntity;

  // state
  // --------------

  private currentState?: GameState;
  private initialized = false;
  private selectedSlotId = 'engine';
  private unsubscribeState?: () => void;

  // constructor
  // ----------------

  constructor() {
    super('CarScene');
  }

  // core loop methods
  // ----------------

  create(): void {
    this.createBackground();
    this.createHud();
    this.createMenu();
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
    this.add.text(22, 102, 'GARAGE', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '34px',
      fontStyle: 'bold',
    });
  }

  // behavior methods
  // ------------------

  private buildCar(state: GameState): void {

    this.carEntity = new CarEntity(this, 240, 252, state.car, {
      selectedSlotId: this.selectedSlotId,
      onSelectSlot: (slot) => {
        this.selectedSlotId = slot.id;
        this.refreshScene();
      },
    });

    this.detailsEntity = new CarPartDetailsEntity(
      this,
      240,
      418,
      this.findSlotById(state, this.selectedSlotId) ?? state.car.slots.engine,
      (slotId) => {
        void ActionProvider.repairCarSlot(slotId).then((updatedState) => {
          this.currentState = updatedState;
          this.refreshScene();
        });
      },
    );

    this.refreshScene();
  }



  private refreshScene(): void {
    if (!this.currentState || !this.carEntity) {
      return;
    }

    this.carEntity.refresh(this.currentState.car, this.selectedSlotId);

    const selectedSlot = this.findSlotById(this.currentState, this.selectedSlotId) ?? this.currentState.car.slots.engine;
    this.detailsEntity?.update(selectedSlot);
  }

  private destroyScene(): void {
    this.unsubscribeState?.();
    this.resourceHud?.destroy();
    this.carEntity?.destroy();
    this.detailsEntity?.destroy();
  }

  private findSlotById(state: GameState, slotId: string): CarSlot | null {
    const slots = [
      state.car.slots.chassis,
      state.car.slots.wheels.frontLeft,
      state.car.slots.wheels.frontRight,
      state.car.slots.wheels.rearLeft,
      state.car.slots.wheels.rearRight,
      state.car.slots.engine,
      state.car.slots.steering,
      state.car.slots.nitro,
      state.car.slots.spoiler,
    ];

    return slots.find((slot) => slot.id === slotId) ?? null;
  }
}
