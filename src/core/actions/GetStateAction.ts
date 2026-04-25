import type { Action } from '../domain/Action';
import type { AchievementChecker } from '../domain/AchievementChecker';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import { DEFAULT_COLLECT_SCRAP_AMOUNT } from '../utils/Constants';

export class GetStateAction implements Action<void, GameState> {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly achievementChecker?: AchievementChecker,
  ) {}

  async execute(): Promise<GameState> {
    let state = this.gameStateService.getState();
    const repairsChanged = state.car.tickRepairs();
    const scrapCollectionChanged = state.scrapCollectAvailableAt > 0 && state.scrapCollectAvailableAt <= Date.now();

    if (repairsChanged || scrapCollectionChanged) {
      state = this.gameStateService.update((current) => {
        if (!scrapCollectionChanged) {
          return current;
        }

        return {
          ...current,
          scrap: current.scrap + DEFAULT_COLLECT_SCRAP_AMOUNT,
          scrapCollected: current.scrapCollected + DEFAULT_COLLECT_SCRAP_AMOUNT,
          scrapCollectAvailableAt: 0,
        };
      });
      this.achievementChecker?.check();
    }

    return state;
  }
}
