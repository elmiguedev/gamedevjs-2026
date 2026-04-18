import type { Action } from '../domain/Action';
import type { AchievementChecker } from '../domain/AchievementChecker';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import { DEFAULT_COLLECT_SCRAP_AMOUNT } from '../utils/Constants';

export class CollectScrapAction implements Action<void, GameState> {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly achievementChecker: AchievementChecker,
  ) {}

  async execute(): Promise<GameState> {
    const state = this.gameStateService.update((current) => ({
      ...current,
      scrap: current.scrap + DEFAULT_COLLECT_SCRAP_AMOUNT,
      scrapCollected: current.scrapCollected + DEFAULT_COLLECT_SCRAP_AMOUNT,
    }));

    this.achievementChecker.check();
    return state;
  }
}
