import type { GameState } from '@/core/domain/GameState';
import type { GameStateService } from '@/core/domain/GameStateService';

export class LocalGameService implements GameStateService {
  private state: GameState;
  private readonly listeners = new Set<(state: GameState) => void>();

  constructor(initialState: GameState) {
    this.state = initialState;
  }

  getState(): GameState {
    return this.state;
  }

  setState(nextState: GameState): void {
    this.state = nextState;
    this.notify();
  }

  update(updater: (state: GameState) => GameState): GameState {
    this.state = updater(this.state);
    this.notify();
    return this.state;
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }
}
