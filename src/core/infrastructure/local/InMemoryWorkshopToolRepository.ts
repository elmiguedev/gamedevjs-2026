import { WorkshopTool } from '@/core/domain/WorkshopTool';
import type { WorkshopToolRepository } from '@/core/domain/WorkshopToolRepository';

const TOOLS = [
  new WorkshopTool('brazo-mecanico', 'Brazo Mecanico', 'Duplica el scrap obtenido al recolectar.', 120, 0, 1, 12, 15, { type: 'scrapMultiplier', multiplier: 2 }),
  new WorkshopTool('iman-poderoso', 'Iman Poderoso', 'Reduce el cooldown de recoleccion a 1s.', 220, 50, 2, 18, 20, { type: 'collectCooldown', seconds: 1 }),
  new WorkshopTool('robot-recolector', 'Robot Recolector', 'Recolecta 1 scrap automaticamente cada 3s.', 450, 150, 3, 28, 30, { type: 'passiveScrap', amount: 1, intervalSeconds: 3 }),
] as const;

export class InMemoryWorkshopToolRepository implements WorkshopToolRepository {
  private readonly tools = [...TOOLS];

  findAll(): WorkshopTool[] {
    return [...this.tools];
  }

  findById(id: string): WorkshopTool | undefined {
    return this.tools.find((tool) => tool.id === id);
  }
}
