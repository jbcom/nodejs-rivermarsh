import { useRPGStore as rivermarshStore } from '../../stores/rpgStore';
import { world } from '../world';

/**
 * PlayerSyncSystem - Syncs player ECS entity back to Zustand store
 */
export function PlayerSyncSystem() {
    for (const entity of world.with('isPlayer', 'species', 'transform')) {
        const stats = rivermarshStore.getState().player.stats;

        // Sync health if it changed in ECS
        if (entity.species!.health !== stats.health) {
            const damage = stats.health - entity.species!.health;
            if (damage > 0) {
                // biome-ignore lint/correctness/useHookAtTopLevel: getState is not a hook
                rivermarshStore.getState().takeDamage(damage);
            } else if (damage < 0) {
                // biome-ignore lint/correctness/useHookAtTopLevel: getState is not a hook
                rivermarshStore.getState().heal(-damage);
            }
        }

        // Sync stamina if it changed in ECS
        if (entity.species!.stamina !== stats.stamina) {
            const consumed = stats.stamina - entity.species!.stamina;
            if (consumed > 0) {
                // biome-ignore lint/correctness/useHookAtTopLevel: getState is not a hook
                rivermarshStore.getState().useStamina(consumed);
            } else if (consumed < 0) {
                // biome-ignore lint/correctness/useHookAtTopLevel: getState is not a hook
                rivermarshStore.getState().restoreStamina(-consumed);
            }
        }

        // Update ECS position from Zustand (since player is moved by Rapier/Zustand)
        const playerPos = rivermarshStore.getState().player.position;
        entity.transform!.position.set(playerPos[0], playerPos[1], playerPos[2]);
    }
}
