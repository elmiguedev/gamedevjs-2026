import type { Action } from '../domain/Action';
import type { GameState } from '../domain/GameState';
import type { GameStateService } from '../domain/GameStateService';

export class GetStateAction implements Action<void, GameState> {
  constructor(private readonly gameStateService: GameStateService) {}

  async execute(): Promise<GameState> {
    const state = this.gameStateService.getState();
    const changed = state.car.tickRepairs();

    if (changed) {
      this.gameStateService.update((current) => current);
    }

    return state;
  }
}
