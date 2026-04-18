export type RaceCategory = 'street';

export interface RaceRewards {
  first: number;
  second: number;
  third: number;
}

export interface RaceDamageRange {
  fuelMin: number;
  fuelMax: number;
  damageMin: number;
  damageMax: number;
}

export interface Race extends RaceDamageRange {
  id: string;
  name: string;
  category: RaceCategory;
  durationSeconds: number;
  cooldownSeconds: number;
  rewards: RaceRewards;
  points: RaceRewards;
  entryFee: number;
}
