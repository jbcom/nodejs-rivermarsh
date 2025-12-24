import { Suspense, useEffect, useState, useRef } from 'react';
import { PerspectiveCamera, useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { AdvancedWater, ProceduralSky } from '@jbcom/strata';
import { racingWorld, RacingEntity } from './world';
import { useRacingStore } from './store';
import { ASSET_URLS, RACING_CONFIG } from './constants';
import { useRivermarsh } from '@/stores/useRivermarsh';

// Helper hook for Miniplex archetypes
function useArchetype(archetype: any) {
    const [, setVersion] = useState(0);
    useEffect(() => {
        let mounted = true;
        const update = () => { if(mounted) setVersion(v => v + 1); };
        const sub1 = archetype.onEntityAdded.subscribe(update);
        const sub2 = archetype.onEntityRemoved.subscribe(update);
        return () => { mounted = false; sub1.unsubscribe(); sub2.unsubscribe(); };
    }, [archetype]);
    return archetype.entities as RacingEntity[];
}

function PlayerModel({ entity }: { entity: any }) {
    const gltf = useGLTF(entity.model.url);
    const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;
    const animations = Array.isArray(gltf) ? gltf[0].animations : gltf.animations;
    const sceneRef = useRef(scene);
    const { actions } = useAnimations(animations, sceneRef);

    useEffect(() => {
        if (actions && actions['Run']) {
           actions['Run'].play();
        } else if (actions && Object.keys(actions).length > 0) {
           const firstAction = Object.values(actions)[0];
           if (firstAction) firstAction.play();
        }
    }, [actions]);

    return <primitive object={scene} position={[entity.position.x, entity.position.y, entity.position.z]} scale={entity.model.scale} />;
}

function SimpleModel({ entity }: { entity: any }) {
    const gltf = useGLTF(entity.model.url);
    const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;
    const clone = scene.clone();
    return <primitive object={clone} position={[entity.position.x, entity.position.y, entity.position.z]} scale={entity.model.scale} />;
}

function Player() {
  const entities = useArchetype(racingWorld.with('player', 'position', 'model'));
  return <>{entities.map((e, i) => <PlayerModel key={i} entity={e} />)}</>;
}

function Obstacles() {
    const entities = useArchetype(racingWorld.with('obstacle', 'position', 'model'));
    return <>{entities.map((e, i) => <SimpleModel key={i} entity={e} />)}</>;
}

function Collectibles() {
    const entities = useArchetype(racingWorld.with('collectible', 'position', 'model'));
    return <>{entities.map((e, i) => <SimpleModel key={i} entity={e} />)}</>;
}

function RacingSystems() {
    const spawnTimer = useRef(0);
    const { addScore, takeDamage, lives, distance, endGame } = useRacingStore();

    useFrame((_, delta) => {
        // Update Distance
        useRacingStore.setState(s => ({ distance: s.distance + delta * RACING_CONFIG.BASE_SCROLL_SPEED }));

        // Win Condition
        if (distance > 500) {
            endGame();
            useRivermarsh.getState().addExperience(200); // Reward
            useRivermarsh.getState().setGameMode('exploration');
            return;
        }

        // Loss Condition
        if (lives <= 0) {
            endGame();
            useRivermarsh.getState().setGameMode('exploration'); // Fail
            return;
        }

        // 1. Move everything
        for (const entity of racingWorld.with('velocity', 'position')) {
            entity.position.z += RACING_CONFIG.BASE_SCROLL_SPEED * delta;

            if (entity.position.z > RACING_CONFIG.DESPAWN_Z) {
                racingWorld.remove(entity);
            }
        }

        // 2. Spawning
        spawnTimer.current += delta;
        if (spawnTimer.current > RACING_CONFIG.SPAWN_INTERVAL) {
            spawnTimer.current = 0;
            const lane = Math.floor(Math.random() * 3) - 1;
            const isRock = Math.random() > 0.5;
            const x = RACING_CONFIG.LANES[lane + 1];

            if (isRock) {
                racingWorld.add({
                    obstacle: true,
                    position: { x, y: 0, z: RACING_CONFIG.SPAWN_Z },
                    velocity: { x: 0, y: 0, z: 0 },
                    model: { url: ASSET_URLS.MODELS.ROCK_RIVER, scale: 1.2 },
                    collider: { width: 1, height: 1, depth: 1 }
                });
            } else {
                 racingWorld.add({
                    collectible: { type: 'coin', value: 10 },
                    position: { x, y: 0, z: RACING_CONFIG.SPAWN_Z },
                    velocity: { x: 0, y: 0, z: 0 },
                    model: { url: ASSET_URLS.MODELS.COIN, scale: 0.8 },
                    collider: { width: 0.5, height: 0.5, depth: 0.5 }
                });
            }
        }

        // 3. Collision
        const player = racingWorld.with('player', 'position', 'lane').first;
        if (player) {
            for (const obs of racingWorld.with('obstacle', 'position')) {
                if (Math.abs(obs.position.z - player.position.z) < 1.0 && Math.abs(obs.position.x - player.position.x) < 0.5) {
                    takeDamage();
                    racingWorld.remove(obs);
                }
            }
            for (const col of racingWorld.with('collectible', 'position')) {
                if (Math.abs(col.position.z - player.position.z) < 1.0 && Math.abs(col.position.x - player.position.x) < 0.5) {
                    addScore(col.collectible.value);
                    racingWorld.remove(col);
                }
            }
        }
    });

    // Input
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
             const player = racingWorld.with('player', 'position', 'lane').first;
             if (!player || player.lane == null) return;

             let lane = player.lane;

             if ((e.key === 'ArrowLeft' || e.key === 'a') && lane > -1) {
                 lane--;
             } else if ((e.key === 'ArrowRight' || e.key === 'd') && lane < 1) {
                 lane++;
             }

             if (lane !== player.lane) {
                 player.lane = lane;
                 player.position.x = RACING_CONFIG.LANES[lane + 1];
             }
        };

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                useRivermarsh.getState().setGameMode('exploration');
            }
        };

        window.addEventListener('keydown', handleKey);
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    return null;
}

export function RacingScene() {
    const { startGame } = useRacingStore();

    useEffect(() => {
        for (const e of racingWorld.entities) racingWorld.remove(e);

        startGame();

        racingWorld.add({
            player: true,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            lane: 0,
            model: { url: ASSET_URLS.MODELS.OTTER, scale: 1.5 },
            animation: { current: 'run', urls: ASSET_URLS.ANIMATIONS }
        });

    }, [startGame]);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={60} rotation={[-0.3, 0, 0]} />

            <ProceduralSky />
            <AdvancedWater
                size={100}
                color="#006994"
                deepColor="#003366"
                foamColor="#ffffff"
            />
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1} />

            <Suspense fallback={null}>
                <Player />
                <Obstacles />
                <Collectibles />
            </Suspense>

            <RacingSystems />

            {/* Simple HUD Overlay */}
            <mesh position={[0, 2, -5]}>
                {/* 3D UI not easy, use HTML via App.tsx?
                    But App.tsx hides HUD.
                    We need GameUI to handle racing HUD or add it here using @react-three/drei Html?
                */}
            </mesh>
        </>
    );
}
