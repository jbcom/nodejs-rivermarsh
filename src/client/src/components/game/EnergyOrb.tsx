import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

interface EnergyOrbProps {
  position: [number, number, number];
  radius?: number;
  color?: string;
  pulseSpeed?: number;
  rotationSpeed?: number;
  glowIntensity?: number;
}

export function EnergyOrb({
  position,
  radius = 0.5,
  color = '#00ffff',
  pulseSpeed = 2,
  rotationSpeed = 1,
  glowIntensity = 2,
}: EnergyOrbProps): React.JSX.Element {
  const orbRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Pulsing animation
    const pulse = Math.sin(time * pulseSpeed) * 0.2 + 1;

    if (orbRef.current) {
      orbRef.current.scale.setScalar(pulse);
      orbRef.current.rotation.y += rotationSpeed * 0.01;
      orbRef.current.rotation.z += rotationSpeed * 0.005;
    }

    // Glow pulse
    if (glowRef.current) {
      const glowPulse = Math.sin(time * pulseSpeed * 1.5) * 0.3 + 1;
      glowRef.current.scale.setScalar(pulse * glowPulse * 1.2);
      glowRef.current.rotation.y -= rotationSpeed * 0.008;

      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = (Math.sin(time * pulseSpeed * 2) * 0.2 + 0.5) * 0.4;
    }
  });

  return (
    <group position={position}>
      {/* Glow layer */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 1.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Core orb */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glowIntensity}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Energy particles circling */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const orbitRadius = radius * 1.8;

        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * orbitRadius,
              Math.sin(angle) * orbitRadius * 0.5,
              Math.sin(angle) * orbitRadius,
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}
