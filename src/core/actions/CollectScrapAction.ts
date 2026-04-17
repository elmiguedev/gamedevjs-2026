import type { Action } from '../domain/Action';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import { DEFAULT_COLLECT_SCRAP_AMOUNT } from '../utils/Constants';

export class CollectScrapAction implements Action<void, GameState> {
  constructor(private readonly gameStateService: GameStateService) {}

  async execute(): Promise<GameState> {
    return this.gameStateService.update((state) => ({
      ...state,
      scrap: state.scrap + DEFAULT_COLLECT_SCRAP_AMOUNT,
    }));
  }
}
