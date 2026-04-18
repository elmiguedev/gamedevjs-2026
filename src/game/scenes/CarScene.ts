import { Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { CarEntity } from '@/game/entities/CarEntity';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import { ToastEntity } from '@/game/entities/ToastEntity';

export class CarScene extends Scene {
  private carEntity?: CarEntity;
  private refuelButton?: ButtonEntity;
  private toast?: ToastEntity;
  private unsubscribeState?: () => void;
  private refreshTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('CarScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    new ResourceHud(this);
    this.toast = new ToastEntity(this, this.scale.width / 2, 70);
    void this.loadCar();

    this.refuelButton = new ButtonEntity(this, 560, 548, 120, 34, 'Refuel', () => {
      void ActionProvider.refuelCar();
    });

    new MenuEntity(this);

    this.unsubscribeState = ActionProvider.subscribeState((state) => {
      if (!this.sys.isActive() || !this.carEntity?.active) {
        return;
      }

      const disabled = state.fuel <= 0 || state.car.fuel >= state.car.maxFuel;
      this.refuelButton?.setDisabled(disabled);
      this.carEntity?.refresh(state.car);
    });

    this.refreshTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.sys.isActive() || !this.carEntity?.active) {
          return;
        }

        void ActionProvider.getState().then((state) => {
          this.carEntity?.refresh(state.car);
        });
      },
    });

    this.events.once('shutdown', () => {
      this.unsubscribeState?.();
      this.refreshTimer?.remove(false);
      this.refuelButton?.destroy();
      this.toast?.destroy();
    });
  }

  private async loadCar(): Promise<void> {
    const state = await ActionProvider.getState();
    if (!this.sys.isActive()) {
      return;
    }

    const { centerX } = this.cameras.main;

    this.carEntity = new CarEntity(this, centerX, 400, state.car, (slotId) => {
      void ActionProvider.repairCarSlot(slotId);
    });
  }
}
