import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: number;
  rotationSpeed: number;
  color: THREE.Color;
  size: number;
  life: number;
}

interface ConfettiExplosionProps {
  position: [number, number, number];
  count?: number;
  spread?: number;
  onComplete?: () => void;
}

export function ConfettiExplosion({
  position,
  count = 100,
  spread = 5,
  onComplete,
}: ConfettiExplosionProps): React.JSX.Element {
  const particlesRef = useRef<Particle[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // Initialize particles
    const particles: Particle[] = [];
    const colors = [
      new THREE.Color('#ff0080'),
      new THREE.Color('#00ff80'),
      new THREE.Color('#0080ff'),
      new THREE.Color('#ffff00'),
      new THREE.Color('#ff8000'),
      new THREE.Color('#ff0000'),
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * spread;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed + 3; // Bias upward
      const vz = (Math.random() - 0.5) * spread;

      particles.push({
        position: new THREE.Vector3(position[0], position[1], position[2]),
        velocity: new THREE.Vector3(vx, vy, vz),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)].clone(),
        size: 0.1 + Math.random() * 0.15,
        life: 1,
      });
    }

    particlesRef.current = particles;
  }, [position, count, spread]);

  useFrame((state, delta) => {
    if (particlesRef.current.length === 0) return;

    let allDead = true;

    particlesRef.current.forEach((particle) => {
      if (particle.life > 0) {
        allDead = false;

        // Update physics
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));
        particle.velocity.y -= 12 * delta; // Gravity
        particle.velocity.multiplyScalar(0.98); // Air resistance
        particle.rotation += particle.rotationSpeed * delta;

        // Fade out
        particle.life -= delta * 0.8;
      }
    });

    if (allDead && onComplete) {
      onComplete();
    }
  });

  return (
    <group ref={groupRef}>
      {particlesRef.current.map((particle, i) => {
        if (particle.life <= 0) return null;

        const alpha = Math.max(0, particle.life);

        return (
          <mesh
            key={i}
            position={particle.position}
            rotation={[0, 0, particle.rotation]}
          >
            <planeGeometry args={[particle.size, particle.size * 1.5]} />
            <meshBasicMaterial
              color={particle.color}
              transparent
              opacity={alpha}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
