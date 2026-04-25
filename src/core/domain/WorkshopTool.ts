export type WorkshopToolEffect =
  | { type: 'scrapMultiplier'; multiplier: number }
  | { type: 'collectCooldown'; seconds: number }
  | { type: 'passiveScrap'; amount: number; intervalSeconds: number }
  | { type: 'passiveFuel'; amount: number; intervalSeconds: number };

export class WorkshopTool {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly scrapCost: number,
    public readonly cashCost: number,
    public readonly requiredLevel: number,
    public readonly xpReward: number,
    public readonly craftTimeSeconds: number,
    public readonly effect: WorkshopToolEffect,
  ) {}
}
