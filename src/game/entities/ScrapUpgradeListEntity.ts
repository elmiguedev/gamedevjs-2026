import { GameObjects, Scene } from 'phaser';
import type { WorkshopTool } from '@/core/domain/WorkshopTool';
import type { UiIconName } from '@/game/assets/spritesheets';
import { IconEntity } from '@/game/entities/IconEntity';

const FONT_FAMILY = 'Barlow Condensed, Arial, sans-serif';

export class ScrapUpgradeListEntity extends GameObjects.Container {
  private cards: GameObjects.Container[] = [];

  constructor(scene: Scene, x: number, y: number, private readonly width: number) {
    super(scene, x, y);
    this.scene.add.existing(this);
  }

  refresh(tools: WorkshopTool[]): void {
    this.cards.forEach((card) => card.destroy());
    this.cards = [];

    if (!tools.length) {
      return;
    }

    const cardWidth = 126;
    const gap = 10;
    tools.forEach((tool, index) => {
      const x = this.width - cardWidth - index * (cardWidth + gap);
      const card = this.createCard(x, tool);
      this.cards.push(card);
      this.add(card);
    });
  }

  private createCard(x: number, tool: WorkshopTool): GameObjects.Container {
    const card = this.scene.add.container(x, 0);
    const background = this.scene.add.rectangle(0, 0, 126, 46, 0xffffff).setOrigin(0, 0.5);
    background.setStrokeStyle(1, 0x111111);

    const icon = new IconEntity(this.scene, 22, 0, { sheet: 'icons', icon: this.getToolIcon(tool) });
    icon.setDisplaySize(24, 24);

    const title = this.scene.add.text(42, -8, tool.name, {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      fontStyle: 'bold',
      wordWrap: { width: 76 },
    }).setOrigin(0, 0.5);

    const effect = this.scene.add.text(42, 10, this.formatEffect(tool), {
      color: '#444444',
      fontFamily: FONT_FAMILY,
      fontSize: '11px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    card.add([background, icon, title, effect]);
    return card;
  }

  private getToolIcon(tool: WorkshopTool): UiIconName {
    if (tool.id === 'brazo-mecanico') {
      return 'repair';
    }

    if (tool.id === 'iman-poderoso') {
      return 'collectScrap';
    }

    return 'scrapYardCrafting';
  }

  private formatEffect(tool: WorkshopTool): string {
    if (tool.effect.type === 'scrapMultiplier') {
      return `x${tool.effect.multiplier} scrap`;
    }

    if (tool.effect.type === 'collectCooldown') {
      return `${tool.effect.seconds}s cooldown`;
    }

    return `+${tool.effect.amount}/${tool.effect.intervalSeconds}s`;
  }
}
