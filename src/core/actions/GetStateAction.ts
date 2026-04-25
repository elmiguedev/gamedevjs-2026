import type { Action } from '../domain/Action';
import type { AchievementChecker } from '../domain/AchievementChecker';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import { DEFAULT_COLLECT_SCRAP_AMOUNT, OIL_WELL_FUEL_AMOUNT, OIL_WELL_FUEL_INTERVAL_SECONDS } from '../utils/Constants';

export class GetStateAction implements Action<void, GameState> {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly achievementChecker?: AchievementChecker,
  ) {}

  async execute(): Promise<GameState> {
    let state = this.gameStateService.getState();
    const repairsChanged = state.car.tickRepairs();
    const scrapCollectionChanged = state.scrapCollectAvailableAt > 0 && state.scrapCollectAvailableAt <= Date.now();
    const robotCanCollect = state.craftedToolIds.includes('robot-recolector')
      && (state.robotScrapCollectedAt <= 0 || Math.floor((Date.now() - state.robotScrapCollectedAt) / 3000) > 0);
    const oilWellCanCollect = state.craftedToolIds.includes('pozo-petrolero')
      && (state.oilWellFuelCollectedAt <= 0 || Math.floor((Date.now() - state.oilWellFuelCollectedAt) / (OIL_WELL_FUEL_INTERVAL_SECONDS * 1000)) > 0);

    if (repairsChanged || scrapCollectionChanged || robotCanCollect || oilWellCanCollect) {
      state = this.gameStateService.update((current) => {
        let nextState = current;

        if (scrapCollectionChanged) {
          const amount = current.craftedToolIds.includes('brazo-mecanico') ? DEFAULT_COLLECT_SCRAP_AMOUNT * 2 : DEFAULT_COLLECT_SCRAP_AMOUNT;
          nextState = {
            ...nextState,
            scrap: nextState.scrap + amount,
            scrapCollected: nextState.scrapCollected + amount,
            scrapCollectAvailableAt: 0,
          };
        }

        if (nextState.craftedToolIds.includes('robot-recolector')) {
          const lastCollectedAt = nextState.robotScrapCollectedAt || Date.now();
          const elapsedTicks = Math.floor((Date.now() - lastCollectedAt) / 3000);

          if (elapsedTicks > 0) {
            nextState = {
              ...nextState,
              scrap: nextState.scrap + elapsedTicks,
              scrapCollected: nextState.scrapCollected + elapsedTicks,
              robotScrapCollectedAt: lastCollectedAt + elapsedTicks * 3000,
            };
          } else if (nextState.robotScrapCollectedAt <= 0) {
            nextState = {
              ...nextState,
              robotScrapCollectedAt: Date.now(),
            };
          }
        }

        if (nextState.craftedToolIds.includes('pozo-petrolero')) {
          const lastCollectedAt = nextState.oilWellFuelCollectedAt || Date.now();
          const elapsedTicks = Math.floor((Date.now() - lastCollectedAt) / (OIL_WELL_FUEL_INTERVAL_SECONDS * 1000));

          if (elapsedTicks > 0) {
            nextState = {
              ...nextState,
              fuel: nextState.fuel + elapsedTicks * OIL_WELL_FUEL_AMOUNT,
              oilWellFuelCollectedAt: lastCollectedAt + elapsedTicks * OIL_WELL_FUEL_INTERVAL_SECONDS * 1000,
            };
          } else if (nextState.oilWellFuelCollectedAt <= 0) {
            nextState = {
              ...nextState,
              oilWellFuelCollectedAt: Date.now(),
            };
          }
        }

        return nextState;
      });
      this.achievementChecker?.check();
    }

    return state;
  }
}
