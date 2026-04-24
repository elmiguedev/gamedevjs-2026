import { GameObjects, Scene } from 'phaser';
import type { Achievement } from '@/core/domain/Achievement';
import { IconEntity } from '@/game/entities/IconEntity';
import type { AchievementIconName, UiIconName } from '@/game/assets/spritesheets';

const ACHIEVEMENT_ICON_BY_ID = {
  'cup-rust-sprint': 'rustSprint',
  'cup-street-relay': 'streetRelay',
  'cup-neon-league': 'neonLeague',
  'cup-urban-qualifier': 'urbanQualifier',
  'cup-neon-crown': 'neonCrown',
  'craft-basic-wheels': 'basicWheels',
  'craft-full-basic-set': 'fullStarterSet',
  'collect-scrap': 'scrapHoarder',
  'collection-complete-car': 'projectComplete',
  'meta-first-race': 'firstCheckeredFlag',
} as const satisfies Record<string, AchievementIconName>;

const STATUS_ICON_BY_STATE = {
  unlocked: 'unlocked',
  locked: 'locked',
  hidden: 'disabled',
} as const satisfies Record<string, UiIconName>;

export class AchievementRowEntity extends GameObjects.Container {
  constructor(scene: Scene, x: number, y: number, achievement: Achievement) {
    super(scene, x, y);

    const color = achievement.unlocked ? '#111111' : achievement.checked ? '#6b7280' : '#d1d5db';
    const statusLabel = achievement.unlocked ? 'Unlocked' : achievement.checked ? 'Locked' : 'Hidden';
    const statusIcon = achievement.unlocked ? STATUS_ICON_BY_STATE.unlocked : achievement.checked ? STATUS_ICON_BY_STATE.locked : STATUS_ICON_BY_STATE.hidden;

    const panel = this.scene.add.rectangle(0, 0, 400, 78, 0xffffff).setOrigin(0, 0);
    panel.setStrokeStyle(1, 0x111111);

    const icon = new IconEntity(this.scene, 38, 39, {
      sheet: 'achievements',
      icon: ACHIEVEMENT_ICON_BY_ID[achievement.id] ?? 'firstCheckeredFlag',
    });
    icon.setDisplaySize(52, 52);
    icon.setAlpha(achievement.unlocked || achievement.checked ? 1 : 0.35);

    const title = this.scene.add.text(76, 12, achievement.title, {
      color,
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      wordWrap: { width: 190 },
    });

    const description = this.scene.add.text(76, 36, achievement.description, {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      wordWrap: { width: 210 },
    });

    const category = this.scene.add.text(286, 18, achievement.category.toUpperCase(), {
      color,
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      backgroundColor: achievement.unlocked ? '#f2d27a' : '#e5e7eb',
      padding: { left: 5, right: 5, top: 2, bottom: 2 },
    }).setOrigin(0.5);

    const statusMarker = new IconEntity(this.scene, 306, 52, { sheet: 'icons', icon: statusIcon });
    statusMarker.setDisplaySize(18, 18);
    statusMarker.setAlpha(achievement.unlocked || achievement.checked ? 1 : 0.45);

    const status = this.scene.add.text(324, 52, statusLabel, {
      color,
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: achievement.unlocked ? 'bold' : 'normal',
    }).setOrigin(0, 0.5);

    this.add([panel, icon, title, description, category, statusMarker, status]);
  }
}
