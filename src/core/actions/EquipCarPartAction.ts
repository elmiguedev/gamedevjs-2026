import type { Action } from '../domain/Action';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';
import type { CarPartInventoryRepository } from '../domain/CarPartInventoryRepository';

export class EquipCarPartAction implements Action<{ itemId: string }, GameState> {
  constructor(
    private readonly gameStateService: GameStateService,
    private readonly carPartInventoryRepository: CarPartInventoryRepository,
  ) {}

  async execute(input: { itemId: string }): Promise<GameState> {
    const item = this.carPartInventoryRepository.remove(input.itemId);

    if (!item) {
      throw new Error('Inventory item not found');
    }

    try {
      const state = this.gameStateService.getState();
      const previousPart = state.car.equipPart(item.part);

      if (previousPart) {
        this.carPartInventoryRepository.add(previousPart);
      }

      this.gameStateService.update((current) => current);
      return state;
    } catch (error) {
      this.carPartInventoryRepository.replace(item);
      throw error;
    }
  }
}
