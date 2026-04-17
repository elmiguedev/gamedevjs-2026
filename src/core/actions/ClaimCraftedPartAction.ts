import type { Action } from '../domain/Action';
import type { CarPart } from '../domain/CarPart';
import type { CarPartInventoryRepository } from '../domain/CarPartInventoryRepository';
import type { CarCraftingRepository } from '../domain/CarCraftingRepository';

export class ClaimCraftedPartAction implements Action<void, CarPart | null> {
  constructor(
    private readonly carPartInventoryRepository: CarPartInventoryRepository,
    private readonly carCraftingRepository: CarCraftingRepository,
  ) {}

  async execute(): Promise<CarPart | null> {
    const part = this.carCraftingRepository.claimReady();

    if (!part) {
      return null;
    }

    this.carPartInventoryRepository.add(part);
    return part;
  }
}
