import { GameObjects, Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { IconEntity } from '@/game/entities/IconEntity';

export type AchievementGroup = 'hall' | 'garage';

export class AchievementCategorySelectorEntity extends GameObjects.Container {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly onSelect: (group: AchievementGroup) => void,
  ) {
    super(scene, x, y);

    const title = this.scene.add.text(40, 0, 'Rutas de logros', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
    });

    const hallPanel = this.scene.add.rectangle(40, 54, 400, 96, 0xffffff).setOrigin(0, 0);
    hallPanel.setStrokeStyle(1, 0x111111);
    const garagePanel = this.scene.add.rectangle(40, 168, 400, 96, 0xffffff).setOrigin(0, 0);
    garagePanel.setStrokeStyle(1, 0x111111);

    const hallIcon = new IconEntity(this.scene, 86, 102, { sheet: 'achievements', icon: 'rustSprint' });
    hallIcon.setDisplaySize(54, 54);
    const garageIcon = new IconEntity(this.scene, 86, 216, { sheet: 'achievements', icon: 'projectComplete' });
    garageIcon.setDisplaySize(54, 54);

    const hallTitle = this.scene.add.text(124, 78, 'Hall of Fame', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
    });
    const garageTitle = this.scene.add.text(124, 192, 'Garage Path', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
    });

    const hallDescription = this.scene.add.text(124, 106, 'Copas, carreras y podios.', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });

    const garageDescription = this.scene.add.text(124, 220, 'Crafteo, colección y armado.', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });

    const hallButton = new ButtonEntity(this.scene, 376, 102, 92, 32, 'Ver', () => this.onSelect('hall'));
    const garageButton = new ButtonEntity(this.scene, 376, 216, 92, 32, 'Ver', () => this.onSelect('garage'));

    this.add([title, hallPanel, garagePanel, hallIcon, garageIcon, hallTitle, garageTitle, hallDescription, garageDescription, hallButton, garageButton]);
    this.scene.add.existing(this);
  }
}
