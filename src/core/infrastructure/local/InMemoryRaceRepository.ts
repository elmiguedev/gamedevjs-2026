import type { Race } from '@/core/domain/Race';
import type { RaceRepository, RaceRunResult } from '@/core/domain/RaceRepository';

type CompletedRaceResult = { race: Race; position: number; reward: number; points: number };

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
    targetStats: { acceleration: 3, speed: 2, resistance: 8, direction: 4 },
    requiresCompleteCar: false,
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
    targetStats: { acceleration: 5, speed: 3, resistance: 10, direction: 6 },
    requiresCompleteCar: false,
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
    targetStats: { acceleration: 7, speed: 4, resistance: 12, direction: 7 },
    requiresCompleteCar: false,
    fuelMin: 10,
    fuelMax: 14,
    damageMin: 2,
    damageMax: 5,
  },
  {
    id: 'street-d',
    name: 'Rustline Sprint',
    category: 'street',
    durationSeconds: 36,
    cooldownSeconds: 110,
    rewards: { first: 230, second: 150, third: 90 },
    points: { first: 24, second: 16, third: 9 },
    entryFee: 25,
    targetStats: { acceleration: 8, speed: 5, resistance: 13, direction: 8 },
    requiresCompleteCar: true,
    fuelMin: 12,
    fuelMax: 16,
    damageMin: 3,
    damageMax: 6,
  },
  {
    id: 'street-e',
    name: 'Overpass Clash',
    category: 'street',
    durationSeconds: 42,
    cooldownSeconds: 130,
    rewards: { first: 300, second: 200, third: 120 },
    points: { first: 32, second: 21, third: 12 },
    entryFee: 50,
    targetStats: { acceleration: 9, speed: 6, resistance: 15, direction: 9 },
    requiresCompleteCar: true,
    fuelMin: 14,
    fuelMax: 19,
    damageMin: 4,
    damageMax: 7,
  },
  {
    id: 'street-f',
    name: 'Iron District GP',
    category: 'street',
    durationSeconds: 50,
    cooldownSeconds: 150,
    rewards: { first: 390, second: 260, third: 150 },
    points: { first: 42, second: 28, third: 16 },
    entryFee: 90,
    targetStats: { acceleration: 11, speed: 7, resistance: 17, direction: 10 },
    requiresCompleteCar: true,
    fuelMin: 16,
    fuelMax: 22,
    damageMin: 5,
    damageMax: 8,
  },
  {
    id: 'street-g',
    name: 'Prism Invitational',
    category: 'street',
    durationSeconds: 58,
    cooldownSeconds: 180,
    rewards: { first: 520, second: 340, third: 210 },
    points: { first: 56, second: 37, third: 22 },
    entryFee: 150,
    targetStats: { acceleration: 12, speed: 8, resistance: 19, direction: 11 },
    requiresCompleteCar: true,
    fuelMin: 20,
    fuelMax: 26,
    damageMin: 6,
    damageMax: 10,
  },
  {
    id: 'street-h',
    name: 'Flux Night Finals',
    category: 'street',
    durationSeconds: 66,
    cooldownSeconds: 210,
    rewards: { first: 680, second: 440, third: 270 },
    points: { first: 74, second: 49, third: 29 },
    entryFee: 240,
    targetStats: { acceleration: 14, speed: 9, resistance: 21, direction: 13 },
    requiresCompleteCar: true,
    fuelMin: 24,
    fuelMax: 30,
    damageMin: 7,
    damageMax: 11,
  },
  {
    id: 'street-i',
    name: 'Neon Crown Trial',
    category: 'street',
    durationSeconds: 75,
    cooldownSeconds: 240,
    rewards: { first: 900, second: 580, third: 360 },
    points: { first: 100, second: 66, third: 40 },
    entryFee: 360,
    targetStats: { acceleration: 15, speed: 9, resistance: 23, direction: 14 },
    requiresCompleteCar: true,
    fuelMin: 28,
    fuelMax: 36,
    damageMin: 8,
    damageMax: 12,
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

  startRace(raceId: string, performanceRatio: number, now: number = Date.now()): RaceRunResult {
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
      performanceRatio,
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

    const position = this.resolvePosition(this.activeRun.performanceRatio ?? 1);
    const reward = position <= 3 ? race.rewards[position === 1 ? 'first' : position === 2 ? 'second' : 'third'] : 0;
    const points = position <= 3 ? race.points[position === 1 ? 'first' : position === 2 ? 'second' : 'third'] : 0;

    this.completed = { race, position, reward, points };
    this.cooldownEndsAt.set(race.id, now + race.cooldownSeconds * 1000);
    this.activeRun = null;
    this.onChange?.();
  }

  claimRace(): { race: Race; position: number; reward: number; points: number } | null {
    if (!this.completed) {
      return null;
    }

    const completed = this.completed;
    this.completed = null;
    this.onChange?.();
    return completed;
  }

  private resolvePosition(performanceRatio: number): number {
    const podiumChance = this.clamp(0.25 + performanceRatio * 0.55, 0.2, 0.95);
    const firstChance = this.clamp((performanceRatio - 0.55) * 0.45, 0.03, 0.55);
    const secondChance = Math.max(0, (podiumChance - firstChance) * 0.45);
    const roll = Math.random();

    if (roll < firstChance) {
      return 1;
    }

    if (roll < firstChance + secondChance) {
      return 2;
    }

    if (roll < podiumChance) {
      return 3;
    }

    return 4;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
