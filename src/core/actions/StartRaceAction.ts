import type { Action } from '../domain/Action';
import type { AchievementChecker } from '../domain/AchievementChecker';
import type { CarAttributes } from '../domain/Car';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import type { RaceRepository, RaceRunResult } from '../domain/RaceRepository';

export class StartRaceAction implements Action<{ raceId: string }, RaceRunResult> {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly raceRepository: RaceRepository,
    private readonly achievementChecker: AchievementChecker,
  ) {}

  async execute(input: { raceId: string }): Promise<RaceRunResult> {
    const race = this.raceRepository.findById(input.raceId);

    if (!race) {
      throw new Error('Race not found');
    }

    const state = this.gameStateService.getState();

    if (!state.car.hasRequiredRaceParts()) {
      throw new Error('Car needs chassis, engine, wheels and steering');
    }

    if (race.requiresCompleteCar && !state.car.hasCompleteCar()) {
      throw new Error('Car needs all part slots equipped');
    }

    if (!state.car.canRace()) {
      throw new Error('Car is damaged');
    }

    if (!state.car.hasFuel(race.fuelMin)) {
      throw new Error('Not enough fuel');
    }

    if (!this.raceRepository.canEnterRace(race.id)) {
      throw new Error('Race is unavailable');
    }

    if (race.entryFee > state.cash) {
      throw new Error('Not enough cash');
    }

    this.gameStateService.update((current) => ({
      ...current,
      cash: current.cash - race.entryFee,
    }));

    this.achievementChecker.check();

    return this.raceRepository.startRace(race.id, this.calculatePerformanceRatio(state, race.targetStats));
  }

  private calculatePerformanceRatio(state: GameState, targetStats: Partial<CarAttributes>): number {
    const entries = Object.entries(targetStats) as [keyof CarAttributes, number][];

    if (entries.length === 0) {
      return 1;
    }

    const total = entries.reduce((sum, [attribute, target]) => {
      if (target <= 0) {
        return sum + 1;
      }

      return sum + state.car.attributes[attribute] / target;
    }, 0);

    return total / entries.length;
  }
}
