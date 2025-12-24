import { world } from '../world';
import { useGameStore } from '@/stores/gameStore';
import * as THREE from 'three';
import { PREDATOR_SPECIES } from '../data/species';

// Track cursed players to remove debuff later
const CURSE_DURATION = 5000; // 5 seconds
let curseTimer = 0;
let playerIsCursed = false;

/**
 * EnemyEffectsSystem handles special behaviors for specific enemy types:
 * - Rage (Orc): Increased damage when health is low (<30%)
 * - Split (Slime): Spawns 2 smaller slimes on death
 * - Curse (Wraith): Temporarily reduces player movement speed on hit
 */
export function EnemyEffectsSystem(delta: number) {
    // 1. Handle Rage (Orc)
    for (const entity of world.with('isNPC', 'species', 'enemyEffect', 'combat')) {
        if (entity.enemyEffect.type === 'rage') {
            const healthPercent = entity.species.health / entity.species.maxHealth;
            if (healthPercent < 0.3 && !entity.enemyEffect.active) {
                // Activate rage
                entity.enemyEffect.active = true;
                entity.combat.damage *= (entity.enemyEffect.value || 1.5);
                console.log(`${entity.species.name} is RAGING! Damage increased.`);
            } else if (healthPercent >= 0.3 && entity.enemyEffect.active) {
                // Deactivate rage (if healed)
                entity.combat.damage /= (entity.enemyEffect.value || 1.5);
                entity.enemyEffect.active = false;
            }
        }
    }

    // 2. Handle Curse Timer
    if (playerIsCursed) {
        curseTimer -= delta * 1000;
        if (curseTimer <= 0) {
            playerIsCursed = false;
            useGameStore.getState().updatePlayer({ speedMultiplier: 1.0 });
            console.log("Curse has lifted!");
        }
    }

    // 3. Handle Split (Slime)
    // Check for slimes that have just died
    for (const entity of world.with('isNPC', 'species', 'enemyEffect', 'transform')) {
        if (entity.enemyEffect.type === 'split' && entity.species.state === 'dead' && entity.enemyEffect.active) {
            // Mark as already split (using 'active' as a 'ready to split' flag, set it to false after split)
            entity.enemyEffect.active = false;
            
            // Spawn 2 smaller slimes
            const pos = entity.transform.position;
            const splitLevel = (entity.enemyEffect.value || 2);
            
            if (splitLevel > 0) {
                spawnSmallSlimes(pos, splitLevel - 1, entity.species.id);
                console.log(`${entity.species.name} split into 2 smaller slimes!`);
            }
        }
    }
}

/**
 * Spawns smaller versions of a slime
 */
function spawnSmallSlimes(position: THREE.Vector3, nextSplitLevel: number, speciesId: string) {
    const speciesData = PREDATOR_SPECIES[speciesId as keyof typeof PREDATOR_SPECIES];
    if (!speciesData) return;

    for (let i = 0; i < 2; i++) {
        const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            0,
            (Math.random() - 0.5) * 2
        );
        const spawnPos = position.clone().add(offset);

        world.add({
            isNPC: true,
            transform: {
                position: spawnPos,
                rotation: new THREE.Quaternion(),
                scale: new THREE.Vector3(0.6, 0.6, 0.6), // Smaller scale
            },
            movement: {
                velocity: new THREE.Vector3(),
                acceleration: new THREE.Vector3(),
                maxSpeed: speciesData.runSpeed * 1.2, // Faster but smaller
                turnRate: 0.15,
            },
            species: {
                id: speciesId,
                name: `Small ${speciesData.name}`,
                type: 'predator',
                health: speciesData.baseHealth * 0.5,
                maxHealth: speciesData.baseHealth * 0.5,
                stamina: 100,
                maxStamina: 100,
                speed: speciesData.walkSpeed * 1.2,
                state: 'idle',
            },
            combat: {
                damage: Math.max(1, ((speciesData as any).damage || 5) * 0.5),
                attackRange: 1.5,
                attackSpeed: 1.0,
                lastAttackTime: 0,
            },
            enemyEffect: {
                type: 'split',
                active: nextSplitLevel > 0, // Can split again if level > 0
                value: nextSplitLevel,
            },
            steering: {
                target: null,
                awarenessRadius: speciesData.awarenessRadius * 0.8,
                wanderAngle: Math.random() * Math.PI * 2,
                wanderTimer: Math.random() * 3,
            },
        });
    }
}

/**
 * Applies the curse effect to the player
 */
export function applyCurse() {
    if (!playerIsCursed) {
        playerIsCursed = true;
        curseTimer = CURSE_DURATION;
        useGameStore.getState().updatePlayer({ speedMultiplier: 0.5 }); // Slow down player (50%)
        console.log("You have been CURSED! Movement speed reduced.");
    } else {
        curseTimer = CURSE_DURATION; // Refresh curse duration
    }
}
