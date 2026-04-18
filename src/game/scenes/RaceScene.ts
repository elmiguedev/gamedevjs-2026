import { Scene } from 'phaser';
import { MenuEntity } from '@/game/entities/MenuEntity';
import { RaceListEntity } from '@/game/entities/RaceListEntity';
import { RaceStatusEntity } from '@/game/entities/RaceStatusEntity';
import { ResourceHud } from '@/game/huds/ResourceHud';
import { ActionProvider } from '@/game/providers/ActionProvider';
import type { GameState } from '@/core/domain/GameState';
import type { Race } from '@/core/domain/Race';

type RaceUiState =
  | { kind: 'idle' }
  | { kind: 'running'; race: Race; remainingSeconds: number }
  | { kind: 'result'; position: 1 | 2 | 3; reward: number; points: number };

export class RaceScene extends Scene {
  private resourceHud!: ResourceHud;
  private raceList?: RaceListEntity;
  private raceStatus?: RaceStatusEntity;
  private statusText?: Phaser.GameObjects.Text;
  private unsubscribeState?: () => void;
  private refreshTimer?: Phaser.Time.TimerEvent;
  private latestState?: GameState;
  private racesRendered = false;
  private uiState: RaceUiState = { kind: 'idle' };

  constructor() {
    super('RaceScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.latestState = undefined;
    this.racesRendered = false;
    this.uiState = { kind: 'idle' };

    this.resourceHud = new ResourceHud(this);

    this.add.text(360, 86, 'Races', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(360, 124, 'Street races are automatic and have cooldowns.', {
      color: '#444444',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
    }).setOrigin(0.5);

    this.raceList = new RaceListEntity(this, 40, 180, (raceId) => {
      void this.enterRace(raceId);
    });

    this.raceStatus = new RaceStatusEntity(this, 40, 180, () => {
      this.uiState = { kind: 'idle' };
      this.resultText?.setText('');
      this.raceList?.setVisible(true);
      this.refreshRaces();
    });
    this.raceStatus.hide();

    this.statusText = this.add.text(40, 568, '', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
    });

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
      this.statusText?.destroy();
    });

    void this.refreshRaces();
  }

  private async enterRace(raceId: string): Promise<void> {
    try {
      await ActionProvider.startRace(raceId);
      this.setStatus('Race started');
      this.refreshRaces();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Race failed';
      this.setStatus(message);
    }
  }

  private async tickRaces(): Promise<void> {
    if (this.uiState.kind !== 'running') {
      return;
    }

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
      this.statusText?.setText('Race complete');
      return;
    }

    if (activeRun) {
      const activeRace = races.find((race) => race.id === activeRun.raceId);
      const remaining = Math.max(0, Math.ceil((activeRun.endsAt - Date.now()) / 1000));

      this.uiState = { kind: 'running', race: activeRace ?? races[0], remainingSeconds: remaining };
      this.raceList.setVisible(false);
      this.raceStatus.showProgress(activeRace?.name ?? activeRun.raceId, remaining);
      this.statusText?.setText(`Active race: ${activeRace?.name ?? activeRun.raceId}`);
      return;
    }

    this.uiState = { kind: 'idle' };
    this.raceList.setVisible(true);
    this.raceStatus.hide();

    const resolver = (race: Race) => {
      const cooldown = repo.getRaceCooldownRemaining(race.id);

      if (cooldown > 0) {
        return { label: `Cooldown ${cooldown}s`, disabled: true };
      }

      if (!state.car.hasCompleteCar()) {
        return { label: 'Need full car', disabled: true };
      }

      if (!state.car.canRace()) {
        return { label: 'Need repair', disabled: true };
      }

      if (!state.car.hasFuel(race.fuelMin)) {
        return { label: 'Need fuel', disabled: true };
      }

      if (race.entryFee > state.cash) {
        return { label: 'Need cash', disabled: true };
      }

      return { label: 'Enter', disabled: false };
    };

    if (!this.racesRendered) {
      this.raceList.setData(races, resolver);
      this.racesRendered = true;
    } else {
      this.raceList.updateStatuses(resolver);
    }

    this.statusText?.setText('No race active');
  }

  private setStatus(message: string): void {
    this.statusText?.setText(message);
  }
}
