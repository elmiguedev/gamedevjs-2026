import { GameObjects, Scene } from 'phaser';
import type { CarAttributes } from '@/core/domain/Car';
import type { CarSlot } from '@/core/domain/CarSlot';

const SLOT_LABELS: Record<string, string> = {
  chasis: 'Chassis',
  rueda: 'Wheel',
  nitro: 'Nitro',
  motor: 'Motor',
  direccion: 'Direction',
  aleron: 'Spoiler',
};

export class CarPartDetailsEntity extends GameObjects.Container {
  private readonly labelText: GameObjects.Text;
  private readonly nameText: GameObjects.Text;
  private readonly bonusText: GameObjects.Text;

  constructor(scene: Scene, x: number, y: number, slot: CarSlot) {
    super(scene, x, y);

    this.labelText = this.scene.add.text(0, -42, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.nameText = this.scene.add.text(0, -18, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
    }).setOrigin(0, 0.5);

    this.bonusText = this.scene.add.text(0, 8, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
    }).setOrigin(0, 0.5);

    this.add(this.labelText);
    this.add(this.nameText);
    this.add(this.bonusText);

    this.update(slot);
  }

  update(slot: CarSlot): void {
    const slotLabel = SLOT_LABELS[slot.type] ?? slot.type;
    const partName = slot.part?.name ?? 'Empty';
    const bonus = slot.part ? this.formatStats(slot.part.stats) : '-';

    this.labelText.setText(`Slot: ${slotLabel}`);
    this.nameText.setText(partName);
    this.bonusText.setText(bonus);
  }

  private formatStats(stats: Partial<CarAttributes>): string {
    const entries = [
      ['A', stats.acceleration],
      ['V', stats.speed],
      ['R', stats.resistance],
      ['D', stats.direction],
    ] as const;

    return entries
      .filter(([, value]) => typeof value === 'number' && value !== 0)
      .map(([label, value]) => `${label} +${value}`)
      .join(', ');
  }
}
