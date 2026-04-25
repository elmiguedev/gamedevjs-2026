export const SPRITESHEET_KEYS = {
  parts: 'parts',
  achievements: 'achievements',
  races: 'races',
  icons: 'icons',
} as const;

export type SpriteSheetKey = typeof SPRITESHEET_KEYS[keyof typeof SPRITESHEET_KEYS];

export const SPRITESHEET_FRAME_SIZE = {
  parts: { frameWidth: 256, frameHeight: 256 },
  achievements: { frameWidth: 256, frameHeight: 256 },
  races: { frameWidth: 256, frameHeight: 256 },
  icons: { frameWidth: 128, frameHeight: 128 },
} as const;

export const SPRITESHEET_URLS = {
  parts: new URL('../../../assets/img/spritesheet/parts/parts.png', import.meta.url).href,
  achievements: new URL('../../../assets/img/spritesheet/achievements/achievements.png', import.meta.url).href,
  races: new URL('../../../assets/img/spritesheet/races/races.png', import.meta.url).href,
  icons: new URL('../../../assets/img/spritesheet/icons/icons.png', import.meta.url).href,
} as const;

export const CAR_DRAFT_URL = new URL('../../../assets/img/sprites/car-draft.png', import.meta.url).href;
export const SCRAPYARD_URL = new URL('../../../assets/img/sprites/scrapyard.png', import.meta.url).href;
export const WORKSHOP_URL = new URL('../../../assets/img/sprites/workshop.png', import.meta.url).href;
export const ACHIEVEMENTS_SCENE_URL = new URL('../../../assets/img/sprites/achievements.png', import.meta.url).href;

export const PARTS_ICON_INDEX = {
  chasisBase: 0,
  chasisNexo: 1,
  chasisPrisma: 2,
  rueda: 10,
  ruedaHalo: 11,
  ruedaUmbra: 12,
  direccion: 20,
  direccionSynapse: 21,
  direccionOracle: 22,
  motorGenerico: 30,
  motorV8: 31,
  motorFlux: 32,
  motorIonico: 33,
  nitro: 40,
  nitroFulgor: 41,
  aleronBase: 50,
} as const;

export const PART_ICON_BY_PART_ID = {
  'chasis-base': 'chasisBase',
  'chasis-nexo': 'chasisNexo',
  'chasis-prisma': 'chasisPrisma',
  'rueda-base': 'rueda',
  'rueda-halo': 'ruedaHalo',
  'rueda-umbra': 'ruedaUmbra',
  'direccion-base': 'direccion',
  'direccion-synapse': 'direccionSynapse',
  'direccion-oracle': 'direccionOracle',
  'motor-generico': 'motorGenerico',
  'motor-v8': 'motorV8',
  'motor-flux': 'motorFlux',
  'motor-ionico': 'motorIonico',
  'nitro-base': 'nitro',
  'nitro-fulgor': 'nitroFulgor',
  'aleron-base': 'aleronBase',
} as const;

export const ACHIEVEMENTS_ICON_INDEX = {
  rustSprint: 0,
  streetRelay: 1,
  neonLeague: 2,
  urbanQualifier: 3,
  neonCrown: 4,
  basicWheels: 5,
  fullStarterSet: 6,
  scrapHoarder: 7,
  projectComplete: 8,
  firstCheckeredFlag: 9,
} as const;

export const RACES_ICON_INDEX = {
  neonLoop: 0,
  midnightGrid: 1,
  chromaticRun: 2,
} as const;

export const UI_ICON_INDEX = {
  garageCar: 0,
  scrapYardCrafting: 1,
  inventory: 2,
  back: 3,
  close: 4,
  confirm: 5,
  cancel: 6,
  paginationLeft: 7,
  paginationRight: 8,
  cash: 10,
  scrap: 11,
  fuel: 12,
  tank: 13,
  star: 14,
  mechanicLevel: 15,
  xp: 16,
  craftingStatus: 17,
  chassis: 20,
  wheel: 21,
  engine: 22,
  steering: 23,
  nitro: 24,
  spoiler: 25,
  carStatus: 26,
  damage: 27,
  repair: 28,
  collectScrap: 30,
  craft: 31,
  craftingInProgress: 32,
  readyToClaim: 33,
  idle: 34,
  equip: 35,
  equipped: 36,
  replaceSwap: 37,
  emptySlot: 38,
  raceFlag: 40,
  raceRunning: 41,
  cooldown: 42,
  needFullCar: 43,
  needRepair: 44,
  needFuel: 45,
  needCash: 46,
  success: 50,
  warning: 51,
  error: 52,
  locked: 53,
  unlocked: 54,
  disabled: 55,
} as const;

export type PartsIconName = keyof typeof PARTS_ICON_INDEX;
export type AchievementIconName = keyof typeof ACHIEVEMENTS_ICON_INDEX;
export type RaceIconName = keyof typeof RACES_ICON_INDEX;
export type UiIconName = keyof typeof UI_ICON_INDEX;

export type IconNamesBySheet = {
  parts: PartsIconName;
  achievements: AchievementIconName;
  races: RaceIconName;
  icons: UiIconName;
};

export type IconSheet = keyof IconNamesBySheet;

export type IconName<S extends IconSheet> = IconNamesBySheet[S];

export type AnyIconName = IconNamesBySheet[IconSheet];

export type PartId = keyof typeof PART_ICON_BY_PART_ID;

export const SLOT_ICON_BY_TYPE = {
  chasis: 'chassis',
  rueda: 'wheel',
  nitro: 'nitro',
  motor: 'engine',
  direccion: 'steering',
  aleron: 'spoiler',
} as const satisfies Record<string, UiIconName>;
