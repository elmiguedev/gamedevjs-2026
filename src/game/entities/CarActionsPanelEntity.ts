import { GameObjects, Scene } from 'phaser';
import type { Car } from '@/core/domain/Car';
import type { CarSlot } from '@/core/domain/CarSlot';
import type { GameState } from '@/core/domain/GameState';
import { IconEntity } from '@/game/entities/IconEntity';

const FONT_FAMILY = 'Barlow Condensed, Arial, sans-serif';

class GarageActionButtonEntity extends GameObjects.Container {
  private readonly background: GameObjects.Rectangle;
  private readonly titleText: GameObjects.Text;
  private readonly detailText: GameObjects.Text;
  private disabled = false;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    icon: 'repair' | 'fuel',
    title: string,
    detail: string,
    private readonly onPressed: () => void,
  ) {
    super(scene, x, y);

    this.background = this.scene.add.rectangle(0, 0, width, height, 0x111111).setOrigin(0);
    const iconEntity = new IconEntity(this.scene, 24, height / 2, { sheet: 'icons', icon });
    iconEntity.setDisplaySize(26, 26);
    iconEntity.setTint(0xffffff);
    this.titleText = this.scene.add.text(48, 14, title, {
      color: '#ffffff',
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);
    this.detailText = this.scene.add.text(48, 30, detail, {
      color: '#ffffff',
      fontFamily: FONT_FAMILY,
      fontSize: '11px',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    this.add([this.background, iconEntity, this.titleText, this.detailText]);
    this.setSize(width, height);
    this.background.setInteractive({ useHandCursor: true });
    this.background.on('pointerdown', () => {
      if (!this.disabled) {
        this.onPressed();
      }
    });
    this.scene.add.existing(this);
  }

  setContent(title: string, detail: string): void {
    this.titleText.setText(title);
    this.detailText.setText(detail);
  }

  setDisabled(disabled: boolean): void {
    this.disabled = disabled;
    this.background.setFillStyle(disabled ? 0x9ca3af : 0x111111);
    this.background.setAlpha(disabled ? 0.75 : 1);
  }
}

export class CarActionsPanelEntity extends GameObjects.Container {
  private repairButton!: GarageActionButtonEntity;
  private refuelButton!: GarageActionButtonEntity;
  private currentState: GameState;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    state: GameState,
    private readonly onRepair: (slotIds: string[]) => void,
    private readonly onRefuel: () => void,
  ) {
    super(scene, x, y);
    this.currentState = state;

    this.createButtons();

    this.scene.add.existing(this);
    this.refresh(state);
  }

  private createButtons(): void {
    this.repairButton = new GarageActionButtonEntity(this.scene, 0, 0, 205, 44, 'repair', 'REPAIR', '', () => {
      const slots = this.getRepairTargets(this.currentState.car);
      if (slots.length > 0) {
        this.onRepair(slots.map((slot) => slot.id));
      }
    });
    this.refuelButton = new GarageActionButtonEntity(this.scene, 235, 0, 205, 44, 'fuel', 'REFUEL', '', () => {
      this.onRefuel();
    });

    this.add([this.repairButton, this.refuelButton]);
  }

  refresh(state: GameState): void {
    this.currentState = state;

    const repairTargets = this.getRepairTargets(state.car);
    const repairCost = repairTargets.reduce((total, slot) => total + this.getRepairCost(slot), 0);
    const repairSeconds = repairTargets.reduce((max, slot) => Math.max(max, this.getRepairSeconds(slot)), 0);
    const hasEnoughScrap = state.scrap >= repairCost;
    this.repairButton.setContent('REPAIR', repairTargets.length > 0 ? `${repairCost} scrap / ${repairSeconds}s` : 'NO DAMAGE');
    this.repairButton.setDisabled(repairTargets.length === 0 || !hasEnoughScrap);

    const fuelNeeded = Math.max(0, state.car.maxFuel - state.car.fuel);
    const refuelAmount = Math.min(state.fuel, fuelNeeded);
    this.refuelButton.setContent('REFUEL', fuelNeeded > 0 ? `${refuelAmount} fuel` : 'TANK FULL');
    this.refuelButton.setDisabled(refuelAmount <= 0);
  }

  private getRepairTargets(car: Car): CarSlot[] {
    return car.listSlots()
      .filter((slot) => slot.part !== null && slot.condition < 100 && !slot.isRepairing())
      .sort((a, b) => a.condition - b.condition);
  }

  private getRepairCost(slot: CarSlot): number {
    return Math.max(1, Math.ceil((100 - slot.condition) / 20));
  }

  private getRepairSeconds(slot: CarSlot): number {
    return Math.max(2, Math.ceil((100 - slot.condition) / 25));
  }
}
