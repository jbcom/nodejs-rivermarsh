import { combatEvents } from '../../events/combatEvents';
import { useRPGStore } from '../../stores';
import { world } from '../world';

/**
 * CombatSystem - Handles combat logic and hit detection
 */
let initialized = false;

export function CombatSystem() {
    if (initialized) {
        return;
    }

    // Subscribe to player attacks
    combatEvents.onPlayerAttack((position, range, damage) => {
        // Find all enemies in range
        const entities = world.with('isNPC', 'transform', 'species').entities;

        entities.forEach((entity) => {
            if (entity.species?.state === 'dead') {
                return;
            }

            const dist = entity.transform!.position.distanceTo(position);
            if (dist <= range) {
                // Damage NPC
                const npcId = entity.id?.toString() || '';
                if (npcId) {
                    const rpgStore = useRPGStore.getState();
                    const npcBefore = rpgStore.npcs.find((n: any) => n.id === npcId);
                    
                    if (npcBefore) {
                        rpgStore.damageNPC(npcId, damage);

                        // Emit damage event for visuals (floating numbers, particles)
                        combatEvents.emitDamageEnemy(npcId, damage, entity.transform!.position.clone());

                        // Check if NPC died (it will be removed from store if health <= 0)
                        const npcAfter = useRPGStore.getState().npcs.find((n: any) => n.id === npcId);
                        if (!npcAfter) {
                            // Dead!
                            entity.species!.state = 'dead';
                        }
                    }
                }
            }
        });
    });

    initialized = true;
}

export function resetCombatSystem() {
    initialized = false;
}
