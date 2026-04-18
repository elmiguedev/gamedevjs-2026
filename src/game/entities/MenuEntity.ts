import { Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';

export class MenuEntity {
  private carButton?: ButtonEntity;
  private scrapButton?: ButtonEntity;
  private inventoryButton?: ButtonEntity;
  private raceButton?: ButtonEntity;
  private achievementsButton?: ButtonEntity;

  constructor(private readonly scene: Scene) {
    this.create();
  }

  create(): void {
    const width = this.scene.game.canvas.width;
    const height = this.scene.game.canvas.height;
        
    const menuY = height - 500;
    const buttonWidth = 100;
    const buttonHeight = 52;
    const gap = 10;
    const startX = width / 2 - (buttonWidth * 2.5 + gap * 2);

    const background = this.scene.add.rectangle(width / 2, menuY, width - 24, 100, 0xf7f7f7);
    background.setStrokeStyle(2, 0x111111);
    background.setScrollFactor(0);
    background.setDepth(1000);
        

    this.carButton = this.createButton(startX, menuY, buttonWidth, buttonHeight, 'Car', 'CarScene');
    this.scrapButton = this.createButton(startX + buttonWidth + gap, menuY, buttonWidth, buttonHeight, 'Scrap', 'ScrapScene');
    this.inventoryButton = this.createButton(startX + (buttonWidth + gap) * 2, menuY, buttonWidth, buttonHeight, 'Inventory', 'InventoryScene');
    this.raceButton = this.createButton(startX + (buttonWidth + gap) * 3, menuY, buttonWidth, buttonHeight, 'Race', 'RaceScene');
    this.achievementsButton = this.createButton(startX + (buttonWidth + gap) * 4, menuY, buttonWidth, buttonHeight, 'Achievements', 'AchievementsScene');
  }

  private createButton(x: number, y: number, width: number, height: number, label: string, targetScene: string): ButtonEntity {
    return new ButtonEntity(this.scene, x, y, width, height, label, () => {
      this.scene.scene.start(targetScene);
    });
  }
}
