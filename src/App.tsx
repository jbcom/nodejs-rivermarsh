import { FollowCamera } from '@/components/Camera';
import { NPCs } from '@/components/NPCs';
import { Player } from '@/components/Player';
import { Resources } from '@/components/Resources';
import { TapToCollect } from '@/components/TapToCollect';
import { GameOver } from '@/components/ui/GameOver';
import { HUD } from '@/components/ui/HUD';
import { AchievementOverlay } from '@/components/ui/AchievementOverlay';
import { EventOverlay } from '@/components/ui/EventOverlay';
import { Loader } from '@/components/ui/Loader';
import { Tutorial } from '@/components/ui/Tutorial';
import { World } from '@/components/World';
import { VolumetricEffects } from '@/components/VolumetricEffects';
import { GameSystems } from '@/systems/GameSystems';
import { InputZone, useInput } from '@/systems/input';
import { initTestHooks, setGameReady } from '@/utils/testHooks';
import { Canvas } from '@react-three/fiber';
// Post-processing effects are handled by Strata's VolumetricEffects
// import { Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { useEffect } from 'react';

// New Rivermarsh game components
import { NPCManager, GameUI, Combat } from '@/components/game';
import { VirtualJoysticks, MobileActionButtons, GyroscopeCamera, SwipeGestures } from '@/components/mobile';
import { useMobileConstraints } from '@/hooks/useMobileConstraints';

// Initialize test hooks for E2E testing
initTestHooks();

interface SceneProps {
    useMobileControls?: boolean;
    useRivermarshFeatures?: boolean;
}

function Scene({ useMobileControls = false, useRivermarshFeatures = false }: SceneProps) {
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
                {useRivermarshFeatures && <NPCManager />}
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
                    height: 5
                }}
                underwaterSettings={{
                    color: new THREE.Color(0.0, 0.25, 0.4),
                    density: 0.08,
                    causticStrength: 0.4,
                    waterSurface: 0
                }}
            />
        </>
    );
}

import { RacingScene } from '@/features/racing/RacingScene';
import { useRivermarsh } from '@/stores/useRivermarsh';

export default function App() {
    const constraints = useMobileConstraints();
    // Rivermarsh features enabled by default - can be toggled in settings later
    const rivermarshEnabled = true;
    const gameMode = useRivermarsh(state => state.gameMode);

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
                        useRivermarshFeatures={rivermarshEnabled}
                    />
                )}
            </Canvas>

            {gameMode === 'exploration' && (
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
                </>
            )}
        </>
    );
}
