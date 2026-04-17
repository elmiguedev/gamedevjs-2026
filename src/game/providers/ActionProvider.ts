import { CollectScrapAction } from '@/core/actions/CollectScrapAction';
import { GetStateAction } from '@/core/actions/GetStateAction';
import { Car } from '@/core/domain/Car';
import type { CarPartRepository } from '@/core/domain/CarPartRepository';
import type { GameState } from '@/core/domain/GameState';
import { InMemoryCarPartRepository } from '@/core/infrastructure/local/InMemoryCarPartRepository';
import { LocalGameService } from '@/core/infrastructure/local/LocalGameService';

export class ActionProvider {
  private static readonly instance = new ActionProvider();

  private readonly gameStateService: LocalGameService;
  private readonly carPartRepository: CarPartRepository;
  private readonly collectScrapAction: CollectScrapAction;
  private readonly getStateAction: GetStateAction;

  private constructor() {
    this.carPartRepository = new InMemoryCarPartRepository();
    const chassisPart = this.carPartRepository.findByType('chasis')[0];

    if (!chassisPart) {
      throw new Error('Missing base chassis part');
    }

    this.gameStateService = new LocalGameService({ scrap: 0, cash: 0, car: Car.createInitial(chassisPart) });
    this.collectScrapAction = new CollectScrapAction(this.gameStateService);
    this.getStateAction = new GetStateAction(this.gameStateService);
  }

  static collectScrap(): Promise<GameState> {
    return ActionProvider.instance.collectScrapAction.execute();
  }

  static getState(): Promise<GameState> {
    return ActionProvider.instance.getStateAction.execute();
  }
}
