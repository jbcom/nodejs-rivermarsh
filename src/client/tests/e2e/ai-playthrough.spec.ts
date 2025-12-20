import { expect, test } from '@playwright/test';

/**
 * AI-Driven Playthrough Tests
 * Uses goal-oriented AI persona to actually PLAY the game autonomously
 * Records video for visual verification
 */

test.describe('AI Player Persona - Autonomous Gameplay', () => {
  test('AI Persona plays 30-second session with goal-oriented behavior', async ({
    page,
  }, testInfo) => {
    // Force video recording for this test
    testInfo.annotations.push({ type: 'video', description: 'always' });
    // Navigate to game (baseURL configured in playwright.config)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start game
    await page.click('#classicButton');
    await page.waitForTimeout(1000);

    // AI Persona Decision Loop (30 seconds)
    const playDuration = 30000;
    const decisionInterval = 100; // Make decisions every 100ms
    const startTime = Date.now();

    while (Date.now() - startTime < playDuration) {
      // Get game state
      const gameState = await page.evaluate(() => {
        const state = (window as any).__gameStore?.getState?.();
        const debug = (window as any).debug;

        return {
          status: state?.status,
          distance: state?.distance || 0,
          score: state?.score || 0,
          lives: state?.lives || 0,
          entities: debug?.exportGameState?.().entities || [],
          playerPosition: debug
            ?.exportGameState?.()
            .entities?.find((e: any) => e.type === 'player')?.position,
        };
      });

      // If game over, break
      if (gameState.status !== 'playing') {
        break;
      }

      // Goal-Oriented AI Decision Making
      const decision = makeDecision(gameState);

      // Execute decision
      if (decision.action === 'move_left') {
        await page.keyboard.press('ArrowLeft');
      } else if (decision.action === 'move_right') {
        await page.keyboard.press('ArrowRight');
      } else if (decision.action === 'collect') {
        // Collect logic
      } else {
        // Default action
      }

      await page.waitForTimeout(decisionInterval);
    }

    // Get final stats
    const finalState = await page.evaluate(() => {
      const state = (window as any).__gameStore?.getState?.();
      return {
        distance: state?.distance || 0,
        score: state?.score || 0,
        lives: state?.lives || 0,
        coins: state?.coins || 0,
        gems: state?.gems || 0,
        status: state?.status,
      };
    });

    // Verify AI was able to play
    expect(finalState.distance).toBeGreaterThan(10); // Should survive at least 10m
    expect(finalState.score).toBeGreaterThan(0);
  });
});

/**
 * Goal-Oriented AI Decision Making
 * Simulates basic Yuka.js-style goal selection
 */
interface GameState {
  status: string;
  distance: number;
  score: number;
  lives: number;
  entities: Array<{
    position?: { x: number; y: number };
    type?: string;
  }>;
  playerPosition?: { x: number; y: number };
}

interface Decision {
  action: 'move_left' | 'move_right' | 'stay' | 'collect';
  goal: string;
  priority: number;
}

function makeDecision(state: GameState): Decision {
  // Default: stay in current lane
  let bestDecision: Decision = {
    action: 'stay',
    goal: 'maintain_position',
    priority: 1,
  };

  if (!state.playerPosition) return bestDecision;

  const playerX = state.playerPosition.x;
  const playerY = state.playerPosition.y;

  // Analyze nearby entities
  const nearbyEntities = state.entities.filter((e) => {
    if (!e.position) return false;
    const dy = e.position.y - playerY;
    return dy > 0 && dy < 3; // Look ahead 3 units
  });

  // Goal 1: AVOID OBSTACLES (highest priority)
  const obstaclesInPath = nearbyEntities.filter((e) => e.type === 'obstacle');
  for (const obstacle of obstaclesInPath) {
    if (obstacle.position && Math.abs(obstacle.position.x - playerX) < 0.5) {
      // Obstacle directly ahead - evade!
      const canMoveLeft = playerX > -2;
      const canMoveRight = playerX < 2;

      if (canMoveLeft && !hasObstacleAt(obstaclesInPath, playerX - 2)) {
        return {
          action: 'move_left',
          goal: 'avoid_obstacle',
          priority: 10,
        };
      } else if (canMoveRight && !hasObstacleAt(obstaclesInPath, playerX + 2)) {
        return {
          action: 'move_right',
          goal: 'avoid_obstacle',
          priority: 10,
        };
      }
    }
  }

  // Goal 2: COLLECT ITEMS (medium priority)
  const collectibles = nearbyEntities.filter(
    (e) => e.type === 'collectible' || e.type === 'coin' || e.type === 'gem'
  );
  for (const item of collectibles) {
    if (item.position && Math.abs(item.position.x - playerX) < 0.5) {
      // Item in current lane - stay to collect
      return {
        action: 'stay',
        goal: 'collect_item',
        priority: 5,
      };
    } else if (item.position) {
      // Item in adjacent lane - move to collect
      if (item.position.x < playerX && playerX > -2) {
        return {
          action: 'move_left',
          goal: 'seek_collectible',
          priority: 3,
        };
      } else if (item.position.x > playerX && playerX < 2) {
        return {
          action: 'move_right',
          goal: 'seek_collectible',
          priority: 3,
        };
      }
    }
  }

  // Goal 3: CENTER BIAS (low priority - return to center lane for better options)
  if (Math.random() < 0.1) {
    // 10% chance to center
    if (playerX < 0) {
      return {
        action: 'move_right',
        goal: 'center_bias',
        priority: 1,
      };
    } else if (playerX > 0) {
      return {
        action: 'move_left',
        goal: 'center_bias',
        priority: 1,
      };
    }
  }

  return bestDecision;
}

function hasObstacleAt(
  obstacles: Array<{ position?: { x: number; y: number } }>,
  x: number
): boolean {
  return obstacles.some(
    (obs) => obs.position && Math.abs(obs.position.x - x) < 0.5
  );
}
