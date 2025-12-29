import { AdvancedWater, createTimeOfDay, ProceduralSky } from '@jbcom/strata';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import { Combat } from '@/components/game/Combat';
import { Player } from '@/components/Player';

/**
 * CombatDemo Example
 *
 * Shows the combat system in a controlled environment.
 */
export const CombatDemo = () => {
    const timeOfDay = createTimeOfDay(12);

    return (
        <div style={{ width: '100%', height: '100vh', background: '#0a0808' }}>
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 5, 10]} />
                <OrbitControls />

                <Suspense fallback={null}>
                    <ProceduralSky timeOfDay={timeOfDay} />
                    <AdvancedWater size={100} position={[0, -1, 0]} />

                    <Physics gravity={[0, -15, 0]}>
                        <Player />
                        <Combat />

                        {/* Floor */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
                            <planeGeometry args={[100, 100]} />
                            <meshStandardMaterial color="#1a1a1a" />
                        </mesh>
                    </Physics>

                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                </Suspense>
            </Canvas>

            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    color: 'white',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '2px solid #d4af37',
                    fontFamily: 'Cinzel, serif',
                }}
            >
                <h2 style={{ color: '#d4af37', margin: '0 0 10px 0' }}>Combat Demonstration</h2>
                <p style={{ fontSize: '14px', margin: 0 }}>Press SPACE to attack / Jump</p>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>
                    Integrates Miniplex ECS and Rapier Physics
                </p>
            </div>
        </div>
    );
};

export default CombatDemo;
