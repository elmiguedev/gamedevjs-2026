import type { AchievementChecker } from '@/core/domain/AchievementChecker';
import type { Achievement } from '@/core/domain/Achievement';
import type { AchievementRepository } from '@/core/domain/AchievementRepository';
import type { GameState } from '@/core/domain/GameState';
import type { GameStateService } from '@/core/domain/GameStateService';

type AchievementRule = {
  id: string;
  unlocked: (state: GameState) => boolean;
};

const RULES: AchievementRule[] = [
  { id: 'cup-rust-sprint', unlocked: (state) => state.raceWins >= 1 },
  { id: 'cup-street-relay', unlocked: (state) => state.racePoints >= 35 },
  { id: 'cup-neon-league', unlocked: (state) => state.racePoints >= 90 },
  { id: 'cup-urban-qualifier', unlocked: (state) => state.racePoints >= 160 },
  { id: 'cup-neon-crown', unlocked: (state) => state.racePoints >= 320 },
  { id: 'cup-podium-hunter', unlocked: (state) => state.racesCompleted >= 5 },
  { id: 'cup-street-contender', unlocked: (state) => state.raceWins >= 3 },
  { id: 'cup-prize-fighter', unlocked: (state) => state.racePoints >= 220 },
  { id: 'cup-crown-defense', unlocked: (state) => state.raceWins >= 8 },
  { id: 'craft-basic-wheels', unlocked: (state) => state.craftedWheelParts >= 1 },
  { id: 'craft-full-basic-set', unlocked: (state) => state.partsCrafted >= 6 },
  { id: 'craft-wheel-specialist', unlocked: (state) => state.craftedWheelParts >= 3 },
  { id: 'craft-premium-builder', unlocked: (state) => state.partsCrafted >= 10 },
  { id: 'collect-scrap', unlocked: (state) => state.scrapCollected >= 100 },
  { id: 'collection-complete-car', unlocked: (state) => state.car.hasCompleteCar() },
  { id: 'collection-tuned-car', unlocked: (state) => state.car.attributes.acceleration >= 12 && state.car.attributes.speed >= 8 },
  { id: 'meta-first-race', unlocked: (state) => state.racesCompleted >= 1 },
  { id: 'meta-race-grinder', unlocked: (state) => state.racesCompleted >= 10 },
];

export class LocalAchievementChecker implements AchievementChecker {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly achievementRepository: AchievementRepository,
  ) {}

  check(): void {
    const state = this.gameStateService.getState();
    const achievements = this.achievementRepository.findAll();
    const byId = new Map(achievements.map((achievement) => [achievement.id, achievement]));

    for (const rule of RULES) {
      const achievement = byId.get(rule.id);

      if (!achievement) {
        continue;
      }

      this.achievementRepository.save({
        ...achievement,
        checked: true,
        unlocked: achievement.unlocked || rule.unlocked(state),
      });
    }

    for (const achievement of achievements) {
      if (RULES.some((rule) => rule.id === achievement.id)) {
        continue;
      }

      this.achievementRepository.save({
        ...achievement,
        checked: true,
      });
    }
  }
}
