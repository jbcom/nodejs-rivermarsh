#!/usr/bin/env node
/**
 * AI Content Generator - Uses Claude to generate game design content
 */

import { generateText } from 'ai';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { CLAUDE_SONNET_4_5 } from '../config/ai-constants';

async function generateEnemyBehaviors() {
  const { text } = await generateText({
    model: CLAUDE_SONNET_4_5,
    prompt: `You're a game designer for an endless runner called "Otter River Rush". Design 6 enemy types with AI behaviors using Yuka.js steering behaviors.

For each enemy, provide:
1. Name and description
2. Yuka.js steering behaviors to use (Seek, Flee, Wander, Pursue, Evade, etc.)
3. Speed, health, aggression level
4. Spawn conditions (distance, difficulty)
5. Score value
6. Special abilities/patterns

Make them progressively harder and more interesting. Output as valid TypeScript code that can be directly imported.

Format as:
\`\`\`typescript
export const ENEMY_DEFINITIONS = [
  {
    id: 'slug',
    name: 'Lazy Slug',
    description: '...',
    // ... etc
  }
];
\`\`\``,
  });

  const tsCode = text.match(/```typescript\n([\s\S]*?)\n```/)?.[1];
  if (tsCode) {
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
      tsCode
    );
  }
}

async function generateAchievements() {
  const { text } = await generateText({
    model: CLAUDE_SONNET_4_5,
    prompt: `Design 30 creative achievements for "Otter River Rush" - an endless runner game.

Categories:
- Distance milestones
- Skill-based (perfect runs, combos)
- Collection (coins, gems)
- Mastery (all power-ups, enemy types)
- Secret/Easter eggs
- Time-based challenges

Each achievement needs:
- id, name, description, icon (emoji)
- requirement (number)
- rarity (common, rare, epic, legendary)
- check function logic (describe the condition)

Output as TypeScript that can be imported.

Format as:
\`\`\`typescript
export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_swim',
    name: 'First Swim',
    // ... etc
  }
];
\`\`\``,
  });

  const tsCode = text.match(/```typescript\n([\s\S]*?)\n```/)?.[1];
  if (tsCode) {
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
      tsCode
    );
  }
}

async function generateLevelPatterns() {
  const { text } = await generateText({
    model: CLAUDE_SONNET_4_5,
    prompt: `Design 15 obstacle patterns for "Otter River Rush" (3-lane endless runner).

Pattern types:
- Wave (alternating lanes)
- Zigzag (forces lane switching)
- Gauntlet (tight spacing)
- Breather (easy recovery section)
- Wall (block 2 lanes, force single lane)
- Spiral (rotating pattern)
- Random clusters
- Speed test (fast obstacles)

Each pattern needs:
- id, name, description
- difficulty (1-10)
- duration (time/distance)
- obstacles array with timing and lane positions
- recommended biome
- enemy spawn rules

Output as TypeScript.

Format as:
\`\`\`typescript
export const LEVEL_PATTERNS = [
  {
    id: 'gentle_wave',
    name: 'Gentle Wave',
    // ... etc
  }
];
\`\`\``,
  });

  const tsCode = text.match(/```typescript\n([\s\S]*?)\n```/)?.[1];
  if (tsCode) {
    writeFileSync(
      join(
        process.cwd(),
        'src',
        'client',
        'src',
        'game',
        'data',
        'level-patterns.ts'
      ),
      tsCode
    );
  }
}

async function generateGameTips() {
  const { text } = await generateText({
    model: CLAUDE_SONNET_4_5,
    prompt: `Write 25 helpful, fun loading screen tips for "Otter River Rush". Mix gameplay tips with otter facts and humor.

Examples:
- "Otters hold hands while sleeping so they don't drift apart!"
- "Chain dodges to build your combo multiplier"
- "The shield power-up can save you from one hit"

Output as TypeScript array.`,
  });

  const tsCode = text.match(/```typescript\n([\s\S]*?)\n```/)?.[1] || text;
  writeFileSync(
    join(
      process.cwd(),
      'src',
      'client',
      'src',
      'game',
      'data',
      'loading-tips.ts'
    ),
    `export const LOADING_TIPS = ${tsCode};`
  );
}

// Run all generators
async function main() {
  // Create data directory if it doesn't exist
  const { mkdirSync, existsSync } = await import('fs');
  const dataDir = join(process.cwd(), 'src', 'client', 'src', 'game', 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  try {
    // Step 1: Generate game content
    await generateEnemyBehaviors();
    await generateAchievements();
    await generateLevelPatterns();
    await generateGameTips();
    const { generateEnemyModels } = await import('../generators/enemy-models');
    await generateEnemyModels();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
