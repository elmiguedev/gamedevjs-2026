import type { Action } from '../domain/Action';
import type { AchievementChecker } from '../domain/AchievementChecker';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import type { CarPartInventoryRepository } from '../domain/CarPartInventoryRepository';

export class EquipCarPartAction implements Action<{ itemId: string }, GameState> {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly carPartInventoryRepository: CarPartInventoryRepository,
    private readonly achievementChecker: AchievementChecker,
  ) {}

  async execute(input: { itemId: string }): Promise<GameState> {
    const item = this.carPartInventoryRepository.findById(input.itemId);

    if (!item) {
      throw new Error('Inventory item not found');
    }

    try {
      const state = this.gameStateService.getState();

      if (item.equipped) {
        return state;
      }

      const previousEquippedItemId = state.car.equipItem(item);
      this.carPartInventoryRepository.setEquipped(item.id, true);

      if (previousEquippedItemId && previousEquippedItemId !== item.id) {
        this.carPartInventoryRepository.setEquipped(previousEquippedItemId, false);
      }

      this.gameStateService.update((current) => current);
      this.achievementChecker.check();
      return state;
    } catch (error) {
      throw error;
    }
  }
}
