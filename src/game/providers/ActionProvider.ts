import { CollectScrapAction } from '@/core/actions/CollectScrapAction';
import { ClaimCraftedPartAction } from '@/core/actions/ClaimCraftedPartAction';
import { CraftCarPartAction } from '@/core/actions/CraftCarPartAction';
import { EquipCarPartAction } from '@/core/actions/EquipCarPartAction';
import { GetStateAction } from '@/core/actions/GetStateAction';
import { RepairCarSlotAction } from '@/core/actions/RepairCarSlotAction';
import { ResolveRaceAction, type RaceResolution } from '@/core/actions/ResolveRaceAction';
import { RefuelCarAction } from '@/core/actions/RefuelCarAction';
import { StartRaceAction } from '@/core/actions/StartRaceAction';
import { Car } from '@/core/domain/Car';
import type { AchievementChecker } from '@/core/domain/AchievementChecker';
import type { AchievementRepository } from '@/core/domain/AchievementRepository';
import type { CarPart } from '@/core/domain/CarPart';
import type { CarPartRepository } from '@/core/domain/CarPartRepository';
import type { CarPartInventoryRepository } from '@/core/domain/CarPartInventoryRepository';
import type { CarCraftingRepository, CraftingStatus } from '@/core/domain/CarCraftingRepository';
import type { RaceRepository } from '@/core/domain/RaceRepository';
import type { MechanicProgressRepository } from '@/core/domain/MechanicProgressRepository';
import type { GameState } from '@/core/domain/GameState';
import { InMemoryCarPartInventoryRepository } from '@/core/infrastructure/local/InMemoryCarPartInventoryRepository';
import { InMemoryCarPartRepository } from '@/core/infrastructure/local/InMemoryCarPartRepository';
import { InMemoryCarCraftingRepository } from '@/core/infrastructure/local/InMemoryCarCraftingRepository';
import { InMemoryAchievementRepository } from '@/core/infrastructure/local/InMemoryAchievementRepository';
import { InMemoryMechanicProgressRepository } from '@/core/infrastructure/local/InMemoryMechanicProgressRepository';
import { InMemoryRaceRepository } from '@/core/infrastructure/local/InMemoryRaceRepository';
import { LocalAchievementChecker } from '@/core/infrastructure/local/LocalAchievementChecker';
import { LocalGameService } from '@/core/infrastructure/local/LocalGameService';

export class ActionProvider {
  private static readonly instance = new ActionProvider();

  private readonly gameStateService: LocalGameService;
  private readonly carPartRepository: CarPartRepository;
  private readonly carPartInventoryRepository: CarPartInventoryRepository;
  private readonly carCraftingRepository: CarCraftingRepository;
  private readonly achievementRepository: AchievementRepository;
  private readonly achievementChecker: AchievementChecker;
  private readonly raceRepository: RaceRepository;
  private readonly mechanicProgressRepository: MechanicProgressRepository;
  private readonly collectScrapAction: CollectScrapAction;
  private readonly craftCarPartAction: CraftCarPartAction;
  private readonly claimCraftedPartAction: ClaimCraftedPartAction;
  private readonly equipCarPartAction: EquipCarPartAction;
  private readonly repairCarSlotAction: RepairCarSlotAction;
  private readonly refuelCarAction: RefuelCarAction;
  private readonly startRaceAction: StartRaceAction;
  private readonly resolveRaceAction: ResolveRaceAction;
  private readonly getStateAction: GetStateAction;

  private constructor() {
    this.carPartRepository = new InMemoryCarPartRepository();
    this.carPartInventoryRepository = new InMemoryCarPartInventoryRepository();
    this.carCraftingRepository = new InMemoryCarCraftingRepository();
    this.achievementRepository = new InMemoryAchievementRepository();
    this.mechanicProgressRepository = new InMemoryMechanicProgressRepository();
    this.raceRepository = new InMemoryRaceRepository();
    const chassisPart = this.carPartRepository.findByType('chasis')[0];

    if (!chassisPart) {
      throw new Error('Missing base chassis part');
    }

    this.gameStateService = new LocalGameService({
      scrap: 0,
      scrapCollected: 0,
      scrapCollectAvailableAt: 0,
      cash: 0,
      fuel: 100,
      racePoints: 0,
      partsCrafted: 0,
      craftedWheelParts: 0,
      racesCompleted: 0,
      raceWins: 0,
      car: Car.createInitial(chassisPart),
    });
    this.achievementChecker = new LocalAchievementChecker(this.gameStateService, this.achievementRepository);

    const initialChassisItem = this.carPartInventoryRepository.add(chassisPart);
    this.carPartInventoryRepository.setEquipped(initialChassisItem.id, true);
    this.gameStateService.getState().car.slots.chassis.equippedItemId = initialChassisItem.id;

    const baseWheel = this.carPartRepository.findById('rueda-base');
    const baseMotor = this.carPartRepository.findById('motor-generico');
    const baseDirection = this.carPartRepository.findById('direccion-base');
    const baseNitro = this.carPartRepository.findById('nitro-base');
    const baseSpoiler = this.carPartRepository.findById('aleron-base');

    if (!baseWheel || !baseMotor || !baseDirection || !baseNitro || !baseSpoiler) {
      throw new Error('Missing base race parts');
    }

    const wheelItem = this.carPartInventoryRepository.add(baseWheel);
    const motorItem = this.carPartInventoryRepository.add(baseMotor);
    const directionItem = this.carPartInventoryRepository.add(baseDirection);
    const nitroItem = this.carPartInventoryRepository.add(baseNitro);
    const spoilerItem = this.carPartInventoryRepository.add(baseSpoiler);

    this.carPartInventoryRepository.setEquipped(wheelItem.id, true);
    this.gameStateService.getState().car.equipItem(wheelItem);
    this.carPartInventoryRepository.setEquipped(motorItem.id, true);
    this.gameStateService.getState().car.equipItem(motorItem);
    this.carPartInventoryRepository.setEquipped(directionItem.id, true);
    this.gameStateService.getState().car.equipItem(directionItem);
    this.carPartInventoryRepository.setEquipped(nitroItem.id, true);
    this.gameStateService.getState().car.equipItem(nitroItem);
    this.carPartInventoryRepository.setEquipped(spoilerItem.id, true);
    this.gameStateService.getState().car.equipItem(spoilerItem);

    const wheelPart = this.carPartRepository.findById('rueda-base');
    const chassisPartForInventory = this.carPartRepository.findById('chasis-base');

    if (!wheelPart) {
      throw new Error('Missing base wheel part');
    }

    if (!chassisPartForInventory) {
      throw new Error('Missing base chassis part for inventory');
    }

    for (let index = 0; index < 10; index += 1) {
      this.carPartInventoryRepository.add(wheelPart);
      if (index < 9) {
        this.carPartInventoryRepository.add(chassisPartForInventory);
      }
    }

    this.achievementChecker.check();

    this.collectScrapAction = new CollectScrapAction(this.gameStateService, this.achievementChecker);
    this.craftCarPartAction = new CraftCarPartAction(
      this.gameStateService,
      this.carPartRepository,
      this.mechanicProgressRepository,
      this.carPartInventoryRepository,
      this.carCraftingRepository,
      this.achievementChecker,
    );
    this.claimCraftedPartAction = new ClaimCraftedPartAction(this.gameStateService, this.carPartInventoryRepository, this.carCraftingRepository, this.achievementChecker);
    this.equipCarPartAction = new EquipCarPartAction(this.gameStateService, this.carPartInventoryRepository, this.achievementChecker);
    this.repairCarSlotAction = new RepairCarSlotAction(this.gameStateService, this.achievementChecker);
    this.refuelCarAction = new RefuelCarAction(this.gameStateService, this.achievementChecker);
    this.startRaceAction = new StartRaceAction(this.gameStateService, this.raceRepository, this.achievementChecker);
    this.resolveRaceAction = new ResolveRaceAction(this.gameStateService, this.raceRepository, this.achievementChecker);
    this.getStateAction = new GetStateAction(this.gameStateService, this.achievementChecker);
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

  static getAchievementRepository(): AchievementRepository {
    return ActionProvider.instance.achievementRepository;
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

  static repairCarSlot(slotId: string): Promise<GameState> {
    return ActionProvider.instance.repairCarSlotAction.execute({ slotId });
  }

  static refuelCar(amount?: number): Promise<GameState> {
    return ActionProvider.instance.refuelCarAction.execute({ amount });
  }

  static getRaceRepository(): RaceRepository {
    return ActionProvider.instance.raceRepository;
  }

  static startRace(raceId: string) {
    return ActionProvider.instance.startRaceAction.execute({ raceId });
  }

  static resolveRace(): Promise<RaceResolution | null> {
    return ActionProvider.instance.resolveRaceAction.execute();
  }
}
