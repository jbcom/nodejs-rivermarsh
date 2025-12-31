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
                    rpgStore.damageNPC(npcId, damage);

                    // Emit damage event for visuals (floating numbers, particles)
                    combatEvents.emitDamageEnemy(npcId, damage, entity.transform!.position.clone());

                    // Check if NPC died
                    const updatedNPC = useRPGStore
                        .getState()
                        .npcs.find((n) => n.id === npcId);
                    if (!updatedNPC) {
                        // Dead!
                        entity.species!.state = 'dead';
                        useRPGStore.getState().addExperience(25);
                        useRPGStore.getState().addGold(10);
                    }
                }
            }
        });
    });

    // Subscribe to player spells
    combatEvents.onPlayerSpell((position, range, damage) => {
        // Find all enemies in range - spells have larger range but cost mana
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
                    rpgStore.damageNPC(npcId, damage);

                    // Emit damage event for visuals (floating numbers, particles)
                    combatEvents.emitDamageEnemy(npcId, damage, entity.transform!.position.clone());

                    // Check if NPC died
                    const updatedNPC = useRPGStore
                        .getState()
                        .npcs.find((n) => n.id === npcId);
                    if (!updatedNPC || (updatedNPC.health ?? 0) <= 0) {
                        // Dead!
                        entity.species!.state = 'dead';
                        useRPGStore.getState().addExperience(25);
                        useRPGStore.getState().addGold(10);
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
