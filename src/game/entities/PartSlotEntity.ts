import { GameObjects, Geom, Scene } from 'phaser';
import type { CarPartType } from '@/core/domain/CarPart';
import type { CarSlot } from '@/core/domain/CarSlot';

const SLOT_COLORS: Record<CarPartType, number> = {
  chasis: 0x93c5fd,
  rueda: 0x111111,
  nitro: 0xfed7aa,
  motor: 0xe9d5ff,
  direccion: 0xcffafe,
  spoiler: 0xd9f99d,
};

export class PartSlotEntity extends GameObjects.Container {
  private readonly sceneRef: Scene;
  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly width: number,
    private readonly height: number,
    private readonly slot: CarSlot,
    private readonly onSelect?: (slot: CarSlot) => void,
  ) {
    super(scene, x, y);
    this.sceneRef = scene;

    this.render();
    this.setSize(this.width, this.height);
    this.setInteractive(new Geom.Rectangle(-this.width / 2, -this.height / 2, this.width, this.height), Geom.Rectangle.Contains);
    this.on('pointerdown', () => this.onSelect?.(this.slot));
  }

  refresh(): void {
    if (!this.scene || !this.active) {
      return;
    }

    this.removeAll(true);
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
    const fill = this.slot.type === 'rueda' ? 0x111111 : SLOT_COLORS[this.slot.type];

    const block = this.sceneRef.add.rectangle(0, 0, this.width, this.height, fill).setOrigin(0.5);
    block.setStrokeStyle(3, 0x111111);
    this.add(block);
  }

  private renderEmpty(): void {
    const graphics = this.sceneRef.add.graphics();
    graphics.lineStyle(2, 0x111111, 1);
    graphics.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
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
