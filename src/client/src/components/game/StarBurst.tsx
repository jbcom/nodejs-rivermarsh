import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

interface Star {
  angle: number;
  distance: number;
  speed: number;
  size: number;
  life: number;
  brightness: number;
}

interface StarBurstProps {
  position: [number, number, number];
  starCount?: number;
  color?: string;
  duration?: number;
}

export function StarBurst({
  position,
  starCount = 12,
  color = '#ffff00',
  duration = 1.5,
}: StarBurstProps): React.JSX.Element {
  const starsRef = useRef<Star[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const startTimeRef = useRef(Date.now());

  // Initialize stars
  if (starsRef.current.length === 0) {
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2;
      starsRef.current.push({
        angle,
        distance: 0,
        speed: 2 + Math.random() * 1,
        size: 0.15 + Math.random() * 0.1,
        life: 1,
        brightness: 0.8 + Math.random() * 0.2,
      });
    }
  }

  useFrame((state, delta) => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    starsRef.current.forEach((star) => {
      // Expand outward
      star.distance += star.speed * delta;

      // Fade based on progress
      star.life = 1 - progress;
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {starsRef.current.map((star, i) => {
        if (star.life <= 0) return null;

        const x = Math.cos(star.angle) * star.distance;
        const y = Math.sin(star.angle) * star.distance;

        return (
          <sprite
            key={i}
            position={[x, y, 0]}
            scale={[star.size, star.size, 1]}
          >
            <spriteMaterial
              color={color}
              transparent
              opacity={star.life * star.brightness}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        );
      })}
    </group>
  );
}
