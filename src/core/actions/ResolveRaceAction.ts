import type { Action } from '../domain/Action';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import type { RaceCompletion, RaceRepository } from '../domain/RaceRepository';

export interface RaceResolution {
  state: GameState;
  result: RaceCompletion;
}

export class ResolveRaceAction implements Action<void, RaceResolution | null> {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly raceRepository: RaceRepository,
  ) {}

  async execute(): Promise<RaceResolution | null> {
    this.raceRepository.resolveActiveRace();
    const completed = this.raceRepository.claimRace();

    if (!completed) {
      return null;
    }

    const state = this.gameStateService.getState();
    const race = completed.race;
    const fuelSpent = this.randomBetween(race.fuelMin, race.fuelMax);
    const damage = this.randomBetween(race.damageMin, race.damageMax);

    state.car.applyRaceDamage({ rueda: damage, chasis: Math.max(0, Math.floor(damage / 2)) });
    state.car.consumeFuel(fuelSpent);

    if (state.car.hasBrokenPart()) {
      completed.reward = Math.max(0, Math.floor(completed.reward * 0.75));
      completed.points = Math.max(0, Math.floor(completed.points * 0.75));
    }

    this.gameStateService.update((current) => ({
      ...current,
      cash: current.cash + completed.reward,
      racePoints: current.racePoints + completed.points,
    }));

    return {
      state: this.gameStateService.getState(),
      result: completed,
    };
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
