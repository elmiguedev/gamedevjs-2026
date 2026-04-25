import { Scene } from 'phaser';
import { ACHIEVEMENTS_SCENE_URL, CAR_DRAFT_URL, SCRAPYARD_URL, SPRITESHEET_FRAME_SIZE, SPRITESHEET_KEYS, SPRITESHEET_URLS, WORKSHOP_URL } from '@/game/assets/spritesheets';
import { SoundManager } from '@/game/audio/SoundManager';

export class BootloaderScene extends Scene {
  // constructor
  // ----------------

  constructor() {
    super('BootloaderScene');
  }

  // core loop methods
  // ----------------

  preload(): void {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.add.text(360, 640, 'Loading...', {
      color: '#111111',
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.load.spritesheet(SPRITESHEET_KEYS.parts, SPRITESHEET_URLS.parts, SPRITESHEET_FRAME_SIZE.parts);
    this.load.spritesheet(SPRITESHEET_KEYS.achievements, SPRITESHEET_URLS.achievements, SPRITESHEET_FRAME_SIZE.achievements);
    this.load.spritesheet(SPRITESHEET_KEYS.races, SPRITESHEET_URLS.races, SPRITESHEET_FRAME_SIZE.races);
    this.load.spritesheet(SPRITESHEET_KEYS.icons, SPRITESHEET_URLS.icons, SPRITESHEET_FRAME_SIZE.icons);
    this.load.image('car-draft', CAR_DRAFT_URL);
    this.load.image('scrapyard', SCRAPYARD_URL);
    this.load.image('workshop', WORKSHOP_URL);
    this.load.image('achievements-scene', ACHIEVEMENTS_SCENE_URL);
  }

  create(): void {
    SoundManager.startBackgroundMusic();
    this.scene.start('CarScene');
  }
}
