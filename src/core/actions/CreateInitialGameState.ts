import type { GameState } from '../domain/GameState';

export const createInitialGameState = (): GameState => ({
  money: 0,
  scrap: 0,
  fuel: 0,
  prestige: 0,
  message: 'Proyecto iniciado: chasis viejo listo para trabajar.',
});
