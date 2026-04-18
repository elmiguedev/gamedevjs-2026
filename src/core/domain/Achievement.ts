export type AchievementCategory = 'cup' | 'craft' | 'collection' | 'meta';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  unlocked: boolean;
}
