import { GameObjects, Scene } from 'phaser';

export class MenuEntity {
  private carButton?: GameObjects.Rectangle;
  private scrapButton?: GameObjects.Rectangle;
  private storeButton?: GameObjects.Rectangle;
  private raceButton?: GameObjects.Rectangle;

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
    const startX = width / 2 - (buttonWidth * 2 + gap * 1.5);

    const background = this.scene.add.rectangle(width / 2, menuY, width - 24, 100, 0xf7f7f7);
    background.setStrokeStyle(2, 0x111111);
    background.setScrollFactor(0);
    background.setDepth(1000);
        

    this.carButton = this.createButton(startX, menuY, buttonWidth, buttonHeight, 'Car', 'CarScene');
    this.scrapButton = this.createButton(startX + buttonWidth + gap, menuY, buttonWidth, buttonHeight, 'Scrap', 'ScrapScene');
    this.storeButton = this.createButton(startX + (buttonWidth + gap) * 2, menuY, buttonWidth, buttonHeight, 'Store', 'StoreScene');
    this.raceButton = this.createButton(startX + (buttonWidth + gap) * 3, menuY, buttonWidth, buttonHeight, 'Race', 'RaceScene');
  }

  private createButton(x: number, y: number, width: number, height: number, label: string, targetScene: string): GameObjects.Rectangle {
    const button = this.scene.add.rectangle(x, y, width, height, 0x0b1d39);
    button.setStrokeStyle(2, 0xffffff);
    button.setInteractive({ useHandCursor: true });
    button.setScrollFactor(0);
    button.setDepth(1001);

    this.scene.add.text(x, y, label, {
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

    button.on('pointerdown', () => {
      this.scene.scene.start(targetScene);
    });

    return button;
  }
}
