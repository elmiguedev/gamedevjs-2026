import type { StorageService } from '../domain/StorageService';

export class LocalStorageService implements StorageService {
  load<T>(key: string): T | null {
    const raw = globalThis.localStorage.getItem(key);
    if (!raw) return null;

    return JSON.parse(raw) as T;
  }

  save<T>(key: string, value: T): void {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
  }
}
