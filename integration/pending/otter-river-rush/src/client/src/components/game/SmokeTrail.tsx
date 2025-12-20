import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

interface SmokeParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  opacity: number;
}

interface SmokeTrailProps {
  emitterPosition: THREE.Vector3;
  active: boolean;
  rate?: number;
  color?: string;
  spread?: number;
}

export function SmokeTrail({
  emitterPosition,
  active,
  rate = 0.05,
  color = '#888888',
  spread = 0.3,
}: SmokeTrailProps): React.JSX.Element {
  const particlesRef = useRef<SmokeParticle[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const lastEmitRef = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Emit new particles
    if (active && time - lastEmitRef.current > rate) {
      lastEmitRef.current = time;

      const particle: SmokeParticle = {
        position: emitterPosition.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * spread,
          1 + Math.random() * 0.5,
          (Math.random() - 0.5) * spread
        ),
        size: 0.2 + Math.random() * 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2,
        life: 2 + Math.random(),
        maxLife: 2 + Math.random(),
        opacity: 0.6,
      };

      particlesRef.current.push(particle);
    }

    // Update particles
    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.position.add(particle.velocity.clone().multiplyScalar(delta));
      particle.velocity.y += 0.5 * delta; // Rise up
      particle.velocity.multiplyScalar(0.98); // Slow down
      particle.rotation += particle.rotationSpeed * delta;
      particle.life -= delta;

      // Expand and fade
      particle.size += 0.3 * delta;
      particle.opacity = (particle.life / particle.maxLife) * 0.6;

      return particle.life > 0;
    });

    // Limit max particles
    if (particlesRef.current.length > 100) {
      particlesRef.current = particlesRef.current.slice(-100);
    }
  });

  return (
    <group ref={groupRef}>
      {particlesRef.current.map((particle, i) => (
        <sprite
          key={i}
          position={particle.position}
          scale={[particle.size, particle.size, 1]}
        >
          <spriteMaterial
            color={color}
            transparent
            opacity={particle.opacity}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  );
}
