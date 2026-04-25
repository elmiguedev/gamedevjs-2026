import type { WorkshopTool } from './WorkshopTool';

export interface WorkshopToolRepository {
  findAll(): WorkshopTool[];
  findById(id: string): WorkshopTool | undefined;
}
