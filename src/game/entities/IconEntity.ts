import { GameObjects, Scene } from 'phaser';
import {
  ACHIEVEMENTS_ICON_INDEX,
  type AchievementIconName,
  type IconName,
  type IconSheet,
  PARTS_ICON_INDEX,
  type PartsIconName,
  RACES_ICON_INDEX,
  SPRITESHEET_KEYS,
  type UiIconName,
  UI_ICON_INDEX,
} from '@/game/assets/spritesheets';

export type { IconSheet, IconName, AnyIconName, PartsIconName, AchievementIconName, UiIconName };

export type IconDefinition<S extends IconSheet = IconSheet> = {
  sheet: S;
  icon: IconName<S>;
};

const ICON_INDEX_BY_SHEET = {
  [SPRITESHEET_KEYS.parts]: PARTS_ICON_INDEX,
  [SPRITESHEET_KEYS.achievements]: ACHIEVEMENTS_ICON_INDEX,
  [SPRITESHEET_KEYS.races]: RACES_ICON_INDEX,
  [SPRITESHEET_KEYS.icons]: UI_ICON_INDEX,
} as const;

export class IconEntity<S extends IconSheet = IconSheet> extends GameObjects.Image {
  private currentIcon: IconDefinition<S>;

  constructor(scene: Scene, x: number, y: number, icon: IconDefinition<S>) {
    const frame = ICON_INDEX_BY_SHEET[icon.sheet][icon.icon as never];
    super(scene, x, y, icon.sheet, frame);

    this.currentIcon = icon;
    this.setOrigin(0.5);
    this.scene.add.existing(this);
  }

  setIcon(icon: IconDefinition<S>): void {
    if (!this.active) {
      return;
    }

    this.currentIcon = icon;
    this.setTexture(icon.sheet, ICON_INDEX_BY_SHEET[icon.sheet][icon.icon as never]);
  }

  getIcon(): IconDefinition<S> {
    return this.currentIcon;
  }
}
