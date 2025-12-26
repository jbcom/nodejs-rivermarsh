/**
 * Combat Event System
 *
 * Clean pub/sub pattern for decoupled communication between Combat and Enemy systems.
 */

import type * as THREE from 'three';

export type DamageHandler = (
    enemyId: string | number,
    damage: number,
    position?: THREE.Vector3
) => void;
export type AttackHandler = (position: THREE.Vector3, range: number, damage: number) => void;

class CombatEventBus {
    private damageHandlers: Set<DamageHandler> = new Set();
    private attackHandlers: Set<AttackHandler> = new Set();

    // Enemy system subscribes to receive damage events
    onDamageEnemy(handler: DamageHandler): () => void {
        this.damageHandlers.add(handler);
        return () => this.damageHandlers.delete(handler);
    }

    // Combat system publishes attack events
    onPlayerAttack(handler: AttackHandler): () => void {
        this.attackHandlers.add(handler);
        return () => this.attackHandlers.delete(handler);
    }

    // Called by combat system when player attacks
    emitPlayerAttack(position: THREE.Vector3, range: number, damage: number): void {
        this.attackHandlers.forEach((handler) => handler(position, range, damage));
    }

    // Called to damage a specific enemy
    emitDamageEnemy(enemyId: string | number, damage: number, position?: THREE.Vector3): void {
        this.damageHandlers.forEach((handler) => handler(enemyId, damage, position));
    }

    // Cleanup all handlers
    clear(): void {
        this.damageHandlers.clear();
        this.attackHandlers.clear();
    }
}

// Singleton instance
export const combatEvents = new CombatEventBus();
