import type { Car } from './Car';

export interface GameState {
  scrap: number;
  scrapCollected: number;
  cash: number;
  fuel: number;
  racePoints: number;
  partsCrafted: number;
  craftedWheelParts: number;
  racesCompleted: number;
  raceWins: number;
  car: Car;
}
