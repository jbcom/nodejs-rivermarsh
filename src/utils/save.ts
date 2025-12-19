import { world } from '@/ecs/world';
import * as THREE from 'three';

export interface SaveData {
    version: string;
    timestamp: number;
    player: {
        position: [number, number, number];
        health: number;
        stamina: number;
    };
    world: {
        time: number;
        weather: string;
    };
    resources: {
        id: number;
        collected: boolean;
        collectedAt: number;
    }[];
}

const SAVE_KEY = 'otterfall_save';
const SAVE_VERSION = '1.0.0';

export function saveGame(playerState: {
    position: THREE.Vector3;
    health: number;
    stamina: number;
}): void {
    try {
        // Get world state from ECS
        let timeHour = 8;
        let weatherType = 'clear';

        for (const { time, weather } of world.with('time', 'weather')) {
            timeHour = time.hour;
            weatherType = weather.current;
        }

        // Get resource states
        const resources = Array.from(world.with('isResource', 'resource').entities)
            .filter(entity => entity.id !== undefined)
            .map(entity => ({
                id: entity.id!,
                collected: entity.resource?.collected || false,
                collectedAt: entity.resource?.collectedAt || 0,
            }));

        const saveData: SaveData = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            player: {
                position: [playerState.position.x, playerState.position.y, playerState.position.z],
                health: playerState.health,
                stamina: playerState.stamina,
            },
            world: {
                time: timeHour,
                weather: weatherType,
            },
            resources,
        };

        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        console.log('Game saved successfully');
    } catch (error) {
        console.error('Failed to save game:', error);
    }
}

function isValidSaveData(data: any): data is SaveData {
    if (!data || typeof data !== 'object') return false;

    // Check version and timestamp
    if (typeof data.version !== 'string' || typeof data.timestamp !== 'number') return false;

    // Check player
    if (!data.player || typeof data.player !== 'object') return false;
    if (!Array.isArray(data.player.position) || data.player.position.length !== 3) return false;
    if (data.player.position.some((n: any) => typeof n !== 'number')) return false;
    if (typeof data.player.health !== 'number' || typeof data.player.stamina !== 'number') return false;

    // Check world
    if (!data.world || typeof data.world !== 'object') return false;
    if (typeof data.world.time !== 'number' || typeof data.world.weather !== 'string') return false;

    // Check resources
    if (!Array.isArray(data.resources)) return false;
    for (const res of data.resources) {
        if (!res || typeof res !== 'object') return false;
        if (typeof res.id !== 'number' || typeof res.collected !== 'boolean' || typeof res.collectedAt !== 'number') return false;
    }

    return true;
}

export function loadGame(): SaveData | null {
    try {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (!savedData) return null;

        const data = JSON.parse(savedData);

        // Version check
        if (data.version !== SAVE_VERSION) {
            console.warn('Save data version mismatch, ignoring save');
            return null;
        }

        // Security: Validate schema to prevent loading malformed data
        if (!isValidSaveData(data)) {
            console.warn('Save data schema validation failed, ignoring save');
            return null;
        }

        return data;
    } catch (error) {
        console.error('Failed to load game:', error);
        return null;
    }
}

export function deleteSave(): void {
    try {
        localStorage.removeItem(SAVE_KEY);
        console.log('Save data deleted');
    } catch (error) {
        console.error('Failed to delete save:', error);
    }
}

export function hasSaveData(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
}
