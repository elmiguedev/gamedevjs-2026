import type { Race } from '@/core/domain/Race';
import type { RaceRepository, RaceRunResult } from '@/core/domain/RaceRepository';

type CompletedRaceResult = { race: Race; position: 1 | 2 | 3; reward: number; points: number };

const RACES: Race[] = [
  {
    id: 'street-a',
    name: 'Neon Loop',
    category: 'street',
    durationSeconds: 18,
    cooldownSeconds: 60,
    rewards: { first: 120, second: 80, third: 50 },
    points: { first: 12, second: 8, third: 5 },
    entryFee: 0,
    fuelMin: 6,
    fuelMax: 10,
    damageMin: 1,
    damageMax: 3,
  },
  {
    id: 'street-b',
    name: 'Midnight Grid',
    category: 'street',
    durationSeconds: 24,
    cooldownSeconds: 75,
    rewards: { first: 150, second: 100, third: 60 },
    points: { first: 15, second: 10, third: 6 },
    entryFee: 0,
    fuelMin: 8,
    fuelMax: 12,
    damageMin: 2,
    damageMax: 4,
  },
  {
    id: 'street-c',
    name: 'Chromatic Run',
    category: 'street',
    durationSeconds: 30,
    cooldownSeconds: 90,
    rewards: { first: 180, second: 120, third: 70 },
    points: { first: 18, second: 12, third: 7 },
    entryFee: 0,
    fuelMin: 10,
    fuelMax: 14,
    damageMin: 2,
    damageMax: 5,
  },
];

export class InMemoryRaceRepository implements RaceRepository {
  private readonly races = [...RACES];
  private activeRun: RaceRunResult | null = null;
  private completed: CompletedRaceResult | null = null;
  private cooldownEndsAt = new Map<string, number>();

  constructor(private readonly onChange?: () => void) {}

  snapshot(): { activeRun: RaceRunResult | null; completed: CompletedRaceResult | null; cooldownEndsAt: [string, number][] } {
    return {
      activeRun: this.activeRun,
      completed: this.completed,
      cooldownEndsAt: [...this.cooldownEndsAt.entries()],
    };
  }

  hydrate(snapshot: { activeRun: RaceRunResult | null; completed: CompletedRaceResult | null; cooldownEndsAt: [string, number][] }): void {
    this.activeRun = snapshot.activeRun;
    this.completed = snapshot.completed;
    this.cooldownEndsAt = new Map(snapshot.cooldownEndsAt);
  }

  findAll(): Race[] {
    return [...this.races];
  }

  findById(id: string): Race | undefined {
    return this.races.find((race) => race.id === id);
  }

  getActiveRun(now: number = Date.now()): RaceRunResult | null {
    this.resolveActiveRace(now);
    return this.activeRun;
  }

  getRaceCooldownRemaining(raceId: string, now: number = Date.now()): number {
    const endsAt = this.cooldownEndsAt.get(raceId) ?? 0;
    return Math.max(0, Math.ceil((endsAt - now) / 1000));
  }

  canEnterRace(raceId: string, now: number = Date.now()): boolean {
    return !this.activeRun && !this.completed && this.getRaceCooldownRemaining(raceId, now) <= 0;
  }

  startRace(raceId: string, now: number = Date.now()): RaceRunResult {
    const race = this.findById(raceId);

    if (!race) {
      throw new Error('Race not found');
    }

    if (this.activeRun) {
      throw new Error('A race is already in progress');
    }

    if (this.completed) {
      throw new Error('Claim race reward first');
    }

    if (!this.canEnterRace(raceId, now)) {
      throw new Error('Race is on cooldown');
    }

    this.activeRun = {
      raceId,
      startedAt: now,
      endsAt: now + race.durationSeconds * 1000,
    };

    this.onChange?.();
    return this.activeRun;
  }

  resolveActiveRace(now: number = Date.now()): void {
    if (!this.activeRun) {
      return;
    }

    if (now < this.activeRun.endsAt) {
      return;
    }

    const race = this.findById(this.activeRun.raceId);

    if (!race) {
      this.activeRun = null;
      return;
    }

    const roll = Math.random();
    const position: 1 | 2 | 3 = roll < 0.35 ? 1 : roll < 0.7 ? 2 : 3;
    const reward = race.rewards[position === 1 ? 'first' : position === 2 ? 'second' : 'third'];
    const points = race.points[position === 1 ? 'first' : position === 2 ? 'second' : 'third'];

    this.completed = { race, position, reward, points };
    this.cooldownEndsAt.set(race.id, now + race.cooldownSeconds * 1000);
    this.activeRun = null;
    this.onChange?.();
  }

  claimRace(): { race: Race; position: 1 | 2 | 3; reward: number; points: number } | null {
    if (!this.completed) {
      return null;
    }

    const completed = this.completed;
    this.completed = null;
    this.onChange?.();
    return completed;
  }
}
