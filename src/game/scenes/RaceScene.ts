import { Scene } from 'phaser';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { RaceListEntity } from '@/game/entities/RaceListEntity';
import { RaceStatusEntity } from '@/game/entities/RaceStatusEntity';
import { TitleEntity } from '@/game/entities/TitleEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import { ToastEntity } from '@/game/entities/ToastEntity';
import type { GameState } from '@/core/domain/GameState';
import type { Race } from '@/core/domain/Race';
import type { UiIconName } from '@/game/assets/spritesheets';

type RaceUiState =
  | { kind: 'idle' }
  | { kind: 'running'; race: Race; remainingSeconds: number }
  | { kind: 'result'; position: number; reward: number; points: number };

export class RaceScene extends Scene {
  // entities
  // ------------

  private resourceHud!: ResourceHud;
  private raceList?: RaceListEntity;
  private raceStatus?: RaceStatusEntity;
  private toast?: ToastEntity;
  private unsubscribeState?: () => void;
  private refreshTimer?: Phaser.Time.TimerEvent;
  private latestState?: GameState;
  private racesRendered = false;
  private uiState: RaceUiState = { kind: 'idle' };

  // constructor
  // ----------------

  constructor() {
    super('RaceScene');
  }

  // core loop methods
  // ----------------

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.latestState = undefined;
    this.racesRendered = false;
    this.uiState = { kind: 'idle' };

    this.resourceHud = new ResourceHud(this);
    this.toast = new ToastEntity(this, this.scale.width / 2, 70);
    this.createTitle();

    this.raceList = new RaceListEntity(this, 40, 168, (raceId) => {
      void this.enterRace(raceId);
    });

    this.raceStatus = new RaceStatusEntity(this, 40, 168, () => {
      this.uiState = { kind: 'idle' };
      this.raceList?.setVisible(true);
      this.refreshRaces();
    });
    this.raceStatus.hide();

    this.unsubscribeState = ActionProvider.subscribeState((state) => {
      this.latestState = state;
      this.refreshRaces();
    });

    void ActionProvider.getState().then((state) => {
      this.latestState = state;
      this.refreshRaces();
    });

    this.refreshTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        void this.tickRaces();
      },
    });

    new MenuEntity(this);

    this.events.once('shutdown', () => {
      this.unsubscribeState?.();
      this.refreshTimer?.remove(false);
      this.raceList?.destroy();
      this.raceStatus?.destroy();
      this.toast?.destroy();
    });

    void this.tickRaces();
  }

  // behavior methods
  // ------------------

  private createTitle(): void {
    new TitleEntity(this, 40, 88, 'RACES', 'COMPETE FOR CASH AND POINTS');
  }

  private async enterRace(raceId: string): Promise<void> {
    try {
      await ActionProvider.startRace(raceId);
      this.refreshRaces();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Race failed';
      this.toast?.showMessage('Race unavailable', message);
    }
  }

  private async tickRaces(): Promise<void> {
    const resolution = await ActionProvider.resolveRace();

    if (resolution) {
      this.latestState = resolution.state;
      this.uiState = {
        kind: 'result',
        position: resolution.result.position,
        reward: resolution.result.reward,
        points: resolution.result.points,
      };
    }

    this.refreshRaces();
  }

  private refreshRaces(): void {
    const state = this.latestState;

    if (!state || !this.raceList || !this.raceStatus) {
      return;
    }

    const repo = ActionProvider.getRaceRepository();
    const races = repo.findAll();
    const activeRun = repo.getActiveRun();

    if (this.uiState.kind === 'result') {
      this.raceList.setVisible(false);
      this.raceStatus.showResult(this.uiState.position, this.uiState.reward, this.uiState.points);
      return;
    }

    if (activeRun) {
      const activeRace = races.find((race) => race.id === activeRun.raceId);
      const remaining = Math.max(0, Math.ceil((activeRun.endsAt - Date.now()) / 1000));
      const total = Math.max(1, Math.ceil((activeRun.endsAt - activeRun.startedAt) / 1000));

      this.uiState = { kind: 'running', race: activeRace ?? races[0], remainingSeconds: remaining };
      this.raceList.setVisible(false);
      this.raceStatus.showProgress(activeRace?.name ?? activeRun.raceId, remaining, total);
      return;
    }

    this.uiState = { kind: 'idle' };
    this.raceList.setVisible(true);
    this.raceStatus.hide();

    const resolver = (race: Race) => {
      const cooldown = repo.getRaceCooldownRemaining(race.id);

      if (cooldown > 0) {
        return { label: `Cooldown ${cooldown}s`, disabled: true, icon: 'cooldown' satisfies UiIconName };
      }

      if (!state.car.hasRequiredRaceParts()) {
        return { label: 'Need core parts', disabled: true, icon: 'needFullCar' satisfies UiIconName };
      }

      if (race.requiresCompleteCar && !state.car.hasCompleteCar()) {
        return { label: 'Need full car', disabled: true, icon: 'needFullCar' satisfies UiIconName };
      }

      if (!state.car.canRace()) {
        return { label: 'Need repair', disabled: true, icon: 'needRepair' satisfies UiIconName };
      }

      if (!state.car.hasFuel(race.fuelMin)) {
        return { label: 'Need fuel', disabled: true, icon: 'needFuel' satisfies UiIconName };
      }

      if (race.entryFee > state.cash) {
        return { label: 'Need cash', disabled: true, icon: 'needCash' satisfies UiIconName };
      }

      return { label: 'Enter', disabled: false, icon: 'raceFlag' satisfies UiIconName };
    };

    if (!this.racesRendered) {
      this.raceList.setData(races, resolver);
      this.racesRendered = true;
    } else {
      this.raceList.updateStatuses(resolver);
    }
  }
}
