import type { Achievement, AchievementCategory } from '@/core/domain/Achievement';
import type { AchievementRepository } from '@/core/domain/AchievementRepository';

const ACHIEVEMENTS: Achievement[] = [
  { id: 'cup-rust-sprint', title: 'Rust Sprint', description: 'Win the first street cup.', category: 'cup', checked: false, unlocked: false },
  { id: 'cup-street-relay', title: 'Street Relay', description: 'Qualify for the second street cup.', category: 'cup', checked: false, unlocked: false },
  { id: 'cup-neon-league', title: 'Neon League', description: 'Reach the upper street bracket.', category: 'cup', checked: false, unlocked: false },
  { id: 'cup-urban-qualifier', title: 'Urban Qualifier', description: 'Earn access to the final tier.', category: 'cup', checked: false, unlocked: false },
  { id: 'cup-neon-crown', title: 'The Neon Crown', description: 'Become the champion of the world.', category: 'cup', checked: false, unlocked: false },
  { id: 'cup-podium-hunter', title: 'Podium Hunter', description: 'Complete 5 races.', category: 'cup', checked: false, unlocked: false },
  { id: 'cup-street-contender', title: 'Street Contender', description: 'Win 3 races.', category: 'cup', checked: false, unlocked: false },
  { id: 'cup-prize-fighter', title: 'Prize Fighter', description: 'Earn 220 race points.', category: 'cup', checked: false, unlocked: false },
  { id: 'cup-crown-defense', title: 'Crown Defense', description: 'Win 8 races.', category: 'cup', checked: false, unlocked: false },
  { id: 'craft-basic-wheels', title: 'Basic Wheels', description: 'Craft your first wheel set.', category: 'craft', checked: false, unlocked: false },
  { id: 'craft-full-basic-set', title: 'Full Starter Set', description: 'Craft a complete starter build.', category: 'craft', checked: false, unlocked: false },
  { id: 'craft-wheel-specialist', title: 'Wheel Specialist', description: 'Craft 3 wheel sets.', category: 'craft', checked: false, unlocked: false },
  { id: 'craft-premium-builder', title: 'Premium Builder', description: 'Craft 10 parts.', category: 'craft', checked: false, unlocked: false },
  { id: 'collect-scrap', title: 'Scrap Hoarder', description: 'Gather a big pile of scrap.', category: 'collection', checked: false, unlocked: false },
  { id: 'collection-complete-car', title: 'Project Complete', description: 'Finish a full car build.', category: 'collection', checked: false, unlocked: false },
  { id: 'collection-tuned-car', title: 'Tuned Machine', description: 'Equip a car with strong speed and acceleration.', category: 'collection', checked: false, unlocked: false },
  { id: 'meta-first-race', title: 'First Checkered Flag', description: 'Complete your first race.', category: 'meta', checked: false, unlocked: false },
  { id: 'meta-race-grinder', title: 'Race Grinder', description: 'Complete 10 races.', category: 'meta', checked: false, unlocked: false },
];

export class InMemoryAchievementRepository implements AchievementRepository {
  private readonly achievements = ACHIEVEMENTS.map((achievement) => ({ ...achievement }));
  private readonly listeners = new Set<(achievements: Achievement[]) => void>();

  hydrate(achievements: Achievement[]): void {
    for (const achievement of achievements) {
      this.save(achievement);
    }
  }

  findAll(): Achievement[] {
    return this.achievements.map((achievement) => ({ ...achievement }));
  }

  findByCategory(category: AchievementCategory): Achievement[] {
    return this.achievements.filter((achievement) => achievement.category === category).map((achievement) => ({ ...achievement }));
  }

  save(achievement: Achievement): void {
    const index = this.achievements.findIndex((current) => current.id === achievement.id);

    if (index < 0) {
      this.achievements.push({ ...achievement });
      this.notify();
      return;
    }

    this.achievements[index] = { ...achievement };
    this.notify();
  }

  subscribe(listener: (achievements: Achievement[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.findAll());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snapshot = this.findAll();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
