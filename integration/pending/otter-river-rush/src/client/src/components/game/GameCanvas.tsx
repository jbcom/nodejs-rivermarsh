import { PerspectiveCamera, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useEffect, useRef } from 'react';
import { VISUAL } from '../../config/visual-constants';
import { AchievementSystem } from '../../ecs/achievement-system';
import { BiomeSystem } from '../../ecs/biome-system';
import { CameraSystem } from '../../ecs/camera-system';
import { ComboSystem } from '../../ecs/combo-system';
import { DifficultySystem } from '../../ecs/difficulty-system';
import { EnemySystem } from '../../ecs/enemy-system';
import { InputSystem } from '../../ecs/input-system';
import { LeaderboardSystem } from '../../ecs/leaderboard-system';
import { MagnetSystem } from '../../ecs/magnet-system';
import { NearMissSystem } from '../../ecs/near-miss-system';
import { PowerUpSystem } from '../../ecs/power-up-system';
import { QuestSystem } from '../../ecs/quest-system';
import { ScoreSystem } from '../../ecs/score-system';
import { ShieldEffectSystem } from '../../ecs/shield-effect-system';
import { GameSystems } from '../../ecs/systems';
import { TouchInputSystem } from '../../ecs/touch-input-system';
import { WeatherSystem } from '../../ecs/weather-system';
import { queries, spawn } from '../../ecs/world';
import { useGameStore } from '../../hooks/useGameStore';
import { useMobileConstraints } from '../../hooks/useMobileConstraints';
import { EntityRenderer } from './EntityRenderer';
import { LaneMarkers } from './LaneMarkers';
import { River } from './River';
import { Skybox } from './Skybox';
import { VisualEffects } from './VisualEffects';

interface GameCanvasProps {
  showStats?: boolean;
}

export function GameCanvas({
  showStats = false,
}: GameCanvasProps): React.JSX.Element {
  const { status } = useGameStore();
  const constraints = useMobileConstraints();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize player when game starts
  useEffect(() => {
    if (status === 'playing') {
      if (queries.player.entities.length === 0) {
        spawn.otter(0);
      }
    }
  }, [status]);

  // Responsive canvas sizing based on orientation
  const canvasStyle: React.CSSProperties = {
    width: '100vw',
    height: constraints.orientation === 'portrait' ? '80vh' : '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
  };

  return (
    <div
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen z-0"
      style={canvasStyle}
    >
      <Canvas
        className="w-full h-full"
        gl={{
          antialias: !constraints.isMobile, // Disable AA on mobile for performance
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={constraints.pixelRatio}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 3, 6]}
          fov={constraints.isPhone ? 60 : 50} // Wider FOV on phones
          near={0.1}
          far={100}
        />

        <ambientLight
          intensity={VISUAL.lighting.ambient.intensity}
          color={VISUAL.lighting.ambient.color}
        />
        <directionalLight
          position={VISUAL.lighting.directional.main.position}
          intensity={VISUAL.lighting.directional.main.intensity}
        />
        <directionalLight
          position={VISUAL.lighting.directional.fill.position}
          intensity={VISUAL.lighting.directional.fill.intensity}
        />

        <Suspense fallback={null}>
          <Skybox />
          <River />
          <LaneMarkers />
          <fog
            attach="fog"
            args={[VISUAL.fog.color, VISUAL.fog.near, VISUAL.fog.far]}
          />

          <EntityRenderer />

          <GameSystems />
          <InputSystem />
          <TouchInputSystem />
          <CameraSystem />
          <ScoreSystem />
          <PowerUpSystem />
          <BiomeSystem />
          <DifficultySystem />
          <AchievementSystem />
          <ComboSystem />
          <MagnetSystem />
          <NearMissSystem />
          <ShieldEffectSystem />
          <WeatherSystem />
          <QuestSystem />
          <LeaderboardSystem />
          <EnemySystem />
        </Suspense>

        <VisualEffects />
        {showStats && <Stats />}
      </Canvas>
    </div>
  );
}
