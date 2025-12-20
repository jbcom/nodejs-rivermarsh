#!/usr/bin/env node
/**
 * AI Content Generator V2 - Uses generateObject with Zod schemas
 * Guarantees valid TypeScript output
 */

import { generateObject } from 'ai';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { CLAUDE_SONNET_4_5 } from '../config/ai-constants';

// Enemy schema
const enemySchema = z.object({
  enemies: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      behaviors: z.object({
        primary: z.enum(['Seek', 'Pursue', 'Wander', 'Evade', 'Flee']),
        secondary: z
          .enum([
            'Seek',
            'Pursue',
            'Wander',
            'Evade',
            'Flee',
            'ObstacleAvoidance',
          ])
          .optional(),
      }),
      stats: z.object({
        speed: z.number(),
        health: z.number(),
        aggression: z.number().min(0).max(10),
      }),
      spawn: z.object({
        minDistance: z.number(),
        maxDistance: z.number(),
        minDifficulty: z.number().min(0).max(10),
        weight: z.number(),
      }),
      scoring: z.object({
        points: z.number(),
        bonusMultiplier: z.number(),
      }),
      abilities: z.object({
        specialAttack: z.string().optional(),
        pattern: z.string().optional(),
        cooldown: z.number().optional(),
        range: z.number().optional(),
      }),
      visual: z.object({
        size: z.number(),
        color: z.string(),
        animationSpeed: z.number(),
      }),
    })
  ),
});

async function generateEnemies() {
  const { object } = await generateObject({
    model: CLAUDE_SONNET_4_5,
    schema: enemySchema,
    prompt:
      'Generate 6 river enemy types for endless runner game, progressively harder',
  });

  const output = `export const ENEMY_DEFINITIONS = ${JSON.stringify(object.enemies, null, 2)};\n`;

  writeFileSync(
    join(
      process.cwd(),
      'src',
      'client',
      'src',
      'game',
      'data',
      'enemy-definitions.ts'
    ),
    output
  );
}

// Achievement schema
const achievementSchema = z.object({
  achievements: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      icon: z.string(),
      requirement: z.number(),
      rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
      checkCondition: z.string(),
    })
  ),
});

async function generateAchievements() {
  const { object } = await generateObject({
    model: CLAUDE_SONNET_4_5,
    schema: achievementSchema,
    prompt:
      'Generate 30 creative achievements for endless runner game with distances, combos, collection, mastery',
  });

  const output = `export const ACHIEVEMENT_DEFINITIONS = ${JSON.stringify(object.achievements, null, 2)};\n`;

  writeFileSync(
    join(
      process.cwd(),
      'src',
      'client',
      'src',
      'game',
      'data',
      'achievement-definitions.ts'
    ),
    output
  );
}

async function main() {
  const { mkdirSync, existsSync } = await import('fs');
  const dataDir = join(process.cwd(), 'src', 'client', 'src', 'game', 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  try {
    await generateEnemies();
    await generateAchievements();
    const { generateEnemyModels } = await import('../generators/enemy-models');
    await generateEnemyModels();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
