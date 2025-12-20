import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Firework {
  position: THREE.Vector3;
  particles: Array<{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    color: THREE.Color;
    life: number;
    maxLife: number;
  }>;
  exploded: boolean;
  velocity: THREE.Vector3;
}

interface VictoryFireworksProps {
  active: boolean;
  intensity?: number;
}

export function VictoryFireworks({
  active,
  intensity = 1,
}: VictoryFireworksProps): React.JSX.Element | null {
  const fireworksRef = useRef<Firework[]>([]);
  const particleGroupRef = useRef<THREE.Group>(null);
  const lastSpawnRef = useRef(0);
  const geometryRef = useRef<THREE.BufferGeometry | undefined>(undefined);
  const materialRef = useRef<THREE.PointsMaterial | undefined>(undefined);

  useEffect(() => {
    if (!active) {
      fireworksRef.current = [];
      return;
    }

    // Create reusable geometry and material
    geometryRef.current = new THREE.BufferGeometry();
    materialRef.current = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return () => {
      geometryRef.current?.dispose();
      materialRef.current?.dispose();
    };
  }, [active]);

  useFrame((state, delta) => {
    if (!active) return;

    const time = state.clock.getElapsedTime();
    const spawnRate = 0.3 / intensity; // More fireworks with higher intensity

    // Spawn new fireworks
    if (time - lastSpawnRef.current > spawnRate) {
      lastSpawnRef.current = time;

      const firework: Firework = {
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          -5,
          (Math.random() - 0.5) * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          8 + Math.random() * 4,
          0
        ),
        particles: [],
        exploded: false,
      };

      fireworksRef.current.push(firework);
    }

    // Update fireworks
    fireworksRef.current = fireworksRef.current.filter((firework) => {
      if (!firework.exploded) {
        // Rocket phase
        firework.position.add(firework.velocity.clone().multiplyScalar(delta));
        firework.velocity.y -= 15 * delta; // Gravity

        // Explode at peak
        if (firework.velocity.y < 0) {
          firework.exploded = true;

          // Create explosion particles
          const particleCount = 50 + Math.floor(Math.random() * 50);
          const hue = Math.random();

          for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 3 + Math.random() * 5;

            firework.particles.push({
              position: firework.position.clone(),
              velocity: new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.cos(phi) * speed,
                Math.sin(phi) * Math.sin(theta) * speed
              ),
              color: new THREE.Color().setHSL(
                hue + (Math.random() - 0.5) * 0.1,
                1,
                0.6
              ),
              life: 1,
              maxLife: 1 + Math.random(),
            });
          }
        }
      } else {
        // Update explosion particles
        firework.particles = firework.particles.filter((particle) => {
          particle.position.add(
            particle.velocity.clone().multiplyScalar(delta)
          );
          particle.velocity.y -= 8 * delta; // Gravity
          particle.velocity.multiplyScalar(0.98); // Air resistance
          particle.life -= delta;

          return particle.life > 0;
        });

        // Remove firework when all particles dead
        return firework.particles.length > 0;
      }

      return true;
    });

    // Update particle mesh
    if (
      particleGroupRef.current &&
      geometryRef.current &&
      materialRef.current
    ) {
      // Collect all particles
      const allParticles = fireworksRef.current.flatMap((f) => f.particles);

      if (allParticles.length > 0) {
        const positions = new Float32Array(allParticles.length * 3);
        const colors = new Float32Array(allParticles.length * 3);

        allParticles.forEach((particle, i) => {
          positions[i * 3] = particle.position.x;
          positions[i * 3 + 1] = particle.position.y;
          positions[i * 3 + 2] = particle.position.z;

          const alpha = particle.life / particle.maxLife;
          colors[i * 3] = particle.color.r * alpha;
          colors[i * 3 + 1] = particle.color.g * alpha;
          colors[i * 3 + 2] = particle.color.b * alpha;
        });

        geometryRef.current.setAttribute(
          'position',
          new THREE.BufferAttribute(positions, 3)
        );
        geometryRef.current.setAttribute(
          'color',
          new THREE.BufferAttribute(colors, 3)
        );
        materialRef.current.opacity = 1;
      } else {
        // Clear geometry when no particles
        geometryRef.current.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array(0), 3)
        );
      }
    }
  });

  if (!active) return null;

  return (
    <group ref={particleGroupRef}>
      {geometryRef.current && materialRef.current && (
        <points geometry={geometryRef.current} material={materialRef.current} />
      )}
    </group>
  );
}
