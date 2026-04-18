import type { Achievement } from './Achievement';
import type { AchievementCategory } from './Achievement';

export interface AchievementRepository {
  findAll(): Achievement[];
  findByCategory(category: AchievementCategory): Achievement[];
  save(achievement: Achievement): void;
  subscribe(listener: (achievements: Achievement[]) => void): () => void;
}
