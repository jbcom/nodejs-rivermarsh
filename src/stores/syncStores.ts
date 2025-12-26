/**
 * Store Synchronization - Bridges engineStore and rpgStore
 * 
 * The game has two stat systems:
 * - engineStore: Core game loop stats (health, stamina, gold, XP) - used by gameplay systems
 * - rpgStore: RPG-specific features (inventory, quests, skills) - used by UI/RPG features
 * 
 * This module keeps them in sync so the HUD and game systems work together.
 */

import { shallow } from 'zustand/shallow';
import { useEngineStore } from './engineStore';
import { useRPGStore } from './rpgStore';

let isSyncing = false;

/**
 * Initialize bidirectional sync between stores
 * Call this once at app startup
 */
export function initStoreSync() {
    // Sync engineStore changes -> rpgStore
    useEngineStore.subscribe(
        (state) => ({
            health: state.player.health,
            maxHealth: state.player.maxHealth,
            stamina: state.player.stamina,
            maxStamina: state.player.maxStamina,
            gold: state.player.gold,
            level: state.player.level,
            experience: state.player.experience,
        }),
        (current: any, prev: any) => {
            if (isSyncing) return;
            isSyncing = true;

            try {
                const rpgState = useRPGStore.getState();

                // Sync health changes
                if (current.health !== prev.health) {
                    rpgState.updatePlayerStats({ health: current.health });
                }

                // Sync stamina changes
                if (current.stamina !== prev.stamina) {
                    rpgState.updatePlayerStats({ stamina: current.stamina });
                }

                // Sync gold changes
                if (current.gold !== prev.gold) {
                    rpgState.updatePlayerStats({ gold: current.gold });
                }

                // Sync level/XP changes
                if (current.level !== prev.level || current.experience !== prev.experience) {
                    rpgState.updatePlayerStats({
                        level: current.level,
                        experience: current.experience,
                        maxHealth: current.maxHealth,
                        maxStamina: current.maxStamina,
                    });
                }
            } finally {
                isSyncing = false;
            }
        },
        { equalityFn: shallow }
    );

    // Sync rpgStore changes -> engineStore (for gold/shop purchases)
    useRPGStore.subscribe(
        (state) => ({
            gold: state.player.stats.gold,
            health: state.player.stats.health,
            stamina: state.player.stats.stamina,
        }),
        (current: any, prev: any) => {
            if (isSyncing) return;
            isSyncing = true;

            try {
                const engineState = useEngineStore.getState();

                // If gold changed in rpgStore (e.g., from shop), sync to engineStore
                if (current.gold !== prev.gold && current.gold !== engineState.player.gold) {
                    engineState.updatePlayer({ gold: current.gold });
                }

                // If health changed in rpgStore (e.g., from potions), sync to engineStore
                if (current.health !== prev.health && current.health !== engineState.player.health) {
                    engineState.updatePlayer({ health: current.health });
                }

                // If stamina changed in rpgStore, sync to engineStore
                if (current.stamina !== prev.stamina && current.stamina !== engineState.player.stamina) {
                    engineState.updatePlayer({ stamina: current.stamina });
                }
            } finally {
                isSyncing = false;
            }
        },
        { equalityFn: shallow }
    );

    // Do an initial sync from rpgStore to engineStore (rpgStore has persisted data)
    const rpgState = useRPGStore.getState();
    useEngineStore.getState().updatePlayer({
        health: rpgState.player.stats.health,
        maxHealth: rpgState.player.stats.maxHealth,
        stamina: rpgState.player.stats.stamina,
        maxStamina: rpgState.player.stats.maxStamina,
        gold: rpgState.player.stats.gold,
        level: rpgState.player.stats.level,
        experience: rpgState.player.stats.experience,
    });

    console.log('[StoreSync] Store synchronization initialized');
}
