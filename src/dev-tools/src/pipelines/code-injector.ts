/**
 * Code Injector - AST-based automatic code integration
 * Reads generated content and auto-wires it into the codebase
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export class CodeInjector {
  /**
   * Auto-wire enemy types into Entity definition
   */
  async injectEnemyTypes() {
    const worldPath = join(
      process.cwd(),
      '..',
      '..',
      'src',
      'client',
      'src',
      'ecs',
      'world.ts'
    );
    let content = readFileSync(worldPath, 'utf-8');

    // Check if already has enemy types
    if (!content.includes('enemy?: true')) {
      const insertion = `  enemy?: true;
  ai?: {
    type: string;
    aggression: number;
    lastAction: number;
  };`;

      // Find insertion point after "obstacle?: true;"
      content = content.replace(
        /obstacle\?: true;/,
        `obstacle?: true;\n${insertion}`
      );

      writeFileSync(worldPath, content);
    } else {
      console.warn('queries.enemies already exists or file structure changed');
    }

    // Check if queries.enemies exists
    if (!content.includes('enemies:')) {
      content = content.replace(
        /player: world\.with/,
        `player: world.with('player', 'position', 'model'),\n  \n  // Enemies\n  enemies: world.with('enemy', 'position', 'collider'),\n  \n  // Obstacles\n  obstacles: world.with`
      );

      // Remove duplicate "player:" line
      content = content.replace(/player:.*?\n.*?player:/s, 'player:');

      writeFileSync(worldPath, content);
    } else {
      console.warn('enemy component already exists or file structure changed');
    }
  }

  /**
   * Auto-wire EnemySystem into GameCanvas
   */
  async injectEnemySystem() {
    const canvasPath = join(
      process.cwd(),
      '..',
      '..',
      'src',
      'client',
      'src',
      'components',
      'game',
      'GameCanvas.tsx'
    );
    let content = readFileSync(canvasPath, 'utf-8');

    // Check for import
    if (!content.includes('EnemySystem')) {
      // Add import
      content = content.replace(
        /import { LeaderboardSystem } from/,
        `import { EnemySystem } from '../../ecs/enemy-system';\nimport { LeaderboardSystem } from`
      );

      // Add to Suspense
      content = content.replace(
        /<LeaderboardSystem \/>/,
        `<LeaderboardSystem />\n          <EnemySystem />`
      );

      writeFileSync(canvasPath, content);
    } else {
      console.warn('GameCanvas already updated');
    }
  }

  /**
   * Auto-wire enemy rendering
   */
  async injectEnemyRenderer() {
    const rendererPath = join(
      process.cwd(),
      '..',
      '..',
      'src',
      'client',
      'src',
      'components',
      'game',
      'EntityRenderer.tsx'
    );
    let content = readFileSync(rendererPath, 'utf-8');

    if (!content.includes('EnemiesRenderer')) {
      // Add component
      const component = `
/**
 * Render all enemies
 */
export function EnemiesRenderer() {
  return (
    <ECS.Entities in={queries.enemies}>
      {(entity) => (
        <ECS.Entity entity={entity}>
          <ECS.Component name="three">
            <group position={[entity.position.x, entity.position.y, entity.position.z]}>
              <Model url={entity.model!.url} scale={entity.model!.scale} />
            </group>
          </ECS.Component>
        </ECS.Entity>
      )}
    </ECS.Entities>
  );
}`;

      // Insert before EntityRenderer
      content = content.replace(
        /\/\*\*\n \* Master Entity Renderer/,
        `${component}\n\n/**\n * Master Entity Renderer`
      );

      // Add to EntityRenderer
      content = content.replace(
        /<PlayerRenderer \/>/,
        `<PlayerRenderer />\n      <EnemiesRenderer />`
      );

      writeFileSync(rendererPath, content);
    } else {
      console.warn('EntityRenderer already updated');
    }
  }

  /**
   * Auto-wire enemy collision
   */
  async injectEnemyCollision() {
    const systemsPath = join(
      process.cwd(),
      '..',
      '..',
      'src',
      'client',
      'src',
      'ecs',
      'systems.tsx'
    );
    let content = readFileSync(systemsPath, 'utf-8');

    if (!content.includes('handleEnemyHit')) {
      const collision = `
    // Check enemy collisions
    const enemies = queries.enemies || [];
    for (const enemy of enemies) {
      if (enemy.collider && checkCollision(player as any, enemy as any)) {
        handleEnemyHit(player, enemy);
      }
    }`;

      content = content.replace(
        /\/\/ Check collectible collisions/,
        `${collision}\n    \n    // Check collectible collisions`
      );

      const handler = `
/**
 * Handle enemy collision
 */
function handleEnemyHit(
  player: With<Entity, 'player'>,
  enemy: With<Entity, 'enemy'>
) {
  if (player.invincible || player.ghost) return;
  
  const damage = enemy.ai?.aggression || 1;
  if (player.health) {
    player.health -= damage;
    
    if (player.animation) {
      player.animation.current = 'hit';
      setTimeout(() => {
        if (player.animation) player.animation.current = 'walk';
      }, 500);
    }
    
    if (player.health <= 0) {
      useGameStore.getState().endGame();
      if (player.animation) player.animation.current = 'death';
    }
  }
  
  world.addComponent(enemy, 'destroyed', true);
  
  for (let i = 0; i < 12; i++) {
    spawn.particle(enemy.position.x, enemy.position.y, '#ff0000');
  }
}`;

      content = content.replace(
        /\/\*\*\n \* Handle obstacle collision\n \*\//,
        `${handler}\n\n/**\n * Handle obstacle collision\n */`
      );

      writeFileSync(systemsPath, content);
    } else {
      console.warn('Systems already updated');
    }
  }

  /**
   * Run all injections
   */
  async injectAll() {
    await this.injectEnemyTypes();
    await this.injectEnemySystem();
    await this.injectEnemyRenderer();
    await this.injectEnemyCollision();
  }
}
