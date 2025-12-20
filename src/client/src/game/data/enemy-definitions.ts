// Enemy AI definitions only; advanced Yuka behaviors removed until integrated

export interface EnemyDefinition {
  id: string;
  name: string;
  description: string;
  behaviors: {
    primary: string;
    secondary?: string;
    defensive?: string;
  };
  stats: {
    speed: number;
    health: number;
    aggression: number; // 0-10 scale
  };
  spawn: {
    minDistance: number; // meters from player
    maxDistance: number;
    minDifficulty: number; // 0-10 scale
    weight: number; // spawn probability weight
  };
  scoring: {
    points: number;
    bonusMultiplier: number;
  };
  abilities: {
    specialAttack?: string;
    pattern?: string;
    cooldown?: number; // seconds
    range?: number; // meters
  };
  visual: {
    size: number;
    color: string;
    animationSpeed: number;
  };
}

export const ENEMY_DEFINITIONS: EnemyDefinition[] = [
  {
    id: 'driftwood',
    name: 'Lazy Driftwood',
    description:
      'Slow-moving wooden debris that drifts predictably downstream. Perfect for beginners to practice dodging.',
    behaviors: {
      primary: 'Wander',
      secondary: 'ObstacleAvoidance',
    },
    stats: {
      speed: 1.2,
      health: 1,
      aggression: 0,
    },
    spawn: {
      minDistance: 10,
      maxDistance: 50,
      minDifficulty: 0,
      weight: 10,
    },
    scoring: {
      points: 10,
      bonusMultiplier: 1.0,
    },
    abilities: {
      pattern: 'drift_downstream',
      cooldown: 0,
    },
    visual: {
      size: 1.5,
      color: '#8B4513',
      animationSpeed: 0.5,
    },
  },

  {
    id: 'territorial_fish',
    name: 'Territorial Bass',
    description:
      'Aggressive fish that chases otters away from its territory. Will pursue for a short distance before giving up.',
    behaviors: {
      primary: 'Pursue',
      secondary: 'Wander',
      defensive: 'Flee',
    },
    stats: {
      speed: 2.5,
      health: 2,
      aggression: 4,
    },
    spawn: {
      minDistance: 8,
      maxDistance: 30,
      minDifficulty: 1,
      weight: 8,
    },
    scoring: {
      points: 25,
      bonusMultiplier: 1.2,
    },
    abilities: {
      specialAttack: 'charge_bite',
      pattern: 'territorial_chase',
      cooldown: 3,
      range: 15,
    },
    visual: {
      size: 1.0,
      color: '#228B22',
      animationSpeed: 2.0,
    },
  },

  {
    id: 'whirlpool_crab',
    name: 'Whirlpool Crab',
    description:
      'Cunning crab that creates circular current traps. Uses unpredictable spiral movements to confuse prey.',
    behaviors: {
      primary: 'Seek',
      secondary: 'Wander',
      defensive: 'Evade',
    },
    stats: {
      speed: 3.0,
      health: 3,
      aggression: 6,
    },
    spawn: {
      minDistance: 12,
      maxDistance: 40,
      minDifficulty: 2,
      weight: 6,
    },
    scoring: {
      points: 50,
      bonusMultiplier: 1.5,
    },
    abilities: {
      specialAttack: 'whirlpool_trap',
      pattern: 'spiral_dance',
      cooldown: 8,
      range: 12,
    },
    visual: {
      size: 0.8,
      color: '#FF6347',
      animationSpeed: 3.0,
    },
  },

  {
    id: 'snapping_turtle',
    name: 'Ancient Snapper',
    description:
      'Massive turtle that alternates between patient waiting and explosive strikes. Uses ambush tactics.',
    behaviors: {
      primary: 'Arrive',
      secondary: 'Pursue',
      defensive: 'ObstacleAvoidance',
    },
    stats: {
      speed: 1.8,
      health: 5,
      aggression: 7,
    },
    spawn: {
      minDistance: 15,
      maxDistance: 35,
      minDifficulty: 3,
      weight: 5,
    },
    scoring: {
      points: 100,
      bonusMultiplier: 2.0,
    },
    abilities: {
      specialAttack: 'lightning_snap',
      pattern: 'ambush_strike',
      cooldown: 5,
      range: 8,
    },
    visual: {
      size: 2.5,
      color: '#556B2F',
      animationSpeed: 1.0,
    },
  },

  {
    id: 'electric_eel',
    name: 'Voltage Viper',
    description:
      'Highly intelligent eel that predicts otter movement patterns. Creates electric barriers and uses advanced evasion.',
    behaviors: {
      primary: 'Evade',
      secondary: 'Pursue',
      defensive: 'Flee',
    },
    stats: {
      speed: 4.2,
      health: 4,
      aggression: 8,
    },
    spawn: {
      minDistance: 20,
      maxDistance: 45,
      minDifficulty: 5,
      weight: 4,
    },
    scoring: {
      points: 200,
      bonusMultiplier: 2.5,
    },
    abilities: {
      specialAttack: 'electric_surge',
      pattern: 'predictive_intercept',
      cooldown: 6,
      range: 18,
    },
    visual: {
      size: 3.0,
      color: '#4169E1',
      animationSpeed: 4.0,
    },
  },

  {
    id: 'hydra_boss',
    name: 'River Hydra',
    description:
      'Legendary multi-headed serpent with complex AI. Each head uses different behaviors simultaneously. Adapts strategy based on player actions.',
    behaviors: {
      primary: 'Seek',
      secondary: 'Pursue',
      defensive: 'Evade',
    },
    stats: {
      speed: 3.5,
      health: 12,
      aggression: 10,
    },
    spawn: {
      minDistance: 25,
      maxDistance: 60,
      minDifficulty: 7,
      weight: 1,
    },
    scoring: {
      points: 1000,
      bonusMultiplier: 5.0,
    },
    abilities: {
      specialAttack: 'tri_head_assault',
      pattern: 'adaptive_formation',
      cooldown: 4,
      range: 25,
    },
    visual: {
      size: 4.0,
      color: '#8A2BE2',
      animationSpeed: 2.5,
    },
  },
];

// Full EnemyAI with yuka behaviors will be reintroduced after integration with ECS
