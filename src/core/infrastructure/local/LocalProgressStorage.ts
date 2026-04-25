import type { Achievement } from '@/core/domain/Achievement';
import type { CarPartType } from '@/core/domain/CarPart';
import type { GameState } from '@/core/domain/GameState';
import type { MechanicProgress } from '@/core/domain/MechanicProgress';
import type { RaceRunResult } from '@/core/domain/RaceRepository';

const STORAGE_KEY = 'wasteland-workshop-progress';
const STORAGE_VERSION = 1;
const SIGNATURE_SECRET = 'gamedevjs-2026-local-progress';

export interface PersistedCarSlot {
  id: string;
  type: CarPartType;
  partId: string | null;
  equippedItemId: string | null;
  condition: number;
  repairingUntil: number | null;
}

export interface PersistedCar {
  fuel: number;
  maxFuel: number;
  slots: PersistedCarSlot[];
}

export type PersistedGameState = Omit<GameState, 'car'> & {
  car: PersistedCar;
};

export interface PersistedInventoryItem {
  id: string;
  partId: string;
  equipped: boolean;
}

export interface PersistedCraftableRef {
  kind: 'part' | 'tool';
  id: string;
}

export interface PersistedCraftingJob {
  part: PersistedCraftableRef;
  startedAt: number;
  craftTimeSeconds: number;
}

export interface PersistedRaceCompletion {
  raceId: string;
  position: 1 | 2 | 3;
  reward: number;
  points: number;
}

export interface PersistedProgressSnapshot {
  state: PersistedGameState;
  inventory: {
    items: PersistedInventoryItem[];
    nextId: number;
  };
  crafting: {
    active: PersistedCraftingJob | null;
    ready: PersistedCraftableRef | null;
  };
  achievements: Achievement[];
  mechanicProgress: MechanicProgress;
  races: {
    activeRun: RaceRunResult | null;
    completed: PersistedRaceCompletion | null;
    cooldownEndsAt: [string, number][];
  };
}

interface StoredProgressEnvelope {
  version: number;
  payload: string;
  checksum: string;
}

export class LocalProgressStorage {
  load(): PersistedProgressSnapshot | null {
    const storage = this.getStorage();

    if (!storage) {
      return null;
    }

    const raw = storage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const envelope = JSON.parse(raw) as StoredProgressEnvelope;

      if (envelope.version !== STORAGE_VERSION || envelope.checksum !== this.hash(envelope.payload)) {
        return null;
      }

      return JSON.parse(this.decode(envelope.payload)) as PersistedProgressSnapshot;
    } catch {
      return null;
    }
  }

  save(snapshot: PersistedProgressSnapshot): void {
    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    const payload = this.encode(JSON.stringify(snapshot));
    const envelope: StoredProgressEnvelope = {
      version: STORAGE_VERSION,
      payload,
      checksum: this.hash(payload),
    };

    storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  }

  private getStorage(): Storage | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage;
  }

  private encode(value: string): string {
    const bytes = new TextEncoder().encode(value);
    let binary = '';

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary);
  }

  private decode(value: string): string {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new TextDecoder().decode(bytes);
  }

  private hash(value: string): string {
    let hash = 2166136261;
    const signedValue = `${SIGNATURE_SECRET}:${value}`;

    for (let index = 0; index < signedValue.length; index += 1) {
      hash ^= signedValue.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(16);
  }
}
