import { useGameStore } from '../../stores/gameStore';
import { world } from '../world';

/**
 * PlayerSyncSystem - Syncs player position between store and ECS
 */
export function PlayerSyncSystem() {
    const { player } = useGameStore.getState();

    for (const entity of world.with('isPlayer', 'species', 'transform')) {
        // Get position from store (updated by Player physics)
        const { x, y, z } = player.position;

        // Update ECS position from store
        entity.transform!.position.set(x, y, z);

        // Sync species stats from store to ECS (for AI systems)
        if (entity.species) {
            entity.species.health = player.health;
            entity.species.maxHealth = player.maxHealth;
            entity.species.stamina = player.stamina;
            entity.species.maxStamina = player.maxStamina;
        }
    }
}
