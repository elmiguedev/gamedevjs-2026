import { GameObjects, Scene } from 'phaser';
import { IconEntity } from '@/game/entities/IconEntity';

export class AchievementHeaderEntity extends GameObjects.Container {
  private readonly icon: IconEntity<'icons'>;
  private readonly titleText: GameObjects.Text;
  private readonly subtitleText: GameObjects.Text;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);

    this.icon = new IconEntity(this.scene, -92, 0, { sheet: 'icons', icon: 'star' });
    this.icon.setDisplaySize(28, 28);

    this.titleText = this.scene.add.text(-58, 0, 'Logros', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '34px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.subtitleText = this.scene.add.text(0, 38, 'Elige una ruta y revisa tus objetivos.', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
    }).setOrigin(0.5);

    this.add([this.icon, this.titleText, this.subtitleText]);
  }
}
