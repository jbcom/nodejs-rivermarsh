import type * as THREE from 'three';
import { world } from '@/ecs/world';
import type { Quest } from '@/stores/rpgStore';
import type { Achievement } from '@/stores/useAchievementStore';

export interface SaveData {
    version: string;
    timestamp: number;
    player: {
        position: [number, number, number];
        health: number;
        stamina: number;
        level: number;
        experience: number;
        mana?: number;
        gold?: number;
        activeQuests?: Quest[];
        completedQuests?: Quest[];
        achievements?: Achievement[];
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
export const SAVE_VERSION = '1.1.0';
const SUPPORTED_VERSIONS = ['1.0.0', '1.1.0'];

export function saveGame(playerState: {
    position: THREE.Vector3;
    health: number;
    stamina: number;
    level: number;
    experience: number;
    mana: number;
    gold: number;
    activeQuests: Quest[];
    completedQuests: Quest[];
    achievements: Achievement[];
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
                activeQuests: playerState.activeQuests,
                completedQuests: playerState.completedQuests,
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

    // Type validation for optional fields (backward compatibility)
    const optionalNumberFields = ['health', 'stamina', 'level', 'experience', 'mana', 'gold'];
    for (const field of optionalNumberFields) {
        if (data.player[field] !== undefined && typeof data.player[field] !== 'number') {
            return false;
        }
    }

    // New RPG fields validation
    if (data.player.activeQuests !== undefined) {
        if (!Array.isArray(data.player.activeQuests)) return false;
        for (const quest of data.player.activeQuests) {
            if (!quest || typeof quest.id !== 'string' || typeof quest.status !== 'string') return false;
        }
    }
    if (data.player.completedQuests !== undefined) {
        if (!Array.isArray(data.player.completedQuests)) return false;
        for (const quest of data.player.completedQuests) {
            if (!quest || typeof quest.id !== 'string' || quest.status !== 'completed') return false;
        }
    }
    if (data.player.achievements !== undefined) {
        if (!Array.isArray(data.player.achievements)) return false;
        for (const achievement of data.player.achievements) {
            if (!achievement || typeof achievement.id !== 'string' || (achievement.unlockedAt !== null && typeof achievement.unlockedAt !== 'number')) return false;
        }
    }

    // Range validation to prevent corrupted save data
    if (data.player.health !== undefined && data.player.health < 0) {
        return false;
    }
    if (data.player.stamina !== undefined && data.player.stamina < 0) {
        return false;
    }
    if (data.player.level !== undefined && data.player.level < 1) {
        return false;
    }
    if (data.player.experience !== undefined && data.player.experience < 0) {
        return false;
    }
    if (data.player.mana !== undefined && data.player.mana < 0) {
        return false;
    }
    if (data.player.gold !== undefined && data.player.gold < 0) {
        return false;
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

        const data = JSON.parse(savedData);

        // Version check with backward compatibility
        if (!SUPPORTED_VERSIONS.includes(data.version)) {
            console.warn(`Unsupported save data version: ${data.version}. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`);
            return null;
        }

        // Security: Validate schema to prevent loading malformed data
        if (!isValidSaveData(data)) {
            console.warn('Save data schema validation failed, ignoring save');
            return null;
        }

        // Ensure defaults for backward compatibility (1.0.0 -> 1.1.0)
        if (data.version === '1.0.0') {
            data.player.mana = data.player.mana ?? 20;
            data.player.gold = data.player.gold ?? 0;
            data.player.activeQuests = data.player.activeQuests ?? [];
            data.player.completedQuests = data.player.completedQuests ?? [];
            data.player.achievements = data.player.achievements ?? [];
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
