import { GameObjects, Scene } from 'phaser';
import type { GameState } from '@/core/domain/GameState';
import type { CraftingStatus } from '@/core/domain/CarCraftingRepository';
import type { WorkshopTool } from '@/core/domain/WorkshopTool';
import type { UiIconName } from '@/game/assets/spritesheets';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { IconEntity } from '@/game/entities/IconEntity';

const FONT_FAMILY = 'Barlow Condensed, Arial, sans-serif';
const CARD_WIDTH = 100;
const CARD_HEIGHT = 92;
const CARD_GAP = 8;

export class ScrapUpgradeListEntity extends GameObjects.Container {
  private cards: GameObjects.Container[] = [];

  constructor(scene: Scene, x: number, y: number, private readonly width: number) {
    super(scene, x, y);
    this.scene.add.existing(this);
  }

  refresh(tools: WorkshopTool[], state: GameState, mechanicLevel: number, craftingStatus: CraftingStatus, onCraft: (tool: WorkshopTool) => void): void {
    this.cards.forEach((card) => card.destroy());
    this.cards = [];

    if (!tools.length) {
      return;
    }

    tools.forEach((tool, index) => {
      const x = index * (CARD_WIDTH + CARD_GAP);
      const card = this.createCard(x, tool, state, mechanicLevel, craftingStatus, onCraft);
      this.cards.push(card);
      this.add(card);
    });
  }

  private createCard(x: number, tool: WorkshopTool, state: GameState, mechanicLevel: number, craftingStatus: CraftingStatus, onCraft: (tool: WorkshopTool) => void): GameObjects.Container {
    const card = this.scene.add.container(x, 0);
    const owned = state.craftedToolIds.includes(tool.id);
    const active = craftingStatus.active?.part.id === tool.id ? craftingStatus.active : null;
    const ready = craftingStatus.ready?.id === tool.id;
    const craftBusy = craftingStatus.active !== null || craftingStatus.ready !== null;
    const progress = active ? this.getCraftProgress(active) : 0;
    const levelLocked = mechanicLevel < tool.requiredLevel;
    const canAfford = state.scrap >= tool.scrapCost && state.cash >= tool.cashCost;
    const canCraft = !owned && !active && !ready && !craftBusy && !levelLocked && canAfford;
    const backgroundColor = owned ? 0xf2d27a : canCraft ? 0xffffff : 0xf3f4f6;
    const strokeColor = owned || canCraft || active || ready ? 0x111111 : 0x9ca3af;

    const background = this.scene.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, backgroundColor).setOrigin(0, 0);
    background.setStrokeStyle(1, strokeColor);

    const icon = new IconEntity(this.scene, 18, 23, { sheet: 'icons', icon: this.getToolIcon(tool) });
    icon.setDisplaySize(24, 24);
    icon.setAlpha(canCraft || owned || active || ready ? 1 : 0.45);

    const title = this.scene.add.text(36, 13, tool.name, {
      color: owned || canCraft || active || ready ? '#111111' : '#6b7280',
      fontFamily: FONT_FAMILY,
      fontSize: '11px',
      fontStyle: 'bold',
      wordWrap: { width: 58 },
    });

    const effect = this.scene.add.text(10, 42, this.formatEffect(tool), {
      color: owned || canCraft || active || ready ? '#444444' : '#9ca3af',
      fontFamily: FONT_FAMILY,
      fontSize: '10px',
      fontStyle: 'bold',
      wordWrap: { width: CARD_WIDTH - 34 },
    });

    const requiredLevel = this.scene.add.text(CARD_WIDTH - 10, 42, `LV ${tool.requiredLevel}`, {
      color: levelLocked ? '#9ca3af' : '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '9px',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    card.add([background, icon, title, effect, requiredLevel]);

    if (owned) {
      card.add(this.createStatusLabel('ACTIVE', '#111111', 73));
      return card;
    }

    if (active || ready) {
      card.add(this.createStatusLabel(ready ? 'READY' : `${Math.floor(progress * 100)}%`, '#111111', 73));
      if (active) {
        card.add(this.createProgressBar(progress));
      }
      return card;
    }

    const button = new ButtonEntity(this.scene, CARD_WIDTH / 2, 72, 90, 24, this.formatPrice(tool), () => onCraft(tool), !canCraft, 'craft');
    button.setDepth(1002);
    card.add(button);

    return card;
  }

  private createStatusLabel(label: string, color: string, y: number): GameObjects.Text {
    return this.scene.add.text(CARD_WIDTH / 2, y, label, {
      color,
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private createProgressBar(progress: number): GameObjects.Rectangle[] {
    const background = this.scene.add.rectangle(12, 85, CARD_WIDTH - 24, 3, 0xd1d5db).setOrigin(0, 0.5);
    const foreground = this.scene.add.rectangle(12, 85, (CARD_WIDTH - 24) * progress, 3, 0x111111).setOrigin(0, 0.5);
    return [background, foreground];
  }

  private getCraftProgress(active: NonNullable<CraftingStatus['active']>): number {
    const elapsed = (Date.now() - active.startedAt) / 1000;
    return Math.min(1, elapsed / active.craftTimeSeconds);
  }

  private getToolIcon(tool: WorkshopTool): UiIconName {
    if (tool.id === 'brazo-mecanico') {
      return 'repair';
    }

    if (tool.id === 'iman-poderoso') {
      return 'collectScrap';
    }

    if (tool.id === 'pozo-petrolero') {
      return 'fuel';
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

    if (tool.effect.type === 'passiveFuel') {
      return `+${tool.effect.amount} fuel/${tool.effect.intervalSeconds}s`;
    }

    return `+${tool.effect.amount}/${tool.effect.intervalSeconds}s`;
  }

  private formatPrice(tool: WorkshopTool): string {
    if (tool.cashCost > 0) {
      return `${tool.scrapCost}S / $${tool.cashCost}`;
    }

    return `${tool.scrapCost} scrap`;
  }
}
