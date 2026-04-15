import type { GameState } from './GameState';

export interface IdleAction {
  execute(state: GameState): GameState;
}
