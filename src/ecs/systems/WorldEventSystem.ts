import * as THREE from 'three';
import { useEngineStore, useRPGStore } from '../../stores';
import { useAchievementStore } from '../../stores/useAchievementStore';
import { BOSSES } from '../data/bosses';
import { world } from '../world';

const POSSIBLE_EVENTS = [
    'blood_moon',
    'golden_hour',
    'meteor_shower',
    'foggy_morning',
    'boss_encounter',
];

/**
 * WorldEventSystem - Manages random world events and boss encounters.
 * Segregated store access: engineStore for game mode, rpgStore for boss/player stats.
 */
export function WorldEventSystem() {
    for (const entity of world.with('worldEvents', 'time')) {
        const { worldEvents, time } = entity;
        const now = Date.now();

        // Check if current events should end
        if (worldEvents.activeEvents.length > 0) {
            if (now - worldEvents.lastEventTime > worldEvents.eventDuration) {
                console.log('World Event(s) Ended:', worldEvents.activeEvents);

                // Cleanup boss if encounter ended
                if (worldEvents.activeEvents.includes('boss_encounter')) {
                    const bossEntity = world.with('isBoss').entities[0];
                    if (bossEntity) {
                        world.remove(bossEntity);
                    }
                    useEngineStore.getState().setGameMode('exploration');
                    useRPGStore.getState().setActiveBossId(null);
                }

                worldEvents.activeEvents = [];
                worldEvents.nextEventTime = now + 120000 + Math.random() * 300000; // Next event in 2-7 mins
                worldEvents.lastEventTime = now;
            }
        }

        // Check if new event should start
        if (worldEvents.activeEvents.length === 0 && now > worldEvents.nextEventTime) {
            const newEvent = POSSIBLE_EVENTS[Math.floor(Math.random() * POSSIBLE_EVENTS.length)];

            // Check event conditions
            let canStart = true;
            if (newEvent === 'blood_moon' && time.phase !== 'night') {
                canStart = false;
            }
            if (newEvent === 'golden_hour' && time.phase !== 'dusk') {
                canStart = false;
            }
            if (newEvent === 'foggy_morning' && time.phase !== 'dawn') {
                canStart = false;
            }

            if (canStart) {
                worldEvents.activeEvents = [newEvent];
                worldEvents.lastEventTime = now;
                console.log('World Event Started:', newEvent);

                if (newEvent === 'boss_encounter') {
                    triggerBossEncounter();
                }

                // Achievement for first world event
                useAchievementStore.getState().unlockAchievement('first-steps'); // Example
            } else {
                // Delay if conditions not met or try a different event
                worldEvents.nextEventTime = now + 10000; // Check again in 10s
            }
        }

        // Apply event effects to global state
        if (worldEvents.activeEvents.includes('blood_moon')) {
            time.ambientLight = 0.1; // Darker red-ish moon
        }

        if (worldEvents.activeEvents.includes('foggy_morning')) {
            time.fogDensity = 0.15; // Very thick fog
        }
    }
}

function triggerBossEncounter() {
    const engineStore = useEngineStore.getState();
    const rpgStore = useRPGStore.getState();
    const { player } = rpgStore;

    // Check if a boss already exists
    const existingBoss = world.with('isBoss').entities[0];
    if (existingBoss) {
        console.log('Boss already exists, skipping spawn');
        return;
    }

    // Pick a boss based on player level
    const bossTypes: ('dread_hydra' | 'shadow_golem' | 'chaos_drake')[] = [
        'dread_hydra',
        'shadow_golem',
        'chaos_drake',
    ];
    const bossType = bossTypes[Math.min((player.level || 1) - 1, bossTypes.length - 1)];
    const bossData = BOSSES[bossType];

    // Create boss entity
    const bossEntity = world.add({
        isBoss: true,
        transform: {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Quaternion(),
            scale: new THREE.Vector3(2, 2, 2),
        },
        species: {
            id: `boss_${Date.now()}`,
            name: bossData.name,
            type: 'predator',
            health: bossData.health,
            maxHealth: bossData.health,
            stamina: 100,
            maxStamina: 100,
            speed: 0,
            state: 'idle',
        },
        boss: {
            type: bossType,
            specialAbilityCooldown: 3,
            phase: 1,
            rewards: bossData.rewards,
            isBossBattleActive: true,
        },
        combat: {
            damage: 10,
            attackRange: 5,
            attackSpeed: 2,
            lastAttackTime: 0,
            turn: 'player',
            playerCooldown: 0,
            bossCooldown: 0,
        },
    });

    engineStore.setGameMode('boss_battle');
    rpgStore.setActiveBossId(bossEntity.id!);
    console.log(`BOSS ENCOUNTER: ${bossData.name} appeared!`);
}
