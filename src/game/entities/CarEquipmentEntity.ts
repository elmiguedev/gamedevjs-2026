import { GameObjects, Scene } from 'phaser';
import type { Car } from '@/core/domain/Car';
import type { CarSlot } from '@/core/domain/CarSlot';

const SLOT_LABELS: Record<CarSlot['type'], string> = {
  chasis: 'Chassis',
  rueda: 'Wheel',
  nitro: 'Nitro',
  motor: 'Motor',
  direccion: 'Direction',
  aleron: 'Spoiler',
};

export class CarEquipmentEntity extends GameObjects.Container {
  private readonly titleText: GameObjects.Text;
  private readonly bodyText: GameObjects.Text;

  constructor(scene: Scene, x: number, y: number, car: Car) {
    super(scene, x, y);

    this.titleText = this.scene.add.text(0, 0, 'Equipped Parts', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.bodyText = this.scene.add.text(0, 24, this.formatCar(car), {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      lineSpacing: 6,
    }).setOrigin(0, 0);

    this.add([this.titleText, this.bodyText]);
  }

  update(car: Car): void {
    this.bodyText.setText(this.formatCar(car));
  }

  private formatCar(car: Car): string {
    const slots = [
      car.slots.chassis,
      car.slots.wheels.frontLeft,
      car.slots.wheels.frontRight,
      car.slots.wheels.rearLeft,
      car.slots.wheels.rearRight,
      car.slots.engine,
      car.slots.steering,
      car.slots.nitro,
      car.slots.spoiler,
    ];

    return slots
      .map((slot) => this.formatSlot(slot))
      .join('\n');
  }

  private formatSlot(slot: CarSlot): string {
    const label = SLOT_LABELS[slot.type] ?? slot.type;

    if (!slot.part) {
      return `${label}: Empty`;
    }

    const stats = [
      ['A', slot.part.stats.acceleration],
      ['V', slot.part.stats.speed],
      ['R', slot.part.stats.resistance],
      ['D', slot.part.stats.direction],
    ] as const;

    const bonus = stats
      .filter(([, value]) => typeof value === 'number' && value !== 0)
      .map(([code, value]) => `${code} +${value}`)
      .join(', ');

    return `${label}: ${slot.part.name}${bonus ? ` (${bonus})` : ''}`;
  }
}
