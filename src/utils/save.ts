import { world } from '@/ecs/world';
import * as THREE from 'three';

export interface SaveData {
    version: string;
    timestamp: number;
    player: {
        position: [number, number, number];
        health: number;
        stamina: number;
        level: number;
        experience: number;
        mana: number;
        gold: number;
        quests: {
            active: any[];
            completed: any[];
        };
        achievements: { id: string; unlockedAt: number }[];
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

const SAVE_KEY = 'rivermarsh_save';
const SAVE_VERSION = '1.1.0';

export function saveGame(playerState: {
    position: THREE.Vector3;
    health: number;
    stamina: number;
    level: number;
    experience: number;
    mana: number;
    gold: number;
    quests: {
        active: any[];
        completed: any[];
    };
    achievements: { id: string; unlockedAt: number }[];
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
            .filter((entity) => entity.id !== undefined)
            .map((entity) => ({
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
                level: playerState.level,
                experience: playerState.experience,
                mana: playerState.mana,
                gold: playerState.gold,
                quests: playerState.quests,
                achievements: playerState.achievements,
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
    if (!data || typeof data !== 'object') {
        return false;
    }

    // Check version and timestamp
    if (typeof data.version !== 'string' || typeof data.timestamp !== 'number') {
        return false;
    }

    // Check player
    if (!data.player || typeof data.player !== 'object') {
        return false;
    }
    if (!Array.isArray(data.player.position) || data.player.position.length !== 3) {
        return false;
    }
    if (data.player.position.some((n: any) => typeof n !== 'number')) {
        return false;
    }

    // Type validation for core fields
    const numericFields = ['health', 'stamina', 'level', 'experience', 'mana', 'gold'];
    for (const field of numericFields) {
        if (data.player[field] !== undefined && typeof data.player[field] !== 'number') {
            return false;
        }
    }

    // Range validation to prevent corrupted save data
    if ((data.player.health ?? 0) < 0 || (data.player.health ?? 0) > 1000) return false;
    if ((data.player.stamina ?? 0) < 0 || (data.player.stamina ?? 0) > 1000) return false;
    if ((data.player.level ?? 1) < 1 || (data.player.level ?? 1) > 100) return false;
    if ((data.player.experience ?? 0) < 0) return false;
    if ((data.player.mana ?? 0) < 0 || (data.player.mana ?? 0) > 1000) return false;
    if ((data.player.gold ?? 0) < 0) return false;

    // Quests validation (if present)
    if (data.player.quests !== undefined) {
        if (typeof data.player.quests !== 'object') return false;
        if (!Array.isArray(data.player.quests.active) || !Array.isArray(data.player.quests.completed)) return false;
    }

    // Achievements validation (if present)
    if (data.player.achievements !== undefined) {
        if (!Array.isArray(data.player.achievements)) return false;
        for (const ach of data.player.achievements) {
            if (typeof ach !== 'string' && (typeof ach !== 'object' || typeof ach.id !== 'string')) {
                return false;
            }
        }
    }

    // Check world
    if (!data.world || typeof data.world !== 'object') {
        return false;
    }
    if (typeof data.world.time !== 'number' || typeof data.world.weather !== 'string') {
        return false;
    }

    // Check resources
    if (!Array.isArray(data.resources)) {
        return false;
    }
    for (const res of data.resources) {
        if (!res || typeof res !== 'object') {
            return false;
        }
        if (
            typeof res.id !== 'number' ||
            typeof res.collected !== 'boolean' ||
            typeof res.collectedAt !== 'number'
        ) {
            return false;
        }
    }

    return true;
}

export function loadGame(): SaveData | null {
    try {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (!savedData) {
            return null;
        }

        let data = JSON.parse(savedData);

        // Security: Validate schema to prevent loading malformed data
        if (!isValidSaveData(data)) {
            console.warn('Save data schema validation failed, ignoring save');
            return null;
        }

        // Backward compatibility / Migration
        if (data.version === '1.0.0') {
            console.log('Migrating save data from 1.0.0 to 1.1.0');
            data.version = '1.1.0';
            data.player.mana = data.player.mana ?? 20;
            data.player.gold = data.player.gold ?? 0;
            data.player.quests = data.player.quests ?? { active: [], completed: [] };
            data.player.achievements = data.player.achievements ?? [];
        }

        // Migration for achievements format (string[] -> {id, unlockedAt}[])
        if (Array.isArray(data.player.achievements) && data.player.achievements.length > 0 && typeof data.player.achievements[0] === 'string') {
            data.player.achievements = (data.player.achievements as unknown as string[]).map((id: string) => ({ id, unlockedAt: Date.now() }));
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
