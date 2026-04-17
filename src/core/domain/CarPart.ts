import type { CarAttributes } from './Car';

export type CarPartType = 'chasis' | 'rueda' | 'nitro' | 'motor' | 'direccion' | 'aleron';

export class CarPart {
  constructor(
    public readonly id: string,
    public readonly type: CarPartType,
    public readonly name: string,
    public readonly stats: Partial<CarAttributes>,
    public readonly scrapCost: number,
    public readonly cashCost: number,
    public readonly requiredLevel: number,
    public readonly xpReward: number,
    public readonly craftTimeSeconds: number,
    public readonly unlock: string,
  ) {}
}
