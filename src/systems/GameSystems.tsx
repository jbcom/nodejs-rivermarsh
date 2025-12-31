import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useEngineStore, useRPGStore } from '@/stores';
import { getAdaptiveQualityManager } from '@/utils/adaptiveQuality';
import { getMemoryMonitor } from '@/utils/memoryMonitor';
import { AchievementSystem } from '../ecs/systems/AchievementSystem';
import { AISystem } from '../ecs/systems/AISystem';
import { BiomeSystem } from '../ecs/systems/BiomeSystem';
import { BossBattleSystem } from '../ecs/systems/BossBattleSystem';
import { CollisionSystem } from '../ecs/systems/CollisionSystem';
import { CombatSystem } from '../ecs/systems/CombatSystem';
import { EnemyEffectsSystem } from '../ecs/systems/EnemyEffectsSystem';
import { PlayerSyncSystem } from '../ecs/systems/PlayerSyncSystem';
import { ResourceSystem } from '../ecs/systems/ResourceSystem';
import { SpawnSystem } from '../ecs/systems/SpawnSystem';
import { TimeSystem } from '../ecs/systems/TimeSystem';
import { WeatherSystem } from '../ecs/systems/WeatherSystem';
import { WorldEventSystem } from '../ecs/systems/WorldEventSystem';
import { world } from '../ecs/world';
import { AudioSystem } from './AudioSystem';

/**
 * GameSystems - Orchestrates ECS systems and store updates.
 * Optimized for performance by segregating store access and ordering systems logically.
 */
export function GameSystems() {
    // Engine state selectors
    const playerPos = useEngineStore((s) => s.player.position);
    const updateTime = useEngineStore((s) => s.updateTime);
    
    // Performance monitors
    const qualityManager = useRef(getAdaptiveQualityManager());
    const memoryMonitor = useRef(getMemoryMonitor());
    const lastQualityCheck = useRef(0);
    const lastMemoryCheck = useRef(0);

    useFrame((_, delta) => {
        // 1. Sync RPG settings to ECS (Low frequency)
        const currentDifficulty = useRPGStore.getState().difficulty;
        const worldEntity = world.with('difficulty').entities[0];
        if (worldEntity && worldEntity.difficulty.level !== currentDifficulty) {
            worldEntity.difficulty.level = currentDifficulty;
            const settings: Record<string, any> = {
                easy: { spawnRate: 0.7, damage: 0.5, health: 0.8, exp: 1.2 },
                normal: { spawnRate: 1.0, damage: 1.0, health: 1.0, exp: 1.0 },
                hard: { spawnRate: 1.3, damage: 1.5, health: 1.2, exp: 0.8 },
                legendary: { spawnRate: 1.6, damage: 2.5, health: 1.5, exp: 0.6 },
            };
            const currentSettings = settings[currentDifficulty] || settings.normal;
            worldEntity.difficulty.spawnRateMultiplier = currentSettings.spawnRate;
            worldEntity.difficulty.damageMultiplier = currentSettings.damage;
            worldEntity.difficulty.healthMultiplier = currentSettings.health;
            worldEntity.difficulty.experienceMultiplier = currentSettings.exp;
        }

        // 2. Performance Monitoring
        const frameTimeMs = delta * 1000;
        qualityManager.current.recordFrameTime(frameTimeMs);

        lastQualityCheck.current++;
        if (lastQualityCheck.current >= 60) {
            qualityManager.current.updateQuality();
            lastQualityCheck.current = 0;
        }

        lastMemoryCheck.current++;
        if (lastMemoryCheck.current >= 300) {
            memoryMonitor.current.checkAndCleanup();
            lastMemoryCheck.current = 0;
        }

        // 3. High-Priority Physics & Sync
        // Always sync player first so other systems use latest position
        PlayerSyncSystem(); 
        
        // 4. Time & Environment
        updateTime(delta); // Store update
        TimeSystem(delta); // ECS update
        WeatherSystem(delta);
        BiomeSystem(playerPos.x, playerPos.z);
        
        // 5. Logic & AI
        AISystem(delta);
        CollisionSystem(delta);
        CombatSystem();
        EnemyEffectsSystem(delta);
        
        // 6. World State & Spawning
        WorldEventSystem();
        SpawnSystem(playerPos);
        ResourceSystem(playerPos, delta);
        BossBattleSystem();
        
        // 7. Meta / Rewards
        AchievementSystem();
    });

    return <AudioSystem />;
}
