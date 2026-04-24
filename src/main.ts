import { AUTO, Game, Scale } from "phaser";
import { BootloaderScene } from "./game/scenes/BootloaderScene";
import { ScrapScene } from "./game/scenes/ScrapScene";
import { CarScene } from "./game/scenes/CarScene";
import { InventoryScene } from "./game/scenes/InventoryScene";
import { RaceScene } from "./game/scenes/RaceScene";
import { AchievementsScene } from "./game/scenes/AchievementsScene";

export default new Game({
  type: AUTO,
  backgroundColor: '#ffffff',
  transparent: false,
  clearBeforeRender: true,
  width: 480,
  height: 700,
  scale: {
    autoCenter: AUTO,
  },
  scene: [
    BootloaderScene,
    ScrapScene,
    CarScene,
    InventoryScene,
    RaceScene,
    AchievementsScene
  ],
});
