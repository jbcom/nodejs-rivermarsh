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
import { MainMenu } from '@/components/ui/MainMenu';
import { Tutorial } from '@/components/ui/Tutorial';
import { BossBattleOverlay } from '@/components/ui/BossBattleOverlay';
import { VolumetricEffects } from '@/components/VolumetricEffects';
import { World } from '@/components/World';
import { useMobileConstraints } from '@/hooks/useMobileConstraints';
import { GameSystems } from '@/systems/GameSystems';
import { InputZone, useInput } from '@/systems/input';
import { initTestHooks, setGameReady } from '@/utils/testHooks';
import { RacingScene } from '@/features/racing/RacingScene';
import { useGameStore } from '@/stores/gameStore';
import { AchievementEffects } from '@/components/game/AchievementEffects';
import { BasicStrataExample } from '../examples/BasicStrata';
import { WeatherExample } from '../examples/WeatherSystem';

interface SceneProps {
    useMobileControls?: boolean;
}

function Scene({ useMobileControls = false }: SceneProps) {
    const constraints = useMobileConstraints();
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
                <NPCManager />
                <BossBattleEffects />
                <AchievementEffects />
            </Physics>

            {/* Use gyroscope camera on mobile, follow camera on desktop */}
            {useMobileControls ? <GyroscopeCamera /> : <FollowCamera />}
            <TapToCollect />

            {/* Volumetric effects for fog and underwater */}
            <VolumetricEffects
                enableFog={!constraints.isMobile || constraints.isTablet}
                enableUnderwater={true}
                fogSettings={{
                    color: new THREE.Color(0.6, 0.7, 0.8),
                    density: constraints.isMobile ? 0.005 : 0.015,
                    height: constraints.isMobile ? 3 : 5,
                }}
                underwaterSettings={{
                    color: new THREE.Color(0.0, 0.25, 0.4),
                    density: constraints.isMobile ? 0.04 : 0.08,
                    causticStrength: constraints.isMobile ? 0.2 : 0.4,
                    waterSurface: 0,
                }}
            />
        </>
    );
}

export default function App() {
    useEffect(() => {
        // Initialize test hooks for E2E testing
        initTestHooks();
    }, []);

    const constraints = useMobileConstraints();
    const [currentExample, setCurrentExample] = useState<'basic' | 'weather'>('basic');
    
    const gameMode = useGameStore((state) => state.gameMode);
    const setGameMode = useGameStore((state) => state.setGameMode);

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
                        border: '2px solid rgba(212, 175, 55, 0.8)',
                        fontFamily: 'Inter, sans-serif',
                    }}
                >
                    <button
                        style={{
                            background:
                                currentExample === 'basic' ? '#d4af37' : 'rgba(255,255,255,0.1)',
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
                                currentExample === 'weather' ? '#d4af37' : 'rgba(255,255,255,0.1)',
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
                        onClick={() => setGameMode('main_menu')}
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Canvas
                shadows={!constraints.isMobile || constraints.isTablet}
                camera={{ fov: 50, near: 0.1, far: constraints.isMobile ? 300 : 500, position: [0, 3.5, -5] }}
                gl={{
                    antialias: !constraints.isMobile,
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                }}
                dpr={constraints.pixelRatio}
                style={{ background: '#0a0808' }}
            >
                {gameMode === 'racing' ? (
                    <RacingScene />
                ) : (
                    <Scene
                        useMobileControls={constraints.isMobile}
                    />
                )}
            </Canvas>

            {gameMode === 'main_menu' && <MainMenu />}

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
                    <GameUI />

                    <GameOver />
                    <Loader />
                    <Tutorial />
                    <BossBattleOverlay />
                </>
            )}
        </>
    );
}
