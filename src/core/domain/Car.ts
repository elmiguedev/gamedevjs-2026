export type CarPartType = 'chassis' | 'wheel' | 'nitro' | 'motor' | 'direction' | 'spoiler';

export interface CarAttributes {
  acceleration: number;
  speed: number;
  resistance: number;
  direction: number;
}

export interface CarPartState {
  type: CarPartType;
  name: string;
  bonus: string;
}

export interface PartSlotState {
  type: CarPartType;
  part?: CarPartState;
}

export interface CarState {
  attributes: CarAttributes;
  slots: {
    chassis: PartSlotState;
    wheels: {
      frontLeft: PartSlotState;
      frontRight: PartSlotState;
      rearLeft: PartSlotState;
      rearRight: PartSlotState;
    };
    engine: PartSlotState;
    steering: PartSlotState;
    nitro: PartSlotState;
    spoiler: PartSlotState;
  };
}

export const createInitialCarState = (): CarState => ({
  attributes: {
    acceleration: 3,
    speed: 2,
    resistance: 8,
    direction: 3,
  },
  slots: {
    chassis: {
      type: 'chassis',
      part: {
        type: 'chassis',
        name: 'Chasis Base',
        bonus: 'R +8',
      },
    },
    wheels: {
      frontLeft: {
        type: 'wheel',
      },
      frontRight: {
        type: 'wheel',
      },
      rearLeft: {
        type: 'wheel',
      },
      rearRight: {
        type: 'wheel',
      },
    },
    engine: {
      type: 'motor',
    },
    steering: {
      type: 'direction',
    },
    nitro: {
      type: 'nitro',
    },
    spoiler: {
      type: 'spoiler',
    },
  },
});
