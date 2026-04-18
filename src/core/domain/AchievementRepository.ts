import type { Achievement } from './Achievement';
import type { AchievementCategory } from './Achievement';

export interface AchievementRepository {
  findAll(): Achievement[];
  findByCategory(category: AchievementCategory): Achievement[];
}
