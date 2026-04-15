import type { GameState } from '@/core/domain/GameState';

export class PlayerEntity {
  constructor(public readonly state: GameState) {}
}
