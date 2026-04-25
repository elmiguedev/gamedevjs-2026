import { Scene } from 'phaser';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { TitleEntity } from '@/game/entities/TitleEntity';

export class MenuScene extends Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');
    this.createTitle();

    const menu = new MenuEntity(this);
    menu.create();
  }

  private createTitle(): void {
    new TitleEntity(this, 40, 88, 'MENU', 'CHOOSE YOUR NEXT STEP');
  }
}
