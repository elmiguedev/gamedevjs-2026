import type { Race } from './Race';

export interface RaceCompletion {
  race: Race;
  position: number;
  reward: number;
  points: number;
}

export interface RaceRunResult {
  raceId: string;
  startedAt: number;
  endsAt: number;
  performanceRatio: number;
}

export interface RaceRepository {
  findAll(): Race[];
  findById(id: string): Race | undefined;
  getActiveRun(now?: number): RaceRunResult | null;
  getRaceCooldownRemaining(raceId: string, now?: number): number;
  canEnterRace(raceId: string, now?: number): boolean;
  startRace(raceId: string, performanceRatio: number, now?: number): RaceRunResult;
  resolveActiveRace(now?: number): void;
  claimRace(): RaceCompletion | null;
}
