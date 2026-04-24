import { GameObjects, Geom, Scene } from 'phaser';
import type { CarPart } from '@/core/domain/CarPart';
import type { CarSlot } from '@/core/domain/CarSlot';
import { IconEntity, type IconDefinition } from '@/game/entities/IconEntity';
import { PART_ICON_BY_PART_ID, SLOT_ICON_BY_TYPE, type PartsIconName, type UiIconName } from '@/game/assets/spritesheets';

export class CarSlotCardEntity extends GameObjects.Container {
  private background!: GameObjects.Rectangle;
  private border!: GameObjects.Graphics;
  private titleText!: GameObjects.Text;
  private partNameText!: GameObjects.Text;
  private statsText!: GameObjects.Text;
  private badgeText!: GameObjects.Text;
  private icon!: IconEntity<'icons' | 'parts'>;
  private currentSlot: CarSlot;
  private readonly onSelect?: (slot: CarSlot) => void;

  constructor(scene: Scene, x: number, y: number, width: number, height: number, slot: CarSlot, onSelect?: (slot: CarSlot) => void) {
    super(scene, x, y);

    this.width = width;
    this.height = height;

    this.currentSlot = slot;
    this.onSelect = onSelect;

    // this.background = this.scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0.5);
    // this.border = this.scene.add.graphics();
    // this.drawCardBorder(width, height);

    this.createBackground();
    this.createTitle();
    this.createPartName();

    // this.icon = new IconEntity<'icons' | 'parts'>(scene, -width / 2 + 14, -height / 2 + 13, this.getIconDefinition(slot));
    // this.icon.setDisplaySize(14, 14);

    // this.titleText = this.scene.add.text(-width / 2 + 25, -height / 2 + 13, this.formatTitle(slot), {
    //   color: '#111111',
    //   fontFamily: 'Arial, sans-serif',
    //   fontSize: '9px',
    //   fontStyle: 'bold',
    // }).setOrigin(0, 0.5);

    // this.partNameText = this.scene.add.text(-width / 2 + 8, -height / 2 + 30, '', {
    //   color: '#111111',
    //   fontFamily: 'Arial, sans-serif',
    //   fontSize: '8px',
    //   fontStyle: 'bold',
    // }).setOrigin(0, 0.5);

    // this.badgeText = this.scene.add.text(width / 2 - 8, -height / 2 + 30, '', {
    //   color: '#111111',
    //   fontFamily: 'Arial, sans-serif',
    //   fontSize: '8px',
    //   fontStyle: 'bold',
    //   backgroundColor: '#f2d27a',
    //   padding: { left: 5, right: 5, top: 1, bottom: 1 },
    // }).setOrigin(1, 0.5);

    // this.statsText = this.scene.add.text(-width / 2 + 8, -height / 2 + 44, '', {
    //   color: '#444444',
    //   fontFamily: 'Arial, sans-serif',
    //   fontSize: '8px',
    //   lineSpacing: 2,
    // }).setOrigin(0, 0.5);

    // this.add([this.background, this.border, this.icon, this.titleText, this.partNameText, this.badgeText, this.statsText]);
    this.setSize(width, height);
    this.setInteractive(new Geom.Rectangle(-width / 2, -height / 2, width, height), Geom.Rectangle.Contains);
    this.on('pointerdown', () => this.onSelect?.(this.currentSlot));
    this.scene.add.existing(this);

    this.refresh(slot, false);
  }

  createBackground() {
    this.background = this.scene.add.rectangle(0, 0, this.width, this.height, 0xffffff).setOrigin(0.5);
    this.border = this.scene.add.graphics();
    this.drawCardBorder(this.width, this.height);
    this.add([this.background, this.border]);
  }

  createTitle() {
    this.icon = new IconEntity<'icons' | 'parts'>(this.scene, -this.width / 2 + 14, -this.height / 2 + 13, this.getIconDefinition(this.currentSlot));
    this.icon.setDisplaySize(14, 14);

    this.titleText = this.scene.add.text(-this.width / 2 + 25, -this.height / 2 + 13, this.formatTitle(this.currentSlot), {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.add([this.icon, this.titleText]);
  }

  createPartName() {
    this.partNameText = this.scene.add.text(-this.width / 2 + 8, -this.height / 2 + 30, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.badgeText = this.scene.add.text(this.width / 2 - 8, -this.height / 2 + 30, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      backgroundColor: '#f2d27a',
      padding: { left: 5, right: 5, top: 1, bottom: 1 },
    }).setOrigin(1, 0.5);

    this.statsText = this.scene.add.text(-this.width / 2 + 8, -this.height / 2 + 44, '', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '8px',
      lineSpacing: 2,
    }).setOrigin(0, 0.5);

    this.add([this.partNameText, this.badgeText, this.statsText]);
  }

  refresh(slot: CarSlot, selected: boolean): void {
    this.currentSlot = slot;
    this.titleText.setText(this.formatTitle(slot));
    this.icon.setIcon(this.getIconDefinition(slot));
    this.icon.setDisplaySize(14, 14);

    if (!slot.part) {
      this.partNameText.setText('Empty');
      this.badgeText.setText('PLACE');
      this.statsText.setText('');
    } else {
      const condition = slot.isRepairing() ? 'Repairing' : `${slot.condition}%`;
      this.partNameText.setText(slot.part.name);
      this.badgeText.setText(condition);
      this.statsText.setText(this.formatStats(slot.part));
    }

    this.background.setFillStyle(selected ? 0xf8f4e5 : 0xffffff);
    this.drawCardBorder(this.background.width, this.background.height, selected);
    this.badgeText.setVisible(true);
  }

  private drawCardBorder(width: number, height: number, selected = false): void {
    this.border.clear();
    this.border.lineStyle(1, selected ? 0xc28b2c : 0x111111, 1);

    const dash = 4;
    const gap = 3;
    const radius = 8;
    const left = -width / 2;
    const top = -height / 2;
    const right = width / 2;
    const bottom = height / 2;

    this.drawDashedRoundedLine(this.border, left + radius, top, right - radius, top, dash, gap);
    this.drawDashedArc(this.border, right - radius, top + radius, radius, -Math.PI / 2, 0, dash, gap);
    this.drawDashedRoundedLine(this.border, right, top + radius, right, bottom - radius, dash, gap);
    this.drawDashedArc(this.border, right - radius, bottom - radius, radius, 0, Math.PI / 2, dash, gap);
    this.drawDashedRoundedLine(this.border, right - radius, bottom, left + radius, bottom, dash, gap);
    this.drawDashedArc(this.border, left + radius, bottom - radius, radius, Math.PI / 2, Math.PI, dash, gap);
    this.drawDashedRoundedLine(this.border, left, bottom - radius, left, top + radius, dash, gap);
    this.drawDashedArc(this.border, left + radius, top + radius, radius, Math.PI, Math.PI * 1.5, dash, gap);
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

  private drawDashedArc(
    graphics: GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    dash: number,
    gap: number,
  ): void {
    const length = Math.abs(endAngle - startAngle) * radius;
    const steps = Math.floor(length / (dash + gap));

    for (let i = 0; i < steps; i += 1) {
      const start = startAngle + ((i * (dash + gap)) / length) * (endAngle - startAngle);
      const end = startAngle + (Math.min(i * (dash + gap) + dash, length) / length) * (endAngle - startAngle);
      graphics.beginPath();
      graphics.arc(x, y, radius, start, end);
      graphics.strokePath();
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
