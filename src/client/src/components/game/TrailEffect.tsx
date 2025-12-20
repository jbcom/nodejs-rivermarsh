import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import { Vector3 } from 'three';
import { queries } from '../../ecs/world';
import { useGameStore } from '../../hooks/useGameStore';

export function TrailEffect(): React.JSX.Element | null {
  const trailPointsRef = useRef<Vector3[]>([]);
  const maxPoints = 20;
  const { status } = useGameStore();

  useFrame(() => {
    if (status !== 'playing') return;

    const [player] = queries.player.entities;
    if (!player) return;

    // Add current position to trail
    const newPoint = new Vector3(
      player.position.x,
      player.position.y,
      player.position.z
    );
    trailPointsRef.current.unshift(newPoint);

    // Remove old points
    if (trailPointsRef.current.length > maxPoints) {
      trailPointsRef.current = trailPointsRef.current.slice(0, maxPoints);
    }
  });

  if (trailPointsRef.current.length < 2) return null;

  // Generate trail geometry from current trail points
  const positions = new Float32Array(
    trailPointsRef.current.flatMap((p) => [p.x, p.y, p.z])
  );

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={trailPointsRef.current.length}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#60a5fa"
        transparent
        opacity={0.5}
        linewidth={2}
      />
    </line>
  );
}
