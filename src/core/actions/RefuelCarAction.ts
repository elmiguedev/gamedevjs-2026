import type { Action } from '../domain/Action';
import type { AchievementChecker } from '../domain/AchievementChecker';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';

export class RefuelCarAction implements Action<{ amount?: number }, GameState> {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly achievementChecker: AchievementChecker,
  ) {}

  async execute(input: { amount?: number } = {}): Promise<GameState> {
    const amount = input.amount ?? Number.POSITIVE_INFINITY;

    const state = await this.gameStateService.update((current) => {
      const needed = Math.max(0, current.car.maxFuel - current.car.fuel);
      const refuelAmount = Math.min(current.fuel, needed, amount);

      current.car.refillFuel(refuelAmount);

      return {
        ...current,
        fuel: current.fuel - refuelAmount,
      };
    });

    this.achievementChecker.check();

    return state;
  }
}
