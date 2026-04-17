import type { CarState } from './Car';

export interface GameState {
  scrap: number;
  cash: number;
  car: CarState;
}
