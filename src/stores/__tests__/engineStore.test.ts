import * as THREE from 'three';
import { beforeEach, describe, expect, it } from 'vitest';
import { useEngineStore } from '../engineStore';

describe('EngineStore', () => {
    beforeEach(() => {
        useEngineStore.getState().resetEngine();
    });

    it('should initialize with default state', () => {
        const state = useEngineStore.getState();
        expect(state.gameOver).toBe(false);
        expect(state.isPaused).toBe(false);
        expect(state.player.position).toBeInstanceOf(THREE.Vector3);
    });

    it('should update player physics', () => {
        const newPos = new THREE.Vector3(1, 2, 3);
        useEngineStore.getState().updatePlayerPhysics({ position: newPos });
        expect(useEngineStore.getState().player.position).toEqual(newPos);
    });

    it('should set game mode', () => {
        useEngineStore.getState().setGameMode('racing');
        expect(useEngineStore.getState().gameMode).toBe('racing');
    });
});
