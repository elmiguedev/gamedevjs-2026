import type { Race } from './Race';

export interface RaceCompletion {
  race: Race;
  position: 1 | 2 | 3;
  reward: number;
  points: number;
}

export interface RaceRunResult {
  raceId: string;
  startedAt: number;
  endsAt: number;
}

export interface RaceRepository {
  findAll(): Race[];
  findById(id: string): Race | undefined;
  getActiveRun(now?: number): RaceRunResult | null;
  getRaceCooldownRemaining(raceId: string, now?: number): number;
  canEnterRace(raceId: string, now?: number): boolean;
  startRace(raceId: string, now?: number): RaceRunResult;
  resolveActiveRace(now?: number): void;
  claimRace(): RaceCompletion | null;
}
