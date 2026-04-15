import { AUTO, Game, Scale } from 'phaser';
import { CarScene } from '@/game/scenes/CarScene';
import { RaceScene } from '@/game/scenes/RaceScene';
import { ScrapScene } from '@/game/scenes/ScrapScene';
import { StoreScene } from '@/game/scenes/StoreScene';

export const createGame = (parent: string): Game => {
  return new Game({
    type: AUTO,
    parent,
    backgroundColor: '#ffffff',
    transparent: false,
    clearBeforeRender: true,
    canvasStyle: 'background-color:#ffffff;display:block;',
    width: 720,
    height: 1280,
    scale: {
      mode: Scale.FIT,
      autoCenter: Scale.CENTER_BOTH,
    },
    scene: [ScrapScene, CarScene, StoreScene, RaceScene],
  });
};
