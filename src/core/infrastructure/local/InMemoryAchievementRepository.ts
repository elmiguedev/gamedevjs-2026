import type { Achievement, AchievementCategory } from '@/core/domain/Achievement';
import type { AchievementRepository } from '@/core/domain/AchievementRepository';

const ACHIEVEMENTS: Achievement[] = [
  { id: 'cup-rust-sprint', title: 'Rust Sprint', description: 'Win the first street cup.', category: 'cup', unlocked: false },
  { id: 'cup-street-relay', title: 'Street Relay', description: 'Qualify for the second street cup.', category: 'cup', unlocked: false },
  { id: 'cup-neon-league', title: 'Neon League', description: 'Reach the upper street bracket.', category: 'cup', unlocked: false },
  { id: 'cup-urban-qualifier', title: 'Urban Qualifier', description: 'Earn access to the final tier.', category: 'cup', unlocked: false },
  { id: 'cup-neon-crown', title: 'The Neon Crown', description: 'Become the champion of the world.', category: 'cup', unlocked: false },
  { id: 'craft-basic-wheels', title: 'Basic Wheels', description: 'Craft your first wheel set.', category: 'craft', unlocked: false },
  { id: 'craft-full-basic-set', title: 'Full Starter Set', description: 'Craft a complete starter build.', category: 'craft', unlocked: false },
  { id: 'collect-scrap', title: 'Scrap Hoarder', description: 'Gather a big pile of scrap.', category: 'collection', unlocked: false },
  { id: 'collection-complete-car', title: 'Project Complete', description: 'Finish a full car build.', category: 'collection', unlocked: false },
  { id: 'meta-first-race', title: 'First Checkered Flag', description: 'Complete your first race.', category: 'meta', unlocked: false },
];

export class InMemoryAchievementRepository implements AchievementRepository {
  findAll(): Achievement[] {
    return [...ACHIEVEMENTS];
  }

  findByCategory(category: AchievementCategory): Achievement[] {
    return ACHIEVEMENTS.filter((achievement) => achievement.category === category);
  }
}
