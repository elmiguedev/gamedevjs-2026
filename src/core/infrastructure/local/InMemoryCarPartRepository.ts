import { CarPart, type CarPartType } from '@/core/domain/CarPart';
import type { CarPartRepository } from '@/core/domain/CarPartRepository';

const PARTS = [
  new CarPart('chasis-base', 'chasis', 'Base Chassis', { resistance: 8 }, 80, 0, 1, 8, 12, 'Start'),
  new CarPart('chasis-nexo', 'chasis', 'Nexus Chassis', { resistance: 12 }, 160, 70, 2, 16, 20, 'Own a chassis and win 1 race'),
  new CarPart('chasis-prisma', 'chasis', 'Prism Chassis', { resistance: 16 }, 300, 150, 3, 30, 32, 'Own Nexus Chassis and prestige 1'),
  new CarPart('rueda-base', 'rueda', 'Wheels', { direction: 2, resistance: 3 }, 40, 0, 1, 8, 10, 'Start'),
  new CarPart('rueda-halo', 'rueda', 'Halo Wheels', { direction: 4, resistance: 5 }, 80, 35, 2, 16, 16, 'Urban race unlocked'),
  new CarPart('rueda-umbra', 'rueda', 'Umbra Wheels', { direction: 6, resistance: 7 }, 150, 75, 3, 30, 24, 'Prestige 1'),
  new CarPart('direccion-base', 'direccion', 'Steering', { direction: 3 }, 120, 0, 1, 8, 10, 'Start'),
  new CarPart('direccion-synapse', 'direccion', 'Synapse Steering', { direction: 5, acceleration: 1 }, 240, 90, 2, 16, 16, 'Workshop level 2'),
  new CarPart('direccion-oracle', 'direccion', 'Oracle Steering', { direction: 7, acceleration: 2 }, 420, 180, 3, 30, 24, 'Workshop level 3 or blueprint'),
  new CarPart('motor-generico', 'motor', 'Generic Engine', { acceleration: 3, speed: 2 }, 280, 0, 1, 8, 14, 'Start'),
  new CarPart('motor-v8', 'motor', 'V8 Engine', { acceleration: 5, speed: 5 }, 560, 180, 2, 16, 20, 'Street race unlocked'),
  new CarPart('motor-flux', 'motor', 'Flux Engine', { acceleration: 8, speed: 8 }, 1100, 420, 3, 30, 30, 'Prestige 2'),
  new CarPart('motor-ionico', 'motor', 'Ionic Engine', { acceleration: 6, speed: 6 }, 850, 320, 3, 30, 28, 'Energy/special blueprint'),
  new CarPart('nitro-base', 'nitro', 'Nitro', { acceleration: 3 }, 220, 0, 1, 8, 12, 'Urban race unlocked'),
  new CarPart('nitro-fulgor', 'nitro', 'Fulgor Nitro', { acceleration: 5 }, 420, 140, 2, 16, 18, 'Prestige 1'),
  new CarPart('aleron-base', 'aleron', 'Base Spoiler', { speed: 1, direction: 1 }, 90, 0, 1, 8, 10, 'Start'),
] as const;

export class InMemoryCarPartRepository implements CarPartRepository {
  private readonly parts = [...PARTS];

  findAll(): CarPart[] {
    return [...this.parts];
  }

  findByType(type: CarPartType): CarPart[] {
    return this.parts.filter((part) => part.type === type);
  }

  findById(id: string): CarPart | undefined {
    return this.parts.find((part) => part.id === id);
  }
}
