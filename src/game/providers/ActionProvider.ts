import { CollectScrapAction } from '@/core/actions/CollectScrapAction';
import { ClaimCraftedPartAction } from '@/core/actions/ClaimCraftedPartAction';
import { CraftCarPartAction } from '@/core/actions/CraftCarPartAction';
import { EquipCarPartAction } from '@/core/actions/EquipCarPartAction';
import { GetStateAction } from '@/core/actions/GetStateAction';
import { Car } from '@/core/domain/Car';
import type { CarPart } from '@/core/domain/CarPart';
import type { CarPartRepository } from '@/core/domain/CarPartRepository';
import type { CarPartInventoryRepository } from '@/core/domain/CarPartInventoryRepository';
import type { CarCraftingRepository, CraftingStatus } from '@/core/domain/CarCraftingRepository';
import type { MechanicProgressRepository } from '@/core/domain/MechanicProgressRepository';
import type { GameState } from '@/core/domain/GameState';
import { InMemoryCarPartInventoryRepository } from '@/core/infrastructure/local/InMemoryCarPartInventoryRepository';
import { InMemoryCarPartRepository } from '@/core/infrastructure/local/InMemoryCarPartRepository';
import { InMemoryCarCraftingRepository } from '@/core/infrastructure/local/InMemoryCarCraftingRepository';
import { InMemoryMechanicProgressRepository } from '@/core/infrastructure/local/InMemoryMechanicProgressRepository';
import { LocalGameService } from '@/core/infrastructure/local/LocalGameService';

export class ActionProvider {
  private static readonly instance = new ActionProvider();

  private readonly gameStateService: LocalGameService;
  private readonly carPartRepository: CarPartRepository;
  private readonly carPartInventoryRepository: CarPartInventoryRepository;
  private readonly carCraftingRepository: CarCraftingRepository;
  private readonly mechanicProgressRepository: MechanicProgressRepository;
  private readonly collectScrapAction: CollectScrapAction;
  private readonly craftCarPartAction: CraftCarPartAction;
  private readonly claimCraftedPartAction: ClaimCraftedPartAction;
  private readonly equipCarPartAction: EquipCarPartAction;
  private readonly getStateAction: GetStateAction;

  private constructor() {
    this.carPartRepository = new InMemoryCarPartRepository();
    this.carPartInventoryRepository = new InMemoryCarPartInventoryRepository();
    this.carCraftingRepository = new InMemoryCarCraftingRepository();
    this.mechanicProgressRepository = new InMemoryMechanicProgressRepository();
    const chassisPart = this.carPartRepository.findByType('chasis')[0];

    if (!chassisPart) {
      throw new Error('Missing base chassis part');
    }

    this.gameStateService = new LocalGameService({ scrap: 0, cash: 0, car: Car.createInitial(chassisPart) });
    this.collectScrapAction = new CollectScrapAction(this.gameStateService);
    this.craftCarPartAction = new CraftCarPartAction(
      this.gameStateService,
      this.carPartRepository,
      this.mechanicProgressRepository,
      this.carPartInventoryRepository,
      this.carCraftingRepository,
    );
    this.claimCraftedPartAction = new ClaimCraftedPartAction(this.carPartInventoryRepository, this.carCraftingRepository);
    this.equipCarPartAction = new EquipCarPartAction(this.gameStateService, this.carPartInventoryRepository);
    this.getStateAction = new GetStateAction(this.gameStateService);
  }

  static collectScrap(): Promise<GameState> {
    return ActionProvider.instance.collectScrapAction.execute();
  }

  static getState(): Promise<GameState> {
    return ActionProvider.instance.getStateAction.execute();
  }

  static subscribeState(listener: (state: GameState) => void): () => void {
    return ActionProvider.instance.gameStateService.subscribe(listener);
  }

  static getCarPartRepository(): CarPartRepository {
    return ActionProvider.instance.carPartRepository;
  }

  static getCarPartInventoryRepository(): CarPartInventoryRepository {
    return ActionProvider.instance.carPartInventoryRepository;
  }

  static getMechanicProgressRepository(): MechanicProgressRepository {
    return ActionProvider.instance.mechanicProgressRepository;
  }

  static getCraftingStatus(): CraftingStatus {
    return ActionProvider.instance.carCraftingRepository.getStatus();
  }

  static craftCarPart(partId: string): Promise<CraftingStatus> {
    return ActionProvider.instance.craftCarPartAction.execute({ partId });
  }

  static claimCraftedPart(): Promise<CarPart | null> {
    return ActionProvider.instance.claimCraftedPartAction.execute();
  }

  static equipCarPart(itemId: string): Promise<GameState> {
    return ActionProvider.instance.equipCarPartAction.execute({ itemId });
  }
}
