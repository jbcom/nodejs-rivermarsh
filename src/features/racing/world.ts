import { World } from 'miniplex';
import type { Object3D } from 'three';

export type RacingEntity = {
    id?: number;

    // Components
    position?: { x: number; y: number; z: number };
    velocity?: { x: number; y: number; z: number };
    model?: { url: string; scale: number };
    three?: Object3D; // For rendering reference

    // Tags
    player?: boolean;
    obstacle?: boolean;
    collectible?: { type: 'coin' | 'gem'; value: number };

    // Game logic
    lane?: number; // -1, 0, 1
    animation?: { current: string; urls: Record<string, string> };
    collider?: { width: number; height: number; depth: number };

    // State
    destroyed?: boolean;
    collected?: boolean;
};

export const racingWorld = new World<RacingEntity>();
