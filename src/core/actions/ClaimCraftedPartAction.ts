import type { Action } from '../domain/Action';
import type { AchievementChecker } from '../domain/AchievementChecker';
import type { CarPart } from '../domain/CarPart';
import type { GameStateService } from '../domain/GameStateService';
import type { CarPartInventoryRepository } from '../domain/CarPartInventoryRepository';
import type { CarCraftingRepository } from '../domain/CarCraftingRepository';
import { isWorkshopTool } from '../domain/CarCrafting';

export class ClaimCraftedPartAction implements Action<void, CarPart | null> {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly carPartInventoryRepository: CarPartInventoryRepository,
    private readonly carCraftingRepository: CarCraftingRepository,
    private readonly achievementChecker: AchievementChecker,
  ) {}

  async execute(): Promise<CarPart | null> {
    const part = this.carCraftingRepository.claimReady();

    if (!part) {
      return null;
    }

    if (isWorkshopTool(part)) {
      this.gameStateService.update((current) => ({
        ...current,
        craftedToolIds: current.craftedToolIds.includes(part.id) ? current.craftedToolIds : [...current.craftedToolIds, part.id],
        robotScrapCollectedAt: part.effect.type === 'passiveScrap' ? Date.now() : current.robotScrapCollectedAt,
        oilWellFuelCollectedAt: part.effect.type === 'passiveFuel' ? Date.now() : current.oilWellFuelCollectedAt,
      }));
      this.achievementChecker.check();
      return null;
    }

    this.carPartInventoryRepository.add(part);
    this.gameStateService.update((current) => ({
      ...current,
      partsCrafted: current.partsCrafted + 1,
      craftedWheelParts: current.craftedWheelParts + (part.type === 'rueda' ? 1 : 0),
    }));
    this.achievementChecker.check();
    return part;
  }
}
