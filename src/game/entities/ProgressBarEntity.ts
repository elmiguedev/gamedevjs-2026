import { GameObjects, Scene } from 'phaser';

type ProgressBarOptions = {
  trackColor?: number;
  fillColor?: number;
  strokeColor?: number;
};

export class ProgressBarEntity extends GameObjects.Container {
  private readonly fill: GameObjects.Rectangle;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    private readonly barWidth: number,
    barHeight: number,
    progress = 0,
    options: ProgressBarOptions = {},
  ) {
    super(scene, x, y);

    const track = this.scene.add.rectangle(0, 0, barWidth, barHeight, options.trackColor ?? 0xffffff).setOrigin(0, 0.5);
    track.setStrokeStyle(1, options.strokeColor ?? 0x999999);
    this.fill = this.scene.add.rectangle(0, 0, 0, barHeight, options.fillColor ?? 0x111111).setOrigin(0, 0.5);

    this.add([track, this.fill]);
    this.scene.add.existing(this);
    this.setProgress(progress);
  }

  setProgress(progress: number): void {
    const normalized = Math.min(1, Math.max(0, progress));
    this.fill.width = this.barWidth * normalized;
  }
}
