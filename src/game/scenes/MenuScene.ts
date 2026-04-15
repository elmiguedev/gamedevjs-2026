import { Scene } from 'phaser';
import { MenuEntity } from '@/game/entities/MenuEntity';

export class MenuScene extends Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    const menu = new MenuEntity(this);
    menu.create();
  }
}
