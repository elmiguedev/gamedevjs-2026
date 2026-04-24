import { Scene } from 'phaser';
import { CarPartDetailsEntity } from '@/game/entities/CarPartDetailsEntity';
import { CarSlotCardEntity } from '@/game/entities/CarSlotCardEntity';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import { CAR_DRAFT_URL } from '@/game/assets/spritesheets';
import type { GameState } from '@/core/domain/GameState';
import type { CarSlot } from '@/core/domain/CarSlot';

type SlotCard = {
  slotId: string;
  entity: CarSlotCardEntity;
};

export class CarScene extends Scene {

  // entities
  // --------------------------------

  // hud con el gamestate
  private resourceHud?: ResourceHud;
  private menu?: MenuEntity;
  private detailsEntity?: CarPartDetailsEntity;
  private slotCards: SlotCard[] = [];
  private carDraft?: Phaser.GameObjects.Image;
  private titleText?: Phaser.GameObjects.Text;
  private refreshTimer?: Phaser.Time.TimerEvent;

  // state
  // --------------------------------

  private currentState?: GameState;
  private initialized = false;
  private selectedSlotId = 'engine';
  private unsubscribeState?: () => void;

  // constructor
  // --------------------------------

  constructor() {
    super('CarScene');
  }

  // creation methods
  // --------------------------------

  create(): void {
    this.createBackground();
    this.createGameHud();
    this.createMenuHud();

    this.unsubscribeState = ActionProvider.subscribeState((state) => {
      this.currentState = state;
      if (this.initialized) {
        this.refreshScene();
      }
    });

    // this.refreshTimer = this.time.addEvent({
    //   delay: 1000,
    //   loop: true,
    //   callback: () => void this.pullState(),
    // });

    // void this.pullState();

    this.events.once('shutdown', () => {
      this.destroyScene();
    });
  }

  private createBackground() {
    this.cameras.main.setBackgroundColor('#ffffff');
  }

  private createGameHud() {
    this.resourceHud = new ResourceHud(this);
  }

  private createMenuHud() {
    this.menu = new MenuEntity(this);
  }

  private destroyScene() {
    this.unsubscribeState?.();
    this.resourceHud?.destroy();
    this.detailsEntity?.destroy();
    this.slotCards.forEach((card) => card.entity.destroy());
    this.titleText?.destroy();
    this.carDraft?.destroy();
  }

  private async pullState(): Promise<void> {
    const state = await ActionProvider.getState();

    if (!this.sys.isActive()) {
      return;
    }

    this.currentState = state;

    if (!this.initialized) {
      this.buildScene(state);
      this.initialized = true;
      return;
    }

    this.refreshScene();
  }

  private buildScene(state: GameState): void {
    this.addTitle();
    this.addCarDraft();
    this.addSlotCards(state);
    this.addDetails(state);
    this.refreshScene();
  }

  private addTitle(): void {
    this.titleText = this.add.text(34, 108, 'GARAGE', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '38px',
      fontStyle: 'bold',
    });
  }

  private addCarDraft(): void {
    this.carDraft = this.add.image(360, 468, 'car-draft');
    this.carDraft.setOrigin(0.5);
    this.carDraft.setDisplaySize(430, 254);
  }

  private addSlotCards(state: GameState): void {
    const slots: Array<{ slot: CarSlot; x: number; y: number; width: number; height: number }> = [
      { slot: state.car.slots.steering, x: 122, y: 312, width: 82, height: 92 },
      { slot: state.car.slots.engine, x: 360, y: 300, width: 82, height: 92 },
      { slot: state.car.slots.nitro, x: 598, y: 312, width: 82, height: 92 },
      { slot: state.car.slots.wheels.frontLeft, x: 112, y: 532, width: 76, height: 88 },
      { slot: state.car.slots.wheels.frontRight, x: 608, y: 532, width: 76, height: 88 },
      { slot: state.car.slots.wheels.rearLeft, x: 112, y: 676, width: 76, height: 88 },
      { slot: state.car.slots.wheels.rearRight, x: 608, y: 676, width: 76, height: 88 },
      { slot: state.car.slots.chassis, x: 258, y: 742, width: 82, height: 92 },
      { slot: state.car.slots.spoiler, x: 462, y: 742, width: 82, height: 92 },
    ];

    this.slotCards = slots.map(({ slot, x, y, width, height }) => ({
      slotId: slot.id,
      entity: new CarSlotCardEntity(this, x, y, width, height, slot, (selectedSlot) => {
        this.selectedSlotId = selectedSlot.id;
        this.refreshScene();
      }),
    }));

    this.slotCards.forEach(({ entity }) => entity.setDepth(5));
  }

  private addDetails(state: GameState): void {
    this.detailsEntity = new CarPartDetailsEntity(
      this,
      360,
      980,
      this.findSlotById(state, this.selectedSlotId) ?? state.car.slots.engine,
      (slotId) => void ActionProvider.repairCarSlot(slotId).then((updatedState) => {
        this.currentState = updatedState;
        this.refreshScene();
      }),
    );
  }

  private refreshScene(): void {
    if (!this.currentState) {
      return;
    }

    const state = this.currentState;

    this.slotCards.forEach(({ slotId, entity }) => {
      const slot = this.findSlotById(state, slotId);
      if (!slot) {
        return;
      }

      entity.refresh(slot, slot.id === this.selectedSlotId);
    });

    const selectedSlot = this.findSlotById(state, this.selectedSlotId) ?? state.car.slots.engine;
    this.detailsEntity?.update(selectedSlot);
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
