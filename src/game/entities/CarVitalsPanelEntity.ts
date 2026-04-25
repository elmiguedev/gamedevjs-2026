import { GameObjects, Scene } from 'phaser';
import type { Car } from '@/core/domain/Car';
import { IconEntity } from '@/game/entities/IconEntity';

const FONT_FAMILY = 'Barlow Condensed, Arial, sans-serif';

export class CarVitalsPanelEntity extends GameObjects.Container {
  private damageText!: GameObjects.Text;
  private damageFill!: GameObjects.Rectangle;
  private fuelText!: GameObjects.Text;
  private fuelFill!: GameObjects.Rectangle;

  constructor(scene: Scene, x: number, y: number, width: number, height: number, car: Car) {
    super(scene, x, y);

    this.createBackground(width, height);
    this.createDamageBlock();
    this.createFuelBlock(width);

    this.scene.add.existing(this);
    this.refresh(car);
  }

  private createBackground(width: number, height: number): void {
    const background = this.scene.add.rectangle(0, 0, width, height, 0xffffff).setOrigin(0);
    background.setStrokeStyle(1, 0x999999);
    const divider = this.scene.add.rectangle(width / 2, 14, 1, height - 28, 0xcccccc).setOrigin(0.5, 0);
    this.add([background, divider]);
  }

  private createDamageBlock(): void {
    const icon = new IconEntity(this.scene, 22, 36, { sheet: 'icons', icon: 'damage' });
    icon.setDisplaySize(26, 26);
    const title = this.scene.add.text(44, 24, 'DANO GENERAL', {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.damageText = this.scene.add.text(44, 44, '0%', {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    const track = this.scene.add.rectangle(44, 64, 160, 5, 0xffffff).setOrigin(0, 0.5);
    track.setStrokeStyle(1, 0x999999);
    this.damageFill = this.scene.add.rectangle(44, 64, 0, 5, 0x111111).setOrigin(0, 0.5);

    this.add([icon, title, this.damageText, track, this.damageFill]);
  }

  private createFuelBlock(width: number): void {
    const x = width / 2 + 22;
    const icon = new IconEntity(this.scene, x, 36, { sheet: 'icons', icon: 'tank' });
    icon.setDisplaySize(28, 28);
    const title = this.scene.add.text(x + 24, 24, 'COMBUSTIBLE', {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.fuelText = this.scene.add.text(x + 24, 44, '0 / 0', {
      color: '#111111',
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    const track = this.scene.add.rectangle(x + 24, 64, 160, 5, 0xffffff).setOrigin(0, 0.5);
    track.setStrokeStyle(1, 0x999999);
    this.fuelFill = this.scene.add.rectangle(x + 24, 64, 0, 5, 0x111111).setOrigin(0, 0.5);

    this.add([icon, title, this.fuelText, track, this.fuelFill]);
  }

  refresh(car: Car): void {
    const damage = this.getGeneralDamage(car);
    this.damageText.setText(`${damage}%`);
    this.damageFill.width = Math.min(160, Math.max(0, damage * 1.6));

    this.fuelText.setText(`${car.fuel} / ${car.maxFuel}`);
    this.fuelFill.width = car.maxFuel <= 0 ? 0 : Math.min(160, Math.max(0, (car.fuel / car.maxFuel) * 160));
  }

  private getGeneralDamage(car: Car): number {
    const slots = car.listSlots().filter((slot) => slot.part !== null);
    if (slots.length === 0) {
      return 0;
    }

    const totalDamage = slots.reduce((total, slot) => total + (100 - slot.condition), 0);
    return Math.round(totalDamage / slots.length);
  }
}
