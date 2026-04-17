import type { GameState } from './GameState';

export interface GameStateService {
  getState(): GameState;
  setState(nextState: GameState): void;
  update(updater: (state: GameState) => GameState): GameState;
  subscribe(listener: (state: GameState) => void): () => void;
}
