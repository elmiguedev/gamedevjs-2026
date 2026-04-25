import type { Action } from '../domain/Action';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import { SCRAP_SALE_AMOUNT, SCRAP_SALE_CASH_REWARD } from '../utils/Constants';

export class SellScrapAction implements Action<void, GameState> {
  constructor(private readonly gameStateService: GameStateService) {}

  async execute(): Promise<GameState> {
    return this.gameStateService.update((current) => {
      if (current.scrap < SCRAP_SALE_AMOUNT) {
        return current;
      }

      return {
        ...current,
        scrap: current.scrap - SCRAP_SALE_AMOUNT,
        cash: current.cash + SCRAP_SALE_CASH_REWARD,
      };
    });
  }
}
