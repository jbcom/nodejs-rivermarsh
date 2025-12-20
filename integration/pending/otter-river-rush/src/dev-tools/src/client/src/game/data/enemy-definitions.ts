export const ENEMY_DEFINITIONS = [
  {
    id: 'river_minnow',
    name: 'River Minnow',
    description:
      'Small, harmless fish that swim in predictable patterns. Perfect for beginners to practice avoiding obstacles.',
    behaviors: {
      primary: 'Wander',
    },
    stats: {
      speed: 2,
      health: 1,
      aggression: 1,
    },
    spawn: {
      minDistance: 0,
      maxDistance: 100,
      minDifficulty: 0,
      weight: 5,
    },
    scoring: {
      points: 10,
      bonusMultiplier: 1,
    },
    abilities: {
      specialAttack: 'None',
      pattern: 'Slow zigzag',
      cooldown: 0,
      range: 1,
    },
    visual: {
      size: 0.5,
      color: 'Silver',
      animationSpeed: 1,
    },
  },
  {
    id: 'water_snake',
    name: 'Water Snake',
    description:
      'Serpentine creature that moves in smooth S-curves across the river. Slightly faster than minnows.',
    behaviors: {
      primary: 'Wander',
      secondary: 'ObstacleAvoidance',
    },
    stats: {
      speed: 3.5,
      health: 2,
      aggression: 3,
    },
    spawn: {
      minDistance: 50,
      maxDistance: 200,
      minDifficulty: 1,
      weight: 4,
    },
    scoring: {
      points: 25,
      bonusMultiplier: 1.2,
    },
    abilities: {
      specialAttack: 'Lunge',
      pattern: 'Sinusoidal movement',
      cooldown: 3,
      range: 2,
    },
    visual: {
      size: 1.2,
      color: 'Dark Green',
      animationSpeed: 1.5,
    },
  },
  {
    id: 'river_pike',
    name: 'River Pike',
    description:
      'Aggressive predatory fish that actively seeks out the player. Moves in quick bursts with brief pauses.',
    behaviors: {
      primary: 'Seek',
    },
    stats: {
      speed: 4.5,
      health: 3,
      aggression: 6,
    },
    spawn: {
      minDistance: 100,
      maxDistance: 300,
      minDifficulty: 3,
      weight: 3.5,
    },
    scoring: {
      points: 50,
      bonusMultiplier: 1.5,
    },
    abilities: {
      specialAttack: 'Dash Strike',
      pattern: 'Burst movement',
      cooldown: 2.5,
      range: 3,
    },
    visual: {
      size: 1.8,
      color: 'Olive Green',
      animationSpeed: 2,
    },
  },
  {
    id: 'electric_eel',
    name: 'Electric Eel',
    description:
      'Dangerous eel that pursues the player relentlessly and can discharge electricity in a wide area around itself.',
    behaviors: {
      primary: 'Pursue',
    },
    stats: {
      speed: 5,
      health: 4,
      aggression: 7,
    },
    spawn: {
      minDistance: 200,
      maxDistance: 450,
      minDifficulty: 5,
      weight: 2.5,
    },
    scoring: {
      points: 100,
      bonusMultiplier: 2,
    },
    abilities: {
      specialAttack: 'Electric Discharge',
      pattern: 'Persistent chase',
      cooldown: 4,
      range: 4,
    },
    visual: {
      size: 2.5,
      color: 'Electric Blue',
      animationSpeed: 2.5,
    },
  },
  {
    id: 'giant_catfish',
    name: 'Giant Catfish',
    description:
      'Massive bottom-dwelling predator that creates whirlpools and has unpredictable movement patterns. Very dangerous.',
    behaviors: {
      primary: 'Pursue',
      secondary: 'Wander',
    },
    stats: {
      speed: 6,
      health: 6,
      aggression: 8,
    },
    spawn: {
      minDistance: 300,
      maxDistance: 600,
      minDifficulty: 7,
      weight: 2,
    },
    scoring: {
      points: 200,
      bonusMultiplier: 2.5,
    },
    abilities: {
      specialAttack: 'Whirlpool Creation',
      pattern: 'Erratic charge',
      cooldown: 6,
      range: 5,
    },
    visual: {
      size: 4,
      color: 'Dark Brown',
      animationSpeed: 1.8,
    },
  },
  {
    id: 'river_kraken',
    name: 'River Kraken',
    description:
      'Legendary aquatic monster with multiple tentacles. The ultimate river threat with devastating area attacks and relentless pursuit.',
    behaviors: {
      primary: 'Pursue',
      secondary: 'Seek',
    },
    stats: {
      speed: 7.5,
      health: 10,
      aggression: 10,
    },
    spawn: {
      minDistance: 500,
      maxDistance: 1000,
      minDifficulty: 9,
      weight: 1,
    },
    scoring: {
      points: 500,
      bonusMultiplier: 3,
    },
    abilities: {
      specialAttack: 'Tentacle Slam',
      pattern: 'Multi-directional assault',
      cooldown: 5,
      range: 8,
    },
    visual: {
      size: 6,
      color: 'Deep Purple',
      animationSpeed: 3,
    },
  },
];
