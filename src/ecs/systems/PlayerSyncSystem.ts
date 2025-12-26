import { useEngineStore } from '../../stores/engineStore';
import { useRPGStore as rivermarshStore } from '../../stores/rpgStore';
import { world } from '../world';

/**
 * PlayerSyncSystem - Syncs player position between stores and ECS
 * 
 * Data flow:
 * - Position: Rapier physics -> engineStore -> rpgStore -> ECS
 * - Stats: engineStore <-> rpgStore (via syncStores.ts)
 */
export function PlayerSyncSystem() {
    const engineState = useEngineStore.getState();
    const rpgState = rivermarshStore.getState();

    for (const entity of world.with('isPlayer', 'species', 'transform')) {
        // Get position from engineStore (updated by Player physics)
        const enginePos = engineState.player.position;
        
        // Sync position to rpgStore
        rpgState.updatePlayerPosition([enginePos.x, enginePos.y, enginePos.z]);
        
        // Update ECS position
        entity.transform!.position.set(enginePos.x, enginePos.y, enginePos.z);
        
        // Sync species stats from engineStore to ECS (for AI systems)
        const enginePlayer = engineState.player;
        if (entity.species) {
            entity.species.health = enginePlayer.health;
            entity.species.maxHealth = enginePlayer.maxHealth;
            entity.species.stamina = enginePlayer.stamina;
            entity.species.maxStamina = enginePlayer.maxStamina;
        }
    }
}
