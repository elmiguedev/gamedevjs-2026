import type { Car } from './Car';

export interface GameState {
  scrap: number;
  cash: number;
  car: Car;
}
