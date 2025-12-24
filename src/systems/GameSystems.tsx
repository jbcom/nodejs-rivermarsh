import { useGameStore } from '@/stores/gameStore';
import { getAdaptiveQualityManager } from '@/utils/adaptiveQuality';
import { getMemoryMonitor } from '@/utils/memoryMonitor';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { AISystem } from '../ecs/systems/AISystem';
import { BiomeSystem } from '../ecs/systems/BiomeSystem';
import { CollisionSystem } from '../ecs/systems/CollisionSystem';
import { ResourceSystem } from '../ecs/systems/ResourceSystem';
import { SpawnSystem } from '../ecs/systems/SpawnSystem';
import { TimeSystem } from '../ecs/systems/TimeSystem';
import { WeatherSystem } from '../ecs/systems/WeatherSystem';
import { WorldEventSystem } from '../ecs/systems/WorldEventSystem';
import { AchievementSystem } from '../ecs/systems/AchievementSystem';
import { AudioSystem } from './AudioSystem';
import { world } from '../ecs/world';

export function GameSystems() {
    const playerPos = useGameStore((s) => s.player.position);
    const qualityManager = useRef(getAdaptiveQualityManager());
    const memoryMonitor = useRef(getMemoryMonitor());
    const lastQualityCheck = useRef(0);
    const lastMemoryCheck = useRef(0);

    useFrame((_, delta) => {
        // Sync difficulty from Zustand to ECS
        const currentDifficulty = useGameStore.getState().difficulty;
        const worldEntity = world.with('difficulty').entities[0];
        if (worldEntity && worldEntity.difficulty.level !== currentDifficulty) {
            worldEntity.difficulty.level = currentDifficulty;
            // Update multipliers based on level
            const settings = {
                easy: { spawnRate: 0.7, damage: 0.5, health: 0.8, exp: 1.2 },
                normal: { spawnRate: 1.0, damage: 1.0, health: 1.0, exp: 1.0 },
                hard: { spawnRate: 1.3, damage: 1.5, health: 1.2, exp: 0.8 },
                legendary: { spawnRate: 1.6, damage: 2.5, health: 1.5, exp: 0.6 }
            }[currentDifficulty];
            
            worldEntity.difficulty.spawnRateMultiplier = settings.spawnRate;
            worldEntity.difficulty.damageMultiplier = settings.damage;
            worldEntity.difficulty.healthMultiplier = settings.health;
            worldEntity.difficulty.experienceMultiplier = settings.exp;
            
            console.log(`Difficulty changed to ${currentDifficulty}`, worldEntity.difficulty);
        }

        // Monitor frame time for adaptive quality
        const frameTimeMs = delta * 1000;
        qualityManager.current.recordFrameTime(frameTimeMs);

        // Check quality every 60 frames (~1 second)
        lastQualityCheck.current++;
        if (lastQualityCheck.current >= 60) {
            const changed = qualityManager.current.updateQuality();
            if (changed) {
                const settings = qualityManager.current.getSettings();
                console.log('Adaptive quality adjusted:', settings);
            }
            lastQualityCheck.current = 0;
        }

        // Check memory every 300 frames (~5 seconds)
        lastMemoryCheck.current++;
        if (lastMemoryCheck.current >= 300) {
            const gcTriggered = memoryMonitor.current.checkAndCleanup();
            if (gcTriggered) {
                console.log('Memory cleanup triggered');
            }
            lastMemoryCheck.current = 0;
        }

        // Run ECS systems in order
        TimeSystem(delta);
        WeatherSystem(delta);
        WorldEventSystem();
        BiomeSystem(playerPos.x, playerPos.z);
        SpawnSystem(playerPos);
        AISystem(delta);
        CollisionSystem(delta);
        ResourceSystem(playerPos, delta);
        AchievementSystem();
    });

    return <AudioSystem />;
}
