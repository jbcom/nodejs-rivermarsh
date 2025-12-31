import { AdvancedWater, ProceduralSky } from '@jbcom/strata';
import { Html, PerspectiveCamera, useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useEngineStore } from '@/stores';
import { ASSET_URLS, RACING_CONFIG, VISUAL } from './constants';
import { useRacingStore } from './store';
import { type RacingEntity, racingWorld } from './world';

// Helper hook for Miniplex archetypes
function useArchetype(archetype: any) {
    const [, setVersion] = useState(0);
    useEffect(() => {
        let mounted = true;
        const update = () => {
            if (mounted) {
                setVersion((v) => v + 1);
            }
        };
        const sub1 = archetype.onEntityAdded.subscribe(update);
        const sub2 = archetype.onEntityRemoved.subscribe(update);
        return () => {
            mounted = false;
            sub1.unsubscribe();
            sub2.unsubscribe();
        };
    }, [archetype]);
    return archetype.entities as RacingEntity[];
}

function PlayerModel({ entity }: { entity: RacingEntity }) {
    const gltf = useGLTF(entity.model!.url);
    const scene = useMemo(() => {
        const s = Array.isArray(gltf) ? gltf[0].scene.clone() : gltf.scene.clone();
        return s;
    }, [gltf]);

    const animations = Array.isArray(gltf) ? gltf[0].animations : gltf.animations;
    const sceneRef = useRef<THREE.Group>(null!);
    const { actions } = useAnimations(animations, sceneRef);

    useEffect(() => {
        if (!actions) {
            return;
        }

        const animName = entity.animation?.current || 'run';
        let actionKey = Object.keys(actions).find((k) =>
            k.toLowerCase().includes(animName.toLowerCase())
        );

        if (!actionKey && animName === 'run') {
            actionKey = Object.keys(actions).find((k) => k.toLowerCase().includes('walk'));
        }
        if (!actionKey) {
            actionKey = Object.keys(actions)[0];
        }

        if (actionKey && actions[actionKey]) {
            for (const a of Object.values(actions)) {
                a?.fadeOut(0.2);
            }
            const action = actions[actionKey];
            if (action) {
                action.reset().fadeIn(0.2).play();
            }
        }
    }, [actions, entity.animation?.current]);

    useFrame((state, delta) => {
        if (entity.position && sceneRef.current) {
            const s = sceneRef.current;
            // Smoothly interpolate X position for lane changes
            s.position.x = THREE.MathUtils.lerp(s.position.x, entity.position.x, delta * 10);
            s.position.y = entity.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1; // Bobbing
            s.position.z = entity.position.z;

            // Tilt based on movement
            const targetRotationZ = (entity.position.x - s.position.x) * -0.5;
            s.rotation.z = THREE.MathUtils.lerp(s.rotation.z, targetRotationZ, delta * 5);
        }
    });

    return <primitive object={scene} ref={sceneRef} scale={entity.model!.scale} />;
}

function SimpleModel({ entity }: { entity: RacingEntity }) {
    const gltf = useGLTF(entity.model!.url);
    const scene = useMemo(() => {
        const s = Array.isArray(gltf) ? gltf[0].scene.clone() : gltf.scene.clone();
        return s;
    }, [gltf]);
    const ref = useRef<THREE.Group>(null!);

    useFrame(() => {
        if (entity.position && ref.current) {
            ref.current.position.set(entity.position.x, entity.position.y, entity.position.z);
            if (entity.collectible) {
                ref.current.rotation.y += 0.05;
            }
        }
    });

    return <primitive ref={ref} object={scene} scale={entity.model!.scale} />;
}

function RiverBanks() {
    const banks = useMemo(() => {
        const items = [];
        for (let i = 0; i < 10; i++) {
            items.push({
                id: i,
                z: i * -10,
                xLeft: -6,
                xRight: 6,
            });
        }
        return items;
    }, []);

    const meshRef = useRef<THREE.Group>(null);
    useFrame((_, delta) => {
        if (!meshRef.current) {
            return;
        }
        const scrollSpeed =
            useRacingStore.getState().status === 'playing' ? RACING_CONFIG.BASE_SCROLL_SPEED : 0;
        for (const child of meshRef.current.children) {
            child.position.z += scrollSpeed * delta;
            if (child.position.z > 20) {
                child.position.z -= 100;
            }
        }
    });

    return (
        <group ref={meshRef}>
            {banks.map((bank) => (
                <group key={bank.id} position={[0, -0.5, bank.z]}>
                    <mesh position={[bank.xLeft, 0, 0]} receiveShadow>
                        <boxGeometry args={[4, 2, 10]} />
                        <meshStandardMaterial color="#2d5a27" />
                    </mesh>
                    <mesh position={[bank.xRight, 0, 0]} receiveShadow>
                        <boxGeometry args={[4, 2, 10]} />
                        <meshStandardMaterial color="#2d5a27" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function Player() {
    const entities = useArchetype(racingWorld.with('player', 'position', 'model'));
    return (
        <>
            {entities.map((e, i) => (
                <PlayerModel key={e.id || i} entity={e} />
            ))}
        </>
    );
}

function Obstacles() {
    const entities = useArchetype(racingWorld.with('obstacle', 'position', 'model'));
    return (
        <>
            {entities.map((e, i) => (
                <SimpleModel key={e.id || i} entity={e} />
            ))}
        </>
    );
}

function Collectibles() {
    const entities = useArchetype(racingWorld.with('collectible', 'position', 'model'));
    return (
        <>
            {entities.map((e, i) => (
                <SimpleModel key={e.id || i} entity={e} />
            ))}
        </>
    );
}

function RacingHUD() {
    const { score, lives, distance, status, startGame } = useRacingStore();
    const setGameMode = useEngineStore((state) => state.setGameMode);

    return (
        <Html fullscreen>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    color: 'white',
                    userSelect: 'none',
                }}
            >
                {/* HUD */}
                {status === 'playing' && (
                    <div
                        style={{
                            padding: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFD700' }}>
                                Score: {score}
                            </div>
                            <div style={{ fontSize: '20px' }}>
                                Distance: {Math.floor(distance)}m
                            </div>
                        </div>
                        <div style={{ fontSize: '32px', color: '#ff4444' }}>
                            {'❤️'.repeat(lives)}
                        </div>
                    </div>
                )}

                {/* Screens */}
                {(status === 'game_over' || status === 'menu') && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.4)',
                            pointerEvents: 'auto',
                        }}
                    >
                        <div
                            style={{
                                textAlign: 'center',
                                background: 'rgba(0,0,0,0.85)',
                                padding: '50px',
                                borderRadius: '30px',
                                border: `4px solid ${status === 'game_over' ? '#ff4444' : '#00aaff'}`,
                                boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                                minWidth: '300px',
                            }}
                        >
                            <h1
                                style={{
                                    color: status === 'game_over' ? '#ff4444' : '#00aaff',
                                    fontSize: '48px',
                                    margin: '0 0 20px 0',
                                }}
                            >
                                {status === 'game_over' ? 'WASHED OUT!' : 'RIVER RUSH'}
                            </h1>

                            {status === 'game_over' && (
                                <div style={{ marginBottom: '30px' }}>
                                    <p style={{ fontSize: '28px', margin: '10px 0' }}>
                                        Score: {score}
                                    </p>
                                    <p style={{ fontSize: '20px', color: '#aaa' }}>
                                        Distance: {Math.floor(distance)}m
                                    </p>
                                </div>
                            )}

                            {status === 'menu' && (
                                <p
                                    style={{
                                        fontSize: '18px',
                                        color: '#ccc',
                                        marginBottom: '30px',
                                    }}
                                >
                                    Avoid rocks, collect coins! <br />
                                    WASD or Swipe to move.
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => startGame()}
                                    style={{
                                        padding: '15px 30px',
                                        fontSize: '20px',
                                        background: status === 'game_over' ? '#ff4444' : '#00aaff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        color: 'white',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {status === 'game_over' ? 'TRY AGAIN' : 'START RACE'}
                                </button>
                                <button
                                    onClick={() => setGameMode('exploration')}
                                    style={{
                                        padding: '15px 30px',
                                        fontSize: '20px',
                                        background: '#444',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        color: 'white',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    EXIT
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Html>
    );
}

function RacingSystems() {
    const spawnTimer = useRef(0);
    const speedBoostTimer = useRef(0);
    const { status, collectCoin, collectGem, takeDamage, updateDistance } = useRacingStore();

    useFrame((_state, delta) => {
        if (status !== 'playing') {
            return;
        }

        let currentSpeed = RACING_CONFIG.BASE_SCROLL_SPEED;
        if (speedBoostTimer.current > 0) {
            speedBoostTimer.current -= delta;
            currentSpeed *= 2;
        }

        // Update Distance
        updateDistance(delta * currentSpeed);

        // 1. Movement System
        for (const entity of racingWorld.with('velocity', 'position')) {
            entity.position.z += currentSpeed * delta;

            if (entity.velocity) {
                entity.position.x += entity.velocity.x * delta;
                entity.position.y += entity.velocity.y * delta;
                entity.position.z += entity.velocity.z * delta;
            }

            if (entity.position.z > RACING_CONFIG.DESPAWN_Z && !entity.player) {
                racingWorld.remove(entity);
            }
        }

        // 2. Spawner System
        spawnTimer.current += delta;
        if (
            spawnTimer.current >
            RACING_CONFIG.SPAWN_INTERVAL * (RACING_CONFIG.BASE_SCROLL_SPEED / currentSpeed)
        ) {
            spawnTimer.current = 0;
            const lane = Math.floor(Math.random() * 3) - 1;
            const x = RACING_CONFIG.LANES[lane + 1];

            const rand = Math.random();
            if (rand > 0.4) {
                const rockVariants = [
                    ASSET_URLS.MODELS.ROCK_RIVER,
                    ASSET_URLS.MODELS.ROCK_MOSSY,
                    ASSET_URLS.MODELS.ROCK_CRACKED,
                ];
                const modelUrl = rockVariants[Math.floor(Math.random() * rockVariants.length)];

                racingWorld.add({
                    obstacle: true,
                    position: { x, y: 0, z: RACING_CONFIG.SPAWN_Z },
                    velocity: { x: 0, y: 0, z: 0 },
                    model: { url: modelUrl, scale: VISUAL.scales.rock },
                    collider: { width: 1.2, height: 1, depth: 1.2 },
                });
            } else {
                const isGem = Math.random() > 0.8;
                racingWorld.add({
                    collectible: { type: isGem ? 'gem' : 'coin', value: isGem ? 5 : 1 },
                    position: { x, y: 0, z: RACING_CONFIG.SPAWN_Z },
                    velocity: { x: 0, y: 0, z: 0 },
                    model: {
                        url: isGem ? ASSET_URLS.MODELS.GEM_RED : ASSET_URLS.MODELS.COIN,
                        scale: isGem ? 0.6 : VISUAL.scales.coin,
                    },
                    collider: { width: 0.8, height: 0.8, depth: 0.8 },
                });
            }
        }

        // 3. Collision System
        const player = racingWorld.with('player', 'position', 'lane').first;
        if (player) {
            for (const obs of racingWorld.with('obstacle', 'position')) {
                const dx = Math.abs(obs.position.x - player.position.x);
                const dz = Math.abs(obs.position.z - player.position.z);

                if (dz < 1.0 && dx < 0.7) {
                    takeDamage();
                    racingWorld.remove(obs);

                    if (player.animation) {
                        player.animation.current = 'hit';
                        setTimeout(() => {
                            if (player.animation) {
                                player.animation.current = 'run';
                            }
                        }, 500);
                    }
                }
            }

            for (const col of racingWorld.with('collectible', 'position')) {
                const dx = Math.abs(col.position.x - player.position.x);
                const dz = Math.abs(col.position.z - player.position.z);

                if (dz < 1.0 && dx < 0.7) {
                    if (col.collectible.type === 'coin') {
                        collectCoin(col.collectible.value);
                    } else {
                        collectGem(col.collectible.value);
                        speedBoostTimer.current = 3.0; // 3 seconds of speed boost!
                    }
                    racingWorld.remove(col);
                }
            }
        }
    });

    // Inputs
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (status !== 'playing') {
                return;
            }
            const player = racingWorld.with('player', 'position', 'lane').first;
            if (!player || player.lane == null) {
                return;
            }

            let newLane = player.lane;
            if ((e.key === 'ArrowLeft' || e.key === 'a') && newLane > -1) {
                newLane--;
            } else if ((e.key === 'ArrowRight' || e.key === 'd') && newLane < 1) {
                newLane++;
            }

            if (newLane !== player.lane) {
                player.lane = newLane;
                player.position.x = RACING_CONFIG.LANES[newLane + 1];
                if (player.animation) {
                    player.animation.current = newLane < player.lane ? 'dodge-left' : 'dodge-right';
                    setTimeout(() => {
                        if (player.animation) {
                            player.animation.current = 'run';
                        }
                    }, 300);
                }
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [status]);

    useEffect(() => {
        if (status !== 'playing') {
            return;
        }
        let startX = 0;
        let startY = 0;
        const onTouchStart = (e: TouchEvent) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        };
        const onTouchEnd = (e: TouchEvent) => {
            const deltaX = e.changedTouches[0].clientX - startX;
            const deltaY = e.changedTouches[0].clientY - startY;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
                const player = racingWorld.with('player', 'position', 'lane').first;
                if (player && player.lane != null) {
                    let newLane = player.lane;
                    if (deltaX > 0 && newLane < 1) {
                        newLane++;
                    } else if (deltaX < 0 && newLane > -1) {
                        newLane--;
                    }
                    if (newLane !== player.lane) {
                        player.lane = newLane;
                        player.position.x = RACING_CONFIG.LANES[newLane + 1];
                    }
                }
            }
        };
        window.addEventListener('touchstart', onTouchStart);
        window.addEventListener('touchend', onTouchEnd);
        return () => {
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [status]);

    return null;
}

export function RacingScene() {
    useEffect(() => {
        for (const e of racingWorld.entities) {
            racingWorld.remove(e);
        }
        racingWorld.add({
            id: 1,
            player: true,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            lane: 0,
            model: { url: ASSET_URLS.MODELS.OTTER, scale: VISUAL.scales.otter },
            animation: { current: 'run', urls: ASSET_URLS.ANIMATIONS },
        });
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 5, 7]} fov={60} rotation={[-0.4, 0, 0]} />
            <fog attach="fog" args={['#006994', 15, 60]} />

            <ProceduralSky />
            <AdvancedWater size={200} color="#006994" deepColor="#003366" foamColor="#ffffff" />

            <ambientLight intensity={1.0} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />

            <Suspense fallback={null}>
                <RiverBanks />
                <Player />
                <Obstacles />
                <Collectibles />
            </Suspense>

            <RacingSystems />
            <RacingHUD />
        </>
    );
}
