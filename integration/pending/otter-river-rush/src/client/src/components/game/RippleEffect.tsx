import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

interface Ripple {
  position: THREE.Vector3;
  radius: number;
  maxRadius: number;
  life: number;
  speed: number;
}

interface RippleEffectProps {
  position: [number, number, number];
  maxRadius?: number;
  duration?: number;
  color?: string;
  count?: number;
  onComplete?: () => void;
}

export function RippleEffect({
  position,
  maxRadius = 2,
  duration = 1.5,
  color = '#00ffff',
  count = 3,
  onComplete,
}: RippleEffectProps): React.JSX.Element | null {
  const ripplesRef = useRef<Ripple[]>([]);
  const startTimeRef = useRef(Date.now());

  // Initialize ripples
  if (ripplesRef.current.length === 0) {
    for (let i = 0; i < count; i++) {
      ripplesRef.current.push({
        position: new THREE.Vector3(...position),
        radius: 0,
        maxRadius: maxRadius * (0.8 + i * 0.1),
        life: 1,
        speed: maxRadius / duration,
      });
    }
  }

  useFrame((_state, _delta) => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const progress = elapsed / duration;

    if (progress >= 1) {
      if (onComplete) onComplete();
      return;
    }

    ripplesRef.current.forEach((ripple, i) => {
      // Stagger ripple starts
      const delay = i * 0.2;
      const adjustedProgress = Math.max(0, elapsed - delay) / duration;

      if (adjustedProgress > 0) {
        ripple.radius = adjustedProgress * ripple.maxRadius;
        ripple.life = 1 - adjustedProgress;
      }
    });
  });

  return (
    <group>
      {ripplesRef.current.map((ripple, i) => {
        if (ripple.life <= 0) return null;

        return (
          <mesh
            key={i}
            position={ripple.position}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[ripple.radius * 0.9, ripple.radius, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={ripple.life * 0.8}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
