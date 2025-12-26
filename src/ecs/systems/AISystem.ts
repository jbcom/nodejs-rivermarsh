/**
 * AISystem - Production-quality AI using Yuka library
 *
 * This system provides:
 * - Battle-tested steering behaviors (Wander, Seek, Flee, Separation, ObstacleAvoidance)
 * - State machine with proper enter/execute/exit lifecycle
 * - CellSpacePartitioning for efficient neighbor queries
 * - Proper integration with Miniplex ECS
 *
 * @see https://github.com/Mugen87/yuka
 */

import * as THREE from 'three';
import { StateMachine } from 'yuka';
import { world } from '../world';
import {
    AttackState,
    ChaseState,
    FleeState,
    IdleState,
    STATE_ATTACK,
    STATE_CHASE,
    STATE_FLEE,
    STATE_IDLE,
    STATE_WANDER,
    WanderState,
} from './ai/states';
import {
    disposeYukaManager,
    getYukaManager,
    initYukaManager,
    type NPCVehicle,
} from './ai/YukaManager';

// Rate limiting - AI doesn't need to run every frame
const AI_UPDATE_RATE = 20; // Hz
const AI_UPDATE_INTERVAL = 1 / AI_UPDATE_RATE;
let aiAccumulator = 0;
let initialized = false;

/**
 * Set up the state machine for an NPC vehicle
 */
function setupStateMachine(vehicle: NPCVehicle): void {
    const stateMachine = new StateMachine(vehicle);

    // Register all states
    stateMachine.add(STATE_IDLE, new IdleState());
    stateMachine.add(STATE_WANDER, new WanderState());
    stateMachine.add(STATE_FLEE, new FleeState());
    stateMachine.add(STATE_CHASE, new ChaseState());
    stateMachine.add(STATE_ATTACK, new AttackState());

    // Start in idle state
    stateMachine.changeTo(STATE_IDLE);

    vehicle.stateMachine = stateMachine;
}

/**
 * Add obstacle avoidance behavior to a vehicle
 * Note: This is called after initial state machine setup, so behaviors
 * will be added/removed by state transitions. We store obstacles for later use.
 */
function addObstacleAvoidance(_vehicle: NPCVehicle): void {
    // Obstacle avoidance is managed by the state machine
    // The YukaManager stores obstacles that states can access
    // This function is a placeholder for future obstacle registration
}

/**
 * Register all existing entities with Yuka
 */
function registerExistingEntities(): void {
    const manager = getYukaManager();

    // Register NPCs
    for (const entity of world.with('isNPC', 'transform', 'movement', 'species', 'steering')) {
        const vehicle = manager.registerNPC(entity, setupStateMachine);
        if (vehicle) {
            addObstacleAvoidance(vehicle);
        }
    }

    // Register Player
    for (const entity of world.with('isPlayer', 'transform', 'movement', 'species')) {
        manager.registerNPC(entity);
    }
}

/**
 * Register any new NPCs or the player with Yuka
 */
function registerNewEntities(): void {
    const manager = getYukaManager();

    // Register NPCs
    for (const entity of world.with('isNPC', 'transform', 'movement', 'species', 'steering')) {
        if (entity.id && !manager.getVehicle(entity.id)) {
            const vehicle = manager.registerNPC(entity, setupStateMachine);
            if (vehicle) {
                addObstacleAvoidance(vehicle);
            }
        }
    }

    // Register Player
    for (const entity of world.with('isPlayer', 'transform', 'movement', 'species')) {
        if (entity.id && !manager.getVehicle(entity.id)) {
            // Player doesn't need a state machine, it's controlled by the user
            manager.registerNPC(entity);
        }
    }
}

/**
 * Main AI system update function
 */
export function AISystem(delta: number): void {
    // Rate limiting - accumulate time
    aiAccumulator += delta;

    if (aiAccumulator < AI_UPDATE_INTERVAL) {
        return; // Skip this frame
    }

    // Initialize on first run
    if (!initialized) {
        initYukaManager();
        registerExistingEntities();
        initialized = true;
    }

    // Register any new NPCs or player added since last frame
    registerNewEntities();

    // Update Yuka (handles all steering behaviors and state machines)
    const manager = getYukaManager();
    manager.update(AI_UPDATE_INTERVAL);

    // Sync Yuka positions back to Miniplex entities
    manager.syncToMiniplex();

    // Sync Player position TO Yuka (so NPCs can track it)
    for (const entity of world.with('isPlayer', 'transform')) {
        const vehicle = manager.getVehicle(entity.id!);
        if (vehicle) {
            vehicle.position.set(
                entity.transform.position.x,
                entity.transform.position.y,
                entity.transform.position.z
            );
        }
    }

    // Reset accumulator (consume one interval)
    aiAccumulator -= AI_UPDATE_INTERVAL;
}

/**
 * Initialize the AI system (call once at startup)
 */
export function initAISystem(): void {
    if (!initialized) {
        initYukaManager();
        registerExistingEntities();
        initialized = true;
    }
}

/**
 * Dispose of the AI system and all resources
 */
export function disposeAISystem(): void {
    disposeYukaManager();
    initialized = false;
    aiAccumulator = 0;
}

/**
 * Register an obstacle for avoidance (e.g., rocks, trees)
 */
export function registerObstacle(
    position: { x: number; y: number; z: number },
    radius: number
): void {
    const manager = getYukaManager();
    const threePos = new THREE.Vector3(position.x, position.y, position.z);
    manager.registerObstacle(threePos, radius);
}

/**
 * Clear all obstacles
 */
export function clearObstacles(): void {
    getYukaManager().clearObstacles();
}

// Re-export for use by other systems
export { getYukaManager, NPCVehicle } from './ai/YukaManager';
