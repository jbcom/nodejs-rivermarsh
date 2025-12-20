import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LightningSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  offset: THREE.Vector3;
  life: number;
}

interface LightningBoltProps {
  start: [number, number, number];
  end: [number, number, number];
  segments?: number;
  thickness?: number;
  color?: string;
  duration?: number;
  flicker?: boolean;
  onComplete?: () => void;
}

export function LightningBolt({
  start,
  end,
  segments = 8,
  thickness: _thickness = 0.05,
  color = '#00ffff',
  duration = 0.5,
  flicker = true,
  onComplete,
}: LightningBoltProps): React.JSX.Element | null {
  const segmentsRef = useRef<LightningSegment[]>([]);
  const lineRef = useRef<THREE.Line>(null);
  const startTimeRef = useRef(Date.now());
  const nextFlickerRef = useRef(0);

  useEffect(() => {
    // Generate lightning path with jagged segments
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const length = direction.length();
    direction.normalize();

    // Perpendicular vectors for offset
    const perpendicular = new THREE.Vector3(
      -direction.y,
      direction.x,
      0
    ).normalize();
    const segmentList: LightningSegment[] = [];

    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const segmentStart = startVec
        .clone()
        .add(direction.clone().multiplyScalar(length * t));
      const segmentEnd = startVec
        .clone()
        .add(direction.clone().multiplyScalar(length * (t + 1 / segments)));

      // Add random offset perpendicular to direction
      const offset = perpendicular
        .clone()
        .multiplyScalar((Math.random() - 0.5) * length * 0.3);

      segmentList.push({
        start: segmentStart,
        end: segmentEnd.add(offset),
        offset,
        life: 1,
      });
    }

    segmentsRef.current = segmentList;
  }, [start, end, segments]);

  useFrame(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const progress = elapsed / duration;

    if (progress >= 1 && onComplete) {
      onComplete();
      return;
    }

    // Update line geometry
    if (lineRef.current && segmentsRef.current.length > 0) {
      const points: THREE.Vector3[] = [];
      segmentsRef.current.forEach((segment) => {
        points.push(segment.start);
        points.push(segment.end);
      });

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = geometry;

      // Flicker effect
      if (flicker) {
        const now = Date.now();
        if (now > nextFlickerRef.current) {
          nextFlickerRef.current = now + 50 + Math.random() * 100;
          const material = lineRef.current.material as THREE.LineBasicMaterial;
          material.opacity = 0.5 + Math.random() * 0.5;
        }
      }
    }
  });

  if (segmentsRef.current.length === 0) return null;

  return (
    <primitive object={new THREE.Line()}>
      <bufferGeometry />
      <lineBasicMaterial
        color={color}
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
      />
    </primitive>
  );
}
