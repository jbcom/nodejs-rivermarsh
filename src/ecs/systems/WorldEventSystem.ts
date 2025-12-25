import * as THREE from 'three';
import { world } from '../world';
import { useAchievementStore } from '../../stores/useAchievementStore';
import { useGameStore } from '../../stores/gameStore';
import { useRivermarsh } from '../../stores/useRivermarsh';
import { BOSSES } from '../data/bosses';

const POSSIBLE_EVENTS = [
    'blood_moon',
    'golden_hour',
    'meteor_shower',
    'foggy_morning',
    'boss_encounter'
];

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
                    const { setMode, setActiveBossId } = useGameStore.getState();
                    const { setGameMode } = useRivermarsh.getState();
                    setMode('exploration');
                    setGameMode('exploration');
                    setActiveBossId(null);
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
            if (newEvent === 'blood_moon' && time.phase !== 'night') canStart = false;
            if (newEvent === 'golden_hour' && time.phase !== 'dusk') canStart = false;
            if (newEvent === 'foggy_morning' && time.phase !== 'dawn') canStart = false;

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
                // If it's time for an event but conditions aren't met, we might want to pick another one
                // but for now let's just wait.
                worldEvents.nextEventTime = now + 10000; // Check again in 10s
            }
        }

        // Apply event effects to global state
        if (worldEvents.activeEvents.includes('blood_moon')) {
            time.ambientLight = 0.1; // Darker red-ish moon
            // Other systems (like AI) should check for blood_moon to increase difficulty
        }
        
        if (worldEvents.activeEvents.includes('foggy_morning')) {
            time.fogDensity = 0.15; // Very thick fog
        }
    }
}

import { useRivermarsh } from '../../stores/useRivermarsh';

function triggerBossEncounter() {
    const { setMode: setGameMode, setActiveBossId, player } = useGameStore.getState();
    const { setGameMode: setRivermarshMode } = useRivermarsh.getState();
    
    // Check if a boss already exists
    const existingBoss = world.with('isBoss').entities[0];
    if (existingBoss) {
        console.log('Boss already exists, skipping spawn');
        return;
    }

    // Pick a boss based on player level
    const bossTypes: ('dread_hydra' | 'shadow_golem' | 'chaos_drake')[] = ['dread_hydra', 'shadow_golem', 'chaos_drake'];
    const bossType = bossTypes[Math.min(player.level - 1, bossTypes.length - 1)];
    const bossData = BOSSES[bossType];

    // Create boss entity
    const bossEntity = world.add({
        isBoss: true,
        transform: {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Quaternion(),
            scale: new THREE.Vector3(2, 2, 2)
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
            state: 'idle'
        },
        boss: {
            type: bossType,
            specialAbilityCooldown: 3,
            phase: 1,
            rewards: bossData.rewards,
            isBossBattleActive: true
        },
        combat: {
            turn: 'player',
            playerCooldown: 0,
            bossCooldown: 0
        }
    });

    setGameMode('boss_battle');
    setRivermarshMode('boss_battle');
    setActiveBossId(bossEntity.id!);
    console.log(`BOSS ENCOUNTER: ${bossData.name} appeared!`);
}
