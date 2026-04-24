import { Scene } from 'phaser';
import { ButtonEntity } from '@/game/entities/ButtonEntity';
import { AchievementCategorySelectorEntity, type AchievementGroup } from '@/game/entities/AchievementCategorySelectorEntity';
import { AchievementHeaderEntity } from '@/game/entities/AchievementHeaderEntity';
import { AchievementListEntity } from '@/game/entities/AchievementListEntity';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { ToastEntity } from '@/game/entities/ToastEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';

export class AchievementsScene extends Scene {
  // entities
  // ------------

  private resourceHud!: ResourceHud;
  private header?: AchievementHeaderEntity;
  private selector?: AchievementCategorySelectorEntity;
  private list?: AchievementListEntity;
  private backButton?: ButtonEntity;
  private toast?: ToastEntity;

  // constructor
  // ----------------

  constructor() {
    super('AchievementsScene');
  }

  // core loop methods
  // ----------------

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.resourceHud = new ResourceHud(this);
    this.toast = new ToastEntity(this, this.scale.width / 2, 70);
    this.header = new AchievementHeaderEntity(this, 360, 100);
    this.add.existing(this.header);

    this.showSelector();

    new MenuEntity(this);
  }

  // behavior methods
  // ------------------

  private showSelector(): void {
    this.destroyCategoryView();

    this.selector = new AchievementCategorySelectorEntity(this, 0, 220, (group) => {
      void this.showCategory(group);
    });
  }

  private async showCategory(group: AchievementGroup): Promise<void> {
    this.destroyCategoryView();

    const repo = ActionProvider.getAchievementRepository();
    const achievements = this.resolveCategory(group, repo);
    const title = group === 'hall' ? 'Hall of Fame' : 'Garage Path';

    this.backButton = new ButtonEntity(this, 90, 170, 120, 34, 'Back', () => {
      this.showSelector();
    });

    this.list = new AchievementListEntity(this, 40, 220);
    this.list.setData(title, achievements);
  }

  private resolveCategory(group: AchievementGroup, repo: ReturnType<typeof ActionProvider.getAchievementRepository>) {
    if (group === 'hall') {
      return repo.findByCategory('cup');
    }

    return [
      ...repo.findByCategory('craft'),
      ...repo.findByCategory('collection'),
      ...repo.findByCategory('meta'),
    ];
  }

  private destroyCategoryView(): void {
    this.selector?.destroy();
    this.list?.destroy();
    this.backButton?.destroy();
    this.toast?.destroy();
    this.selector = undefined;
    this.list = undefined;
    this.backButton = undefined;
    this.toast = undefined;
  }
}
