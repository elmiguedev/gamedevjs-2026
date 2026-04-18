import type { Action } from '../domain/Action';
import type { AchievementChecker } from '../domain/AchievementChecker';
import type { CarPart } from '../domain/CarPart';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import type { CarPartRepository } from '../domain/CarPartRepository';
import type { CarPartInventoryRepository } from '../domain/CarPartInventoryRepository';
import type { MechanicProgressRepository } from '../domain/MechanicProgressRepository';
import type { CarCraftingRepository, CraftingStatus } from '../domain/CarCraftingRepository';

export class CraftCarPartAction implements Action<{ partId: string }, CraftingStatus> {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly carPartRepository: CarPartRepository,
    private readonly mechanicProgressRepository: MechanicProgressRepository,
    private readonly carPartInventoryRepository: CarPartInventoryRepository,
    private readonly carCraftingRepository: CarCraftingRepository,
    private readonly achievementChecker: AchievementChecker,
  ) {}

  async execute(input: { partId: string }): Promise<CraftingStatus> {
    const currentCraft = this.carCraftingRepository.getStatus();

    if (currentCraft.active || currentCraft.ready) {
      throw new Error('Craft already active');
    }

    const part = this.carPartRepository.findById(input.partId);

    if (!part) {
      throw new Error('Part not found');
    }

    const progress = this.mechanicProgressRepository.get();

    if (progress.level < part.requiredLevel) {
      throw new Error('Mechanic level too low');
    }

    const state = this.gameStateService.getState();

    if (state.scrap < part.scrapCost || state.cash < part.cashCost) {
      throw new Error('Not enough resources');
    }

    this.gameStateService.setState({
      ...state,
      scrap: state.scrap - part.scrapCost,
      cash: state.cash - part.cashCost,
    });

    this.mechanicProgressRepository.addXp(part.xpReward);
    this.carCraftingRepository.start(part);
    this.achievementChecker.check();

    return this.carCraftingRepository.getStatus();
  }
}
