import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import { Mesh } from 'three';
import { useBiome } from '../../ecs/biome-system';
import { useGameStore } from '../../hooks/useGameStore';

export function WaterEffects(): React.JSX.Element | null {
  const meshRef = useRef<Mesh>(null);
  const { status } = useGameStore();
  const biome = useBiome();

  // Biome-specific water colors
  const waterColors = {
    forest: [0.1, 0.3, 0.5], // Deep blue-green
    mountain: [0.15, 0.4, 0.7], // Clear mountain water
    canyon: [0.2, 0.3, 0.4], // Murky desert water
    rapids: [0.05, 0.2, 0.4], // Dark turbulent water
  };

  const waterColor = waterColors[biome.name as keyof typeof waterColors] || [
    0.1, 0.2, 0.7,
  ];

  useFrame((_, dt) => {
    if (!meshRef.current || status !== 'playing') return;

    // Animate water
    const material = meshRef.current.material as {
      uniforms?: { time: { value: number } };
    };
    if (material.uniforms) {
      material.uniforms.time.value += dt;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, -0.5, -1]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[20, 30, 32, 32]} />
      <shaderMaterial
        uniforms={{
          time: { value: 0 },
          color: { value: waterColor },
        }}
        vertexShader={`
          uniform float time;
          varying vec2 vUv;
          varying float vWave;
          
          void main() {
            vUv = uv;
            vec3 pos = position;
            
            float wave1 = sin(pos.x * 2.0 + time) * 0.1;
            float wave2 = sin(pos.y * 3.0 + time * 0.5) * 0.05;
            pos.z += wave1 + wave2;
            
            vWave = wave1 + wave2;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          varying vec2 vUv;
          varying float vWave;
          
          void main() {
            vec3 waterColor = color + vec3(vWave * 0.2);
            gl_FragColor = vec4(waterColor, 0.9);
          }
        `}
        transparent
      />
    </mesh>
  );
}
