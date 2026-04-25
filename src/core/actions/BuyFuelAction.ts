import type { Action } from '../domain/Action';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import { FUEL_PURCHASE_AMOUNT, FUEL_PURCHASE_CASH_COST } from '../utils/Constants';

export class BuyFuelAction implements Action<void, GameState> {
  constructor(private readonly gameStateService: GameStateService) {}

  async execute(): Promise<GameState> {
    return this.gameStateService.update((current) => {
      if (current.cash < FUEL_PURCHASE_CASH_COST) {
        return current;
      }

      return {
        ...current,
        cash: current.cash - FUEL_PURCHASE_CASH_COST,
        fuel: current.fuel + FUEL_PURCHASE_AMOUNT,
      };
    });
  }
}
