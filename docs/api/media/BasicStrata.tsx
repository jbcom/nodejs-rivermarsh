import { AdvancedWater, createTimeOfDay, ProceduralSky, VolumetricFogMesh } from '@jbcom/strata';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

/**
 * BasicStrata Example
 *
 * Shows the core Strata components in a minimal setup.
 */
export const BasicStrataExample = () => {
    // 12:00 PM
    const timeOfDay = createTimeOfDay(12);

    return (
        <div style={{ width: '100%', height: '100vh', background: '#000' }}>
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[10, 5, 10]} />
                <OrbitControls />

                <Suspense fallback={null}>
                    {/* 1. Procedural Sky */}
                    <ProceduralSky timeOfDay={timeOfDay} />

                    {/* 2. Volumetric Fog */}
                    <VolumetricFogMesh density={0.02} color="#aabbcc" height={10} />

                    {/* 3. Advanced Water */}
                    <AdvancedWater
                        size={50}
                        position={[0, -0.5, 0]}
                        color="#006994"
                        foamColor="#ffffff"
                    />

                    {/* Standard Lighting */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

                    {/* Placeholder Ground */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow>
                        <planeGeometry args={[100, 100]} />
                        <meshStandardMaterial color="#223322" />
                    </mesh>
                </Suspense>
            </Canvas>
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    color: 'white',
                    fontFamily: 'Inter, sans-serif',
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '2px solid rgba(139, 105, 20, 0.8)',
                }}
            >
                <h1 style={{ color: '#DAA520', margin: '0 0 10px 0', fontSize: '24px' }}>
                    Basic Strata Integration
                </h1>
                <p style={{ margin: 0, color: '#aaa' }}>Sky, Water, and Volumetric Fog</p>
                <ul
                    style={{
                        margin: '15px 0 0 0',
                        paddingLeft: '20px',
                        fontSize: '14px',
                        color: '#eee',
                    }}
                >
                    <li>ProceduralSky: Dynamic atmospheric rendering</li>
                    <li>AdvancedWater: GPU-accelerated water surface</li>
                    <li>VolumetricFogMesh: Height-based depth effects</li>
                </ul>
            </div>
        </div>
    );
};

export default BasicStrataExample;
