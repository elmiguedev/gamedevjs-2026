import { Scene } from 'phaser';
import scrapYardUrl from '../../../assets/img/draft/scrap-yard.svg?url';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ScrapButtonEntity } from '@/game/entities/ScrapButtonEntity';

export class ScrapScene extends Scene {
  private scrapButtonEntity!: ScrapButtonEntity;

  constructor() {
    super('ScrapScene');
  }

  preload(): void {
    this.load.image('scrap-yard', scrapYardUrl);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.add.text(360, 120, 'Scrap Scene', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '38px',
    }).setOrigin(0.5);


    new MenuEntity(this);

    this.scrapButtonEntity = new ScrapButtonEntity(this, 360, 500);
  }
}
