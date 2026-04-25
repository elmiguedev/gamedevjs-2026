import { GameObjects, Scene } from 'phaser';
import type { Car } from '@/core/domain/Car';
import type { CarSlot } from '@/core/domain/CarSlot';

const FONT_FAMILY = 'Barlow Condensed, Arial, sans-serif';

type SlotView = {
  slotId: string;
  title: GameObjects.Text;
  part: GameObjects.Text;
  condition: GameObjects.Text;
  line: GameObjects.Line;
};

export class CarOverviewEntity extends GameObjects.Container {
  private draft!: GameObjects.Image;
  private readonly slotViews: SlotView[] = [];

  constructor(scene: Scene, x: number, y: number, private car: Car) {
    super(scene, x, y);

    this.createDraft();
    this.createSlots();

    this.scene.add.existing(this);
    this.refresh(car);
  }

  private createDraft(): void {
    this.draft = this.scene.add.image(240, 109, 'car-draft');
    this.draft.setDisplaySize(170, 215);
    this.add(this.draft);
  }

  private createSlots(): void {
    this.createSlotView(this.car.slots.engine, 28, 104, 150, 116);
    this.createSlotView(this.car.slots.steering, 28, 42, 150, 74);
    this.createSlotView(this.car.slots.wheels, 338, 32, 292, 64);
    this.createSlotView(this.car.slots.nitro, 338, 110, 292, 116);
    this.createSlotView(this.car.slots.spoiler, 338, 182, 292, 214);
    this.createSlotView(this.car.slots.chassis, 28, 168, 150, 184);
  }

  private createSlotView(slot: CarSlot, x: number, y: number, lineEndX: number, lineEndY: number): void {
    const line = this.scene.add.line(0, 0, x + 2, y + 28, lineEndX, lineEndY, 0x888888, 1).setOrigin(0);
    const title = this.scene.add.text(x, y, this.formatTitle(slot), {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    const part = this.scene.add.text(x, y + 16, '', {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
    }).setOrigin(0, 0.5);
    const condition = this.scene.add.text(x, y + 32, '', {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.slotViews.push({ slotId: slot.id, title, part, condition, line });
    this.add([line, title, part, condition]);
  }

  refresh(car: Car): void {
    this.car = car;

    for (const view of this.slotViews) {
      const slot = this.findSlot(view.slotId);
      if (!slot) {
        continue;
      }

      view.title.setText(this.formatTitle(slot));
      view.part.setText(slot.part?.name ?? 'Empty');
      view.condition.setText(slot.part ? `${slot.condition}%` : '-');
    }
  }

  private findSlot(slotId: string): CarSlot | null {
    return this.car.listSlots().find((slot) => slot.id === slotId) ?? null;
  }

  private formatTitle(slot: CarSlot): string {
    return slot.type.toUpperCase();
  }
}
