import { Scene } from 'phaser';
import { CarEntity } from '@/game/entities/CarEntity';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ActionProvider } from '@/game/providers/ActionProvider';

export class CarScene extends Scene {
  constructor() {
    super('CarScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    void this.loadCar();

    new MenuEntity(this);
  }

  private async loadCar(): Promise<void> {
    const state = await ActionProvider.getState();
    const { centerX } = this.cameras.main;

    new CarEntity(this, centerX, 400, state.car);
  }
}
