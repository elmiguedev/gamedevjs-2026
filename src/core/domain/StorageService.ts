export interface StorageService {
  load<T>(key: string): T | null;
  save<T>(key: string, value: T): void;
}
