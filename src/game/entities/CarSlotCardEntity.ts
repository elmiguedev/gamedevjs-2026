import { GameObjects, Geom, Scene } from 'phaser';
import type { CarPart } from '@/core/domain/CarPart';
import type { CarSlot } from '@/core/domain/CarSlot';
import { IconEntity, type IconDefinition } from '@/game/entities/IconEntity';
import { PART_ICON_BY_PART_ID, SLOT_ICON_BY_TYPE, type PartsIconName, type UiIconName } from '@/game/assets/spritesheets';

export class CarSlotCardEntity extends GameObjects.Container {
  private readonly background: GameObjects.Rectangle;
  private readonly border: GameObjects.Graphics;
  private readonly titleText: GameObjects.Text;
  private readonly valueText: GameObjects.Text;
  private readonly badgeText: GameObjects.Text;
  private readonly icon: IconEntity<'icons' | 'parts'>;
  private currentSlot: CarSlot;
  private readonly onSelect?: (slot: CarSlot) => void;

  constructor(scene: Scene, x: number, y: number, width: number, height: number, slot: CarSlot, onSelect?: (slot: CarSlot) => void) {
    super(scene, x, y);

    this.currentSlot = slot;
    this.onSelect = onSelect;

    this.background = this.scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5);
    this.border = this.scene.add.graphics();
    this.drawCardBorder(width, height);

    this.titleText = this.scene.add.text(-width / 2 + 8, -height / 2 + 6, this.formatTitle(slot), {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.icon = new IconEntity<'icons' | 'parts'>(scene, -width / 2 + 18, 1, this.getIconDefinition(slot));
    this.icon.setDisplaySize(16, 16);

    this.valueText = this.scene.add.text(-width / 2 + 34, 0, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      lineSpacing: 2,
    }).setOrigin(0, 0.5);

    this.badgeText = this.scene.add.text(width / 2 - 8, height / 2 - 10, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      backgroundColor: '#f2d27a',
      padding: { left: 5, right: 5, top: 1, bottom: 1 },
    }).setOrigin(1, 1);

    this.add([this.background, this.border, this.titleText, this.icon, this.valueText, this.badgeText]);
    this.setSize(width, height);
    this.setInteractive(new Geom.Rectangle(-width / 2, -height / 2, width, height), Geom.Rectangle.Contains);
    this.on('pointerdown', () => this.onSelect?.(this.currentSlot));
    this.scene.add.existing(this);

    this.refresh(slot, false);
  }

  refresh(slot: CarSlot, selected: boolean): void {
    this.currentSlot = slot;
    this.titleText.setText(this.formatTitle(slot));
    this.icon.setIcon(this.getIconDefinition(slot));
    this.icon.setDisplaySize(16, 16);

    if (!slot.part) {
      this.valueText.setText('Empty');
      this.badgeText.setText('PLACE');
    } else {
      const condition = slot.isRepairing() ? 'Repairing' : `${slot.condition}%`;
      this.valueText.setText([slot.part.name, this.formatStats(slot.part)].filter(Boolean).join(' '));
      this.badgeText.setText(condition);
    }

    this.background.setFillStyle(selected ? 0xf8f4e5 : 0xffffff);
    this.drawCardBorder(this.background.width, this.background.height, selected);
    this.badgeText.setVisible(true);
  }

  private drawCardBorder(width: number, height: number, selected = false): void {
    this.border.clear();

    const dash = 4;
    const gap = 3;
    const radius = 8;
    const left = -width / 2;
    const top = -height / 2;
    const right = width / 2;
    const bottom = height / 2;

    this.drawDashedRoundedLine(this.border, left + radius, top, right - radius, top, dash, gap);
    this.drawDashedRoundedLine(this.border, right, top + radius, right, bottom - radius, dash, gap);
    this.drawDashedRoundedLine(this.border, right - radius, bottom, left + radius, bottom, dash, gap);
    this.drawDashedRoundedLine(this.border, left, bottom - radius, left, top + radius, dash, gap);
  }

  private drawDashedRoundedLine(graphics: GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, dash: number, gap: number): void {
    const length = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.floor(length / (dash + gap));

    for (let i = 0; i < steps; i += 1) {
      const start = (i * (dash + gap)) / length;
      const end = Math.min((i * (dash + gap) + dash) / length, 1);
      graphics.lineBetween(
        x1 + (x2 - x1) * start,
        y1 + (y2 - y1) * start,
        x1 + (x2 - x1) * end,
        y1 + (y2 - y1) * end,
      );
    }
  }

  private getIconDefinition(slot: CarSlot): IconDefinition<'icons' | 'parts'> {
    if (slot.part) {
      const partIcon = PART_ICON_BY_PART_ID[slot.part.id as keyof typeof PART_ICON_BY_PART_ID] as PartsIconName | undefined;
      if (partIcon) {
        return { sheet: 'parts', icon: partIcon };
      }
    }

    return { sheet: 'icons', icon: SLOT_ICON_BY_TYPE[slot.type] as UiIconName };
  }

  private formatTitle(slot: CarSlot): string {
    return slot.type.toUpperCase();
  }

  private formatStats(part: CarPart): string {
    const stats = [
      ['A', part.stats.acceleration],
      ['V', part.stats.speed],
      ['R', part.stats.resistance],
      ['D', part.stats.direction],
    ] as const;

    return stats
      .filter(([, value]) => typeof value === 'number' && value !== 0)
      .map(([label, value]) => `${label} +${value}`)
      .join(' ');
  }
}
