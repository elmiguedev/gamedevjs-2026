import { GameObjects, Scene } from 'phaser';
import type { Achievement } from '@/core/domain/Achievement';

export class AchievementRowEntity extends GameObjects.Container {
  constructor(scene: Scene, x: number, y: number, achievement: Achievement) {
    super(scene, x, y);

    const panel = this.scene.add.rectangle(0, 0, 640, 72, 0xffffff).setOrigin(0, 0);
    panel.setStrokeStyle(1, 0x111111);

    const title = this.scene.add.text(12, 10, achievement.title, {
      color: achievement.unlocked ? '#111111' : achievement.checked ? '#6b7280' : '#d1d5db',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
    });

    const description = this.scene.add.text(12, 38, achievement.description, {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });

    const badge = this.scene.add.text(560, 24, achievement.category.toUpperCase(), {
      color: achievement.unlocked ? '#111111' : achievement.checked ? '#6b7280' : '#d1d5db',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const status = this.scene.add.text(620, 24, achievement.unlocked ? 'Unlocked' : achievement.checked ? 'Locked' : 'Hidden', {
      color: achievement.unlocked ? '#111111' : achievement.checked ? '#6b7280' : '#d1d5db',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
    }).setOrigin(1, 0.5);

    this.add([panel, title, description, badge, status]);
  }
}
