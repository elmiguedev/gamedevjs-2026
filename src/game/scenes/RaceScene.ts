import { Scene } from 'phaser';
import { MenuEntity } from '@/game/entities/MenuEntity';

export class RaceScene extends Scene {
  constructor() {
    super('RaceScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.add.text(360, 180, 'Race Scene', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
    }).setOrigin(0.5);

    this.add.text(360, 260, 'Placeholder for races', {
      color: '#555555',
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
    }).setOrigin(0.5);

    new MenuEntity(this);
  }
}
