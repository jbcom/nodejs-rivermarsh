import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { FollowCamera } from '@/components/Camera';
import { Combat, GameUI, NPCManager, BossBattleEffects } from '@/components/game';
import {
    GyroscopeCamera,
    MobileActionButtons,
    SwipeGestures,
    VirtualJoysticks,
} from '@/components/mobile';
import { NPCs } from '@/components/NPCs';
import { Player } from '@/components/Player';
import { Resources } from '@/components/Resources';
import { TapToCollect } from '@/components/TapToCollect';
import { AchievementOverlay } from '@/components/ui/AchievementOverlay';
import { EventOverlay } from '@/components/ui/EventOverlay';
import { GameOver } from '@/components/ui/GameOver';
import { HUD } from '@/components/ui/HUD';
import { Loader } from '@/components/ui/Loader';
import { Tutorial } from '@/components/ui/Tutorial';
import { BossBattleOverlay } from '@/components/ui/BossBattleOverlay';
import { VolumetricEffects } from '@/components/VolumetricEffects';
import { World } from '@/components/World';
import { useMobileConstraints } from '@/hooks/useMobileConstraints';
import { GameSystems } from '@/systems/GameSystems';
import { InputZone, useInput } from '@/systems/input';
import { initTestHooks, setGameReady } from '@/utils/testHooks';
import { RacingScene } from '@/features/racing/RacingScene';
import { useRPGStore } from '@/stores/rpgStore';
import { BasicStrataExample } from '../examples/BasicStrata';
import { WeatherExample } from '../examples/WeatherSystem';

// Initialize test hooks for E2E testing
initTestHooks();

interface SceneProps {
    useMobileControls?: boolean;
    useRPGStoreFeatures?: boolean;
}

function Scene({ useMobileControls = false, useRPGStoreFeatures = false }: SceneProps) {
    useInput();

    // Mark game as ready after first frame
    useEffect(() => {
        const timer = setTimeout(() => setGameReady(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <GameSystems />

            {/* Physics world wraps all physical objects */}
            <Physics gravity={[0, -15, 0]} timeStep="vary">
                <World />
                <Player />
                <NPCs />
                <Resources />
                <Combat />

                {/* Rivermarsh NPC system - spawns story NPCs */}
                {useRPGStoreFeatures && <NPCManager />}
                {useRPGStoreFeatures && <BossBattleEffects />}
            </Physics>

            {/* Use gyroscope camera on mobile, follow camera on desktop */}
            {useMobileControls ? <GyroscopeCamera /> : <FollowCamera />}
            <TapToCollect />

            {/* Volumetric effects for fog and underwater */}
            <VolumetricEffects
                enableFog={true}
                enableUnderwater={true}
                fogSettings={{
                    color: new THREE.Color(0.6, 0.7, 0.8),
                    density: 0.015,
                    height: 5,
                }}
                underwaterSettings={{
                    color: new THREE.Color(0.0, 0.25, 0.4),
                    density: 0.08,
                    causticStrength: 0.4,
                    waterSurface: 0,
                }}
            />
        </>
    );
}

export default function App() {
    const constraints = useMobileConstraints();
    const [currentExample, setCurrentExample] = useState<'basic' | 'weather'>('basic');
    // Rivermarsh features enabled by default - can be toggled in settings later
    const rivermarshEnabled = true;
    const gameMode = useRPGStore((state) => state.gameMode);
    const setGameMode = useRPGStore((state) => state.setGameMode);

    if (gameMode === 'examples') {
        return (
            <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
                {currentExample === 'basic' ? <BasicStrataExample /> : <WeatherExample />}
                <div
                    style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        zIndex: 1000,
                        display: 'flex',
                        gap: '10px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '2px solid rgba(139, 105, 20, 0.8)',
                        fontFamily: 'Inter, sans-serif',
                    }}
                >
                    <button
                        style={{
                            background:
                                currentExample === 'basic' ? '#DAA520' : 'rgba(255,255,255,0.1)',
                            color: currentExample === 'basic' ? '#000' : '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                        onClick={() => setCurrentExample('basic')}
                    >
                        Basic Strata
                    </button>
                    <button
                        style={{
                            background:
                                currentExample === 'weather' ? '#DAA520' : 'rgba(255,255,255,0.1)',
                            color: currentExample === 'weather' ? '#000' : '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                        onClick={() => setCurrentExample('weather')}
                    >
                        Weather System
                    </button>
                    <button
                        style={{
                            background: '#8b0000',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                        onClick={() => setGameMode('exploration')}
                    >
                        Back to Game
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Canvas
                shadows
                camera={{ fov: 50, near: 0.1, far: 500, position: [0, 3.5, -5] }}
                gl={{
                    antialias: false,
                    powerPreference: 'high-performance',
                }}
                dpr={[1, 1.5]}
                style={{ background: '#0a0808' }}
            >
                {gameMode === 'racing' ? (
                    <RacingScene />
                ) : (
                    <Scene
                        useMobileControls={constraints.isMobile}
                        useRPGStoreFeatures={rivermarshEnabled}
                    />
                )}
            </Canvas>

            {(gameMode === 'exploration' || gameMode === 'boss_battle') && (
                <>
                    {/* Mobile controls - virtual joystick and action buttons */}
                    {constraints.isMobile && (
                        <>
                            <VirtualJoysticks />
                            <MobileActionButtons />
                            <SwipeGestures />
                        </>
                    )}

                    <InputZone />
                    <HUD />
                    <AchievementOverlay />
                    <EventOverlay />

                    {/* Rivermarsh game UI - inventory, quests, dialogue */}
                    {rivermarshEnabled && <GameUI />}

                    <GameOver />
                    <Loader />
                    <Tutorial />
                    <BossBattleOverlay />
                </>
            )}
        </>
    );
}
