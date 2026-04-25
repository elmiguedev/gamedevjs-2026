import type { CarPart } from '@/core/domain/CarPart';
import type { CarPartInventoryItem } from '@/core/domain/CarPartInventory';
import type { CarPartInventoryRepository } from '@/core/domain/CarPartInventoryRepository';

export class InMemoryCarPartInventoryRepository implements CarPartInventoryRepository {
  private items: CarPartInventoryItem[] = [];
  private nextId = 1;
  private readonly listeners = new Set<(items: CarPartInventoryItem[]) => void>();

  snapshot(): { items: CarPartInventoryItem[]; nextId: number } {
    return {
      items: this.findAll(),
      nextId: this.nextId,
    };
  }

  hydrate(snapshot: { items: CarPartInventoryItem[]; nextId: number }): void {
    this.items = snapshot.items;
    this.nextId = snapshot.nextId;
    this.notify();
  }

  findAll(): CarPartInventoryItem[] {
    return [...this.items];
  }

  add(part: CarPart): CarPartInventoryItem {
    const item: CarPartInventoryItem = {
      id: `part-${this.nextId++}`,
      part,
      equipped: false,
    };

    this.items.push(item);
    this.notify();
    return item;
  }

  remove(id: string): CarPartInventoryItem | undefined {
    const index = this.items.findIndex((item) => item.id === id);

    if (index < 0) {
      return undefined;
    }

    const [removed] = this.items.splice(index, 1);
    this.notify();
    return removed;
  }

  findById(id: string): CarPartInventoryItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  replace(item: CarPartInventoryItem): void {
    const index = this.items.findIndex((current) => current.id === item.id);

    if (index < 0) {
      this.items.push(item);
      this.notify();
      return;
    }

    this.items[index] = item;
    this.notify();
  }

  setEquipped(id: string, equipped: boolean): void {
    const item = this.findById(id);

    if (!item) {
      return;
    }

    item.equipped = equipped;
    this.notify();
  }

  subscribe(listener: (items: CarPartInventoryItem[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.findAll());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snapshot = this.findAll();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
