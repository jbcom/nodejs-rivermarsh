import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import { Mesh } from 'three';

/**
 * Background Component - Scrolling water background
 * Converts BackgroundGenerator to React Three Fiber
 */

export function Background(): React.JSX.Element {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Scroll the background
    meshRef.current.position.y -= delta * 2;

    // Reset position for infinite scroll
    if (meshRef.current.position.y < -10) {
      meshRef.current.position.y = 0;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial color="#1e3a8a" />
    </mesh>
  );
}
