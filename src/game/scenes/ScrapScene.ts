import { Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { IconEntity } from '@/game/entities/IconEntity';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ToastEntity } from '@/game/entities/ToastEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';

export class ScrapScene extends Scene {
  private resourceHud!: ResourceHud;
  private toast?: ToastEntity;
  private collectButton?: ButtonEntity;
  private collectIcon?: IconEntity<'icons'>;

  constructor() {
    super('ScrapScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.resourceHud = new ResourceHud(this);
    this.toast = new ToastEntity(this, this.scale.width / 2, 70);

    this.add.text(this.scale.width / 2, 94, 'Recolección', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, 126, 'Junta scrap para fabricar piezas en el taller.', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
    }).setOrigin(0.5);

    const scrapyard = this.add.image(this.scale.width / 2, 280, 'scrapyard');
    scrapyard.setDisplaySize(400, 266);

    this.collectButton = new ButtonEntity(this, this.scale.width / 2, 468, 170, 42, 'Collect', () => {
      void ActionProvider.collectScrap();
    });
    this.collectIcon = new IconEntity(this, this.scale.width / 2 - 60, 468, { sheet: 'icons', icon: 'collectScrap' });
    this.collectIcon.setDisplaySize(24, 24);
    this.collectIcon.setDepth(1002);

    new MenuEntity(this);

    this.events.once('shutdown', () => {
      this.collectButton?.destroy();
      this.collectIcon?.destroy();
      this.toast?.destroy();
    });
  }
}
