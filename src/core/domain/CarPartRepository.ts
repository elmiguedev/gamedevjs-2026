import type { CarPart, CarPartType } from './CarPart';

export interface CarPartRepository {
  findAll(): CarPart[];
  findByType(type: CarPartType): CarPart[];
  findById(id: string): CarPart | undefined;
}
