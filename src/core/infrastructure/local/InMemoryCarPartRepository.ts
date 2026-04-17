import { CarPart, type CarPartType } from '@/core/domain/CarPart';
import type { CarPartRepository } from '@/core/domain/CarPartRepository';

const PARTS = [
  new CarPart('chasis-base', 'chasis', 'Chasis Base', { resistance: 8 }, 80, 0, 'Inicio'),
  new CarPart('chasis-nexo', 'chasis', 'Chasis Nexo', { resistance: 12 }, 160, 70, 'Tener Chasis y 1 carrera ganada'),
  new CarPart('chasis-prisma', 'chasis', 'Chasis Prisma', { resistance: 16 }, 300, 150, 'Tener Chasis Nexo y prestigio 1'),
  new CarPart('rueda-base', 'rueda', 'Rueda', { direction: 2, resistance: 3 }, 40, 0, 'Inicio'),
  new CarPart('rueda-halo', 'rueda', 'Rueda Halo', { direction: 4, resistance: 5 }, 80, 35, 'Carrera urbana desbloqueada'),
  new CarPart('rueda-umbra', 'rueda', 'Rueda Umbra', { direction: 6, resistance: 7 }, 150, 75, 'Prestigio 1'),
  new CarPart('direccion-base', 'direccion', 'Direccion', { direction: 3 }, 120, 0, 'Inicio'),
  new CarPart('direccion-synapse', 'direccion', 'Direccion Synapse', { direction: 5, acceleration: 1 }, 240, 90, 'Taller nivel 2'),
  new CarPart('direccion-oracle', 'direccion', 'Direccion Oracle', { direction: 7, acceleration: 2 }, 420, 180, 'Taller nivel 3 o plano'),
  new CarPart('motor-generico', 'motor', 'Motor Generico', { acceleration: 3, speed: 2 }, 280, 0, 'Inicio'),
  new CarPart('motor-v8', 'motor', 'Motor V8', { acceleration: 5, speed: 5 }, 560, 180, 'Carrera callejera desbloqueada'),
  new CarPart('motor-flux', 'motor', 'Motor Flux', { acceleration: 8, speed: 8 }, 1100, 420, 'Prestigio 2'),
  new CarPart('motor-ionico', 'motor', 'Motor Ionico', { acceleration: 6, speed: 6 }, 850, 320, 'Energia/plan especial'),
  new CarPart('nitro-base', 'nitro', 'Nitro', { acceleration: 3 }, 220, 0, 'Carrera urbana desbloqueada'),
  new CarPart('nitro-fulgor', 'nitro', 'Nitro Fulgor', { acceleration: 5 }, 420, 140, 'Prestigio 1'),
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
