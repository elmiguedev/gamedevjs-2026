import type { Action } from '../domain/Action';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';

export class RepairCarSlotAction implements Action<{ slotId: string }, GameState> {
  constructor(private readonly gameStateService: GameStateService) {}

  async execute(input: { slotId: string }): Promise<GameState> {
    return this.gameStateService.update((current) => {
      const slot = current.car.getSlotById(input.slotId);

      if (!slot || !slot.part) {
        throw new Error('Slot not found');
      }

      if (slot.condition >= 100 || slot.isRepairing()) {
        return current;
      }

      const missing = 100 - slot.condition;
      const scrapCost = Math.max(1, Math.ceil(missing / 20));
      const cooldownSeconds = Math.max(2, Math.ceil(missing / 25));

      if (current.scrap < scrapCost) {
        throw new Error('Not enough scrap');
      }

      current.scrap -= scrapCost;
      slot.startRepair(Date.now(), cooldownSeconds);

      return current;
    });
  }
}
