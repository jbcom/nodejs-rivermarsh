import { useEngineStore, useRPGStore } from '@/stores';
import { world } from '../world';

/**
 * PlayerSyncSystem - Syncs player position and stats between stores and ECS.
 * Optimized to use engineStore for high-frequency physics and rpgStore for stats.
 */
export function PlayerSyncSystem() {
    const { position } = useEngineStore.getState().player;
    const { health, maxHealth, stamina, maxStamina } = useRPGStore.getState().player;

    for (const entity of world.with('isPlayer', 'species', 'transform')) {
        // Sync position from Engine Store (updated by Player physics)
        entity.transform!.position.copy(position);

        // Sync species stats from RPG Store (for AI systems)
        if (entity.species) {
            entity.species.health = health;
            entity.species.maxHealth = maxHealth;
            entity.species.stamina = stamina;
            entity.species.maxStamina = maxStamina;
        }
    }
}
