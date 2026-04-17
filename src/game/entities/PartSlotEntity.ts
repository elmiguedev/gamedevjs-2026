import { GameObjects, Scene } from 'phaser';
import type { CarPartType, PartSlotState } from '@/core/domain/Car';

const SLOT_COLORS: Record<CarPartType, number> = {
  chassis: 0xf4f1ea,
  wheel: 0x111111,
  nitro: 0xfed7aa,
  motor: 0xe9d5ff,
  direction: 0xc7d2fe,
  spoiler: 0xd9f99d,
};

export class PartSlotEntity extends GameObjects.Container {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly width: number,
    private readonly height: number,
    private readonly slot: PartSlotState,
  ) {
    super(scene, x, y);

    this.render();
  }

  private render(): void {
    if (this.slot.part) {
      this.renderFilled();
      return;
    }

    this.renderEmpty();
  }

  private renderFilled(): void {
    const partType = this.slot.part?.type ?? this.slot.type;
    const fill = SLOT_COLORS[partType];

    const block = this.scene.add.rectangle(0, 0, this.width, this.height, fill);
    block.setStrokeStyle(2, 0x111111);
    this.add(block);
  }

  private renderEmpty(): void {
    const graphics = this.scene.add.graphics();
    graphics.lineStyle(2, 0x111111, 1);
    this.drawDashedRectangle(graphics, this.width, this.height);
    this.add(graphics);
  }

  private drawDashedRectangle(graphics: GameObjects.Graphics, width: number, height: number): void {
    const dash = 8;
    const gap = 6;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    for (let x = -halfWidth; x < halfWidth; x += dash + gap) {
      graphics.lineBetween(x, -halfHeight, Math.min(x + dash, halfWidth), -halfHeight);
      graphics.lineBetween(x, halfHeight, Math.min(x + dash, halfWidth), halfHeight);
    }

    for (let y = -halfHeight; y < halfHeight; y += dash + gap) {
      graphics.lineBetween(-halfWidth, y, -halfWidth, Math.min(y + dash, halfHeight));
      graphics.lineBetween(halfWidth, y, halfWidth, Math.min(y + dash, halfHeight));
    }
  }
}
