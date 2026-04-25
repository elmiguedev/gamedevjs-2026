import type { Action } from '../domain/Action';
import type { AchievementChecker } from '../domain/AchievementChecker';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import { DEFAULT_COLLECT_SCRAP_AMOUNT, DEFAULT_COLLECT_SCRAP_COOLDOWN_SECONDS } from '../utils/Constants';

export class CollectScrapAction implements Action<void, GameState> {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly achievementChecker: AchievementChecker,
  ) {}

  async execute(): Promise<GameState> {
    const now = Date.now();
    const state = this.gameStateService.update((current) => {
      if (current.scrapCollectAvailableAt > now) {
        return current;
      }

      return {
        ...current,
        scrapCollectAvailableAt: now + DEFAULT_COLLECT_SCRAP_COOLDOWN_SECONDS * 1000,
      };
    });

    this.achievementChecker.check();
    return state;
  }
}
