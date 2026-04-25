import type { Car } from './Car';

export interface GameState {
  scrap: number;
  scrapCollected: number;
  scrapCollectAvailableAt: number;
  cash: number;
  fuel: number;
  craftedToolIds: string[];
  robotScrapCollectedAt: number;
  racePoints: number;
  partsCrafted: number;
  craftedWheelParts: number;
  racesCompleted: number;
  raceWins: number;
  car: Car;
}
