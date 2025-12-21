// Racing Game Constants

const getModelPath = (filename: string) => `/models/racing/${filename}`;

export const ASSET_URLS = {
  MODELS: {
    OTTER: getModelPath('otter-rusty.glb'),
    ROCK_RIVER: getModelPath('rock-river.glb'),
    ROCK_MOSSY: getModelPath('rock-mossy.glb'),
    ROCK_CRACKED: getModelPath('rock-cracked.glb'),
    ROCK_CRYSTAL: getModelPath('rock-crystal.glb'),
    COIN: getModelPath('coin-gold.glb'),
    GEM_RED: getModelPath('gem-red.glb'),
  },
  ANIMATIONS: {
    OTTER_IDLE: getModelPath('otter-rusty.glb'),
    OTTER_WALK: getModelPath('otter-rusty-walk.glb'),
    OTTER_RUN: getModelPath('otter-rusty-run.glb'),
    OTTER_JUMP: getModelPath('otter-rusty-jump.glb'),
    OTTER_COLLECT: getModelPath('otter-rusty-collect.glb'),
    OTTER_HIT: getModelPath('otter-rusty-hit.glb'),
    OTTER_DEATH: getModelPath('otter-rusty-death.glb'),
    OTTER_VICTORY: getModelPath('otter-rusty-victory.glb'),
    OTTER_HAPPY: getModelPath('otter-rusty-happy.glb'),
    OTTER_DODGE_LEFT: getModelPath('otter-rusty-dodge-left.glb'),
    OTTER_DODGE_RIGHT: getModelPath('otter-rusty-dodge-right.glb'),
  },
} as const;

export const RACING_CONFIG = {
  LANES: [-2, 0, 2], // Left, Center, Right x-positions
  LANE_WIDTH: 2,
  BASE_SCROLL_SPEED: 8,
  SPAWN_Z: -30, // Spawn far ahead
  DESPAWN_Z: 10, // Despawn behind camera
  PLAYER_Z: 0,
  PLAYER_Y: 0,
  SPAWN_INTERVAL: 1.5, // Seconds between spawning obstacles/collectibles
};

export const VISUAL = {
  scales: {
    otter: 1.5,
    rock: 1.2,
    coin: 0.8,
  },
  colors: {
    coin: '#ffd700',
  }
} as const;
