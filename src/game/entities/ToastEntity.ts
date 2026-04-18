import { GameObjects, Scene } from 'phaser';
import type { Achievement } from '@/core/domain/Achievement';
import { ActionProvider } from '@/game/providers/ActionProvider';

const TOAST_DURATION_MS = 3000;
const TOAST_FADE_MS = 180;

export class ToastEntity extends GameObjects.Container {
  private readonly frame: GameObjects.Rectangle;
  private readonly titleText: GameObjects.Text;
  private readonly bodyText: GameObjects.Text;
  private readonly queue: Achievement[] = [];
  private activeAchievementIds = new Set<string>();
  private unsubscribeAchievements?: () => void;
  private hideTimer?: Phaser.Time.TimerEvent;
  private isShowing = false;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);

    this.frame = this.scene.add.rectangle(0, 0, 320, 74, 0x111111, 0.96).setOrigin(0.5);
    this.frame.setStrokeStyle(1, 0xffffff, 0.2);

    this.titleText = this.scene.add.text(0, -16, 'Achievement unlocked', {
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.bodyText = this.scene.add.text(0, 8, '', {
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
    }).setOrigin(0.5);

    this.add([this.frame, this.titleText, this.bodyText]);
    this.setScrollFactor(0);
    this.setDepth(5000);
    this.setAlpha(0);
    this.setVisible(false);
    this.scene.add.existing(this);

    this.activeAchievementIds = new Set(
      ActionProvider.getAchievementRepository()
        .findAll()
        .filter((achievement) => achievement.unlocked)
        .map((achievement) => achievement.id),
    );

    this.unsubscribeAchievements = ActionProvider.getAchievementRepository().subscribe((achievements) => {
      this.collectUnlockedAchievements(achievements);
    });

    this.scene.events.once('shutdown', () => {
      this.destroy();
    });
  }

  protected preDestroy(): void {
    this.unsubscribeAchievements?.();
    this.hideTimer?.remove(false);
    this.frame.destroy();
    this.titleText.destroy();
    this.bodyText.destroy();
  }

  private collectUnlockedAchievements(achievements: Achievement[]): void {
    const nextUnlockedIds = new Set(achievements.filter((achievement) => achievement.unlocked).map((achievement) => achievement.id));
    const newlyUnlocked = achievements.filter((achievement) => achievement.unlocked && !this.activeAchievementIds.has(achievement.id));

    this.activeAchievementIds = nextUnlockedIds;

    newlyUnlocked.forEach((achievement) => this.enqueue(achievement));
  }

  private enqueue(achievement: Achievement): void {
    this.queue.push(achievement);

    if (!this.isShowing) {
      void this.showNext();
    }
  }

  private async showNext(): Promise<void> {
    const achievement = this.queue.shift();

    if (!achievement || !this.active) {
      return;
    }

    this.isShowing = true;
    this.bodyText.setText(achievement.title);
    this.setVisible(true);

    this.scene.tweens.killTweensOf(this);
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: TOAST_FADE_MS,
      ease: 'Sine.easeOut',
    });

    this.hideTimer?.remove(false);
    this.hideTimer = this.scene.time.delayedCall(TOAST_DURATION_MS, () => {
      if (!this.active) {
        return;
      }

      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: TOAST_FADE_MS,
        ease: 'Sine.easeIn',
        onComplete: () => {
          if (!this.active) {
            return;
          }

          this.setVisible(false);
          this.isShowing = false;
          void this.showNext();
        },
      });
    });
  }
}
