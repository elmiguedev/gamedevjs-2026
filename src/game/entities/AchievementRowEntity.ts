import { GameObjects, Scene } from 'phaser';
import type { Achievement } from '@/core/domain/Achievement';
import { IconEntity } from '@/game/entities/IconEntity';
import type { AchievementIconName } from '@/game/assets/spritesheets';

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

export class AchievementRowEntity extends GameObjects.Container {
  constructor(scene: Scene, x: number, y: number, achievement: Achievement) {
    super(scene, x, y);

    const color = achievement.unlocked ? '#111111' : achievement.checked ? '#6b7280' : '#d1d5db';
    const alpha = achievement.unlocked ? 1 : 0.45;

    const panel = this.scene.add.rectangle(0, 0, 400, 60, achievement.unlocked ? 0xf8e4a1 : 0xffffff).setOrigin(0, 0);
    panel.setStrokeStyle(1, 0x111111);

    const icon = new IconEntity(this.scene, 32, 30, {
      sheet: 'achievements',
      icon: ACHIEVEMENT_ICON_BY_ID[achievement.id] ?? 'firstCheckeredFlag',
    });
    icon.setDisplaySize(42, 42);
    icon.setAlpha(alpha);
    if (achievement.unlocked) {
      icon.setTint(0xf2d27a);
    }

    const title = this.scene.add.text(64, 8, achievement.title, {
      color,
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      wordWrap: { width: 190 },
    });

    const description = this.scene.add.text(64, 28, achievement.description, {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      wordWrap: { width: 218 },
    });

    const category = this.scene.add.text(320, 30, achievement.category.toUpperCase(), {
      color,
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      backgroundColor: achievement.unlocked ? '#f2d27a' : '#e5e7eb',
      padding: { left: 5, right: 5, top: 2, bottom: 2 },
    }).setOrigin(0.5);

    panel.setAlpha(achievement.unlocked ? 1 : 0.65);
    category.setAlpha(alpha);

    this.add([panel, icon, title, description, category]);
  }
}
