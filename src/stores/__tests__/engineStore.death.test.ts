import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEngineStore } from '../engineStore';

// Mock the audio manager
vi.mock('@/utils/audioManager', () => ({
    getAudioManager: () => null,
}));

// Mock the save utilities
vi.mock('@/utils/save', () => ({
    saveGame: vi.fn(),
    loadGame: vi.fn(() => null),
}));

describe('GameStore - Death and Respawn', () => {
    let mockSaveGame: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        // Get the mocked saveGame function
        const saveModule = await import('@/utils/save');
        mockSaveGame = vi.mocked(saveModule.saveGame);
        mockSaveGame.mockClear();

        // Reset store to initial state
        const store = useEngineStore.getState();
        store.updatePlayer({
            position: new THREE.Vector3(0, 0, 0),
            health: 100,
            maxHealth: 100,
            stamina: 100,
            maxStamina: 100,
            verticalSpeed: 0,
            isJumping: false,
            invulnerable: false,
            invulnerableUntil: 0,
        });
        store.setGameOver(false);
    });

    describe('Death Mechanics', () => {
        it('should set gameOver to true when health reaches 0', () => {
            const { damagePlayer } = useEngineStore.getState();

            // Damage player to death
            damagePlayer(100);

            const state = useEngineStore.getState();
            expect(state.player.health).toBe(0);
            expect(state.gameOver).toBe(true);
        });

        it('should set gameOver to true when health goes below 0', () => {
            const { damagePlayer } = useEngineStore.getState();

            // Damage player beyond death
            damagePlayer(150);

            const state = useEngineStore.getState();
            expect(state.player.health).toBe(0);
            expect(state.gameOver).toBe(true);
        });

        it('should not set gameOver if health is above 0', () => {
            const { damagePlayer } = useEngineStore.getState();

            // Damage player but not to death
            damagePlayer(50);

            const state = useEngineStore.getState();
            expect(state.player.health).toBe(50);
            expect(state.gameOver).toBe(false);
        });

        it('should preserve position when player dies', () => {
            const { updatePlayer, damagePlayer } = useEngineStore.getState();
            const deathPosition = new THREE.Vector3(10, 5, 15);

            updatePlayer({ position: deathPosition });
            damagePlayer(100);

            // Position should remain at death location until respawn
            const state = useEngineStore.getState();
            expect(state.player.position.x).toBe(10);
            expect(state.player.position.y).toBe(5);
            expect(state.player.position.z).toBe(15);
        });
    });

    describe('Respawn Mechanics', () => {
        it('should reset player to spawn point (0, 0, 0)', () => {
            const { updatePlayer, respawn } = useEngineStore.getState();

            // Move player away from spawn
            updatePlayer({ position: new THREE.Vector3(50, 10, 30) });

            // Respawn
            respawn();

            const state = useEngineStore.getState();
            expect(state.player.position.x).toBe(0);
            expect(state.player.position.y).toBe(0);
            expect(state.player.position.z).toBe(0);
        });

        it('should reset health to maxHealth', () => {
            const { damagePlayer, respawn } = useEngineStore.getState();

            // Damage player
            damagePlayer(80);
            expect(useEngineStore.getState().player.health).toBe(20);

            // Respawn
            respawn();

            expect(useEngineStore.getState().player.health).toBe(100);
        });

        it('should reset stamina to maxStamina', () => {
            const { consumeStamina, respawn } = useEngineStore.getState();

            // Consume stamina
            consumeStamina(60);
            expect(useEngineStore.getState().player.stamina).toBe(40);

            // Respawn
            respawn();

            expect(useEngineStore.getState().player.stamina).toBe(100);
        });

        it('should reset gameOver to false', () => {
            const { damagePlayer, respawn } = useEngineStore.getState();

            // Kill player
            damagePlayer(100);
            expect(useEngineStore.getState().gameOver).toBe(true);

            // Respawn
            respawn();

            expect(useEngineStore.getState().gameOver).toBe(false);
        });

        it('should reset vertical speed to 0', () => {
            const { updatePlayer, respawn } = useEngineStore.getState();

            // Set vertical speed (falling)
            updatePlayer({ verticalSpeed: -5 });

            // Respawn
            respawn();

            expect(useEngineStore.getState().player.verticalSpeed).toBe(0);
        });

        it('should reset isJumping to false', () => {
            const { updatePlayer, respawn } = useEngineStore.getState();

            // Set jumping state
            updatePlayer({ isJumping: true });

            // Respawn
            respawn();

            expect(useEngineStore.getState().player.isJumping).toBe(false);
        });

        it('should work with custom maxHealth', () => {
            const { updatePlayer, respawn } = useEngineStore.getState();

            // Set custom max health
            updatePlayer({ maxHealth: 150, health: 30 });

            // Respawn
            respawn();

            expect(useEngineStore.getState().player.health).toBe(150);
        });

        it('should work with custom maxStamina', () => {
            const { updatePlayer, respawn } = useEngineStore.getState();

            // Set custom max stamina
            updatePlayer({ maxStamina: 200, stamina: 50 });

            // Respawn
            respawn();

            expect(useEngineStore.getState().player.stamina).toBe(200);
        });
    });

    describe('Save Data Preservation', () => {
        it('should allow saving game state before death', () => {
            const store = useEngineStore.getState();

            // Move player and modify stats
            store.updatePlayer({
                position: new THREE.Vector3(25, 3, 40),
                health: 75,
                stamina: 60,
            });

            // Save game
            store.saveGame();

            // Verify save was called with correct data
            expect(mockSaveGame).toHaveBeenCalledWith({
                position: expect.objectContaining({
                    x: 25,
                    y: 3,
                    z: 40,
                }),
                health: 75,
                stamina: 60,
                level: 1,
                experience: 0,
                mana: 20,
                gold: 0,
            });
        });

        it('should allow saving after respawn', () => {
            const store = useEngineStore.getState();

            // Kill and respawn player
            store.damagePlayer(100);
            store.respawn();

            // Save game after respawn
            store.saveGame();

            // Verify save was called with respawn state
            expect(mockSaveGame).toHaveBeenCalledWith({
                position: expect.objectContaining({
                    x: 0,
                    y: 0,
                    z: 0,
                }),
                health: 100,
                stamina: 100,
                level: 1,
                experience: 0,
                mana: 20,
                gold: 0,
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple respawns', () => {
            const store = useEngineStore.getState();

            // First death and respawn
            store.damagePlayer(100);
            store.respawn();

            // Move and die again
            store.updatePlayer({ position: new THREE.Vector3(20, 0, 20) });
            store.damagePlayer(100);
            store.respawn();

            // Should still respawn at origin
            expect(store.player.position.x).toBe(0);
            expect(store.player.position.y).toBe(0);
            expect(store.player.position.z).toBe(0);
            expect(store.player.health).toBe(100);
            expect(store.player.stamina).toBe(100);
            expect(useEngineStore.getState().gameOver).toBe(false);
        });

        it('should handle respawn without prior death', () => {
            const store = useEngineStore.getState();

            // Respawn without dying
            store.updatePlayer({ position: new THREE.Vector3(15, 2, 10) });
            store.respawn();

            // Should still work correctly
            expect(store.player.position.x).toBe(0);
            expect(store.player.position.y).toBe(0);
            expect(store.player.position.z).toBe(0);
            expect(store.player.health).toBe(100);
            expect(store.player.stamina).toBe(100);
        });

        it('should handle respawn with partial health', () => {
            const store = useEngineStore.getState();

            // Damage player partially
            store.damagePlayer(40);

            // Get updated state after damage
            const stateAfterDamage = useEngineStore.getState();
            expect(stateAfterDamage.player.health).toBe(60);

            // Respawn
            store.respawn();

            // Should restore to full health
            const stateAfterRespawn = useEngineStore.getState();
            expect(stateAfterRespawn.player.health).toBe(100);
        });
    });
});
