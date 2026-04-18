import { GameObjects, Scene } from 'phaser';
import type { CarAttributes } from '@/core/domain/Car';
import type { CarSlot } from '@/core/domain/CarSlot';
import { ButtonEntity } from '@/game/entities/ButtonEntity';

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
  private readonly conditionText: GameObjects.Text;
  private readonly repairButton: ButtonEntity;
  private readonly onRepair: (slotId: string) => void;

  constructor(scene: Scene, x: number, y: number, slot: CarSlot, onRepair: (slotId: string) => void) {
    super(scene, x, y);
    this.onRepair = onRepair;

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

    this.conditionText = this.scene.add.text(0, 30, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    }).setOrigin(0, 0.5);

    this.repairButton = new ButtonEntity(this.scene, 120, 34, 92, 30, 'Repair', () => {
      this.onRepair(slot.id);
    });

    this.add(this.labelText);
    this.add(this.nameText);
    this.add(this.bonusText);
    this.add(this.conditionText);
    this.add(this.repairButton);

    this.update(slot);
  }

  update(slot: CarSlot): void {
    if (!this.active || !this.labelText.active || !this.nameText.active || !this.bonusText.active || !this.conditionText.active || !this.repairButton.active) {
      return;
    }

    const slotLabel = SLOT_LABELS[slot.type] ?? slot.type;
    const partName = slot.part?.name ?? 'Empty';
    const bonus = slot.part ? this.formatStats(slot.part.stats) : '-';
    const condition = slot.part ? (slot.isRepairing() ? `Repairing... ${Math.max(0, Math.ceil((slot.repairingUntil! - Date.now()) / 1000))}s` : `Condition: ${slot.condition}%`) : 'No part';

    this.labelText.setText(`Slot: ${slotLabel}`);
    this.nameText.setText(partName);
    this.bonusText.setText(bonus);
    this.conditionText.setText(condition);

    const canRepair = !!slot.part && slot.condition < 100 && !slot.isRepairing();
    this.repairButton.setVisible(canRepair);
    this.repairButton.setDisabled(!canRepair);
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
