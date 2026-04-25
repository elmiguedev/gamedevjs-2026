import type { Action } from '../domain/Action';
import type { AchievementChecker } from '../domain/AchievementChecker';
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

    return this.raceRepository.startRace(race.id);
  }
}
