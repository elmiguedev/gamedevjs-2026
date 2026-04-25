import { CollectScrapAction } from '@/core/actions/CollectScrapAction';
import { BuyFuelAction } from '@/core/actions/BuyFuelAction';
import { ClaimCraftedPartAction } from '@/core/actions/ClaimCraftedPartAction';
import { CraftCarPartAction } from '@/core/actions/CraftCarPartAction';
import { EquipCarPartAction } from '@/core/actions/EquipCarPartAction';
import { GetStateAction } from '@/core/actions/GetStateAction';
import { RepairCarSlotAction } from '@/core/actions/RepairCarSlotAction';
import { ResolveRaceAction, type RaceResolution } from '@/core/actions/ResolveRaceAction';
import { RefuelCarAction } from '@/core/actions/RefuelCarAction';
import { StartRaceAction } from '@/core/actions/StartRaceAction';
import { Car } from '@/core/domain/Car';
import { CarSlot } from '@/core/domain/CarSlot';
import type { AchievementChecker } from '@/core/domain/AchievementChecker';
import type { AchievementRepository } from '@/core/domain/AchievementRepository';
import type { CarPart } from '@/core/domain/CarPart';
import type { CarPartRepository } from '@/core/domain/CarPartRepository';
import type { CarPartInventoryRepository } from '@/core/domain/CarPartInventoryRepository';
import { isWorkshopTool, type CraftableItem } from '@/core/domain/CarCrafting';
import type { CarCraftingRepository, CraftingStatus } from '@/core/domain/CarCraftingRepository';
import type { RaceCompletion, RaceRepository } from '@/core/domain/RaceRepository';
import type { MechanicProgressRepository } from '@/core/domain/MechanicProgressRepository';
import type { WorkshopToolRepository } from '@/core/domain/WorkshopToolRepository';
import type { GameState } from '@/core/domain/GameState';
import { InMemoryCarPartInventoryRepository } from '@/core/infrastructure/local/InMemoryCarPartInventoryRepository';
import { InMemoryCarPartRepository } from '@/core/infrastructure/local/InMemoryCarPartRepository';
import { InMemoryCarCraftingRepository } from '@/core/infrastructure/local/InMemoryCarCraftingRepository';
import { InMemoryAchievementRepository } from '@/core/infrastructure/local/InMemoryAchievementRepository';
import { InMemoryMechanicProgressRepository } from '@/core/infrastructure/local/InMemoryMechanicProgressRepository';
import { InMemoryRaceRepository } from '@/core/infrastructure/local/InMemoryRaceRepository';
import { InMemoryWorkshopToolRepository } from '@/core/infrastructure/local/InMemoryWorkshopToolRepository';
import { LocalAchievementChecker } from '@/core/infrastructure/local/LocalAchievementChecker';
import { LocalGameService } from '@/core/infrastructure/local/LocalGameService';
import {
  LocalProgressStorage,
  type PersistedCar,
  type PersistedCraftableRef,
  type PersistedProgressSnapshot,
} from '@/core/infrastructure/local/LocalProgressStorage';

export class ActionProvider {
  private static readonly instance = new ActionProvider();

  private readonly gameStateService: LocalGameService;
  private readonly carPartRepository: InMemoryCarPartRepository;
  private readonly carPartInventoryRepository: InMemoryCarPartInventoryRepository;
  private readonly carCraftingRepository: InMemoryCarCraftingRepository;
  private readonly workshopToolRepository: InMemoryWorkshopToolRepository;
  private readonly achievementRepository: InMemoryAchievementRepository;
  private readonly achievementChecker: AchievementChecker;
  private readonly raceRepository: InMemoryRaceRepository;
  private readonly mechanicProgressRepository: InMemoryMechanicProgressRepository;
  private readonly progressStorage: LocalProgressStorage;
  private readonly collectScrapAction: CollectScrapAction;
  private readonly buyFuelAction: BuyFuelAction;
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
    this.workshopToolRepository = new InMemoryWorkshopToolRepository();
    this.achievementRepository = new InMemoryAchievementRepository();
    this.mechanicProgressRepository = new InMemoryMechanicProgressRepository();
    this.progressStorage = new LocalProgressStorage();
    this.raceRepository = new InMemoryRaceRepository(() => this.saveProgress());
    const chassisPart = this.carPartRepository.findByType('chasis')[0];
    const wheelsPart = this.carPartRepository.findByType('rueda')[0];

    if (!chassisPart) {
      throw new Error('Missing base chassis part');
    }

    if (!wheelsPart) {
      throw new Error('Missing base wheels part');
    }

    this.gameStateService = new LocalGameService({
      scrap: 0,
      scrapCollected: 0,
      scrapCollectAvailableAt: 0,
      cash: 0,
      fuel: 100,
      craftedToolIds: [],
      robotScrapCollectedAt: 0,
      oilWellFuelCollectedAt: 0,
      racePoints: 0,
      partsCrafted: 0,
      craftedWheelParts: 0,
      racesCompleted: 0,
      raceWins: 0,
      car: Car.createInitial(chassisPart, wheelsPart),
    });
    this.achievementChecker = new LocalAchievementChecker(this.gameStateService, this.achievementRepository);

    const initialChassisItem = this.carPartInventoryRepository.add(chassisPart);
    this.carPartInventoryRepository.setEquipped(initialChassisItem.id, true);
    this.gameStateService.getState().car.slots.chassis.equippedItemId = initialChassisItem.id;
    const initialWheelsItem = this.carPartInventoryRepository.add(wheelsPart);
    this.carPartInventoryRepository.setEquipped(initialWheelsItem.id, true);
    this.gameStateService.getState().car.slots.wheels.equippedItemId = initialWheelsItem.id;

    this.restoreProgress();

    this.achievementChecker.check();

    this.collectScrapAction = new CollectScrapAction(this.gameStateService, this.achievementChecker);
    this.buyFuelAction = new BuyFuelAction(this.gameStateService);
    this.craftCarPartAction = new CraftCarPartAction(
      this.gameStateService,
      this.carPartRepository,
      this.workshopToolRepository,
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
    return ActionProvider.instance.executeAndPersist(() => ActionProvider.instance.collectScrapAction.execute());
  }

  static buyFuel(): Promise<GameState> {
    return ActionProvider.instance.executeAndPersist(() => ActionProvider.instance.buyFuelAction.execute());
  }

  static getState(): Promise<GameState> {
    return ActionProvider.instance.executeAndPersist(() => ActionProvider.instance.getStateAction.execute());
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

  static getWorkshopToolRepository(): WorkshopToolRepository {
    return ActionProvider.instance.workshopToolRepository;
  }

  static getCraftingStatus(): CraftingStatus {
    const status = ActionProvider.instance.carCraftingRepository.getStatus();
    ActionProvider.instance.saveProgress();
    return status;
  }

  static getAchievementRepository(): AchievementRepository {
    return ActionProvider.instance.achievementRepository;
  }

  static craftCarPart(partId: string): Promise<CraftingStatus> {
    return ActionProvider.instance.executeAndPersist(() => ActionProvider.instance.craftCarPartAction.execute({ partId }));
  }

  static claimCraftedPart(): Promise<CarPart | null> {
    return ActionProvider.instance.executeAndPersist(() => ActionProvider.instance.claimCraftedPartAction.execute());
  }

  static equipCarPart(itemId: string): Promise<GameState> {
    return ActionProvider.instance.executeAndPersist(() => ActionProvider.instance.equipCarPartAction.execute({ itemId }));
  }

  static repairCarSlot(slotId: string): Promise<GameState> {
    return ActionProvider.instance.executeAndPersist(() => ActionProvider.instance.repairCarSlotAction.execute({ slotId }));
  }

  static refuelCar(amount?: number): Promise<GameState> {
    return ActionProvider.instance.executeAndPersist(() => ActionProvider.instance.refuelCarAction.execute({ amount }));
  }

  static getRaceRepository(): RaceRepository {
    return ActionProvider.instance.raceRepository;
  }

  static startRace(raceId: string) {
    return ActionProvider.instance.executeAndPersist(() => ActionProvider.instance.startRaceAction.execute({ raceId }));
  }

  static resolveRace(): Promise<RaceResolution | null> {
    return ActionProvider.instance.executeAndPersist(() => ActionProvider.instance.resolveRaceAction.execute());
  }

  private async executeAndPersist<T>(execute: () => Promise<T>): Promise<T> {
    const result = await execute();
    this.saveProgress();
    return result;
  }

  private saveProgress(): void {
    this.progressStorage.save(this.createProgressSnapshot());
  }

  private restoreProgress(): void {
    const snapshot = this.progressStorage.load();

    if (!snapshot) {
      return;
    }

    try {
      this.applyProgressSnapshot(snapshot);
    } catch {
      // Ignore invalid saves so a bad localStorage edit never blocks the game boot.
    }
  }

  private createProgressSnapshot(): PersistedProgressSnapshot {
    const state = this.gameStateService.getState();
    const inventory = this.carPartInventoryRepository.snapshot();
    const crafting = this.carCraftingRepository.snapshot();
    const races = this.raceRepository.snapshot();

    return {
      state: {
        ...state,
        car: this.persistCar(state.car),
      },
      inventory: {
        items: inventory.items.map((item) => ({
          id: item.id,
          partId: item.part.id,
          equipped: item.equipped,
        })),
        nextId: inventory.nextId,
      },
      crafting: {
        active: crafting.active ? {
          ...crafting.active,
          part: this.persistCraftable(crafting.active.part),
        } : null,
        ready: crafting.ready ? this.persistCraftable(crafting.ready) : null,
      },
      achievements: this.achievementRepository.findAll(),
      mechanicProgress: this.mechanicProgressRepository.get(),
      races: {
        activeRun: races.activeRun,
        completed: races.completed ? {
          raceId: races.completed.race.id,
          position: races.completed.position,
          reward: races.completed.reward,
          points: races.completed.points,
        } : null,
        cooldownEndsAt: races.cooldownEndsAt,
      },
    };
  }

  private applyProgressSnapshot(snapshot: PersistedProgressSnapshot): void {
    this.carPartInventoryRepository.hydrate({
      items: snapshot.inventory.items.map((item) => {
        const part = this.carPartRepository.findById(item.partId);

        if (!part) {
          throw new Error(`Saved inventory part not found: ${item.partId}`);
        }

        return {
          id: item.id,
          part,
          equipped: item.equipped,
        };
      }),
      nextId: snapshot.inventory.nextId,
    });
    this.gameStateService.setState({
      ...snapshot.state,
      car: this.restoreCar(snapshot.state.car),
    });
    this.carCraftingRepository.hydrate({
      active: snapshot.crafting.active ? {
        ...snapshot.crafting.active,
        part: this.restoreCraftable(snapshot.crafting.active.part),
      } : null,
      ready: snapshot.crafting.ready ? this.restoreCraftable(snapshot.crafting.ready) : null,
    });
    this.achievementRepository.hydrate(snapshot.achievements);
    this.mechanicProgressRepository.set(snapshot.mechanicProgress);
    this.raceRepository.hydrate({
      activeRun: snapshot.races.activeRun,
      completed: snapshot.races.completed ? this.restoreRaceCompletion(snapshot.races.completed) : null,
      cooldownEndsAt: snapshot.races.cooldownEndsAt,
    });
  }

  private persistCar(car: Car): PersistedCar {
    return {
      fuel: car.fuel,
      maxFuel: car.maxFuel,
      slots: car.listSlots().map((slot) => ({
        id: slot.id,
        type: slot.type,
        partId: slot.part?.id ?? null,
        equippedItemId: slot.equippedItemId,
        condition: slot.condition,
        repairingUntil: slot.repairingUntil,
      })),
    };
  }

  private restoreCar(car: PersistedCar): Car {
    const slots = car.slots.map((slot) => new CarSlot(
      slot.id,
      slot.type,
      slot.partId ? this.carPartRepository.findById(slot.partId) ?? null : null,
      slot.equippedItemId,
      slot.condition,
      slot.repairingUntil,
    ));
    const [chassis, wheels, engine, steering, nitro, spoiler] = slots;

    if (!chassis || !wheels || !engine || !steering || !nitro || !spoiler) {
      throw new Error('Invalid saved car slots');
    }

    return new Car({ chassis, wheels, engine, steering, nitro, spoiler }, car.fuel, car.maxFuel);
  }

  private persistCraftable(item: CraftableItem): PersistedCraftableRef {
    return {
      kind: isWorkshopTool(item) ? 'tool' : 'part',
      id: item.id,
    };
  }

  private restoreCraftable(ref: PersistedCraftableRef): CraftableItem {
    const item = ref.kind === 'tool'
      ? this.workshopToolRepository.findById(ref.id)
      : this.carPartRepository.findById(ref.id);

    if (!item) {
      throw new Error(`Saved craftable not found: ${ref.id}`);
    }

    return item;
  }

  private restoreRaceCompletion(completed: PersistedProgressSnapshot['races']['completed']): RaceCompletion {
    if (!completed) {
      throw new Error('Missing saved race completion');
    }

    const race = this.raceRepository.findById(completed.raceId);

    if (!race) {
      throw new Error(`Saved race not found: ${completed.raceId}`);
    }

    return {
      race,
      position: completed.position,
      reward: completed.reward,
      points: completed.points,
    };
  }
}
