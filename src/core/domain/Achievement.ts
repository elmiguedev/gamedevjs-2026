export type AchievementCategory = 'cup' | 'craft' | 'collection' | 'meta';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  checked: boolean;
  unlocked: boolean;
}
