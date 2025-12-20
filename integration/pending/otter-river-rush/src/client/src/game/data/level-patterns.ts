export const LEVEL_PATTERNS = [
  {
    id: 'gentle_wave',
    name: 'Gentle Wave',
    description: 'Soft alternating obstacles for beginners',
    difficulty: 2,
    duration: 8000, // 8 seconds
    obstacles: [
      { time: 0, lane: 1, type: 'rock' },
      { time: 1500, lane: 2, type: 'log' },
      { time: 3000, lane: 0, type: 'rock' },
      { time: 4500, lane: 2, type: 'branch' },
      { time: 6000, lane: 1, type: 'log' },
      { time: 7500, lane: 0, type: 'rock' },
    ],
    recommendedBiome: 'forest',
    enemySpawnRules: {
      enabled: false,
      frequency: 0,
      types: [],
    },
  },

  {
    id: 'rapid_zigzag',
    name: 'Rapid Zigzag',
    description: 'Sharp lane changes required at moderate speed',
    difficulty: 5,
    duration: 6000,
    obstacles: [
      { time: 0, lane: 0, type: 'rock' },
      { time: 800, lane: 1, type: 'rock' },
      { time: 1600, lane: 2, type: 'boulder' },
      { time: 2400, lane: 1, type: 'log' },
      { time: 3200, lane: 0, type: 'rock' },
      { time: 4000, lane: 1, type: 'branch' },
      { time: 4800, lane: 2, type: 'rock' },
    ],
    recommendedBiome: 'mountain',
    enemySpawnRules: {
      enabled: true,
      frequency: 3000,
      types: ['fish', 'bird'],
    },
  },

  {
    id: 'gauntlet_run',
    name: 'Boulder Gauntlet',
    description: 'Tight spacing challenges requiring precise timing',
    difficulty: 7,
    duration: 5000,
    obstacles: [
      { time: 0, lane: 1, type: 'boulder' },
      { time: 600, lane: 0, type: 'rock' },
      { time: 600, lane: 2, type: 'rock' },
      { time: 1200, lane: 2, type: 'boulder' },
      { time: 1800, lane: 1, type: 'rock' },
      { time: 2400, lane: 0, type: 'boulder' },
      { time: 3000, lane: 2, type: 'rock' },
      { time: 3000, lane: 1, type: 'branch' },
      { time: 3600, lane: 0, type: 'rock' },
      { time: 4200, lane: 1, type: 'boulder' },
    ],
    recommendedBiome: 'canyon',
    enemySpawnRules: {
      enabled: true,
      frequency: 2500,
      types: ['eagle', 'snake'],
    },
  },

  {
    id: 'peaceful_float',
    name: 'Peaceful Float',
    description: 'Recovery section with minimal obstacles',
    difficulty: 1,
    duration: 10000,
    obstacles: [
      { time: 2000, lane: 1, type: 'branch' },
      { time: 5000, lane: 0, type: 'log' },
      { time: 8000, lane: 2, type: 'branch' },
    ],
    recommendedBiome: 'meadow',
    enemySpawnRules: {
      enabled: true,
      frequency: 4000,
      types: ['butterfly', 'fish'],
    },
  },

  {
    id: 'left_wall_block',
    name: 'Left Bank Jam',
    description: 'Two left lanes blocked, forcing right lane navigation',
    difficulty: 4,
    duration: 4000,
    obstacles: [
      { time: 0, lane: 0, type: 'boulder' },
      { time: 0, lane: 1, type: 'boulder' },
      { time: 1000, lane: 0, type: 'rock' },
      { time: 1000, lane: 1, type: 'log' },
      { time: 2000, lane: 0, type: 'boulder' },
      { time: 2000, lane: 1, type: 'rock' },
      { time: 3000, lane: 0, type: 'log' },
      { time: 3000, lane: 1, type: 'boulder' },
    ],
    recommendedBiome: 'swamp',
    enemySpawnRules: {
      enabled: true,
      frequency: 2000,
      types: ['frog', 'mosquito'],
    },
  },

  {
    id: 'right_wall_block',
    name: 'Right Bank Jam',
    description: 'Two right lanes blocked, forcing left lane navigation',
    difficulty: 4,
    duration: 4000,
    obstacles: [
      { time: 0, lane: 1, type: 'boulder' },
      { time: 0, lane: 2, type: 'boulder' },
      { time: 1000, lane: 1, type: 'log' },
      { time: 1000, lane: 2, type: 'rock' },
      { time: 2000, lane: 1, type: 'rock' },
      { time: 2000, lane: 2, type: 'boulder' },
      { time: 3000, lane: 1, type: 'boulder' },
      { time: 3000, lane: 2, type: 'log' },
    ],
    recommendedBiome: 'forest',
    enemySpawnRules: {
      enabled: true,
      frequency: 1500,
      types: ['bear', 'wolf'],
    },
  },

  {
    id: 'clockwise_spiral',
    name: 'Whirlpool Spiral',
    description: 'Rotating obstacle pattern mimicking a whirlpool',
    difficulty: 6,
    duration: 7200,
    obstacles: [
      { time: 0, lane: 1, type: 'rock' },
      { time: 600, lane: 2, type: 'log' },
      { time: 1200, lane: 1, type: 'branch' },
      { time: 1800, lane: 0, type: 'rock' },
      { time: 2400, lane: 1, type: 'boulder' },
      { time: 3000, lane: 2, type: 'rock' },
      { time: 3600, lane: 1, type: 'log' },
      { time: 4200, lane: 0, type: 'branch' },
      { time: 4800, lane: 1, type: 'rock' },
      { time: 5400, lane: 2, type: 'boulder' },
      { time: 6000, lane: 1, type: 'rock' },
      { time: 6600, lane: 0, type: 'log' },
    ],
    recommendedBiome: 'rapids',
    enemySpawnRules: {
      enabled: true,
      frequency: 2400,
      types: ['fish', 'eel'],
    },
  },

  {
    id: 'chaos_clusters',
    name: 'Chaos Rapids',
    description: 'Random clustered obstacles with unpredictable patterns',
    difficulty: 8,
    duration: 6000,
    obstacles: [
      { time: 0, lane: 0, type: 'rock' },
      { time: 200, lane: 1, type: 'boulder' },
      { time: 1000, lane: 2, type: 'log' },
      { time: 1200, lane: 0, type: 'branch' },
      { time: 1400, lane: 1, type: 'rock' },
      { time: 2500, lane: 1, type: 'boulder' },
      { time: 2700, lane: 2, type: 'rock' },
      { time: 3800, lane: 0, type: 'log' },
      { time: 4000, lane: 2, type: 'boulder' },
      { time: 4200, lane: 1, type: 'branch' },
      { time: 5000, lane: 0, type: 'rock' },
      { time: 5200, lane: 2, type: 'rock' },
    ],
    recommendedBiome: 'storm',
    enemySpawnRules: {
      enabled: true,
      frequency: 1800,
      types: ['lightning', 'wind', 'debris'],
    },
  },

  {
    id: 'speed_demon',
    name: 'Lightning Current',
    description: 'High-speed obstacles testing reaction time',
    difficulty: 9,
    duration: 4000,
    obstacles: [
      { time: 0, lane: 1, type: 'rock' },
      { time: 400, lane: 0, type: 'boulder' },
      { time: 800, lane: 2, type: 'rock' },
      { time: 1200, lane: 1, type: 'log' },
      { time: 1600, lane: 0, type: 'rock' },
      { time: 2000, lane: 2, type: 'boulder' },
      { time: 2400, lane: 1, type: 'branch' },
      { time: 2800, lane: 0, type: 'rock' },
      { time: 3200, lane: 2, type: 'log' },
      { time: 3600, lane: 1, type: 'boulder' },
    ],
    recommendedBiome: 'electric',
    enemySpawnRules: {
      enabled: true,
      frequency: 1200,
      types: ['spark', 'bolt'],
    },
  },

  {
    id: 'alternating_wave',
    name: 'Tidal Wave',
    description: 'Smooth alternating pattern with increasing difficulty',
    difficulty: 3,
    duration: 9000,
    obstacles: [
      { time: 0, lane: 0, type: 'branch' },
      { time: 1000, lane: 2, type: 'log' },
      { time: 2000, lane: 1, type: 'rock' },
      { time: 3000, lane: 0, type: 'log' },
      { time: 4000, lane: 2, type: 'boulder' },
      { time: 5000, lane: 1, type: 'rock' },
      { time: 6000, lane: 0, type: 'boulder' },
      { time: 7000, lane: 2, type: 'rock' },
      { time: 8000, lane: 1, type: 'log' },
    ],
    recommendedBiome: 'ocean',
    enemySpawnRules: {
      enabled: true,
      frequency: 3000,
      types: ['seagull', 'crab', 'wave'],
    },
  },

  {
    id: 'center_wall_split',
    name: 'Rock Garden Split',
    description: 'Center and one side blocked, forcing edge navigation',
    difficulty: 5,
    duration: 5000,
    obstacles: [
      { time: 0, lane: 1, type: 'boulder' },
      { time: 0, lane: 2, type: 'boulder' },
      { time: 1200, lane: 0, type: 'rock' },
      { time: 1200, lane: 1, type: 'boulder' },
      { time: 2400, lane: 1, type: 'boulder' },
      { time: 2400, lane: 2, type: 'log' },
      { time: 3600, lane: 0, type: 'boulder' },
      { time: 3600, lane: 1, type: 'boulder' },
      { time: 4800, lane: 1, type: 'rock' },
    ],
    recommendedBiome: 'desert',
    enemySpawnRules: {
      enabled: true,
      frequency: 2500,
      types: ['scorpion', 'vulture'],
    },
  },

  {
    id: 'narrow_squeeze',
    name: 'Canyon Squeeze',
    description: 'Tight corridors with minimal maneuvering space',
    difficulty: 7,
    duration: 6000,
    obstacles: [
      { time: 0, lane: 0, type: 'boulder' },
      { time: 0, lane: 2, type: 'boulder' },
      { time: 800, lane: 1, type: 'branch' },
      { time: 1600, lane: 0, type: 'rock' },
      { time: 1600, lane: 2, type: 'rock' },
      { time: 2400, lane: 1, type: 'log' },
      { time: 3200, lane: 0, type: 'boulder' },
      { time: 3200, lane: 2, type: 'boulder' },
      { time: 4000, lane: 1, type: 'rock' },
      { time: 4800, lane: 0, type: 'log' },
      { time: 4800, lane: 2, type: 'log' },
      { time: 5600, lane: 1, type: 'boulder' },
    ],
    recommendedBiome: 'canyon',
    enemySpawnRules: {
      enabled: true,
      frequency: 2000,
      types: ['bat', 'spider'],
    },
  },

  {
    id: 'triple_spiral',
    name: 'Triple Helix',
    description: 'Complex rotating pattern across all three lanes',
    difficulty: 8,
    duration: 8400,
    obstacles: [
      { time: 0, lane: 0, type: 'rock' },
      { time: 400, lane: 1, type: 'log' },
      { time: 800, lane: 2, type: 'boulder' },
      { time: 1200, lane: 0, type: 'branch' },
      { time: 1600, lane: 1, type: 'rock' },
      { time: 2000, lane: 2, type: 'log' },
      { time: 2400, lane: 0, type: 'boulder' },
      { time: 2800, lane: 1, type: 'branch' },
      { time: 3200, lane: 2, type: 'rock' },
      { time: 3600, lane: 0, type: 'log' },
      { time: 4000, lane: 1, type: 'boulder' },
      { time: 4400, lane: 2, type: 'branch' },
      { time: 4800, lane: 0, type: 'rock' },
      { time: 5200, lane: 1, type: 'log' },
      { time: 5600, lane: 2, type: 'boulder' },
      { time: 6000, lane: 0, type: 'branch' },
      { time: 6400, lane: 1, type: 'rock' },
      { time: 6800, lane: 2, type: 'log' },
      { time: 7200, lane: 0, type: 'boulder' },
      { time: 7600, lane: 1, type: 'branch' },
      { time: 8000, lane: 2, type: 'rock' },
    ],
    recommendedBiome: 'mystical',
    enemySpawnRules: {
      enabled: true,
      frequency: 1600,
      types: ['spirit', 'wisp', 'phantom'],
    },
  },

  {
    id: 'scattered_mayhem',
    name: 'Debris Field',
    description: 'Scattered obstacles with irregular timing patterns',
    difficulty: 6,
    duration: 7000,
    obstacles: [
      { time: 300, lane: 1, type: 'branch' },
      { time: 900, lane: 0, type: 'rock' },
      { time: 1600, lane: 2, type: 'log' },
      { time: 2100, lane: 1, type: 'boulder' },
      { time: 2900, lane: 0, type: 'branch' },
      { time: 3400, lane: 2, type: 'rock' },
      { time: 4200, lane: 1, type: 'log' },
      { time: 4700, lane: 0, type: 'boulder' },
      { time: 5300, lane: 2, type: 'branch' },
      { time: 5900, lane: 1, type: 'rock' },
      { time: 6500, lane: 0, type: 'log' },
    ],
    recommendedBiome: 'industrial',
    enemySpawnRules: {
      enabled: true,
      frequency: 2100,
      types: ['drone', 'robot', 'alarm'],
    },
  },

  {
    id: 'blitz_test',
    name: 'Reaction Blitz',
    description: 'Ultimate speed test with minimal reaction time',
    difficulty: 10,
    duration: 3000,
    obstacles: [
      { time: 0, lane: 2, type: 'boulder' },
      { time: 300, lane: 0, type: 'rock' },
      { time: 600, lane: 1, type: 'log' },
      { time: 900, lane: 2, type: 'branch' },
      { time: 1200, lane: 0, type: 'boulder' },
      { time: 1500, lane: 1, type: 'rock' },
      { time: 1800, lane: 2, type: 'log' },
      { time: 2100, lane: 0, type: 'branch' },
      { time: 2400, lane: 1, type: 'boulder' },
      { time: 2700, lane: 2, type: 'rock' },
    ],
    recommendedBiome: 'volcano',
    enemySpawnRules: {
      enabled: true,
      frequency: 800,
      types: ['lava', 'fire', 'ash'],
    },
  },
];

export type ObstaclePattern = (typeof LEVEL_PATTERNS)[0];
export type ObstacleType = 'rock' | 'log' | 'branch' | 'boulder';
export type BiomeType =
  | 'forest'
  | 'mountain'
  | 'canyon'
  | 'meadow'
  | 'swamp'
  | 'rapids'
  | 'storm'
  | 'electric'
  | 'ocean'
  | 'desert'
  | 'mystical'
  | 'industrial'
  | 'volcano';
export type EnemyType =
  | 'fish'
  | 'bird'
  | 'eagle'
  | 'snake'
  | 'butterfly'
  | 'frog'
  | 'mosquito'
  | 'bear'
  | 'wolf'
  | 'eel'
  | 'lightning'
  | 'wind'
  | 'debris'
  | 'spark'
  | 'bolt'
  | 'seagull'
  | 'crab'
  | 'wave'
  | 'scorpion'
  | 'vulture'
  | 'bat'
  | 'spider'
  | 'spirit'
  | 'wisp'
  | 'phantom'
  | 'drone'
  | 'robot'
  | 'alarm'
  | 'lava'
  | 'fire'
  | 'ash';
