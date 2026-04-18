import type { Car } from './Car';

export interface GameState {
  scrap: number;
  cash: number;
  fuel: number;
  racePoints: number;
  car: Car;
}
