import { createTimeOfDay, ProceduralSky, Rain, Snow } from '@jbcom/strata';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * WeatherSystem Example
 *
 * Demonstrates dynamic weather transitions using Strata's particle systems.
 */
export const WeatherExample = () => {
    const [weatherType, setWeatherType] = useState<'rain' | 'snow'>('rain');
    const [intensity, setIntensity] = useState(0.5);
    const [isNight, setIsNight] = useState(false);

    const timeOfDay = createTimeOfDay(isNight ? 0 : 12);
    const wind = useRef(new THREE.Vector3(0.5, 0, 0.2));

    return (
        <div style={{ width: '100%', height: '100vh', background: '#000' }}>
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[15, 10, 15]} />
                <OrbitControls />

                <Suspense fallback={null}>
                    <ProceduralSky timeOfDay={timeOfDay} />

                    {isNight && (
                        <Stars
                            radius={100}
                            depth={50}
                            count={5000}
                            factor={4}
                            saturation={0}
                            fade
                            speed={1}
                        />
                    )}

                    {/* Weather Particles */}
                    {weatherType === 'rain' ? (
                        <Rain intensity={intensity} wind={wind.current} color="#88aacc" />
                    ) : (
                        <Snow intensity={intensity} wind={wind.current} color="#ffffff" />
                    )}

                    <ambientLight intensity={isNight ? 0.2 : 0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={isNight ? 0.5 : 1} />

                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                        <planeGeometry args={[100, 100]} />
                        <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                </Suspense>
            </Canvas>

            {/* Controls Overlay */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '20px',
                    borderRadius: '10px',
                    color: 'white',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    border: '2px solid rgba(139, 105, 20, 0.8)',
                    fontFamily: 'Inter, sans-serif',
                }}
            >
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        style={{
                            background:
                                weatherType === 'rain' ? '#DAA520' : 'rgba(255,255,255,0.1)',
                            color: weatherType === 'rain' ? '#000' : '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                        onClick={() => setWeatherType('rain')}
                    >
                        Rain
                    </button>
                    <button
                        style={{
                            background:
                                weatherType === 'snow' ? '#DAA520' : 'rgba(255,255,255,0.1)',
                            color: weatherType === 'snow' ? '#000' : '#fff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                        onClick={() => setWeatherType('snow')}
                    >
                        Snow
                    </button>
                    <button
                        style={{
                            background: isNight ? '#444' : '#87CEEB',
                            color: isNight ? '#fff' : '#000',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                        onClick={() => setIsNight(!isNight)}
                    >
                        {isNight ? 'Switch to Day' : 'Switch to Night'}
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', color: '#aaa' }}>Intensity:</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={intensity}
                        onChange={(e) => setIntensity(parseFloat(e.target.value))}
                        style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 'bold', minWidth: '30px' }}>{intensity}</span>
                </div>
            </div>
        </div>
    );
};

export default WeatherExample;
